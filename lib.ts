export async function getIntrospectionToken(token: string) {
  const res = await fetch("http://localhost:8000/oauth2/introspect", {
    method: "POST",
    headers: {
      Authorization:
        "Basic MDAwMDAwMDAwMDAwMDAwMDAwMFNZTkFQU0U6U29tZVJhbmRvbVNlY3JldA==",
    },
    body: new URLSearchParams({
      token,
      token_type_hint: "access_token",
    }),
  });
  const json = await res.json();
  return json;
}

const res = await getIntrospectionToken("A");

console.log({ res });
