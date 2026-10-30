import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const API = "https://api.frankfurter.dev/v1";

const units = {
  length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, ft: 0.3048, in: 0.0254 },
  weight: { kg: 1, g: 0.001, lb: 0.45359237, oz: 0.028349523 },
};

const toC = { C: (v) => v, F: (v) => ((v - 32) * 5) / 9, K: (v) => v - 273.15 };
const fromC = { C: (v) => v, F: (v) => (v * 9) / 5 + 32, K: (v) => v + 273.15 };

// Liste des unités / devises
app.get("/api/units/:type", async (req, res) => {
  const { type } = req.params;
  try {
    if (type === "currency") {
      const r = await fetch(`${API}/currencies`);
      const codes = Object.keys(await r.json());
      if (!codes.includes("TND")) codes.push("TND");
      return res.json(codes);
    }
    if (type === "temperature") return res.json(["C", "F", "K"]);
    if (units[type]) return res.json(Object.keys(units[type]));
    res.status(400).json({ error: "Type inconnu" });
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Conversion
app.get("/api/convert", async (req, res) => {
  const { type, from, to } = req.query;
  const amount = parseFloat(req.query.amount);
  if (isNaN(amount)) return res.status(400).json({ error: "Montant invalide" });

  try {
    let result, rate;
    if (type === "currency") {
      if (from === to) {
        result = amount; rate = 1;
      } else if (from === "TND" || to === "TND") {
        // Frankfurter (ECB) has no TND, so use another source
        const r = await fetch(`https://open.er-api.com/v6/latest/${from}`);
        const data = await r.json();
        rate = data.rates?.[to];
        if (!rate) return res.status(400).json({ error: "Taux indisponible" });
        result = amount * rate;
      } else {
        const r = await fetch(`${API}/latest?base=${from}&symbols=${to}`);
        const data = await r.json();
        rate = data.rates[to];
        result = amount * rate;
      }
    } else if (type === "temperature") {
      result = fromC[to](toC[from](amount));
    } else if (units[type]) {
      rate = units[type][from] / units[type][to];
      result = amount * rate;
    } else {
      return res.status(400).json({ error: "Type inconnu" });
    }
    res.json({ result: Number(result.toFixed(4)), rate, date: new Date() });
  } catch {
    res.status(500).json({ error: "Erreur de conversion" });
  }
});

app.listen(5000, () => console.log("API sur http://localhost:5000"));