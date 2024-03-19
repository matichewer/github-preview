const http = require("http");
const https = require("https");
const url = require("url");
const cheerio = require("cheerio");
require('dotenv').config();

const hostname = process.env.HOST_NAME || 'localhost';
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const username = parsedUrl.pathname.split('/')[1];
  const repoName = parsedUrl.pathname.split('/')[2];

  if (!username || !repoName) {
    res.statusCode = 400;
    res.end("Bad Request: Missing username or repo name");
    return;
  }

  // Construct GitHub URL from username and repoName
  const githubUrl = `https://github.com/${username}/${repoName}`;

  const requestOptions = {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  };

  const proxyReq = https.request(githubUrl, requestOptions, (proxyRes) => {
    let responseData = "";

    proxyRes.on("data", (chunk) => {
      responseData += chunk;
    });

    proxyRes.on("end", () => {
      const $ = cheerio.load(responseData);

      const title = $('meta[property="og:title"]').attr("content") || "";
      const description =
        $('meta[property="og:description"]').attr("content") || "";
      const imageUrl = $('meta[property="og:image"]').attr("content") || "";

      const jsonResponse = {
        title: title,
        description: description,
        imageUrl: imageUrl,
      };

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
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
