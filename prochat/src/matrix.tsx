import {createContext, useEffect, useMemo, useState} from 'react';
import * as matrixSdk from "matrix-js-sdk";

const tokenEndpoint = "https://teamchat.eks-saas.staging.houzz.net/oidc/token";
const helperEndpoint = "https://teamchat.eks-saas.staging.houzz.net/helper/";

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

async function getUserToken(jukwaaInfos: JukwaaInfos, deviceId: string): Promise<ExchangeTokenResponse> {
    const res = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
            "jukwaa-infos": JSON.stringify({...jukwaaInfos, userName: makeUserName(jukwaaInfos)}),
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

function getDeviceID() {
    const deviceId = localStorage.getItem(matrix_device_id);
    if (deviceId) {
        return deviceId;
    }

    const newId = self.crypto.randomUUID();
    localStorage.setItem(matrix_device_id, newId);
    return newId;
}

function makeUserName({teamId, userId}: JukwaaInfos) {
    return '@hz_' + teamId + "_" + userId + ":teamchat.eks-saas.staging.houzz.net";
}

type JukwaaInfos = { teamId: number, userId: number }

export function useMatrix(jukwaaInfos: JukwaaInfos) {
    const [matrixClient, setMatrixClient] = useState<matrixSdk.MatrixClient>();
    const [userTokens, setUserTokens] = useState<ExchangeTokenResponse>();
    const helperClient = useMemo(() =>
        ({
            async getRoomId(projectId: number) {
                const headers = {
                    "jukwaa-infos": JSON.stringify(jukwaaInfos),
                };
                const params = new URLSearchParams({
                    projectId: '' + projectId,
                });
                const response = await fetch(helperEndpoint + 'getOrCreateProjectRoom?' + params.toString(), {headers});
                if (!response.ok) {
                    throw new Error('Failed to get room')
                }
                const payload = await response.json()

                return payload.roomId;
            }
        }), [jukwaaInfos]
    );

    async function updateUserTokens() {
        let newTokens;
        if (userTokens) {
            newTokens = await refresh(userTokens);
        } else {
            newTokens = await getUserToken(jukwaaInfos, getDeviceID());
        }
        setUserTokens(newTokens);
        window.setTimeout(updateUserTokens, newTokens.expires_in * 1000 / 2)
    }

    async function createClient(userTokens: ExchangeTokenResponse, jukwaaInfos: JukwaaInfos) {
        const client = matrixSdk.createClient({
            baseUrl: "https://teamchat.eks-saas.staging.houzz.net",
            userId: makeUserName(jukwaaInfos),
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
            createClient(userTokens, jukwaaInfos);
        }
    }, [userTokens]);

    useEffect(() => {
        if (userTokens?.access_token) {
            matrixClient?.setAccessToken(userTokens.access_token)
        }
    }, [matrixClient, userTokens]);

    return {matrixClient, helperClient};
}
