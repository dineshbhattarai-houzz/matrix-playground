// https://github.com/mayankchoubey/deno-native-router/blob/main/mod.ts
type CallbackHandler = (
  request: Request,
  params: Record<string, string>
) => Promise<Response> | Response;

const METHODS: Record<string, string> = {
  GET: "GET",
  HEAD: "HEAD",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  OPTIONS: "OPTIONS",
  TRACE: "TRACE",
  PATCH: "PATCH",
};

export class Router {
  private routes: Record<string, Array<any>> = {};

  constructor() {
    for (const m in METHODS) {
      this.routes[METHODS[m]] = [];
    }
  }

  private add(method: string, pathname: string, handler: CallbackHandler) {
    this.routes[method].push({
      pattern: new URLPattern({ pathname }),
      handler,
    });
  }

  all(pathname: string, handler: CallbackHandler) {
    this.get(pathname, handler);
    this.head(pathname, handler);
    this.post(pathname, handler);
    this.put(pathname, handler);
    this.delete(pathname, handler);
    this.options(pathname, handler);
    this.trace(pathname, handler);
    this.patch(pathname, handler);
  }

  get(pathname: string, handler: CallbackHandler) {
    this.add(METHODS.GET, pathname, handler);
  }

  head(pathname: string, handler: CallbackHandler) {
    this.add(METHODS.HEAD, pathname, handler);
  }

  post(pathname: string, handler: CallbackHandler) {
    this.add(METHODS.POST, pathname, handler);
  }

  put(pathname: string, handler: CallbackHandler) {
    this.add(METHODS.PUT, pathname, handler);
  }

  delete(pathname: string, handler: CallbackHandler) {
    this.add(METHODS.DELETE, pathname, handler);
  }

  options(pathname: string, handler: CallbackHandler) {
    this.add(METHODS.OPTIONS, pathname, handler);
  }

  trace(pathname: string, handler: CallbackHandler) {
    this.add(METHODS.TRACE, pathname, handler);
  }

  patch(pathname: string, handler: CallbackHandler) {
    this.add(METHODS.PATCH, pathname, handler);
  }

  async route(req: Request): Promise<Response> {
    for (const r of this.routes[req.method]) {
      if (r.pattern.test(req.url)) {
        const params = r.pattern.exec(req.url).pathname.groups;
        try {
          return r["handler"](req, params);
        } catch (err) {
          return new Response(null, { status: 500 });
        }
      }
    }
    return new Response(null, { status: 404 });
  }
}
