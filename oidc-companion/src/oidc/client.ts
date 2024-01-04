import { gty } from "./tokenExchange.ts";

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

type ExchangeTokenResponse = {
  access_token: string;
  refresh_token: string;
  scope: string;
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
        grant_type: gty,
        audience: "urn:houzz.com",
        device_id: deviceId ?? "abc",
      }),
    });
    return await res.json();
  }

  async refresh(token: ExchangeTokenResponse) {
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
    return await res.json();
  }
}

export async function getOpenIdConfiguration(
  baseUrl: string,
): Promise<OpenIdConfiguration> {
  const res = await fetch(
    `${baseUrl}/.well-known/openid-configuration`.replace("//", "/"),
  );
  return await res.json();
}
