import { homeServerUrl } from "./config.ts";

export async function createDevice(userId: string, deviceId: string) {
  console.info(`creating new device ${deviceId} for user ${userId}`);
  const res = await fetch(
    `${homeServerUrl}/_synapse/admin/v2/users/${userId}/devices`,
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
