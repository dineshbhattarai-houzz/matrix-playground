import fetch from 'cross-fetch';

type OpenIdConfiguration = {
  token_endpoint: string;
  introspection_endpoint: string;
};

type MockJukwaaHeader = {
  localse?: string;
  user?: {
    userId: string;
  };
};

export async function getOpenIdClient(
  endpoint: string,
  clientId: string,
  clientSecret: string,
) {
  const config = await getOpenIdConfiguration(endpoint);
  return new OpenIdClient(config, clientId, clientSecret);
}

export type ExchangeTokenResponse = {
  access_token: string;
  refresh_token: string;
  scope: string;
  expires_in: number;
  token_type: string;
};

export class OpenIdClient {
  #config: OpenIdConfiguration;
  #clientId: string;
  #clientSecret: string;

  constructor(
    config: OpenIdConfiguration,
    clientId: string,
    clientSecret: string,
  ) {
    this.#config = config;
    this.#clientId = clientId;
    this.#clientSecret = clientSecret;
  }

  async introspect(token: string) {
    const res = await fetch(this.#config.introspection_endpoint, {
      method: "POST",
      headers: {
        Authorization:  'Basic '+ btoa(`${this.#clientId}:${this.#clientSecret}`)
      },
      body: new URLSearchParams({
        client_id: this.#clientId,
        token : token,
      }),
    });
    return await res.json();
  }

  async exchange(
    jukwaaHeader: MockJukwaaHeader,
    deviceId?: string
  ): Promise<ExchangeTokenResponse> {
    const res = await fetch(this.#config.token_endpoint, {
      method: "POST",
      headers: {
        "jukwaa-infos": JSON.stringify(jukwaaHeader),
        Authorization: 'Basic '+ btoa(`${this.#clientId}:${this.#clientSecret}`)
      },
      body: new URLSearchParams({
        client_id: this.#clientId,
        grant_type: "urn:ietf:params:oauth:grant-type:jukwaa-token-exchange",
        audience: "urn:houzz.com",
        device_id: deviceId ?? "",
      }),
    });
    const json = await res.json();
    return json as ExchangeTokenResponse;
  }

  async refresh(token: ExchangeTokenResponse) : Promise<ExchangeTokenResponse> {
    const res = await fetch(this.#config.token_endpoint, {
      method: "POST",
      headers: {
        Authorization: 'Basic '+ btoa(`${this.#clientId}:${this.#clientSecret}`)
      },
      body: new URLSearchParams({
        client_id: this.#clientId,
        grant_type: "refresh_token",
        refresh_token: token.refresh_token,
        scope: token.scope,
      }),
    });
    return (await res.json()) as ExchangeTokenResponse;
  }
}

export async function getOpenIdConfiguration(
  baseUrl: string,
): Promise<OpenIdConfiguration> {
  const res = await fetch(
    `${baseUrl}/.well-known/openid-configuration`.replace("//", "/"),
  );
  const json = await res.json();
  return json as OpenIdConfiguration;
}
