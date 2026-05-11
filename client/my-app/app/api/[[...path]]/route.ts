export const runtime = "nodejs";

const normalizeBaseUrl = (value: string) => value.replace(/\/api\/?$/, "");

const handler = async (request: Request) => {
  const baseUrl =
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:5000";
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(
    `${incomingUrl.pathname}${incomingUrl.search}`,
    normalizedBaseUrl
  );

  const headers = new Headers(request.headers);
  headers.delete("host");

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
};

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE, handler as OPTIONS, handler as HEAD };
