/**
 * Entities associated with their JMAP capability identifiers.
 */
export const knownCapabilities = {
  // RFC8620
  Core: "urn:ietf:params:jmap:core",
  // RFC8621
  Mailbox: "urn:ietf:params:jmap:mail",
  Thread: "urn:ietf:params:jmap:mail",
  Email: "urn:ietf:params:jmap:mail",
  SearchSnippet: "urn:ietf:params:jmap:mail",
  Identity: "urn:ietf:params:jmap:submission",
  EmailSubmission: "urn:ietf:params:jmap:submission",
  VacationResponse: "urn:ietf:params:jmap:vacationresponse"
};

/**
 * Regex to match an entity name from within a method name.
 */
const entityMatcher = /^(\w+)\//;

/**
 * Given a list of method names, determine the entities and provide the capabilities
 * that are required to operate on them.
 */
export function getCapabilitiesForMethodCalls({
  methodNames,
  availableCapabilities
}: {
  methodNames: Iterable<string>;
  availableCapabilities: ReadonlyMap<string, string>;
}) {
  const capabilities = new Set<string>();

  // For each method
  for (const method of methodNames) {
    // Get the entity
    const entity = entityMatcher.exec(method)?.[1];
    if (entity) {
      // Get the capability
      const capability = availableCapabilities.get(entity);
      if (capability) {
        // Add the capability
        capabilities.add(capability);
      }
    }
  }

  // Ensure the Core capability is present when any other capability is required.
  // Some JMAP servers (for example Fastmail) require the core capability
  // to be included whenever other capabilities (like mail) are requested.
  if (capabilities.size > 0) {
    capabilities.add(knownCapabilities.Core);
  }

  return capabilities;
}
