import Provider from 'oidc-provider';
import { nanoid } from 'nanoid';

const tokenExchange = 'urn:ietf:params:oauth:grant-type:token-exchange';

export const OIDCConfiguration = {
  async findAccount(ctx, id, token) {
    return {
      accountId: id,
      async claims(_use: string, scope: string) {
        return { sub: id };
      },
    };
  },
  features: {
    introspection: {
      enabled: true,
    },
    jwtResponseModes: {
      enabled: true,
    }
  },
  clients: [
    {
      client_id: '0000000000000000000SYNAPSE',
      client_secret: 'SomeRandomSecret',
      redirect_uris: ['http://lvh.me:8080/cb'],
      grant_types: ["authorization_code", "refresh_token", tokenExchange],
      token_endpoint_auth_method: "none",
    },
  ],
};

const parameters = [
  'audience',
  'device_id',
];
const allowedDuplicateParameters = ['audience', 'resource'];

async function tokenExchangeHandler(ctx, next) {
  const { client } = ctx.oidc;
  const {
    RefreshToken, AccessToken, IdToken, InvalidGrant
  } = ctx.oidc.provider;

  const headerUserInfo = ctx.req.get("jukwaa-infos");
  if (!headerUserInfo) {
    ctx.throw(401, "unauthorized", 'request is not authorized');
  }

  const userInfo = JSON.parse(headerUserInfo);
  console.log('userInfo', userInfo);

  const at = new AccessToken({
    accountId: userInfo.user.userId,
    client,
    scope: `urn:matrix:org.matrix.msc2967.client:api:* urn:matrix:org.matrix.msc2967.client:device:${ctx.params.device_id ?? nanoid(6)}`,
    // expiresWithSession: refreshToken.expiresWithSession,
    // grantId: refreshToken.grantId,
    // gty: refreshToken.gty,
    // sessionUid: refreshToken.sessionUid,
    // sid: refreshToken.sid,
  });


  ctx.oidc.entity('AccessToken', at);
  const accessToken = await at.save()

  ctx.body = {
    access_token: accessToken,
    expires_in: at.expiration,
    // id_token: idToken,
    // refresh_token: refreshTokenValue,
    scope: at.scope,
    token_type: at.tokenType,
  }
  await next();
}

export function getProvider(issuer: string) {
  const oidcProvider = new Provider(issuer, OIDCConfiguration);
  oidcProvider.registerGrantType(tokenExchange, tokenExchangeHandler, parameters, allowedDuplicateParameters);
  return oidcProvider;
}
