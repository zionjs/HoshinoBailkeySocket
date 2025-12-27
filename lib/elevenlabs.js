const axios = require("axios");

const api = {
  xterm: {
    url: "https://api.termai.cc",
    key: "aliceezuberg"
  }
};

async function Elevenlabs(text, voice, pitch, speed) {
  try {
    const url = `${api.xterm.url}/api/text2speech/elevenlabs`;
    
    const response = await axios.get(url, {
      params: {
        text,
        voice,
        pitch,
        speed,
        key: api.xterm.key
      },
      responseType: "arraybuffer" // penting untuk audio
    });

    return response.data; // ini adalah audio buffer
  } catch (error) {
    console.error("Fetch error:", error.response ? error.response.data : error);
    throw error;
  }
}

module.exports = Elevenlabs;

// Contoh penggunaan:
Elevenlabs("hallo", "bella", 0, 0.9)
  .then(audioBuffer => {
  })
  .catch(error => {
    console.error("Error in Elevenlabs:", error);
  });