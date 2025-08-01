import { processQuery } from "./src/agnet/adGrantAgnet.js";
import { isAIMessageChunk } from "@langchain/core/messages";

const main = async () => {
  const threadId = "123";
  const query = "hello how are you ";

  const stream = await processQuery(threadId, query);
  for await (const [message, _metadata] of stream) {
    if (isAIMessageChunk(message) && message.tool_call_chunks?.length) {
      console.log(
        `${message.getType()} MESSAGE TOOL CALL CHUNK: ${
          message.tool_call_chunks[0].args
        }`
      );
    } else {
      console.log(`${message.getType()} MESSAGE CONTENT: ${message.content}`);
    }
  }
};

main();
