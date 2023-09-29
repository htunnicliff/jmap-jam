export type Obj = Record<string, unknown>;

export type InvocationTemplate<T> = T extends [infer Name, infer Data]
  ? [Name, Data, string]
  : never;

export type HasAllKeysOfRelated<
  R extends Record<string | number | symbol, unknown>,
  T extends Record<keyof R, unknown>
> = T;
