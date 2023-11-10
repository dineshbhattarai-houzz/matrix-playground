import { matrixSdk } from "../deps.ts";

export const mas = Deno.env.get("MAS");
export const homeServerUrl = Deno.env.get("BASE_DOMAIN");
export const elementUrl = Deno.env.get("Element_DOMAIN");
export const port = Deno.env.get("PORT") ?? "8080";

export const kv = await Deno.openKv();

export function getClient(userId: string): matrixSdk.MatrixClient {
  return matrixSdk.createClient({
    baseUrl: homeServerUrl,
    userId: `@${userId}:matrix.localdomain`,
    accessToken: userId,
  });
}
export const houzzbotClient = getClient("houzzbot");

export const tokenUsers: Record<string, unknown> = {
  dineshdb1: {
    active: true,
    scope:
      "urn:matrix:org.matrix.msc2967.client:api:* urn:matrix:org.matrix.msc2967.client:device:nQGSKPNVNA",
    client_id: "legacy",
    username: "dineshdb1",
    token_type: "access_token",
    iat: 1699373211,
    nbf: 1699373211,
    sub: "01HEKZZZCXTMRKJVY9DXRTGAJB",
  },

  dineshdb2: {
    active: true,
    scope:
      "urn:matrix:org.matrix.msc2967.client:api:* urn:matrix:org.matrix.msc2967.client:device:nQGSKPNVNB",
    client_id: "legacy",
    username: "dineshdb2",
    token_type: "access_token",
    iat: 1699373211,
    nbf: 1699373211,
    sub: "01HEKZZZCXTMRKJVY9DXRTGAJD",
  },

  houzzbot: {
    active: true,
    scope:
      "urn:matrix:org.matrix.msc2967.client:api:* urn:matrix:org.matrix.msc2967.client:device:nQGSKPKVNC",
    client_id: "legacy",
    username: "houzzbot",
    token_type: "access_token",
    iat: 1699373211,
    nbf: 1699373211,
    sub: "01HEKZZZCXTMRKJVY9DXRTGAJE",
  },
};
