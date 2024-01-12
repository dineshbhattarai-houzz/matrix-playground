
import { createContext, useEffect, useState } from 'react';
import * as matrixSdk from "matrix-js-sdk";

const tokenEndpoint = "https://teamchat.eks-saas.staging.houzz.net/oidc/token";

type ExchangeTokenResponse = {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
};

export const MatrixContext = createContext(matrixSdk.createClient({
  baseUrl: "https://teamchat.eks-saas.staging.houzz.net",
}))

const mockUserInfo = {
  user: {
    userId: "dineshdb",
    username: "@dineshdb:matrix.localdomain"
  },
};

async function refresh(token: ExchangeTokenResponse) {
  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Authorization": 'Basic ' + btoa(`0000000000000000000SYNAPSE:SomeRandomSecret`)
    },
    body: new URLSearchParams({
      client_id: "0000000000000000000SYNAPSE",
      grant_type: "refresh_token",
      refresh_token: token.refresh_token,
      scope: token.scope,
    }),
  });
  const json = await res.json();
  console.info("refreshed user tokens", json)
  return json;
}

async function getUserToken(deviceId: string): Promise<ExchangeTokenResponse> {
  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "jukwaa-infos": JSON.stringify(mockUserInfo),
      "Authorization": 'Basic ' + btoa(`0000000000000000000SYNAPSE:SomeRandomSecret`)
    },
    body: new URLSearchParams({
      client_id: "0000000000000000000SYNAPSE",
      grant_type: 'urn:ietf:params:oauth:grant-type:jukwaa-token-exchange',
      audience: "urn:houzz.com",
      device_id: deviceId,
    })
  });
  const json = await res.json();
  console.info("fetched user tokens", json)
  return json;
}

const matrix_device_id = "matrix_device_id"

function getDeviceID(){
  const deviceId = localStorage.getItem(matrix_device_id);
  if(deviceId){
    return deviceId;
  }
  
  const newId = self.crypto.randomUUID();
  localStorage.setItem(matrix_device_id, newId);
  return newId;
}

export function useMatrix() {
  const [matrixClient, setMatrixClient] = useState<matrixSdk.MatrixClient>();
  const [userTokens, setUserTokens] = useState<ExchangeTokenResponse>();

  async function updateUserTokens(){
    let newTokens;
    if(userTokens){
      newTokens = await refresh(userTokens);
    } else {
      newTokens = await getUserToken(getDeviceID());
    }
    setUserTokens(newTokens);
    window.setTimeout(updateUserTokens, newTokens.expires_in * 1000 / 2)
  }

  async function createClient(userTokens: ExchangeTokenResponse){
    const client = matrixSdk.createClient({
      baseUrl: "https://teamchat.eks-saas.staging.houzz.net",
      userId: `@dineshdb:teamchat.eks-saas.staging.houzz.net`,
      accessToken: userTokens.access_token,
    });
    client.on('sync', async function (state: string) {
      if (state !== 'PREPARED') return;
      setMatrixClient(client);
    });
    client.startClient({
      pollTimeout: 3000,
    });
  }

  useEffect(() => {
    updateUserTokens();
  }, []);

  useEffect(() => {
    if (userTokens) {
      createClient(userTokens);
    }
  }, [userTokens]);

  useEffect(() => {
    if(userTokens?.access_token) {
      matrixClient?.setAccessToken(userTokens.access_token)
    }
  }, [matrixClient, userTokens]);

  return { matrixClient };
}