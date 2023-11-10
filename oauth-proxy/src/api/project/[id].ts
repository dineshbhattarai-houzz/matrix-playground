import { houzzbotClient, kv } from "../../config.ts";

const elementDomain = "http://localhost:8080";

const key = "projects-nov-9";

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
  });

  await kv.set([key, projectId], roomId);

  return await joinAndReturn(roomId);
}

async function joinAndReturn(roomId: string) {
  const res2 = await houzzbotClient.invite(
    roomId,
    "@dineshdb:matrix.localdomain"
  );

  return new Response(undefined, {
    status: 303,
    headers: {
      "Access-Control-Allow-Origin": "*",
      Location: `${elementDomain}/#/room/${roomId}`,
    },
  });
}
