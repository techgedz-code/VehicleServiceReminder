export default async function handler(req: Request) {
  return new Response(JSON.stringify({ 
    message: 'Edge Function works!', 
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
}