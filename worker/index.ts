/// <reference types="@cloudflare/workers-types" />

interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    // 处理 API 请求
    if (url.pathname.startsWith("/api/")) {
      return Response.json({
        message: "Hello from Docu-Notes API!",
        timestamp: new Date().toISOString()
      });
    }

    // 对于其他请求，返回静态资源或 404
    try {
      return await env.ASSETS.fetch(request);
    } catch {
      return new Response("Not Found", { status: 404 });
    }
  },
} satisfies ExportedHandler<Env>; 
