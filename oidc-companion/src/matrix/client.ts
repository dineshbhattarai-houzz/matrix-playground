import * as matrixSdk from "matrix-js-sdk";
import fetch from 'cross-fetch';
import { MATRIX_SKIP_DEVICE_CREATION, MATRIX_HOMESERVER_URL, MATRIX_SERVER_NAME } from "../config.js";

export function getMatrixClient(
  userId: string,
  accessToken: string,
): matrixSdk.MatrixClient {
  return matrixSdk.createClient({
    baseUrl: MATRIX_HOMESERVER_URL,
    userId: `@${userId}:${MATRIX_SERVER_NAME}`,
    accessToken,
  });
}

export async function createDevice(accessToken: string, fullUserId: string, deviceId: string) {
  if(MATRIX_SKIP_DEVICE_CREATION){
    return;
  }
  const res = await fetch(
    `${MATRIX_HOMESERVER_URL}/_synapse/admin/v2/users/${fullUserId}/devices`,
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

  if (res.status !== 201) {
    throw new Error(await res.text());
  }
  console.info('device created', { userId: fullUserId, deviceId});
}
