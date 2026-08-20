import { createApp } from "./app.js";

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT ?? 3001);
  createApp().listen(port, () => console.log(`CodeCoach API listening on port ${port}`));
}

export { createApp } from "./app.js";
export type { AiService } from "./app.js";
