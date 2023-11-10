import getProjectByProjectId from "./src/api/project/[id].ts";
import { mas, port } from "./src/config.ts";
import introspect from "./src/oauth2/introspect.ts";
import { proxy } from "./src/proxy.ts";
import { Router } from "./src/router.ts";

const router = new Router();
router.options("/*", () => {
  return new Response(undefined, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "*",
    },
  });
});
router.all("/oauth2/introspect", introspect);
router.get("/api/project/:id", getProjectByProjectId);

router.all("/*", proxy(mas));

Deno.serve({ port }, async (req: Request) => await router.route(req));
