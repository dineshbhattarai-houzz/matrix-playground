// import { houzzbotClient } from "./config.ts";
// import { editUserMessage } from "./matrix.ts";
// import { renderMoodboard, renderMoodboards } from "./moodboards.ts";

// async function handleCommand(roomId, event) {
//   if (event["content"]?.["msgtype"] !== "m.text") return undefined;
//   if (event["sender"] === (await houzzbotClient.getUserId())) return undefined;

//   const body = event["content"]["body"];

//   if (body?.startsWith("!mboards")) {
//     // todo: get project id based on room
//     const projectId = "1";
//     return editUserMessage(
//       "dineshdb",
//       event.room_id,
//       event.event_id,
//       renderMoodboards(event.room_id, event.event_id, projectId),
//     );
//   }

//   if (body?.startsWith("!mboard")) {
//     return showmoodboard(event);
//   }
// }

// function showmoodboard(event) {
//   const [_, id] = event.content.body.split(" ");

//   return editUserMessage(
//     "dineshdb",
//     event.room_id,
//     event.event_id,
//     renderMoodboard(id),
//   );
// }

// export default function main() {
//   houzzbotClient.on("Room.timeline", (event, room) => {
//     if (event.getType() !== "m.room.message") {
//       return undefined; // only use messages
//     }
//     return handleCommand(room, event.event);
//   });

//   return houzzbotClient.startClient({ initialSyncLimit: 1 });
// }

//   console.info("starting");
//   main();
