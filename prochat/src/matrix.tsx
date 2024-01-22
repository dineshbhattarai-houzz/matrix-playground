import { createContext, useEffect, useMemo, useState } from "react";
import * as matrixSdk from "matrix-js-sdk";

const tokenEndpoint = "https://teamchat.eks-saas.staging.houzz.net/oidc/token";
const helperEndpoint = "https://teamchat.eks-saas.staging.houzz.net/helper/";
const serverName = `teamchat.eks-saas.staging.houzz.net`;
type ExchangeTokenResponse = {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
  username: string;
};

export const MatrixContext = createContext(matrixSdk.createClient({
  baseUrl: "https://teamchat.eks-saas.staging.houzz.net",
}));

async function refresh(token: ExchangeTokenResponse) {
  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Authorization": "Basic " +
        btoa(`0000000000000000000SYNAPSE:SomeRandomSecret`),
    },
    body: new URLSearchParams({
      client_id: "0000000000000000000SYNAPSE",
      grant_type: "refresh_token",
      refresh_token: token.refresh_token,
      scope: token.scope,
    }),
  });
  const json = await res.json();
  console.info("refreshed user tokens", json);
  return json;
}

async function getUserToken(
  jukwaaInfos: JukwaaInfos,
  deviceId: string,
): Promise<ExchangeTokenResponse> {
  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "jukwaa-infos": JSON.stringify({ ...jukwaaInfos }),
      "Authorization": "Basic " +
        btoa(`0000000000000000000SYNAPSE:SomeRandomSecret`),
    },
    body: new URLSearchParams({
      client_id: "0000000000000000000SYNAPSE",
      grant_type: "urn:ietf:params:oauth:grant-type:jukwaa-token-exchange",
      audience: "urn:houzz.com",
      device_id: deviceId,
    }),
  });
  const json = await res.json();
  console.info("fetched user tokens", json);
  return json;
}

const matrix_device_id = "matrix_device_id";

function getDeviceID() {
  const deviceId = localStorage.getItem(matrix_device_id);
  if (deviceId) {
    return deviceId;
  }

  const newId = self.crypto.randomUUID();
  localStorage.setItem(matrix_device_id, newId);
  return newId;
}

type JukwaaInfos = { user: { userId: string } };

export function useMatrix(jukwaaInfos: JukwaaInfos) {
  const [matrixClient, setMatrixClient] = useState<matrixSdk.MatrixClient>();
  const [userTokens, setUserTokens] = useState<ExchangeTokenResponse>();
  const helperClient = useMemo(() => ({
    async getRoomId(projectId: number) {
      console.log("running getRoomId by project id");
      const roomName = "hz_p" + projectId;
      console.log(roomName);
      try {
        const roomAlias = await matrixClient?.getRoomIdForAlias(
          '#' + roomName + ":" + serverName,
        );
        console.log({ roomAlias });
        if (roomAlias) {
          return roomAlias.room_id;
        }
      } catch (e) {
      }

      // fixme: this will create their own version of roomId for each project.
      // this should be done in server
      const result = await matrixClient?.createRoom({
        name: "Project " + projectId,
        room_alias_name: roomName,
        is_direct: false,
        visibility: matrixSdk.Visibility.Private,
        preset: matrixSdk.Preset.TrustedPrivateChat,
        invite: [
          `@hz_${Number(jukwaaInfos.user.userId) + 1}:${serverName}`,
          `@hz_${Number(jukwaaInfos.user.userId) + 2}:${serverName}`,
        ],
      });
      if (!result) {
        console.error("error creating room", result);
        alert("error creating room " + roomName);
      }
      return result?.room_id;
    },
  }), [jukwaaInfos]);

  async function createClient() {
    const newTokens = await getUserToken(jukwaaInfos, getDeviceID());
    setUserTokens(newTokens);

    window.setInterval(async () => {
      if (userTokens) {
        const newTokens = await refresh(userTokens);
        setUserTokens(newTokens);
      }
    }, newTokens.expires_in * 1000 / 2);

    const client = matrixSdk.createClient({
      baseUrl: "https://teamchat.eks-saas.staging.houzz.net",
      userId: newTokens.username,
      accessToken: newTokens.access_token,
    });
    client.on("sync", async function (state: string) {
      if (state !== "PREPARED") return;
      setMatrixClient(client);
    });
    client.startClient({
      pollTimeout: 3000,
    });
  }

  useEffect(() => {
    createClient();
  }, []);

  useEffect(() => {
    if (userTokens?.access_token) {
      matrixClient?.setAccessToken(userTokens.access_token);
    }
  }, [matrixClient, userTokens]);

  return { matrixClient, helperClient };
}
