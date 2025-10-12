import type { LocalContext } from "../../context";

interface FooCommandFlags {
    // ...
}

export async function foo(this: LocalContext, flags: FooCommandFlags): Promise<void> {
    // ...
}

interface BarCommandFlags {
    // ...
}

export async function bar(this: LocalContext, flags: BarCommandFlags): Promise<void> {
    // ...
}
