import { matrixSdk } from "../../deps.ts";
import process from "node:process";

const HOMESERVER_URL = process.env.HOMESERVER_URL;

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

export async function createDevice(accessToken: string, fullUserId: string, deviceId: string) {
    const res = await fetch(
      `${HOMESERVER_URL}/_synapse/admin/v2/users/${fullUserId}/devices`,
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
    return res.status;
  }
