const express = require("express");
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const url = require("url");
const cheerio = require("cheerio");
require("dotenv").config();

const hostname = process.env.HOST_NAME || "localhost";
const port = process.env.PORT || 3000;

const app = express();
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/:user/:repo", async (req, res) => {
  console.log("Processing...");
  const username = req.params.user;
  const repoName = req.params.repo;

  const repoCheckResult = await checkRepoExists(username, repoName);
  if (repoCheckResult.error) {
    res.status(404).json({ error: repoCheckResult.error });
    return;
  }

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

async function checkRepoExists(username, repoName) {
  const apiUrl = `https://api.github.com/repos/${username}/${repoName}`;
  
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.message === "Not Found") {
      const msg = "Repository not found. Check username and repository name";
      console.error(msg);
      return { error: msg };
    }
  } catch (error) {
    console.error("Network error:", error);
    return {
      error: "Network error",
    };
  }
  return { success: true };
}


const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
