import type { LocalContext } from "../../context";

interface SubdirCommandFlags {
    // ...
}

export default async function(this: LocalContext, flags: SubdirCommandFlags): Promise<void> {
    // ...
}
