import express from "express";
import axios from "axios";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cheerio from "cheerio";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientPath = path.join(__dirname, "../client/dist");

function extractJSONFromHTML(html) {
  const match =
    html.match(/window\.__SIGI_STATE__\s*=\s*({.*?})\s*;<\/script>/s) ||
    html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

app.post("/api/extract", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL obrigatória." });

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/119.0 Safari/537.36"
      },
      timeout: 10000
    });

    const html = response.data;
    const data = extractJSONFromHTML(html);

    if (data) {
      const str = JSON.stringify(data);
      const match = str.match(/"playAddr":"(https:\/\/[^"]+)"/);
      if (match) {
        const videoUrl = match[1].replace(/\\u0026/g, "&").replace(/\\/g, "");
        return res.json({ video: { url: videoUrl } });
      }
    }

    const $ = cheerio.load(html);
    const meta = $('meta[property="og:video"]').attr("content");
    if (meta) return res.json({ video: { url: meta } });

    return res.status(404).json({ error: "Não foi possível extrair o vídeo." });
  } catch (err) {
    console.error("Erro:", err.message);
    return res.status(500).json({ error: "Erro ao processar URL." });
  }
});

app.use(express.static(clientPath));
app.get("*", (_, res) => res.sendFile(path.join(clientPath, "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
