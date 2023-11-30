import init from "./pages/api/init.ts";
import getProjectByProjectId from "./pages/api/project/[id].ts";
import moodboard from "./pages/bot/moodboard.ts";
import introspect from "./pages/oauth2/introspect.ts";
import { MAS, PORT } from "./src/config.ts";
import { proxy } from "./src/utils/proxy.ts";
import { Router } from "./src/utils/router.ts";
import { serveFile } from "./src/utils/serveFile.ts";

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

router.all("/api/init", init);
router.all("/oauth2/introspect", introspect);
router.get("/api/project/:id", getProjectByProjectId);
router.get("/bot/moodboard/:roomId/:eventId/:boardId", moodboard);
router.get("/assets/*", serveFile);

router.all("/*", proxy(MAS));

Deno.serve({ port: PORT }, async (req: Request) => await router.route(req));
