import { createContext, useEffect, useState } from "react";
import * as matrixSdk from "matrix-js-sdk";
import { ClientEvent } from "matrix-js-sdk";

const tokenEndpoint = "/prochat/oidc/token";
const helperEndpoint = "/prochat/helper/";

type ExchangeTokenResponse = {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
  username: string;
};

export const MatrixContext = createContext(
  matrixSdk.createClient({
    baseUrl: "https://teamchat.eks-saas.staging.houzz.net",
  }),
);

async function refresh(token: ExchangeTokenResponse) {
  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + btoa(`0000000000000000000SYNAPSE:SomeRandomSecret`),
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
      "jukwaa-infos": JSON.stringify({ user: { ...jukwaaInfos } }),
      Authorization:
        "Basic " + btoa(`0000000000000000000SYNAPSE:SomeRandomSecret`),
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

type JukwaaInfos = { userId: string; teamId: number };

export class HelperClient {
  private jukwaaInfos: JukwaaInfos;

  constructor(jukwaaInfos: JukwaaInfos) {
    this.jukwaaInfos = jukwaaInfos;
  }

  async getRoomId(projectId: number) {
    const headers = {
      "jukwaa-infos": JSON.stringify({ user: this.jukwaaInfos }),
    };
    const params = new URLSearchParams({
      projectId: "" + projectId,
    });
    const response = await fetch(
      helperEndpoint + "getOrCreateProjectRoom?" + params.toString(),
      { headers },
    );
    if (!response.ok) {
      throw new Error("Failed to get room");
    }
    const payload = await response.json();

    return payload.roomId;
  }
}

export function useMatrix(jukwaaInfos: JukwaaInfos) {
  const [matrixClient, setMatrixClient] = useState<matrixSdk.MatrixClient>();
  const [userTokens, setUserTokens] = useState<ExchangeTokenResponse>();

  async function createClient() {
    const newTokens = await getUserToken(jukwaaInfos, getDeviceID());
    setUserTokens(newTokens);

    window.setInterval(
      async () => {
        if (userTokens) {
          const newTokens = await refresh(userTokens);
          setUserTokens(newTokens);
        }
      },
      (newTokens.expires_in * 1000) / 2,
    );

    const client = matrixSdk.createClient({
      baseUrl: "https://teamchat.eks-saas.staging.houzz.net",
      userId: newTokens.username,
      accessToken: newTokens.access_token,
    });
    client.on(ClientEvent.Sync, async function (state: string) {
      console.log("STATE --- " + state);
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

  return { matrixClient };
}
