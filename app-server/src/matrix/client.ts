import { matrixSdk } from "../../deps.ts";
const HOMESERVER_URL = Deno.env.get('HOMESERVER_URL');

export function getMatrixClient(userId: string, accessToken: string): matrixSdk.MatrixClient {
    return matrixSdk.createClient({
      baseUrl: HOMESERVER_URL,
      userId: `@${userId}:matrix.localdomain`,
      accessToken,
    });
  }