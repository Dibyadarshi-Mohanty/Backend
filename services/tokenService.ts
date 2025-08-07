import { TokenModel } from "../models/token";
import { encrypt, decrypt } from "../utils/encrypt.js";
import axios from "axios";

export const saveTokens = async (
  team_id: string,
  access_token: string,
  refresh_token: string,
  expires_in: number
) => {
  await TokenModel.findOneAndUpdate(
    { team_id },
    {
      access_token: encrypt(access_token),
      refresh_token: encrypt(refresh_token),
      expires_at: Date.now() + expires_in * 1000
    },
    { upsert: true, new: true }
  );
};

export const getAccessToken = async (team_id: string) => {
  const tokenDoc = await TokenModel.findOne({ team_id });
  if (!tokenDoc) throw new Error("Slack not connected");

  // If access token expired → refresh it
  if (Date.now() > (tokenDoc.expires_at instanceof Date ? tokenDoc.expires_at.getTime() : tokenDoc.expires_at)) {
    console.log("Access token expired. Refreshing...");
    await refreshAccessToken(team_id);
    const updatedDoc = await TokenModel.findOne({ team_id });
    return decrypt(updatedDoc!.access_token);
  }

  return decrypt(tokenDoc.access_token);
};

export const refreshAccessToken = async (team_id: string) => {
  const tokenDoc = await TokenModel.findOne({ team_id });
  if (!tokenDoc) throw new Error("No token found");

  const refreshToken = decrypt(tokenDoc.refresh_token);

  const response = await axios.post("https://slack.com/api/oauth.v2.access", null, {
    params: {
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken
    }
  });

  if (!response.data.ok) {
    throw new Error("Failed to refresh access token: " + response.data.error);
  }

  const { access_token, refresh_token, expires_in } = response.data;

  await saveTokens(team_id, access_token, refresh_token || refreshToken, expires_in);

  console.log("Access token refreshed successfully");
};
