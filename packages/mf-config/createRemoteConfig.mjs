// @ts-check
import path from "node:path";
import { fileURLToPath } from "node:url";
import webpack from "webpack";
import { ModuleFederationPlugin } from "@module-federation/enhanced/webpack";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * React is provided by the shell at runtime. `import: false` means a remote never bundles
 * its own copy: one React instance across the page, so hooks and context work across the
 * federation boundary, and remotes stay small.
 */
const hostProvided = { singleton: true, import: /** @type {false} */ (false), requiredVersion: "^19.0.0" };

/**
 * @param {{
 *   name: string;          // federation container name, e.g. "caseStudies"
 *   folder: string;        // published folder under /remotes, e.g. "case-studies"
 *   version: string;       // the remote's own package version (independent of the shell)
 *   exposes: Record<string, string>;
 *   dir: string;           // the remote package directory
 * }} options
 */
export function createRemoteConfig({ name, folder, version, exposes, dir }) {
  /** @returns {import("webpack").Configuration} */
  return (_env, argv) => {
    const dev = argv.mode === "development";
    // Default: build straight into the shell so one Vercel project serves everything.
    // Set REMOTE_OUT_DIR to build elsewhere and deploy a remote independently.
    const outDir = process.env.REMOTE_OUT_DIR
      ? path.resolve(process.env.REMOTE_OUT_DIR, folder)
      : path.join(repoRoot, "apps/shell/public/remotes", folder);

    return {
      mode: dev ? "development" : "production",
      context: dir,
      entry: {},
      target: "web",
      devtool: dev ? "eval-cheap-module-source-map" : false,
      output: {
        path: outDir,
        publicPath: "auto",
        uniqueName: name,
        clean: true,
        filename: dev ? "[name].js" : "[name].[contenthash:8].js",
        chunkFilename: dev ? "[name].js" : "[name].[contenthash:8].js",
      },
      resolve: { extensions: [".tsx", ".ts", ".js", ".mjs"] },
      module: {
        rules: [
          {
            test: /\.[jt]sx?$/,
            exclude: /node_modules/,
            use: {
              loader: "swc-loader",
              options: {
                jsc: {
                  parser: { syntax: "typescript", tsx: true },
                  // Always the production JSX runtime: react/jsx-runtime is the shared singleton the
                  // shell provides. A dev build importing react/jsx-dev-runtime would bundle its own
                  // copy and crash against the shell's production React.
                  transform: { react: { runtime: "automatic", development: false } },
                  target: "es2020",
                },
              },
            },
          },
          {
            test: /\.module\.css$/,
            use: [
              "style-loader",
              {
                loader: "css-loader",
                options: {
                  modules: {
                    namedExport: false,
                    exportLocalsConvention: "as-is",
                    // Prefix with the remote name so class names never collide with the shell.
                    localIdentName: `${name}__[local]__[hash:base64:5]`,
                  },
                },
              },
            ],
          },
        ],
      },
      plugins: [
        new webpack.DefinePlugin({
          __REMOTE_NAME__: JSON.stringify(name),
          __REMOTE_VERSION__: JSON.stringify(version),
          __BUILT_AT__: JSON.stringify(new Date().toISOString()),
        }),
        new ModuleFederationPlugin({
          name,
          filename: "remoteEntry.js",
          library: { type: "var", name },
          exposes,
          shared: {
            react: hostProvided,
            "react-dom": hostProvided,
            "react/jsx-runtime": hostProvided,
          },
          dts: false,
          manifest: false,
        }),
      ],
      performance: { hints: false },
      stats: "errors-warnings",
    };
  };
}
