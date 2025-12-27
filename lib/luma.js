const axios = require("axios");
const fs = require("fs");
const path = require("path");

const api = {
  xterm: {
    url: "https://api.termai.cc",
    key: "aliceezuberg"
  }
};

async function downloadFile(url, destination) {
  const writer = fs.createWriteStream(destination);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream"
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

module.exports = async function Luma(buffer, onProgress = () => {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.post(
        `${api.xterm.url}/api/img2video/luma?key=${api.xterm.key}`,
        buffer,
        {
          headers: {
            "Content-Type": "application/octet-stream"
          },
          responseType: "stream"
        }
      );

      response.data.on("data", async (chunk) => {
        try {
          const eventString = chunk.toString();
          const match = eventString.match(/data: (.+)/);

          if (!match || !match[1]) return;

          const data = JSON.parse(match[1]);
          console.log(data);

          switch (data.status) {
            case "pending":
            case "processing":
            case "queueing":
            case "generating":
              onProgress(data.msg || data.status);
              break;

            case "completed":
              response.data.destroy();

              const videoUrl = data.video?.url;
              if (!videoUrl) return reject("Video URL not found!");

              const outDir = path.join(__dirname, "output");
              if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

              const filePath = path.join(outDir, `${Date.now()}.mp4`);
              await downloadFile(videoUrl, filePath);

              return resolve({
                status: "success",
                file: filePath,
                raw: data
              });

            case "failed":
            case "error":
              response.data.destroy();
              return reject(data.msg || "API failed!");

            default:
              onProgress(`Status: ${data.status}`);
              break;
          }

        } catch (e) {
          response.data.destroy();
          return reject(e);
        }
      });

      response.data.on("error", reject);

    } catch (err) {
      reject(err);
    }
  });
};