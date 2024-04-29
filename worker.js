import handleProxy from "./proxy.js";
import handleRedirect from "./redirect.js";
import apiRouter from "./router.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return handleBCRAApi(request, env);
    }

    switch (url.pathname) {
      case "/redirect":
        return handleRedirect.fetch(request, env, ctx);
      case "/proxy":
        return handleProxy.fetch(request, env, ctx);
      case "/api/bcra":
        return handleBCRAApi(request, env);
    }

    if (url.pathname.startsWith("/api/")) {
      return apiRouter.handle(request);
    }

    return new Response(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="Explore API endpoints">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="API Endpoints">
        <meta name="twitter:description" content="Explore various API endpoints available.">
        <title>API Endpoints</title>
        <style>
          @import url('https://cdn.jsdelivr.net/npm/tailwindcss@^2.0/dist/tailwind.min.css');
        </style>
      </head>
      <body class="bg-gray-100 flex flex-col justify-between min-h-screen">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-2xl font-bold text-gray-800 mb-4">Page not found</h1>
          <p>Try accessing <a href="/" class="text-blue-500 hover:text-blue-700 transition duration-150 ease-in-out">Home Page</a></p>
        </div>
        <footer class="bg-gray-800 text-white text-center p-4 mt-8">
          Hecho con ❤️ por <a href="https://github.com/Beor18" class="text-blue-300 hover:text-blue-500 transition duration-150 ease-in-out">Fernando Lopez</a>
        </footer>
      </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  },
};

async function handleBCRAApi(request, env) {
  const apiURL = "https://api.bcra.gob.ar/estadisticas/v1/principalesvariables";
  const headers = {
    Authorization: `BEARER ${env.BCRA_API_KEY}`,
  };

  try {
    const response = await fetch(apiURL, { headers });
    const data = await response.json();

    const cards = data.results
      .map(
        (item) => `
      <div class="bg-white shadow-md rounded-lg p-6 my-4 w-96">
        <h2 class="text-lg font-semibold text-gray-900">${item.descripcion}</h2>
        <p class="text-gray-600">${item.fecha}</p>
        <p class="text-gray-800 font-bold">${item.valor}</p>
      </div>
    `
      )
      .join("");

    return new Response(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="Detailed BCRA Data Display">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="BCRA Data">
        <meta name="twitter:description" content="Detailed financial data from BCRA.">
        <title>BCRA Data</title>
        <style>
          @import url('https://cdn.jsdelivr.net/npm/tailwindcss@^2.0/dist/tailwind.min.css');
        </style>
      </head>
      <body class="bg-gray-100 flex flex-col justify-between min-h-screen">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-2xl font-bold text-gray-800 mt-4 mb-4">BCRA Data</h1>
          <div class="flex flex-col items-center">${cards}</div>
        </div>
        <footer class="bg-gray-800 text-white text-center p-4 mt-8">
          Hecho con ❤️ por <a href="https://github.com/Beor18" class="text-blue-300 hover:text-blue-500 transition duration-150 ease-in-out">Fernando Lopez</a>
        </footer>
      </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
