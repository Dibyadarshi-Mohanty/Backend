import type { Request, Response } from "express";

import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import { slackOAuthCallback } from "./Controllers/authController.js";
import { sendImmediateMessage, scheduleMessage } from "./Controllers/messageController.js";
import { getScheduledMessages, cancelScheduledMessage } from "./Controllers/schedulerController.js";
import { startScheduler } from "./services/schedulerService.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());

app.get("/slack/oauth/callback", slackOAuthCallback);
app.post("/slack/send", sendImmediateMessage);
app.post("/slack/schedule", scheduleMessage);
app.get("/slack/scheduled", getScheduledMessages);
app.delete("/slack/scheduled/:id", cancelScheduledMessage);

startScheduler();

export default app;
