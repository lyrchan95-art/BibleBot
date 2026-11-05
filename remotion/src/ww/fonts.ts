import { continueRender, delayRender, staticFile } from "remotion";

// Fonts are served from public/fonts so renders never depend on Google Fonts.
export const MINCHO = "'Shippori Mincho B1', Georgia, serif";
export const MARU = "'Zen Maru Gothic', system-ui, sans-serif";

const FACES: [string, string, string][] = [
  ["Shippori Mincho B1", "600", "ShipporiMinchoB1-600.woff2"],
  ["Shippori Mincho B1", "800", "ShipporiMinchoB1-800.woff2"],
  ["Zen Maru Gothic", "500", "ZenMaruGothic-500.woff2"],
  ["Zen Maru Gothic", "700", "ZenMaruGothic-700.woff2"],
];

if (typeof document !== "undefined") {
  const handle = delayRender("Loading local fonts");
  Promise.all(
    FACES.map(([family, weight, file]) => {
      const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, { weight });
      document.fonts.add(face);
      return face.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}
