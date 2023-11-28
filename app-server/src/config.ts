import "https://deno.land/std@0.208.0/dotenv/load.ts";
import { matrixSdk } from "../deps.ts";
import { AutoJoinRoomClient } from "./matrix.ts";

export const { MAS, HOMESERVER_URL, PORT } = Deno.env.toObject();

export const kv = await Deno.openKv();

export function getImpersonationClient(userId: string): matrixSdk.MatrixClient {
  return matrixSdk.createClient({
    baseUrl: HOMESERVER_URL,
    userId: `@${userId}:matrix.localdomain`,
    accessToken: userId,
  });
}

export const houzzbotClient = AutoJoinRoomClient(
  getImpersonationClient("houzzbot")
);

export const tokenUsers: Record<string, Record<string, unknown>> = {
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
      "urn:synapse:admin:* urn:matrix:org.matrix.msc2967.client:api:* urn:matrix:org.matrix.msc2967.client:device:nQGSKPKVNC",
    client_id: "legacy",
    username: "houzzbot",
    token_type: "access_token",
    iat: 1699373211,
    nbf: 1699373211,
    sub: "01HEKZZZCXTMRKJVY9DXRTGAJE",
  },
  dineshdb: {
    active: true,
    scope:
      "urn:synapse:admin:* urn:matrix:org.matrix.msc2967.client:api:* urn:matrix:org.matrix.msc2967.client:device:nQGSKPKVNK",
    client_id: "legacy",
    username: "dineshdb",
    token_type: "access_token",
    iat: 1699373211,
    nbf: 1699373211,
    sub: "01HEKZZZCXTMRKJVY9DXRTGAJF",
  },
};

export const projects = {
  "1": {
    moodboards: ["1", "2"],
  },
  "2": {
    moodboards: ["1", "3"],
  },
  "3": {
    moodboards: ["2", "3"],
  },
};

export const moodBoards = {
  "1": { title: "DArch Living Room", thumbnail: "" },
  "2": { title: "DArch Dining Room", thumbnail: "" },
  "3": { title: "Gym Hall", thumbnail: "" },
};
