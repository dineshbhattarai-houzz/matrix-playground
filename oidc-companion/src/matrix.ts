import { matrixSdk } from "../deps.ts";
import { getMatrixClient } from "./matrix/client.ts";

export function AutoJoinRoomClient(
  client: matrixSdk.MatrixClient,
): matrixSdk.MatrixClient {
  client.on("room.invite", (roomId: string, _inviteEvent: any) => {
    return client.joinRoom(roomId);
  });

  return client;
}

export function editUserMessage(
  userId: string,
  roomId: string,
  eventId: string,
  html: string,
) {
  return getMatrixClient(userId, userId).sendMessage(
    roomId,
    editMessage(eventId, html),
  );
}

export function sendMessage(msg: string){
  return {
    msgtype: "m.text",
    body: msg,
    "m.mentions": {},
  };
}

export function editMessage(eventId: string, html: string) {
  return {
    msgtype: "m.text",
    body: " * helloff",

    "m.new_content": {
      msgtype: "m.text",
      formatted_body: html,
      format: "org.matrix.custom.html",
      "m.mentions": {},
      "m.thumbnail": [
        // optional
        {
          // A thumbnail is an m.file+m.image, or a small image
          "m.file": {
            url:
              "https://dbhattarai.info.np/_astro/home-illustration.5a54143b_1ce4ca.webp",
            mimetype: "image/jpeg",
            size: 400,
            // "name" is optional in this scenario
          },
          "m.image_details": {
            width: 160,
            height: 120,
          },
        },
      ],
    },
    "m.mentions": {},
    "m.relates_to": {
      rel_type: "m.replace",
      event_id: eventId,
    },
  };
}
