import { matrixSdk } from "../deps.ts";
import { HOMESERVER_URL, getImpersonationClient } from "./config.ts";

export async function createDevice(userId: string, deviceId: string) {
  console.info(`creating new device ${deviceId} for user ${userId}`);
  const res = await fetch(
    `${HOMESERVER_URL}/_synapse/admin/v2/users/${userId}/devices`,
    {
      method: "POST",
      body: JSON.stringify({
        device_id: deviceId,
      }),
      headers: {
        Authorization: "Bearer houzzbot",
      },
    }
  );

  if (res.status >= 400) {
    throw new Error(await res.text());
  }
}

export function AutoJoinRoomClient(
  client: matrixSdk.MatrixClient
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
  html: string
) {
  return getImpersonationClient(userId).sendMessage(
    roomId,
    editMessage(eventId, html)
  );
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
    },
    "m.mentions": {},
    "m.relates_to": {
      rel_type: "m.replace",
      event_id: eventId,
    },
  };
}
