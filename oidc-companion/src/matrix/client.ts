import { matrixSdk } from "../../deps.ts";
const HOMESERVER_URL = Deno.env.get("HOMESERVER_URL");

export function getMatrixClient(
  userId: string,
  accessToken: string,
): matrixSdk.MatrixClient {
  return matrixSdk.createClient({
    baseUrl: HOMESERVER_URL,
    userId: `@${userId}:matrix.localdomain`,
    accessToken,
  });
}

export async function createDevice(accessToken: string, userId: string, deviceId: string) {
    console.info(`creating new device ${deviceId} for user ${userId}`);
    const res = await fetch(
      `${HOMESERVER_URL}/_synapse/admin/v2/users/${userId}/devices`,
      {
        method: "POST",
        body: JSON.stringify({
          device_id: deviceId,
        }),
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      },
    );
  
    if (res.status >= 400) {
      throw new Error(await res.text());
    }
  }
