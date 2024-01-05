
const mockUserInfo = {
    user: {
      userId: "dineshdb",
      username: "dineshdb"
    },
  };
async function getUserToken(){
    const res = await fetch("http://auth.matrix.localdomain/oidc/token", {
        method: "POST",
        headers: {
            "Authorization": 'Basic '+ btoa(`0000000000000000000SYNAPSE:SomeRandomSecret`),
            "jukwaa-infos": JSON.stringify(mockUserInfo),

        },
        body: new URLSearchParams({
            client_id: "0000000000000000000SYNAPSE",
            grant_type: 'urn:ietf:params:oauth:grant-type:jukwaa-token-exchange',
            audience: "urn:houzz.com",
        })
    });
    return await res.json()
}

const abc = await getUserToken();
console.log(abc)