/**
 * Local Astryx themes ship a stylesheet that `astryx-themes.ts` imports for its
 * side effect. The Inertia program types CSS through `vite/client`; this gives
 * the backend program, which also sees `astryx-themes.ts`, the same answer.
 */
declare module '*.css'
