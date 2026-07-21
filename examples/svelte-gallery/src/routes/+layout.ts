// The one route prerenders to a real file so GitHub Pages serves it with a 200; unknown
// paths fall back to 404.html (see svelte.config.js), which boots the SPA router. The
// pattern canvases mount client-side (inside effects), so prerendering the shell is safe.
export const prerender = true;
