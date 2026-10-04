import app, { startServer } from "../src/server.js";

let booted = false;

export default async function handler(req, res) {
  if (!booted) {
    try {
      await startServer();
      booted = true;
    } catch (err) {
      res
        .status(500)
        .json({ error: "API boot failed", detail: String(err?.message || err) });
      return;
    }
  }
  app(req, res, (_err) => {
    if (!res.headersSent) {
      res.status(404).json({ error: "Route not found in backend" });
    }
  });
}
