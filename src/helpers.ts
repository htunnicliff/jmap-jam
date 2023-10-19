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

/**
 * Note: This could be more defensive, but for now I'm willing to trust that JMAP
 * servers will follow the specs (meaning: each method call will have a response
 * with a matching ID, no duplicates, etc. if the status code is 2xx)
 */
export function getResultsForMethodCalls(
  methodCallResponses: Array<Invocation<any>>,
  { returnErrors }: { returnErrors: boolean }
) {
  return Object.fromEntries(
    methodCallResponses.map(([name, data, id]) => {
      if (!returnErrors) {
        return [id, data];
      }

      if (name === "error") {
        return [
          id,
          {
            data: null,
            error: data as ProblemDetails,
          },
        ];
      } else {
        return [
          id,
          {
            data,
            error: null,
          },
        ];
      }
    })
  );
}
