import { mas, tokenUsers } from "../config.ts";
import { proxy } from "../proxy.ts";

export default async function (req: Request) {
  const body = await req.clone().formData();
  const token: string = body.get("token")! as string;

  const internalUser = tokenUsers[token];
  if (internalUser) {
    console.log("internal user", token);
    return Response.json(internalUser);
  }

  return proxy(mas)(req);
}
