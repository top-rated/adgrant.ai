import { linkedInAgnet } from "./src/agnet/adGrantAgnet.js";

const main = async () => {
  const threadId = "123";
  const query = "hello use any dummy data and give me a csv file so i can see your are working give m ereal wokring csv download link not any dumy link";

  const result = await linkedInAgnet(threadId, query);
  console.log(result);
};

main();
