import "std/dotenv/load.ts";
import { AutoJoinRoomClient } from "./matrix.ts";
import { getMatrixClient } from "./matrix/client.ts";

export const { MAS, HOMESERVER_URL, PORT } = Deno.env.toObject();

export const kv = await Deno.openKv();

export const houzzbotClient = AutoJoinRoomClient(
  getMatrixClient("houzzbot", "houzzbot")
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
  "1": {
    title: "DArch Living Room",
    url: "https://github.com/matrix-org/matrix-js-sdk",
    thumbnail:
      "https://dbhattarai.info.np/_astro/home-illustration.5a54143b_1ce4ca.webp",
  },
  "2": {
    title: "DArch Dining Room",
    url: "https://github.com/matrix-org/matrix-react-sdk",
    thumbnail:
      "https://dbhattarai.info.np/_astro/home-illustration.5a54143b_1ce4ca.webp",
  },
  "3": {
    title: "Gym Hall",
    url: "https://github.com/matrix-org/matrix-react-sdk",
    thumbnail:
      "https://dbhattarai.info.np/_astro/home-illustration.5a54143b_1ce4ca.webp",
  },
};
