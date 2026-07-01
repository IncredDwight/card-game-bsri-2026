import { defineConfig } from "vite";

// In production, the client is served by the same Express server that
// runs socket.io, so io() with no args just works (same origin).
//
// In local dev, the Vite dev server runs on its own port (usually 5173)
// while the Express+socket.io server runs on 3000. This proxy forwards
// socket.io's websocket/polling requests to the real server so io()
// still works without hardcoding a URL.
export default defineConfig({
  server: {
    proxy: {
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true
      }
    }
  }
});
