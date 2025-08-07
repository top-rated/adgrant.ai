import { generateWebCampaigns } from "./src/agnet/adGrantAgnet.js";

const main = async () => {
  const threadId = "123";
  const url = "https://top-voice.ai/";

  const result = await generateWebCampaigns(threadId, url);

  console.log(result);
};

main();
