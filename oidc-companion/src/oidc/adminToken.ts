
import { client } from "../../src/oidc/config.js";
import { MATRIX_ADMIN_USERNAME, PORT } from "../config.js";
import { ExchangeTokenResponse, getOpenIdClient } from "./client.js";

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
            userId: MATRIX_ADMIN_USERNAME,
            username: MATRIX_ADMIN_USERNAME,
          },
        };
        
        // get and update accesstoken
        adminTokens = await openIdClient.exchange(mockUserInfo, "admin-job");
        console.info('acquired admin access tokens');
        setInterval(async() => {
            const newToken = await openIdClient.refresh(adminTokens!);
            adminTokens = newToken;
        }, adminTokens.expires_in * 1000 / 2);
        return adminTokens;
      }
  }
}

