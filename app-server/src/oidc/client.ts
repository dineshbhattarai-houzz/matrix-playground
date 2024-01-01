
type OpenIdConfiguration = {
    token_endpoint: string,
    introspection_endpoint: string;
}

type MockJukwaaHeader = {
    localse?: string;
    user?: {
        userId: string;
    }
}

export async function getOpenIdClient(endpoint: string, clientId: string, clientSecret: string){
    const config = await getOpenIdConfiguration(endpoint);
    return new OpenIdClient(config, clientId, clientSecret)
}

export class OpenIdClient {
    #config: OpenIdConfiguration;
    #clientId: string;
    #clientSecret: string;

    constructor(config: OpenIdConfiguration, clientId: string, clientSecret: string){
        this.#config = config;
        this.#clientId = clientId;
        this.#clientSecret = clientSecret;
    }

    async introspect(token: string){
        const res = await fetch(this.#config.introspection_endpoint, {
            method: "POST",
            body: new URLSearchParams({
                client_id: this.#clientId,
                token,
                token_type_hint: "access_token",
            })
        });
        return await res.json();
    }

    async exchange(jukwaaHeader: MockJukwaaHeader){
        const res = await fetch(this.#config.token_endpoint, {
            method: "POST",
            headers: {
                'jukwaa-infos': JSON.stringify(jukwaaHeader),
            },
            body: new URLSearchParams({
                client_id: this.#clientId,
                grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
                audience: "urn:houzz.com",
                resource: "matrix"
            })
        });
        return await res.json();
    }
}

export async function getOpenIdConfiguration(baseUrl: string): Promise<OpenIdConfiguration> {
    const res = await fetch(`${baseUrl}/.well-known/openid-configuration`.replace("//", "/"));
    return await res.json();
}