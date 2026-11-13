/**
 * The generated Al Quran Cloud client (app/integrations/alquran_cloud) uses the
 * DOM global `BodyInit`. The server tsconfig loads only Node's types, so alias
 * it to the undici type Node's own fetch uses.
 */
declare global {
  type BodyInit = import('undici-types').BodyInit
}

export {}
