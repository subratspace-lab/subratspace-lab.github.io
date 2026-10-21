import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { createRemoteConfig } from "@skj/mf-config";

const pkg = createRequire(import.meta.url)("./package.json");

export default createRemoteConfig({
  name: "caseStudies",
  folder: "case-studies",
  version: pkg.version,
  dir: path.dirname(fileURLToPath(import.meta.url)),
  exposes: {
    "./LighthouseSlider": "./src/LighthouseSlider.tsx",
    "./BundleChart": "./src/BundleChart.tsx",
  },
});
