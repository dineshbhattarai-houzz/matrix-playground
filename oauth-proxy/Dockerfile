FROM docker.io/denoland/deno:1.38.0
EXPOSE 1993
WORKDIR /app
USER deno
COPY deno.lock deps.ts .
RUN deno cache --lock=deno.lock deps.ts
COPY . .
RUN deno cache main.ts
CMD ["run", "-A", "--unstable", "main.ts"]
