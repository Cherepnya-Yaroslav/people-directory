import { createServer } from "vite";
import { createApp } from "./app.js";
import { createDatabase } from "./database.js";

const app = createApp(createDatabase());
const vite = await createServer({
  server: { middlewareMode: true },
  appType: "spa",
});
app.use(vite.middlewares);
const port = Number(process.env.PORT ?? 3000);
app.listen(port, "0.0.0.0", () =>
  console.log(`People is ready at http://localhost:${port}`),
);
