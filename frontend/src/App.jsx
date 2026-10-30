import { useState } from "react";
import Converter from "./Converter.jsx";

const tabs = [
  { id: "currency", label: "💲 Currency" },
  { id: "temperature", label: "🌡️ Temperature" },
  { id: "length", label: "📏 Length" },
  { id: "weight", label: "⚖️ Weight" },
];

export default function App() {
  const [type, setType] = useState("currency");
  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("history") || "[]")
  );

  const addHistory = (item) => {
    const next = [item, ...history].slice(0, 10);
    setHistory(next);
    localStorage.setItem("history", JSON.stringify(next));
  };

  const removeItem = (i) => {
    const next = history.filter((_, idx) => idx !== i);
    setHistory(next);
    localStorage.setItem("history", JSON.stringify(next));
  };

  const clearAll = () => {
    setHistory([]);
    localStorage.removeItem("history");
  };

  return (
    <div className="app">
      <header>
        <h1>Convertly</h1>
        <p>All your conversions in one place</p>
      </header>

      <div className="layout">
        <nav>
          {tabs.map((t) => (
            <button
              key={t.id}
              className={type === t.id ? "active" : ""}
              onClick={() => setType(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <main>
          <Converter key={type} type={type} onSave={addHistory} />

          <section className="card">
            <div className="row-between">
              <h3>Conversion History</h3>
              <button className="link" onClick={clearAll}>Clear all</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date</th><th>Type</th><th>From</th><th>To</th>
                  <th>Amount</th><th>Result</th><th></th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td>{new Date(h.date).toLocaleString()}</td>
                    <td>{h.type}</td>
                    <td>{h.from}</td>
                    <td>{h.to}</td>
                    <td>{h.amount}</td>
                    <td>{h.result}</td>
                    <td><button className="link" onClick={() => removeItem(i)}>🗑</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  );
}