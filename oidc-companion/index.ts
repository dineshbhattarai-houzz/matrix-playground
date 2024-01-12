import { getProvider } from "./src/oidc/provider.js";
import express from "express";
import { OIDC_ISSUER, PORT } from "./src/config.js";

const oidcProvider = getProvider(OIDC_ISSUER);

const app = express();
app.use("/oidc", oidcProvider.callback());

app.use(function(err, _req, res, _next) {
  res.status(err.status || 500);
  console.error(err.message, err)
});


app.listen(PORT, () => {
  console.info(
    `oidc-provider listening on port ${PORT}, check http://localhost:${PORT}/oidc/.well-known/openid-configuration`,
  );
});
