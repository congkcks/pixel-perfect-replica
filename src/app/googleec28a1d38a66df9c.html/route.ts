export function GET() {
  return new Response("google-site-verification: googleec28a1d38a66df9c.html\n", {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
