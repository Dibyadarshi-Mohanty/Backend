import type { Request, Response } from "express";
import { getAccessToken }  from  "../services/slackservice";
import { encrypt }  from "../utils/encrypt"
import { TokenModel }  from "../models/token"


export const slackOAuthCallback = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    return res.status(400).send("Missing code");
  }

  const data = await getAccessToken(code);
  if (!data.ok) {
    return res.status(400).json(data);
  }

  await TokenModel.findOneAndUpdate(
    { team_id: data.team.id },
    {
      access_token: encrypt(data.access_token),
      refresh_token: encrypt(data.refresh_token || ""),
      expires_at: Date.now() + data.expires_in * 1000
    },
    { upsert: true, new: true }
  );

  res.send("Slack connected successfully! You can close this window.");
};
