// Offline stand-in for Vimeo oEmbed in tests: one known video, everything else 404s
// (which exercises the fallbacks).
const KNOWN: Record<string, unknown> = {
  "22439234": { title: "Mock Vimeo Title" },
};

export default async function fixtureFetch(url: string): Promise<Response> {
  const id = /vimeo\.com%2F(\d+)/.exec(url)?.[1] ?? "";
  const body = KNOWN[id];
  return body
    ? new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } })
    : new Response("Not Found", { status: 404 });
}
