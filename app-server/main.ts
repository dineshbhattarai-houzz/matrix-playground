import { getProvider } from "./src/oidc/provider.ts";
import express from "express";
import process from "node:process";
import httpProxy from "express-http-proxy";

const issuer = process.env.ISSUER ?? "http://localhost:3000"
const port = process.env.PORT ?? 3000;

export const oidcProvider = getProvider(issuer);

const app = express();

app.use("/oidc", oidcProvider.callback());
app.use("/*", httpProxy("http://synapse:8008"));

app.listen(port, () => {
  console.log('oidc-provider listening on port 3000, check http://localhost:3000/oidc/.well-known/openid-configuration');
});
