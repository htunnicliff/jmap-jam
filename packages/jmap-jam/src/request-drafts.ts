import type {
  ExtendedJSONPointer,
  Invocation,
  ResultReference
} from "jmap-rfc-types";
import type { LocalInvocation, Methods, Requests } from "./contracts.ts";
import type { ExcludeValue, IncludeValue } from "./helpers.ts";

/**
 * Symbol used to identify arguments that need to be transformed
 * into JMAP result references
 */
const r = Symbol("Result Reference");

export type Ref<I = unknown> = {
  [r]: {
    path: `/${string}`;
    invocation: I;
  };
};

export type WithRefValues<T> = IncludeValue<T, Ref>;

export type WithoutRefValues<T> = ExcludeValue<T, Ref>;

/**
 * These instances represent partially-formed method calls
 * used within `requestMany`. They are transformed into standard
 * JMAP method calls before being sent to the server.
 */
export class InvocationDraft<I = unknown> {
  #invocation: I;

  constructor(invocation: I) {
    this.#invocation = invocation;
  }

  /**
   * Create a result reference that points to the result
   * of a previous invocation.
   */
  $ref(path: ExtendedJSONPointer): Ref<I> {
    return {
      [r]: {
        path,
        invocation: this.#invocation
      }
    };
  }

  /**
   * Determine if a value is a result reference placeholder
   */
  static isRef<I = unknown>(value: unknown): value is Ref<I> {
    return typeof value === "object" && value !== null && r in value;
  }

  /**
   * Transform InvocationDraft instances into fully-formed JMAP method calls
   * by replacing result reference placeholders with JMAP result references
   * and applying user-provided IDs.
   */
  static createInvocationsFromDrafts<T extends Record<string, InvocationDraft>>(
    drafts: T
  ): {
    methodCalls: Invocation[];
    methodNames: Set<string>;
  } {
    // Track method names
    const methodNames = new Set<string>();

    // Associate IDs with invocation references
    const invocationToId = new Map<unknown, string>();

    const methodCalls = Object.entries(drafts).map(([id, draft]) => {
      const [method, inputArgs] = draft.#invocation as LocalInvocation<
        any,
        any
      >;

      invocationToId.set(draft.#invocation, id);
      methodNames.add(method);

      // Transform partial refs into full refs
      const args = Object.fromEntries(
        Object.entries(inputArgs).map(([key, value]) => {
          if (InvocationDraft.isRef<any>(value)) {
            const { invocation, path } = value[r];

            return [
              `#${key}`, // Convert key to use JMAP ref syntax
              {
                name: invocation[0], // Ref method
                resultOf: invocationToId.get(invocation)!, // Ref ID
                path
              } satisfies ResultReference
            ];
          }

          // Not a ref, return unmodified
          return [key, value];
        })
      );

      return [method, args, id] as Invocation;
    });

    return { methodCalls, methodNames };
  }
}

export type DraftsProxy = {
  [Entity in keyof Requests as Entity extends `${infer EntityName}/${string}`
    ? EntityName
    : never]: {
    [Method in Entity as Method extends `${string}/${infer MethodName}`
      ? MethodName
      : never]: <
      Args extends {
        [T in keyof Requests[Method]]: Requests[Method][T] | Ref;
      }
    >(
      args: Args
    ) => InvocationDraft<[Method, Args]>;
  };
};

export function buildRequestsFromDrafts<
  R extends Record<string, InvocationDraft>
>(draftsFn: (p: DraftsProxy) => R) {
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
          }
        }
      )
  });

  // Create invocation drafts
  const drafts = draftsFn(draftsProxy);

  // Create actual invocations
  return InvocationDraft.createInvocationsFromDrafts(drafts);
}
