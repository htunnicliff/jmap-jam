import type { Invocation, ProblemDetails } from "./types/jmap.ts";

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
    const parameter = `{${key}}`;
    if (!expanded.includes(parameter)) {
      throw new Error(`Template "${template}" is missing parameter: ${key}`);
    }
    expanded = expanded.replaceAll(parameter, value);
  }

  return new URL(expanded);
}

export function isErrorInvocation(
  input: Invocation
): input is Invocation<ProblemDetails> {
  return input[0] === "error";
}

export function getErrorFromInvocation(
  invocation: Invocation
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
            error: data as ProblemDetails
          }
        ];
      }
      return [
        id,
        {
          data,
          error: null
        }
      ];
    })
  );
}

export type Obj = Record<string, unknown>;

export type InvocationTemplate<T> = T extends [infer Name, infer Data]
  ? [Name, Data, string]
  : never;

export type HasAllKeysOfRelated<
  R extends Record<string | number | symbol, unknown>,
  T extends Record<keyof R, unknown>
> = T;

export type IncludeValue<T, V> = {
  [K in keyof T]: T[K] | V;
};

export type ExcludeValue<T, V> = {
  [K in keyof T]: Exclude<T[K], V>;
};
