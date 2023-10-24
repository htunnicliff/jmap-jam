import type { Invocation, JSONPointer, ResultReference } from "./types/jmap";
import { LocalInvocation, Methods, Requests } from "./types/contracts";

type Ref = ReturnType<InvocationDraft["$ref"]>;

/**
 * @private
 *
 * These instances represent partially-formed method calls
 * used within `requestMany`. They are transformed into standard
 * JMAP method calls before being sent to the server.
 */
class InvocationDraft {
  #invocation: LocalInvocation<Methods, any>;

  /**
   * Symbol used to identify arguments that need to be transformed
   * into JMAP result references
   */
  static #ref = Symbol("Result Reference");

  constructor(invocation: LocalInvocation<Methods, any>) {
    this.#invocation = invocation;
  }

  /**
   * Create a result reference that points to the result
   * of a previous invocation.
   */
  $ref(path: JSONPointer) {
    return {
      [InvocationDraft.#ref]: {
        path,
        invocation: this.#invocation,
      },
    };
  }

  /**
   * Determine if a value is a result reference placeholder
   */
  static isRef(value: unknown): value is Ref {
    return (
      typeof value === "object" &&
      value !== null &&
      InvocationDraft.#ref in value
    );
  }

  /**
   * Transform InvocationDraft instances into fully-formed JMAP method calls
   * by replacing result reference placeholders with JMAP result references
   * and applying user-provided IDs.
   */
  static createInvocationsFromDrafts(drafts: Record<string, InvocationDraft>) {
    // Track method names
    const methodNames = new Set<string>();

    // Associate IDs with invocation references
    const invocationToId = new Map<LocalInvocation<Methods, any>, string>();

    const methodCalls = Object.entries(drafts).map(([id, draft]) => {
      const [method, inputArgs] = draft.#invocation;

      invocationToId.set(draft.#invocation, id);
      methodNames.add(method);

      // Transform partial refs into full refs
      const args = Object.fromEntries(
        Object.entries(inputArgs).map(([key, value]) => {
          if (InvocationDraft.isRef(value)) {
            const ref = value[InvocationDraft.#ref];

            return [
              `#${key}`, // Convert key to use JMAP ref syntax
              {
                name: ref.invocation[0], // Ref method
                resultOf: invocationToId.get(ref.invocation)!, // Ref ID
                path: ref.path,
              } satisfies ResultReference,
            ];
          }

          // Not a ref, return unmodified
          return [key, value];
        })
      );

      return [method, args, id] as Invocation<typeof args>;
    });

    return { methodCalls, methodNames };
  }
}

type DraftsProxy = {
  [Entity in keyof Requests as Entity extends `${infer EntityName}/${string}`
    ? EntityName
    : never]: {
    [Method in Entity as Method extends `${string}/${infer MethodName}`
      ? MethodName
      : never]: <
      A extends {
        [T in keyof Requests[Method]]: Requests[Method][T] | Ref;
      }
    >(
      args: A
    ) => InvocationDraft;
  };
};

export type DraftsFunction = (
  t: DraftsProxy
) => Record<string, InvocationDraft>;

export function buildRequestsFromDrafts(draftsFn: DraftsFunction) {
  // Create a proxy to intercept {entity}.{operation} calls
  const draftsProxy = new Proxy({} as DraftsProxy, {
    get: (_, entity: string) =>
      new Proxy(
        {},
        {
          get: (__, operation: string) => {
            return (args: unknown) => {
              const method = `${entity}/${operation}` as Methods;

              const invocation = [method, args] as LocalInvocation<
                Methods,
                any
              >;

              return new InvocationDraft(invocation);
            };
          },
        }
      ),
  });

  // Create invocation drafts
  const drafts = draftsFn(draftsProxy);

  // Create actual invocations
  return InvocationDraft.createInvocationsFromDrafts(drafts);
}
