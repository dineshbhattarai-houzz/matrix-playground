import * as path from "https://deno.land/std/path/mod.ts";
export async function serveFile(req: Request) {
  const url = new URL(req.url);
  const filepath = decodeURIComponent(url.pathname);
  console.log(path.resolve("." + filepath));
  try {
    const file = await Deno.open("." + filepath);
    return new Response(file.readable);
  } catch (e) {
    console.error(e);
    return new Response("404 Not Found", { status: 404 });
  }
}
