import { tokenUsers } from "../../src/config.ts";
import { createDevice } from "../../src/matrix.ts";

export default async function init(_) {
  console.log("initializing users");

  for (const userId in tokenUsers) {
    const user = tokenUsers[userId];

    await createDevice(
      `@${user.username}:matrix.localdomain`,
      getDeviceId(user.scope as string),
    );
  }
  return new Response(undefined, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}

const getDeviceId = (scope: string) => {
  const parts = scope.split(":");
  return parts[parts.length - 1];
};
