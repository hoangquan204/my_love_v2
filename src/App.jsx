import { useEffect, useId, useMemo, useRef, useState } from "react";

const HEART_PATH =
  "M100 170 C20 110 0 70 0 45 C0 20 20 0 50 0 C75 0 92 15 100 30 C108 15 125 0 150 0 C180 0 200 20 200 45 C200 70 180 110 100 170 Z";

/* ---------- Tính phần trăm: cùng một cặp tên luôn ra cùng kết quả ---------- */
function normalize(name) {
  return name.trim().toLowerCase().normalize("NFC").replace(/\s+/g, " ");
}

function fnv1a(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function calcLove(a, b) {
  const pair = [normalize(a), normalize(b)].sort().join("♥");
  return 40 + (fnv1a(pair) % 61); // 40 → 100
}

const SLOTS_PER_SIDE = 3; // số ô ghim mỗi bên (trái / phải)
const MAX_PINS = SLOTS_PER_SIDE * 2; // tổng số cặp đôi tối đa được ghim
const STORAGE_KEY = "my-love-pins";

function pairId(a, b) {
  return [normalize(a), normalize(b)].sort().join("♥");
}

function getMessage(p) {
  if (p >= 90) return "Định mệnh của nhau rồi! Hai bạn sinh ra là để dành cho nhau.";
  if (p >= 75) return "Rất hợp nhau! Cứ nắm tay thật chặt và đi cùng nhau nhé.";
  if (p >= 60) return "Khá ăn ý đấy! Thêm chút thấu hiểu mỗi ngày sẽ càng tuyệt hơn.";
  return "Tình yêu cần được vun đắp mỗi ngày. Hai bạn cùng cố gắng nhé!";
}

/* ---------- Trái tim lớn có phần trăm bên trong ---------- */
function BigHeart({ value }) {
  const liquidY = 175 - (175 * value) / 100;

  const bursts = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.25;
        const dist = 145 + Math.random() * 95;
        const symbols = ["♥", "✦", "💖", "✧", "♥", "✨"];
        return {
          symbol: symbols[i % symbols.length],
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist - 30,
          size: 13 + Math.random() * 18,
          delay: Math.random() * 0.45,
          color: i % 3 === 0 ? "#ffd27a" : i % 2 === 0 ? "#ff5c8a" : "#ff2d6b",
        };
      }),
    []
  );

  return (
    <div className="heart-stage">
      <span className="ring ring-1" />
      <span className="ring ring-2" />
      <span className="ring ring-3" />

      {bursts.map((b, i) => (
        <span
          key={i}
          className="burst"
          style={{
            "--dx": `${b.dx}px`,
            "--dy": `${b.dy}px`,
            fontSize: `${b.size}px`,
            color: b.color,
            animationDelay: `${b.delay}s`,
          }}
        >
          {b.symbol}
        </span>
      ))}

      <div className="heart-beat">
        <svg className="heart-svg" viewBox="-6 -6 212 188" aria-hidden="true">
          <defs>
            <clipPath id="heartClip">
              <path d={HEART_PATH} />
            </clipPath>
            <linearGradient id="liquid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f9a0b8" />
              <stop offset="42%" stopColor="#e8295c" />
              <stop offset="100%" stopColor="#900030" />
            </linearGradient>
            <linearGradient id="liquidBack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffcce0" stopOpacity="0.80" />
              <stop offset="100%" stopColor="#c01445" stopOpacity="0.80" />
            </linearGradient>
            <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#fff0f5" stopOpacity="0.90" />
              <stop offset="100%" stopColor="#ffd8e8" stopOpacity="0.85" />
            </linearGradient>
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path d={HEART_PATH} fill="url(#glass)" filter="url(#glow)" />

          <g clipPath="url(#heartClip)">
            <g style={{ transform: `translateY(${liquidY}px)` }}>
              <g className="wave wave-back">
                <path
                  d="M0 8 Q25 -2 50 8 T100 8 T150 8 T200 8 T250 8 T300 8 V220 H0 Z"
                  fill="url(#liquidBack)"
                />
              </g>
              <g className="wave wave-front">
                <path
                  d="M0 8 Q25 -2 50 8 T100 8 T150 8 T200 8 T250 8 T300 8 V220 H0 Z"
                  fill="url(#liquid)"
                />
              </g>
            </g>
          </g>

          {/* Ánh sáng phản chiếu — glass highlight */}
          <path
            d="M30 28 C38 14 56 10 66 16"
            fill="none"
            stroke="#ffffff"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M32 30 C38 18 52 14 62 18"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.95"
          />
          <path d={HEART_PATH} fill="none" stroke="#fff" strokeWidth="3" opacity="0.6" />
        </svg>

        <div className="percent" aria-live="polite">
          {Math.round(value)}
          <small>%</small>
        </div>
      </div>
    </div>
  );
}

/* ---------- Nền trái tim và ánh sao lãng mạn ---------- */
function FloatingHearts() {
  const items = useMemo(() => {
    const symbols = ["♥", "💖", "✦", "♥", "✧", "💕", "♥", "✨", "🌸", "♥"];
    return Array.from({ length: 26 }, (_, i) => ({
      symbol: symbols[i % symbols.length],
      left: Math.random() * 100,
      size: 13 + Math.random() * 24,
      duration: 10 + Math.random() * 12,
      delay: -Math.random() * 20,
      opacity: 0.35 + Math.random() * 0.52,
      drift: (Math.random() - 0.5) * 44,
      rot: (Math.random() - 0.5) * 50,
      color: i % 4 === 0 ? "#ffd27a" : i % 3 === 0 ? "#ff5c8a" : "#ff2d6b",
    }));
  }, []);

  return (
    <div className="bg-hearts" aria-hidden="true">
      {items.map((h, i) => (
        <span
          key={i}
          style={{
            left: `${h.left}%`,
            fontSize: `${h.size}px`,
            color: h.color,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
            "--item-opacity": h.opacity,
            "--drift": `${h.drift}px`,
            "--rot": `${h.rot}deg`,
          }}
        >
          {h.symbol}
        </span>
      ))}
    </div>
  );
}

/* ---------- Trái tim nhỏ có phần trăm trong thẻ ghim ---------- */
function MiniHeart({ pct }) {
  const uid = useId().replace(/:/g, "");
  const y = 175 - (175 * pct) / 100;
  return (
    <div className="pin-heart">
      <svg viewBox="-6 -6 212 188" aria-hidden="true">
        <defs>
          <clipPath id={`c${uid}`}>
            <path d={HEART_PATH} />
          </clipPath>
          <linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff5c8a" />
            <stop offset="50%" stopColor="#ff2d6b" />
            <stop offset="100%" stopColor="#8c0030" />
          </linearGradient>
        </defs>
        <path d={HEART_PATH} fill="transparent" />
        <g clipPath={`url(#c${uid})`}>
          <rect x="-10" y={y} width="220" height="220" fill={`url(#g${uid})`} />
        </g>
        <path d={HEART_PATH} fill="none" stroke="#ff2d6b" strokeWidth="5" opacity="0.7" />
      </svg>
      <span className="pin-pct">
        {pct}
        <small>%</small>
      </span>
    </div>
  );
}

/* ---------- Cột cặp đôi đã ghim (trái hoặc phải) ---------- */
function PinColumn({ side, pins, onRemove }) {
  const mine = pins.filter((p) => p.side === side);
  const empty = Math.max(0, SLOTS_PER_SIDE - mine.length);

  return (
    <aside
      className={`pins-col ${side} ${mine.length ? "has-items" : ""}`}
      aria-label="Cặp đôi đã ghim"
    >
      <div className="pins-head-wrap">
        <h2 className="pins-head">
          <span className="head-heart">♥</span> Đã ghim <span className="head-heart">♥</span>
        </h2>
      </div>

      <ul className="pins-list">
        {mine.map((p) => (
          <li key={p.id} className={`pin ${p.leaving ? "leaving" : ""}`} title={`${p.a} ♥ ${p.b}`}>
            <span className="pushpin" />
            <div className="pin-names" style={{ "--n": p.a.length + p.b.length + 3 }}>
              <span>{p.a}</span>
              <i className="pin-sep">♥</i>
              <span>{p.b}</span>
            </div>
            <MiniHeart pct={p.pct} />
            <button className="pin-x" onClick={() => onRemove(p.id)} aria-label="Bỏ ghim" title="Bỏ ghim">
              ×
            </button>
          </li>
        ))}

        {Array.from({ length: empty }, (_, i) => (
          <li key={`empty-${i}`} className="slot" aria-hidden="true">
            <span className="slot-heart">♡</span>
            <span className="slot-hint">Chờ ghim</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/* ---------- App ---------- */
export default function App() {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [stage, setStage] = useState("form"); // form | loading | result
  const [target, setTarget] = useState(0);
  const [shown, setShown] = useState(0);
  const [couple, setCouple] = useState({ a: "", b: "" });
  const input1Ref = useRef(null);

  useEffect(() => {
    if (stage === "form") {
      input1Ref.current?.focus();
    }
  }, [stage]);
  const [pins, setPins] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!Array.isArray(saved)) return [];
      return saved.slice(-MAX_PINS).map((p, i) => ({
        ...p,
        side: p.side === "left" || p.side === "right" ? p.side : i % 2 ? "right" : "left",
      }));
    } catch {
      return [];
    }
  });

  const canSubmit = name1.trim() && name2.trim();

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setCouple({ a: name1.trim(), b: name2.trim() });
    setTarget(calcLove(name1, name2));
    setShown(0);
    setStage("loading");
  }

  function reset() {
    setName1("");
    setName2("");
    setStage("form");
    setShown(0);
  }

  // lưu danh sách ghim
  useEffect(() => {
    try {
      const clean = pins.filter((p) => !p.leaving).map(({ id, a, b, pct, side }) => ({ id, a, b, pct, side }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    } catch {
      /* bỏ qua nếu trình duyệt chặn localStorage */
    }
  }, [pins]);

  const currentId = pairId(couple.a, couple.b);
  const isPinned = pins.some((p) => p.id === currentId && !p.leaving);

  function handlePin() {
    if (isPinned) return;
    const active = pins.filter((p) => !p.leaving);
    const count = (s) => active.filter((p) => p.side === s).length;
    const item = { id: currentId, a: couple.a, b: couple.b, pct: target };

    if (active.length >= MAX_PINS) {
      // đủ số lượng: cặp ghim đầu tiên biến mất, cặp mới vào đúng chỗ trống đó (ở dưới cùng cột)
      const first = active[0];
      item.side = first.side;
      setPins((prev) => prev.map((p) => (p.id === first.id ? { ...p, leaving: true } : p)));
      setTimeout(() => {
        setPins((prev) => {
          const rest = prev.filter((p) => p.id !== first.id);
          return rest.some((p) => p.id === item.id) ? rest : [...rest, item];
        });
      }, 350);
    } else {
      // còn chỗ: ghim vào bên đang ít cặp hơn (bằng nhau thì bên trái)
      item.side = count("left") <= count("right") ? "left" : "right";
      setPins((prev) => [...prev, item]);
    }
  }

  function removePin(id) {
    setPins((prev) => prev.filter((p) => p.id !== id));
  }

  // loading -> result
  useEffect(() => {
    if (stage !== "loading") return;
    const t = setTimeout(() => setStage("result"), 1800);
    return () => clearTimeout(t);
  }, [stage]);

  // đếm số từ 0 đến phần trăm
  useEffect(() => {
    if (stage !== "result") return;
    const duration = 2800;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(eased * target);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stage, target]);

  const done = Math.round(shown) >= target;

  return (
    <div className={`page ${pins.length ? "with-pins" : ""}`}>
      <FloatingHearts />

      <header className="brand">
        <div className="brand-badge">
          <span className="brand-sparkle left">✨</span>
          <span className="brand-name">My love</span>
          <span className="brand-sparkle right">✨</span>
        </div>
      </header>

      <div className="title-wrap">
        <h1 className="title">Comment tên của 2 bạn để xem độ phù hợp</h1>
        <div className="title-ornament" aria-hidden="true">
          <span className="line" />
          <span className="heart">❦</span>
          <span className="line" />
        </div>
      </div>

      <div className="cluster">
        <PinColumn side="left" pins={pins} onRemove={removePin} />

        <main className="main">
          {stage === "form" && (
            <form className="card" onSubmit={handleSubmit}>
              <div className="card-sparkle-top">✦ ♡ ✦</div>
              <label className="field">
                <span className="field-title">
                  <i className="field-icon">♥</i> Tên người thứ nhất
                </span>
                <input
                  ref={input1Ref}
                  value={name1}
                  onChange={(e) => setName1(e.target.value)}
                  placeholder="Ví dụ: Minh"
                  maxLength={30}
                  autoComplete="off"
                />
              </label>

              <div className="between" aria-hidden="true">
                <i className="line-left" />
                <span className="heart-bead">♥</span>
                <i className="line-right" />
              </div>

              <label className="field">
                <span className="field-title">
                  <i className="field-icon">♥</i> Tên người thứ hai
                </span>
                <input
                  value={name2}
                  onChange={(e) => setName2(e.target.value)}
                  placeholder="Ví dụ: Lan"
                  maxLength={30}
                  autoComplete="off"
                />
              </label>

              <button className="btn btn-submit" type="submit" disabled={!canSubmit}>
                <span className="btn-text">Xem độ phù hợp</span>
                <span className="btn-icon">💖</span>
              </button>
            </form>
          )}

          {stage === "loading" && (
            <div className="loading" role="status">
              <div className="loading-ripple">
                <span className="pulse-ring r1" />
                <span className="pulse-ring r2" />
                <span className="pulse-ring r3" />
                <div className="mini-heart">♥</div>
              </div>
              <p>Đang lắng nghe nhịp tim của hai bạn…</p>
              <div className="loading-dots">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          {stage === "result" && (
            <section className="result">
              <div className="couple-badge">
                <p className="couple" style={{ "--n": couple.a.length + couple.b.length + 3 }}>
                  <span className="name-a">{couple.a}</span>
                  <span className="couple-heart">♥</span>
                  <span className="name-b">{couple.b}</span>
                </p>
              </div>

              <BigHeart value={shown} />

              <div className={`message-card ${done ? "show" : ""}`}>
                <span className="quote-mark">“</span>
                <p className="message">{getMessage(target)}</p>
                <span className="quote-mark">”</span>
              </div>

              <div className={`actions ${done ? "show" : ""}`}>
                <button
                  className={`btn btn-pin ${isPinned ? "pinned" : ""}`}
                  onClick={handlePin}
                  disabled={isPinned}
                >
                  <span className="btn-icon">{isPinned ? "✓" : "♥"}</span>
                  <span className="btn-text">{isPinned ? "Đã ghim thành công" : "Ghim cặp đôi"}</span>
                </button>
                <button className="btn ghost" onClick={reset}>
                  <span className="btn-icon">↺</span>
                  <span className="btn-text">Thử cặp khác</span>
                </button>
              </div>
            </section>
          )}
        </main>

        <PinColumn side="right" pins={pins} onRemove={removePin} />
      </div>
    </div>
  );
}
