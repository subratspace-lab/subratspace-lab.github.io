import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

/**
 * One Jest config for every workspace. SWC compiles TS/TSX (fast, no Babel), CSS Modules
 * map to their class names, and `@/` resolves to the shell like it does in Next.
 * @type {import("jest").Config}
 */
const config = {
  testEnvironment: "jsdom",
  moduleFileExtensions: ["ts", "tsx", "js", "mjs", "cjs", "json"],
  roots: ["<rootDir>/apps", "<rootDir>/packages"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/out/", "/e2e/"],
  rootDir: root,
  setupFilesAfterEnv: [path.join(root, "jest.setup.ts")],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript", tsx: true },
          transform: { react: { runtime: "automatic" } },
          target: "es2022",
        },
        module: { type: "commonjs" },
      },
    ],
  },
  moduleNameMapper: {
    "\\.module\\.css$": "identity-obj-proxy",
    "\\.css$": "<rootDir>/jest.style-stub.js",
    "^@/(.*)$": "<rootDir>/apps/shell/$1",
  },
  // Build-time constants that webpack's DefinePlugin injects into remotes.
  globals: {
    __REMOTE_NAME__: "test",
    __REMOTE_VERSION__: "0.0.0",
    __BUILT_AT__: "2026-01-01T00:00:00.000Z",
  },
  collectCoverageFrom: [
    "apps/shell/{lib,components}/**/*.{ts,tsx}",
    "apps/remote-*/src/**/*.{ts,tsx}",
    "packages/*/src/**/*.ts",
  ],
};

export default config;
