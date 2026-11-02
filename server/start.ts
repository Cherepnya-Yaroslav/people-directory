import express from "express";
import { resolve } from "node:path";
import { createApp } from "./app.js";
import { createDatabase } from "./database.js";

const app = createApp(createDatabase());
app.use(express.static(resolve("dist")));
app.get("/{*path}", (_req, res) => res.sendFile(resolve("dist/index.html")));
app.listen(Number(process.env.PORT ?? 3000), "0.0.0.0");
