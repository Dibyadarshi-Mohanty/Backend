  import type { Request, Response } from "express";

  import { sendMessage } from "../services/slackservice.js";
  import { decrypt } from "../utils/encrypt.js";
  import { TokenModel } from "../models/token.js";
  import { ScheduledMessageModel } from "../models/SchedulesMessage.js";

  export const sendImmediateMessage = async (req: Request, res: Response) => {
    const { channel, text } = req.body;
    const tokenDoc = await TokenModel.findOne();
    if (!tokenDoc) return res.status(400).send("Slack not connected");

    const token = decrypt(tokenDoc.access_token);
    const result = await sendMessage(token, channel, text);
    res.json(result.data);
  };

  export const scheduleMessage = async (req: Request, res: Response) => {
    const { channel, text, send_at } = req.body;
    const msg = await ScheduledMessageModel.create({
      channel,
      text,
      send_at,
      status: "pending"
    });
    res.json(msg);
  };

  export const getScheduledMessages = async (_req: Request, res: Response) => {
    const msgs = await ScheduledMessageModel.find();
    res.json(msgs);
  };

  export const cancelScheduledMessage = async (req: Request, res: Response) => {
    const { id } = req.params;
    await ScheduledMessageModel.findByIdAndUpdate(id, { status: "cancelled" });
    res.json({ message: "Cancelled" });
  };
