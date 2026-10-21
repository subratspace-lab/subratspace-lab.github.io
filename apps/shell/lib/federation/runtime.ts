"use client";

import { createInstance, type ModuleFederation } from "@module-federation/runtime";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as JsxRuntime from "react/jsx-runtime";
import type { RemoteModuleId, RemoteModuleMap, RemoteName } from "@skj/contracts";
import { REMOTES } from "./remotes";

/**
 * Next.js (App Router) has no supported Module Federation build plugin, so the shell is a
 * *runtime* host: remotes are built by webpack with @module-federation/enhanced, and this
 * instance loads their containers in the browser. The shell hands its own React to every
 * remote (remotes are built with `import: false` for React), so there is one React tree.
 */

// Next vendors React with a canary suffix (e.g. 19.3.0-canary-…). Strip it so semver ranges
// like ^19.0.0 in remotes match.
const reactVersion = React.version.split("-")[0] ?? "19.0.0";

const shareConfig = { singleton: true, requiredVersion: "^19.0.0" } as const;

let instance: ModuleFederation | null = null;

function getFederation(): ModuleFederation {
  if (instance) return instance;
  instance = createInstance({
    name: "shell",
    remotes: (Object.keys(REMOTES) as RemoteName[]).map((name) => ({
      name,
      entry: REMOTES[name].entry,
      type: "var",
    })),
    shared: {
      react: { version: reactVersion, scope: "default", lib: () => React, shareConfig },
      "react-dom": { version: reactVersion, scope: "default", lib: () => ReactDOM, shareConfig },
      "react/jsx-runtime": { version: reactVersion, scope: "default", lib: () => JsxRuntime, shareConfig },
    },
  });
  return instance;
}

type ExposedModule<C> = { default: C } | C;

export async function loadRemoteModule<Id extends RemoteModuleId>(id: Id): Promise<RemoteModuleMap[Id]> {
  const mod = await getFederation().loadRemote<ExposedModule<RemoteModuleMap[Id]>>(id);
  if (!mod) throw new Error(`Remote module ${id} resolved to nothing`);
  return (typeof mod === "object" && "default" in mod ? mod.default : mod) as RemoteModuleMap[Id];
}
