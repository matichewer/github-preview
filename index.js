const http = require("http");
const https = require("https");
const url = require("url");
const cheerio = require("cheerio");
require('dotenv').config();

// Usage: http://localhost:3000/index.html?url=https://github.com/matichewer/PDF-Password-Remover

const hostname = process.env.HOST_NAME || 'localhost';
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const targetUrl = parsedUrl.query.url;

  if (!targetUrl) {
    res.statusCode = 400;
    res.end("Bad Request: Missing URL parameter");
    return;
  }

  const requestOptions = {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0", // Set a user agent to prevent some servers from blocking the request
    },
  };

  const proxyReq = https.request(targetUrl, requestOptions, (proxyRes) => {
    let responseData = "";

    proxyRes.on("data", (chunk) => {
      responseData += chunk;
    });

    proxyRes.on("end", () => {
      // Load HTML into cheerio
      const $ = cheerio.load(responseData);

      // Extract Open Graph meta tags
      const title = $('meta[property="og:title"]').attr("content") || "";
      const description =
        $('meta[property="og:description"]').attr("content") || "";
      const imageUrl = $('meta[property="og:image"]').attr("content") || "";

      // Construct JSON response
      const jsonResponse = {
        title: title,
        description: description,
        imageUrl: imageUrl,
      };

      // Set response headers and send JSON response
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*"); // Allow CORS from any origin
      res.end(JSON.stringify(jsonResponse));
    });
  });

  proxyReq.on("error", (error) => {
    console.error("Error:", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  });

  proxyReq.end();
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
