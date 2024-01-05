import { getProvider } from "./src/oidc/provider.ts";
import express from "express";
import process from "node:process";

const issuer = process.env.ISSUER ?? "http://localhost:3000";
const port = process.env.PORT ?? 3000;
export const oidcProvider = getProvider(issuer);

if (import.meta.main) {
  const app = express();
  app.use("/oidc", oidcProvider.callback());

  app.listen(port, () => {
    console.info(
      `oidc-provider listening on port ${port}, check http://localhost:${port}/oidc/.well-known/openid-configuration`,
    );
  });
}
