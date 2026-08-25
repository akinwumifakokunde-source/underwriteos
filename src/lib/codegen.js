import { API_BASE_URL } from "@/lib/apiConfig";

// Paths are relative to API_BASE_URL (which already includes /v1).
// This guarantees the URL is never doubled (no /v1/v1).
export function buildCurl({ method, path, body, headers = {} }) {
  const url = API_BASE_URL + path;
  const h = { "Authorization": "Bearer <sandbox_key>", "Content-Type": "application/json", ...headers };
  let cmd = `curl -X ${method} '${url}'`;
  for (const [k, v] of Object.entries(h)) cmd += ` \\\n  -H '${k}: ${v}'`;
  if (body && method !== "GET") cmd += ` \\\n  -d '${JSON.stringify(body)}'`;
  return cmd;
}

export function buildPython({ method, path, body, headers = {} }) {
  const url = API_BASE_URL + path;
  const h = { "Authorization": "Bearer <sandbox_key>", "Content-Type": "application/json", ...headers };
  const headersStr = Object.entries(h).map(([k, v]) => `    "${k}": "${v}"`).join(",\n");
  const payload = body && method !== "GET" ? JSON.stringify(body, null, 4) : "None";
  return `import requests

url = "${url}"
headers = {
${headersStr}
}
payload = ${payload}

response = requests.${method.toLowerCase()}(url, json=payload, headers=headers)
print(response.status_code)
print(response.json())`;
}

export function buildJs({ method, path, body, headers = {} }) {
  const url = API_BASE_URL + path;
  const h = { "Authorization": "Bearer <sandbox_key>", "Content-Type": "application/json", ...headers };
  const headersStr = Object.entries(h).map(([k, v]) => `    "${k}": "${v}"`).join(",\n");
  const bodyStr = body && method !== "GET" ? JSON.stringify(body, null, 2) : "undefined";
  return `const res = await fetch("${url}", {
  method: "${method}",
  headers: {
${headersStr}
  },
  body: ${bodyStr}
});

const data = await res.json();
console.log(data);`;
}