import { getOpenIdClient } from "./src/oidc/client.ts";

const openIdClient = await getOpenIdClient("http://localhost:3000/oidc", "0000000000000000000SYNAPSE", "SomeRandomSecret")

const mockUserInfo = {
  user: {
    userId: "2",
    username: "2"
  }
};

const userTokens = await openIdClient.exchange(mockUserInfo);
console.log(userTokens)

const res1 = await openIdClient.introspect(userTokens.access_token);

// const matrixClient = getMatrixClient("2", userTokens.access_token)

// matrixClient.on("Room.timeline", (event, room, toStartOfTimeline) => {
//   if (event.getType() !== "m.room.message") {
//     return; // only use messages
//   }
//   console.log(event)
// });

// matrixClient.startClient({ initialSyncLimit: 1 });