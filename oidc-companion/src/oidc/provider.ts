import Provider from "oidc-provider";

import { OIDCConfiguration } from "./config.js";
import {
  allowedDuplicateParameters,
  gty,
  handler,
  parameters,
} from "./tokenExchange.js";

export function getProvider(issuer: string) {
  const oidcProvider = new Provider(issuer, OIDCConfiguration);
  oidcProvider.registerGrantType(
    gty,
    handler,
    parameters,
    allowedDuplicateParameters,
  );
  return oidcProvider;
}
