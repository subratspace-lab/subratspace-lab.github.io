/**
 * Runs in <head> before first paint so the stored theme and recruiter mode are applied
 * without a flash. Kept tiny and dependency-free; it is inlined as a string.
 *
 * Mode can also be set by link: /?mode=skim or /?mode=deep (handy for sending to recruiters).
 */
export const THEME_STORAGE_KEY = "skj-theme";
export const MODE_STORAGE_KEY = "skj-mode";
export const DEFAULT_MODE = "deep";

export const themeInitScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");d.dataset.theme=(t==="light"||t==="dark")?t:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");var q=new URLSearchParams(location.search).get("mode");var m=(q==="skim"||q==="deep")?q:localStorage.getItem("${MODE_STORAGE_KEY}");if(q===m)localStorage.setItem("${MODE_STORAGE_KEY}",m);d.dataset.mode=(m==="skim"||m==="deep")?m:"${DEFAULT_MODE}";}catch(e){d.dataset.mode="${DEFAULT_MODE}";}})();`;
