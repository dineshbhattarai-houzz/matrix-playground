
import { client } from "../../src/oidc/config.js";
import { ExchangeTokenResponse, getOpenIdClient } from "./client.js";
import process from "node:process";

const PORT = process.env.PORT;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME

export function getAdminTokensProvider(){
  let adminTokens: ExchangeTokenResponse | undefined = undefined;
  return {
     async get() : Promise<ExchangeTokenResponse>{
        if(adminTokens){
          return adminTokens;
        }

        const openIdClient = await getOpenIdClient(
          `http://localhost:${PORT}/oidc`,
          client.id,
          client.secret,
        );
      
        const mockUserInfo = {
          user: {
            userId: ADMIN_USERNAME,
            username: ADMIN_USERNAME,
          },
        };
        
        // get and update accesstoken
        adminTokens = await openIdClient.exchange(mockUserInfo, "admin-job");
        setInterval(async() => {
            const newToken = await openIdClient.refresh(adminTokens!);
            adminTokens = newToken;
        }, adminTokens.expires_in * 1000 / 2);
        return adminTokens;
      }
  }
}

