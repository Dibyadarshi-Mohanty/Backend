import type { Request, Response } from "express";

import cron from "node-cron";
import { ScheduledMessageModel } from "../models/SchedulesMessage.js";
import { TokenModel } from "../models/token.js";
import { decrypt } from "../utils/encrypt.js";
import { sendMessage } from "./slackservice.js";

export const startScheduler = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = Date.now();

      const pendingMsgs = await ScheduledMessageModel.find({
        send_at: { $lte: now },
        status: "pending"
      });

      if (!pendingMsgs.length) return;

      const tokenDoc = await TokenModel.findOne();
      if (!tokenDoc) return;
      const token = decrypt(tokenDoc.access_token);

      for (const msg of pendingMsgs) {
        await sendMessage(token, msg.channel, msg.text);
        msg.status = "sent";
        await msg.save();
      }
    } catch (err) {
      console.error("Error in scheduler:", err);
    }
  });
};
