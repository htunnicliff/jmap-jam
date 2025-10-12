import type { LocalContext } from "../../context";

type FooCommandFlags = {
  // ...
};

export async function foo(
  this: LocalContext,
  flags: FooCommandFlags
): Promise<void> {
  // ...
}

type BarCommandFlags = {
  // ...
};

export async function bar(
  this: LocalContext,
  flags: BarCommandFlags
): Promise<void> {
  // ...
}
