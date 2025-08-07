import axios from "axios";

export const getAccessToken = async (code: string) => {
  const res = await axios.post(
    "https://slack.com/api/oauth.v2.access",
    null,
    {
      params: {
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code,
        redirect_uri: process.env.SLACK_REDIRECT_URI
      }
    }
  );
  return res.data;
};

export const sendMessage = async (team_id: string, channel: string, text: string) => {
  const accessToken = await getAccessToken(team_id); // handles refresh automatically

  return await axios.post(
    "https://slack.com/api/chat.postMessage",
    { channel, text },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
};

export const listChannels = async (token: string) => {
  const res = await axios.get("https://slack.com/api/conversations.list", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
