declare module "*.module.css" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

/** Injected by webpack DefinePlugin (see @skj/mf-config). */
declare const __REMOTE_NAME__: string;
declare const __REMOTE_VERSION__: string;
declare const __BUILT_AT__: string;
