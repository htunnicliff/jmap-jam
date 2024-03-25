import type { HeaderParsedForm } from "./types/jmap-mail";

/**
 * Generate a key to retrieve a header field
 *
 * @example
 * ```ts
 * headerField("Some-Header", "Addresses") // "header:Some-Header:asAddresses"
 * ```
 */
export function headerField<
  Name extends string,
  Form extends keyof HeaderParsedForm
>(name: Name, form: Form) {
  return `header:${name}:as${form}` as const;
}

export function allHeaderFields<
  Name extends string,
  Form extends keyof HeaderParsedForm
>(name: Name, form: Form) {
  const header = headerField(name, form);

  return `${header}:all` as const;
}
