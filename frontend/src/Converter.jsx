import { useEffect, useState } from "react";

// Default pair for each converter type
const DEFAULTS = {
  currency: ["TND", "EUR"],
};

// Show "DT" in the UI while keeping the ISO code TND as the value
const label = (u) => (u === "TND" ? "DT (TND)" : u);

export default function Converter({ type, onSave }) {
  const [list, setList] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("100");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  // load the units for the selected type
  useEffect(() => {
    fetch(`/api/units/${type}`)
      .then((r) => r.json())
      .then((data) => {
        setList(data);
        const [defFrom, defTo] = DEFAULTS[type] || [];
        setFrom(data.includes(defFrom) ? defFrom : data[0]);
        setTo(data.includes(defTo) ? defTo : data[1] || data[0]);
      })
      .catch(() => setError("Serveur inaccessible"));
  }, [type]);

  const convert = async (save = false) => {
    if (!from || !to || amount === "") return;
    try {
      const r = await fetch(
        `/api/convert?type=${type}&from=${from}&to=${to}&amount=${amount}`
      );
      const data = await r.json();
      if (!r.ok) return setError(data.error);
      setError("");
      setResult(data.result);
      if (save)
        onSave({ type, from, to, amount, result: data.result, date: data.date });
    } catch {
      setError("Erreur réseau");
    }
  };

  // automatic conversion
  useEffect(() => {
    convert(false);
  }, [from, to, amount]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <section className="card">
      <h2>{type.charAt(0).toUpperCase() + type.slice(1)} Converter</h2>

      <div className="converter">
        <div>
          <label>From</label>
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {list.map((u) => (
              <option key={u} value={u}>{label(u)}</option>
            ))}
          </select>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <button className="swap" onClick={swap}>⇄</button>

        <div>
          <label>To</label>
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {list.map((u) => (
              <option key={u} value={u}>{label(u)}</option>
            ))}
          </select>
          <input type="text" value={result} readOnly />
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      <button className="primary" onClick={() => convert(true)}>
        Save to history
      </button>
    </section>
  );
}