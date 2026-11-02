import { createApp } from "../server/app.js";
import { createDatabase } from "../server/database.js";

export default createApp(createDatabase());
