import { getOpenIdClient } from "./src/oidc/client.ts";
import { client } from "./src/oidc/config.ts";
import "./main.ts";
import { createDevice, getMatrixClient } from "./src/matrix/client.ts";

const local = 'http://localhost:3000/oidc';
const docker = "http://auth.matrix.localhost/oidc";

const openIdClient = await getOpenIdClient(
  docker,
  client.id,
  client.secret,
);

const mockUserInfo = {
  user: {
    userId: "dineshdb",
    username: "dineshdb"
  },
};

const userTokens = await openIdClient.exchange(mockUserInfo);
console.log(JSON.stringify(userTokens.access_token), userTokens.scope)
console.log("introspect", await openIdClient.introspect(userTokens.access_token));

const newToken = await openIdClient.refresh(userTokens);
console.log(newToken)

console.log("introspect", await openIdClient.introspect(newToken.access_token));

const matrixClient = getMatrixClient(mockUserInfo.user.username, newToken.access_token);
matrixClient.on("Room.timeline", (event, room, toStartOfTimeline) => {
  if (event.getType() !== "m.room.message") {
    return; // only use messages
  }
  console.log(event);
});

matrixClient.startClient({ initialSyncLimit: 1 });
