## Requirements

- Linux
- docker-compose with docker
- Deno

## Getting Started

```bash
# cmd for creating configuration file. One is already generated for you
sudo podman run -v synapse:/data:z -e SYNAPSE_SERVER_NAME=matrix.localhost -e SYNAPSE_REPORT_STATS=yes docker.io/matrixdotorg/synapse:latest generate


# start the stack
docker-compose up -d

# you will need to sync oauth clients using. It contains a client used by synapse to make the api calls
# on first run, wait while the database is migrated
sudo podman run -v ./server/mas.yaml:/config.yaml:z --network=matrix_default ghcr.io/matrix-org/matrix-authentication-service:main --config=/config.yaml config sync

# note: synapse might fail to initialize data on first run due to postgres taking some time to initialize. Simply restart synapse after few seconds


## create a admin user using 
sudo podman exec -it systemd-synapse bash -c "register_new_matrix_user -c /data/homeserver.yaml"
```

## Architecture

### Matrix Api Server

This is the main api server. It communicates with a oauth2 provider for login
Internally, when this server receives a opaque token, it calls the /oauth2/introspect ednpoint of 
the provider to get user details. Technically, we could implement this endpoint and provide the 
details about Houzz Pro's and remove the need for login endpoints altogether.

TODO: The get profile endpoint from element web gives error. Which means there should be another 
endpoint that's failing. However, we won't need to show the chat user profile so that seems to be low priority.

Note: matrix api server sends the introspection request to the public domain set. As a result, you need to 

### Element Web

This is shallow shell that builds around `matrix-react-sdk` and provides the complete client.

Follow the [getting started guide](https://github.com/vector-im/element-web/#setting-up-a-dev-environment). Use
[element.config.json](element.config.json) as `config.json` for element-web.

Following things are being verified:
- [ ] Theming: We can customize the theme and apply it. However, how to do it exactly is yet to be seen
- [ ] Extension of the platform using bots and apps
- [ ] Automatic acceptance of invite

### Custom API
- API to get a room: this endpoint would create a new matrix room or return preexisting room
	when a project id is provided. It would invite members to the room as well. Note: due to the architechture
	the members would need to accept the invitation to join. This should be doable by listening to 
	invite events.

```
# /etc/hosts

# public url of your local interface. synapse uses this domain to call introspection url
# also, this needs to be available via browser for login
192.168.18.109 matrix.localdomain
```
