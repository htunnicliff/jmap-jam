import { Invocation, ProblemDetails } from "./types/jmap";

/**
 * Expands a URI template with the given parameters.
 *
 * [rfc6570](https://datatracker.ietf.org/doc/html/rfc6570)
 */
export function expandURITemplate(
  template: string,
  params: Record<string, string>
): URL {
  let expanded = template;

  for (const [key, value] of Object.entries(params)) {
    if (!expanded.includes(`{${key}}`)) {
      throw new Error(`Template "${template}" is missing parameter: ${key}`);
    }

    expanded = expanded.replaceAll(`{${key}}`, value);
  }

  return new URL(expanded);
}

export function isErrorInvocation(
  input: Invocation
): input is Invocation<ProblemDetails> {
  return input[0] === "error";
}

export function getErrorFromInvocation<T extends Invocation>(
  invocation: T
): ProblemDetails | null {
  if (isErrorInvocation(invocation)) {
    return invocation[1];
  }

  return null;
}
