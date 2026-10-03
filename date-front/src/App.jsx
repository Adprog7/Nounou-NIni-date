import { useRef, useState } from "react";
import "./App.css";

const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");const DAYS = ["L", "M", "M", "J", "V", "S", "D"];
// 32 = 1er novembre. Les lettres regroupent les week-ends.
const OK = { 10: "a", 11: "a", 17: "b", 18: "b", 31: "c", 32: "c" };
const NAMES = {
  10: "samedi 10 octobre", 11: "dimanche 11 octobre",
  17: "samedi 17 octobre", 18: "dimanche 18 octobre",
  31: "samedi 31 octobre", 32: "dimanche 1er novembre",
};
const TIMES = ["12:00", "14:00", "17:00", "19:00", "20:00", "21:00"];
const FOODS = [
  { e: "🌮", n: "Tacos" },
  { e: "🍕", n: "Pizza" },
  { e: "🍝", n: "Pâtes" },
  { e: "🍗", n: "Poulet" },
];
const NO_TEXTS = ["Non", "Vraiment ?", "Réfléchis 🥺", "Allez !", "Pitié 🥹", "Même pas un peu ?"];
const ARENA_H = 190;

export default function App() {
  const [step, setStep] = useState(0);
  const [day, setDay] = useState(null);
  const [time, setTime] = useState(null);
  const [food, setFood] = useState(null);
  const [no, setNo] = useState({ x: 0, y: 100 });
  const [noText, setNoText] = useState("Non");
  const [tries, setTries] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | sending | error
  const arena = useRef(null);

  // cœurs qui flottent en fond (générés une seule fois)
  const [hearts] = useState(() =>
    Array.from({ length: 16 }, () => ({
      left: Math.random() * 100,
      size: 14 + Math.random() * 26,
      dur: 9 + Math.random() * 10,
      delay: -Math.random() * 18,
    }))
  );

  const dodge = () => {
    const w = arena.current?.clientWidth ?? 300;
    const maxX = w / 2 - 70;
    let x, y, n = 0;
    do {
      x = (Math.random() * 2 - 1) * maxX;
      y = Math.random() * (ARENA_H - 50);
      n++;
    } while (
      n < 25 &&
      ((Math.abs(x - no.x) < 70 && Math.abs(y - no.y) < 40) || // pas au même endroit
        (y < 85 && Math.abs(x) < 120)) // pas sur le bouton Oui
    );
    setNo({ x, y });
    setTries((t) => t + 1);
    setNoText(NO_TEXTS[Math.floor(Math.random() * NO_TEXTS.length)]);
  };

  const submit = async (chosen) => {
    setFood(chosen);
    setStatus("sending");
    setStep(4);
    try {
      const res = await fetch(`${API}/api/date`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ day: NAMES[day], time, food: chosen.n }),
      });
      if (!res.ok) throw new Error();
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  const cell = (d) => {
    const label = d === 32 ? "1 nov" : d;
    if (!OK[d]) return <button key={d} disabled>{label}</button>;
    const selected = day && OK[day] === OK[d];
    return (
      <button key={d} className={"avail" + (selected ? " sel" : "")} onClick={() => setDay(d)}>
        {label}
      </button>
    );
  };

  const ouiScale = Math.min(1 + tries * 0.07, 1.4);

  return (
    <>
      <div className="hearts" aria-hidden="true">
        {hearts.map((h, i) => (
          <span key={i} style={{
            left: h.left + "%", fontSize: h.size,
            animationDuration: h.dur + "s", animationDelay: h.delay + "s",
          }}>💗</span>
        ))}
      </div>

      <main className="card" key={step}>
        {step === 0 && (
          <>
            <div className="big pulse">💌</div>
            <h1>Nini, une question…</h1>
            <p>Veux-tu aller à un date avec moi ?</p>
            <div className="arena" ref={arena} style={{ height: ARENA_H }}>
              <button
                className="oui"
                style={{ transform: `translateX(-50%) scale(${ouiScale})` }}
                onClick={() => setStep(1)}
              >
                Oui 💖
              </button>
              <button
                className="non"
                style={{ transform: `translate(calc(-50% + ${no.x}px), ${no.y}px)` }}
                onPointerEnter={dodge}
                onClick={dodge}
              >
                {noText}
              </button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="big">📅</div>
            <h1>Quel week-end ?</h1>
            <p>Octobre 2026</p>
            <div className="grid">
              {DAYS.map((d, i) => <span key={i} className="dn">{d}</span>)}
              {[0, 1, 2].map((i) => <span key={"e" + i} />)}
              {Array.from({ length: 31 }, (_, i) => cell(i + 1))}
              {cell(32)}
            </div>
            <button className="cta" disabled={!day} onClick={() => setStep(2)}>Suivant</button>
            <br /><button className="back" onClick={() => setStep(0)}>← retour</button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="big">⏰</div>
            <h1>À quelle heure ?</h1>
            <p>{NAMES[day]}</p>
            <div className="opts three">
              {TIMES.map((t) => (
                <button key={t} className={"opt" + (time === t ? " sel" : "")}
                  onClick={() => { setTime(t); setStep(3); }}>{t}</button>
              ))}
            </div>
            <button className="back" onClick={() => setStep(1)}>← retour</button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="big">😋</div>
            <h1>Tu as envie de quoi ?</h1>
            <p>Choisis ton plat préféré</p>
            <div className="opts">
              {FOODS.map((f) => (
                <button key={f.n} className="opt food" onClick={() => submit(f)}>
                  <span className="fe">{f.e}</span>{f.n}
                </button>
              ))}
            </div>
            <button className="back" onClick={() => setStep(2)}>← retour</button>
          </>
        )}

        {step === 4 && (
          <>
            <div className="big pop">🎉</div>
            <h1>Date confirmé !</h1>
            <div className="recap">
              <div>📅 {NAMES[day]}</div>
              <div>⏰ {time}</div>
              <div>🍽️ {food?.e} {food?.n}</div>
            </div>
            <p>Nounou choisit le restaurant 😉<br />Tu vas kiffer !</p>
            {status === "sending" && <p>Envoi en cours…</p>}
            {status === "error" && (
              <button className="cta" onClick={() => submit(food)}>
                Oups, réessayer l'envoi
              </button>
            )}
          </>
        )}
      </main>
    </>
  );
}