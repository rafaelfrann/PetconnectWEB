import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = 5000;

app.use(cors());

const CLIENT_ID = process.env.VITE_PETFINDER_CLIENT_ID;
const CLIENT_SECRET = process.env.VITE_PETFINDER_CLIENT_SECRET;

async function getAccessToken() {
  try {
    const res = await axios.post("https://api.petfinder.com/v2/oauth2/token", {
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });
    return res.data.access_token;
  } catch (error) {
    console.error("Erro ao obter token:", error.response?.data || error.message);
    return null;
  }
}

app.get("/pets", async (req, res) => {
  const token = await getAccessToken();
  if (!token) return res.status(500).json({ error: "Não foi possível obter token" });

  try {
    const petsRes = await axios.get("https://api.petfinder.com/v2/animals?limit=10", {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.json(petsRes.data.animals); // envia array de animais
  } catch (error) {
    console.error("Erro ao buscar animais:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao buscar pets" });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
