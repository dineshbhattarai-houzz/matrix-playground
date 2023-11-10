## Requirements

- Linux
- docker-compose with docker
- Deno

## Getting Started

Note: I'm using podman. If you use docker, update the docker socket path on
[docker-compose.yaml](docker-compose.yaml) as well as update following commands
accordingly.

```bash
# Optional. cmd for creating configuration file. One is already generated for you
sudo podman run -v synapse:/data:z -e SYNAPSE_SERVER_NAME=matrix.localhost -e SYNAPSE_REPORT_STATS=yes docker.io/matrixdotorg/synapse:latest generate


# start the stack
docker-compose up -d

# you will need to sync oauth clients using. It contains a client used by synapse to make the api calls
# on first run, wait while the database is migrated
sudo podman run -v ./server/mas.yaml:/config.yaml:z --network=matrix_default ghcr.io/matrix-org/matrix-authentication-service:main --config=/config.yaml config sync

# note: synapse might fail to initialize data on first run due to postgres taking some time to initialize. Simply restart synapse after few seconds
```

## Architecture

### Matrix Api Server

This is the main api server. It communicates with a oauth2 provider for login
Internally, when this server receives a opaque token, it calls the
/oauth2/introspect ednpoint of the provider to get user details. Technically, we
could implement this endpoint and provide the details about Houzz Pro's and
remove the need for login endpoints altogether.

TODO: The get profile endpoint from element web gives error. Which means there
should be another endpoint that's failing. However, we won't need to show the
chat user profile so that seems to be low priority.

Note: matrix api server sends the introspection request to the public domain
set. As a result, you need to set `/etc/hosts`

```
# /etc/hosts

# public ip of your local interface. synapse uses this domain to call introspection url
# also, this needs to be available via browser for login
192.168.18.109 matrix.localdomain
```

### Element Web

This is shallow shell that builds around `matrix-react-sdk` and provides the
complete client.

Follow the
[getting started guide](https://github.com/vector-im/element-web/#setting-up-a-dev-environment).
Use [element.config.json](element.config.json) as `config.json` for element-web.

Following things are being verified:

- [-] Theming: We can customize the theme and apply it. We can define a custom
  theme that would handle colors. For more changes, we can clone the repo and
  update accordingly. The `matrix-react-sdk` is quite easy to follow and the
  development seems quite good to be honest.
- [-] Extension of the platform using bots and apps. See known issues.
- [x] Automatic acceptance of invite. We can simply accept the invite when the
      user loads it on site. Slight code changes will be necessary.

### Custom API

API to get a room(`auth.matrix.localhost/api/project/[id]`): this endpoint would
create a new matrix room or return preexisting room when a project id is
provided. It would invite members to the room as well. Note: due to the
architechture the members would need to accept the invitation to join. This
should be doable by listening to invite events. ID is an opaque room id. This
endpoint could live anywhere and has no reason to be inside this path.

We implement `auth.matrix.localhost/oauth2/introspect` endpoint. This is just a
proxy that returns early for some case and int other cases, it would just
forward the request to `matrix-authentication-service`. This endpoint needs to
live in this path since we are acting as middleman for the standard oauth
endpoint.

## Known Issues

- matrix-proxy is a nginx proxy which provides some compatibility proxying. It
  might give gateway error if it fails to detect that upstream is down and might
  fail to detect that it is up again. Simply restarting it should fix it. The
  problem is with nginx config but I haven't bothered to fix it.
- When houzzbot replies to a conversation, we get a error about (user_id,
  device_id) not existing for our fake users returned via `/oauth2/introspect`
  endpoint. I've been debugging it but I'm missing something. Once this gets
  fixed, we would have proper framework for everything we need.
