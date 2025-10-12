import type { CommandContext } from "@stricli/core";
import type { StricliAutoCompleteContext } from "@stricli/auto-complete";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export type LocalContext = {
  readonly process: NodeJS.Process;
  // ...
} & CommandContext &
  StricliAutoCompleteContext;

export function buildContext(process: NodeJS.Process): LocalContext {
  return {
    process,
    os,
    fs,
    path
  };
}
