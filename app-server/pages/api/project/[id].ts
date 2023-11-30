import { houzzbotClient, kv } from "../../../src/config.ts";

const elementDomain = "http://localhost:8080";

const key = "projects-nov-28";

export default async function getProjectRoom(
  _,
  { id: projectId }: Record<string, string>
) {
  console.log("creating new project");
  const { value: existingRoom } = await kv.get([key, projectId]);

  if (existingRoom) {
    return joinAndReturn(existingRoom);
  }

  // create a new channel
  const { room_id: roomId } = await houzzbotClient.createRoom({
    is_direct: false,
    name: `Project: ${projectId}`,
    preset: "trusted_private_chat",

    invite: ["@dineshdb:matrix.localdomain", "@dineshdb2:matrix.localdomain"],
  });

  // background job
  // todo: accept invites from each of the following users as a background job.

  await kv
    .atomic()
    .set([key, projectId], roomId)
    .set([key, roomId], projectId)
    .commit();

  return await joinAndReturn(roomId);
}

async function joinAndReturn(roomId: string) {
  return new Response(undefined, {
    status: 303,
    headers: {
      "Access-Control-Allow-Origin": "*",
      Location: `${elementDomain}/#/room/${roomId}`,
    },
  });
}
