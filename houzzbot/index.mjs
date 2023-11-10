export const homeServerUrl = "http://matrix.localdomain";
import {
  AutojoinRoomsMixin,
  MatrixClient,
  SimpleFsStorageProvider,
} from "matrix-bot-sdk";

const storage = new SimpleFsStorageProvider("hello-bot.json");

const client = new MatrixClient(homeServerUrl, "houzzbot", storage);
AutojoinRoomsMixin.setupOnClient(client);

client.on("room.message", handleCommand);

client.start().then(() => console.log("Bot started!"));

async function handleCommand(roomId, event) {
  // Don't handle unhelpful events (ones that aren't text messages, are redacted, or sent by us)
  console.log({ event, roomId });

  if (event["content"]?.["msgtype"] !== "m.text") return;
  if (event["sender"] === (await client.getUserId())) return;

  // Check to ensure that the `!hello` command is being run
  const body = event["content"]["body"];
  if (!body?.startsWith("!hello")) return;

  // Now that we've passed all the checks, we can actually act upon the command
  await client.replyText(roomId, event, "Hello world!");
}
