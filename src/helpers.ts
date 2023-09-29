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
