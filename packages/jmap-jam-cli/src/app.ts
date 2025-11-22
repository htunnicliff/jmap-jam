import { buildApplication, buildRouteMap } from "@stricli/core";
import {
  buildInstallCommand,
  buildUninstallCommand
} from "@stricli/auto-complete";
import { name, version, description } from "../package.json";
import { subdirCommand } from "./commands/subdir/command";
import { nestedRoutes } from "./commands/nested/commands";

const routes = buildRouteMap({
  routes: {
    subdir: subdirCommand,
    nested: nestedRoutes,
    install: buildInstallCommand("jmap-jam-cli", {
      bash: "__jmap-jam-cli_bash_complete"
    }),
    uninstall: buildUninstallCommand("jmap-jam-cli", { bash: true })
  },
  docs: {
    brief: description,
    hideRoute: {
      install: true,
      uninstall: true
    }
  }
});

export const app = buildApplication(routes, {
  name,
  versionInfo: {
    currentVersion: version
  }
});
