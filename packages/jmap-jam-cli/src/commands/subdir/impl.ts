import type { LocalContext } from "../../context";

type SubdirCommandFlags = {
  // ...
};

export default async function (
  this: LocalContext,
  flags: SubdirCommandFlags
): Promise<void> {
  // ...
}
