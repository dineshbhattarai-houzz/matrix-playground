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
sudo podman run -v synapse:/data:z -e SYNAPSE_SERVER_NAME=matrix.localhost -e SYNAPSE_REPORT_STATS=yes docker.io/matrixdotorg synapse:latest generate

# start the stack
# note: synapse might fail to initialize data on first run due to postgres taking some time to initialize. Simply restart synapse after few seconds
docker-compose up -d

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

# external ip of your local interface. synapse uses this domain to call introspection url
# also, this needs to be available via browser for login
192.168.18.109 matrix.localdomain auth.matrix.localdomain

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

API to get a room(`auth.matrix.localdomain/api/project/[id]`): this endpoint would
create a new matrix room or return preexisting room when a project id is
provided. It would invite members to the room as well. Note: due to the
architechture the members would need to accept the invitation to join. This
should be doable by listening to invite events. ID is an opaque room id. This
endpoint could live anywhere and has no reason to be inside this path.

We implement `auth.matrix.localdomain/oauth2/introspect` endpoint. This is just a
proxy that returns early for some case and int other cases, it would just
forward the request to `matrix-authentication-service`. This endpoint needs to
live in this path since we are acting as middleman for the standard oauth
endpoint.

## Known Issues
- Element web contains many features we don't actually require such as: configuration reload watching, settings watch, jitsi call. I think we can delete half of the stuff and create a lighter weight component by incrementally replacing the components one by one. With enough deletion, we will have only enough components that we need. For changing the whole way element works, we could replace the base elements with houzz components and it would look like houzz.
- Interactive Bots: This one's messy. There are two paths
  - Modals: We could show modals, which work fantastically already.
  - Inline: We create custom URIs like houzz://quiz/xw4a3fc and then intercept the `LinkPreviewWidget` to show a custom html widget that would interact as it would on a dialog.

For interception, there is a framework based on [customizations.md](https://github.com/vector-im/element-web/blob/develop/docs/customisations.md)


## TODO
- [x] exchange jukwaa header to an access token
- [x] verify it works with synapse for normal flow
- [x] combine oidc and companion app on same server
- check if jwt access token can be enabled properly
- Backchannel to generate an accesstoken for the bot account
- Backchannel to generate accesstoken for auto-accepting the invites
- idtoken and accesstoken

## Exchanging jukwaa header for access-token
Make a call at token endpoint with grant_type token-exchange. The endpoint will extract the jukwaa
header and that will be used to authenticate the user. Right now, only userId and locale is set https://github.com/Houzz/jukwaa-packages/blob/bd5a2c52373be727d81096118784b9b5d3c9f5af/packages/request-proxy/src/jukwaaInfoFetcher.ts#L22

We will need to update this to add more user info onto the header. #todo

```
const exchange = (url: string) => post(url, new URLSearchParams({
  client_id: "0000000000000000000SYNAPSE",
  grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
  audience: "urn:houzz.com",
  resource: "matrix"
}));
```

For a running example, see lib.ts.