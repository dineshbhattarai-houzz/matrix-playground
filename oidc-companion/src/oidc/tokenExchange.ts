import { nanoid } from "nanoid";
export const gty = "urn:ietf:params:oauth:grant-type:jukwaa-token-exchange";

export const parameters = [
  "audience",
  "device_id",
  "resource"
];
export const allowedDuplicateParameters = ["audience", "resource"];

export async function handler(ctx, next) {
  const { client } = ctx.oidc;
  const {
    RefreshToken,
    AccessToken,
    IdToken,
    InvalidGrant,
    Grant,
  } = ctx.oidc.provider;
  const headerUserInfo = ctx.req.get("jukwaa-infos");
  if (!headerUserInfo) {
    ctx.throw(401, "unauthorized", "request is not authorized");
  }

  const userInfo = JSON.parse(headerUserInfo);
  const scope =
    `${userInfo.user.isAdmin ? "urn:synapse:admin:*" : ""} urn:matrix:org.matrix.msc2967.client:api:* urn:matrix:org.matrix.msc2967.client:device:${
      ctx.oidc.params.device_id ?? nanoid(6)
    }`;

  const grant = new Grant({
    accountId: userInfo.user.userId,
    clientId: client.clientId,
  });
  grant.addOIDCScope(scope);
  ctx.oidc.entity("Grant", grant);
  const grantId = await grant.save();

  const at = new AccessToken({
    accountId: userInfo.user.userId,
    client,
    scope,
    expiresWithSession: false,
    grantId,
    gty: RefreshToken.gty,
    // sessionUid: nanoid(5),
    // sid: nanoid(5),
  });

  const rt = new RefreshToken({
    accountId: userInfo.user.userId,
    // acr: request.acr,
    // amr: request.amr,
    // authTime: request.authTime,
    client: ctx.oidc.client,
    expiresWithSession: false,
    grantId: at.grantId,
    gty,
    // nonce: request.nonce,
    resource: ctx.oidc.params.resource,
    rotations: 0,
    scope,
    sessionUid: at.sid,
    sid: at.sid,
  });
  
  ctx.oidc.entity("AccessToken", at);
  const accessToken = await at.save();

  if (ctx.oidc.client.clientAuthMethod === "none") {
    if (at.jkt) {
      rt.jkt = at.jkt;
    }

    if (at["x5t#S256"]) {
      rt["x5t#S256"] = at["x5t#S256"];
    }
  }

  ctx.oidc.entity("RefreshToken", rt);
  const refreshToken = await rt.save();

  ctx.body = {
    access_token: accessToken,
    expires_in: at.expiration,
    refresh_token: refreshToken,
    scope: at.scope,
    token_type: at.tokenType,
  };
  await next();
}
