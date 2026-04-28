const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const year = document.querySelector("[data-year]");
const queryForm = document.querySelector("[data-query-form]");
const queryCount = document.querySelector("[data-query-count]");
const queryList = document.querySelector("[data-query-list]");
const formStatus = document.querySelector("[data-form-status]");
const whatsappQuery = document.querySelector("[data-whatsapp-query]");
const exportQueries = document.querySelector("[data-export-queries]");
const queryStorageKey = "trademind-ai-queries";
const ownerEmail = "jadhavdnyaneshwar701@gmail.com";
const whatsappNumber = "918806160767";

year.textContent = new Date().getFullYear();

const syncHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

window.addEventListener("scroll", syncHeader, { passive: true });
syncHeader();

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  header.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
  if (event.target.tagName === "A") {
    nav.classList.remove("is-open");
    header.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

const getQueries = () => JSON.parse(localStorage.getItem(queryStorageKey) || "[]");

const setQueries = (queries) => {
  localStorage.setItem(queryStorageKey, JSON.stringify(queries));
};

const getQueryPayload = () => {
  const formData = new FormData(queryForm);
  return {
    name: String(formData.get("name") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    service: String(formData.get("service") || "").trim(),
    message: String(formData.get("message") || "").trim(),
    createdAt: new Date().toLocaleString(),
  };
};

const createMessage = (query) =>
  [
    "TradeMind AI Project Query",
    `Name: ${query.name}`,
    `Phone: ${query.phone}`,
    `Email: ${query.email || "Not provided"}`,
    `Service: ${query.service}`,
    `Message: ${query.message}`,
  ].join("\n");

const updateQueryDatabase = () => {
  const queries = getQueries();
  queryCount.textContent = `${queries.length} saved ${queries.length === 1 ? "query" : "queries"}`;
  queryList.innerHTML = "";

  queries.slice(0, 5).forEach((query) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    const detail = document.createElement("span");

    title.textContent = `${query.name} - ${query.service}`;
    detail.textContent = `${query.phone} | ${query.createdAt}`;
    item.append(title, detail);
    queryList.append(item);
  });

  if (queries.length === 0) {
    const item = document.createElement("li");
    const detail = document.createElement("span");
    detail.textContent = "No saved queries yet.";
    item.append(detail);
    queryList.append(item);
  }
};

const updateWhatsappLink = () => {
  const query = getQueryPayload();
  const message = createMessage(query);
  whatsappQuery.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};

queryForm.addEventListener("input", updateWhatsappLink);

queryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = getQueryPayload();
  const queries = [query, ...getQueries()].slice(0, 50);
  const subject = encodeURIComponent(`TradeMind AI Query - ${query.service}`);
  const body = encodeURIComponent(createMessage(query));

  setQueries(queries);
  updateQueryDatabase();
  updateWhatsappLink();
  formStatus.textContent = "Query saved. Opening email now.";
  window.location.href = `mailto:${ownerEmail}?subject=${subject}&body=${body}`;
});

exportQueries.addEventListener("click", () => {
  const queries = getQueries();
  const columns = ["createdAt", "name", "phone", "email", "service", "message"];
  const rows = queries.map((query) =>
    columns.map((column) => `"${String(query[column] || "").replaceAll('"', '""')}"`).join(",")
  );
  const csv = [columns.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "trademind-ai-queries.csv";
  link.click();
  URL.revokeObjectURL(url);
});

updateQueryDatabase();
updateWhatsappLink();

const canvas = document.getElementById("marketCanvas");
const ctx = canvas.getContext("2d");
let width = 0;
let height = 0;
let pointer = { x: 0.72, y: 0.42 };

const candles = Array.from({ length: 92 }, (_, index) => ({
  phase: index * 0.36,
  bias: Math.sin(index * 0.22) * 0.26,
}));

const resize = () => {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
};

window.addEventListener("resize", resize);
resize();

window.addEventListener(
  "pointermove",
  (event) => {
    pointer = {
      x: event.clientX / Math.max(window.innerWidth, 1),
      y: event.clientY / Math.max(window.innerHeight, 1),
    };
  },
  { passive: true }
);

const drawGrid = () => {
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 1;

  for (let x = 0; x < width; x += 72) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y < height; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
};

const drawCandles = (time) => {
  const spacing = width / candles.length;
  const baseline = height * (0.5 + (pointer.y - 0.5) * 0.12);

  candles.forEach((candle, index) => {
    const x = index * spacing + spacing * 0.5;
    const wave = Math.sin(time * 0.0012 + candle.phase) * 42;
    const trend = Math.sin(index * 0.13 + time * 0.00045) * 90;
    const open = baseline + wave + trend * 0.5 + candle.bias * 70;
    const close = baseline + Math.cos(time * 0.001 + candle.phase) * 48 + trend * 0.42;
    const high = Math.min(open, close) - 22 - Math.abs(Math.sin(candle.phase + time * 0.001)) * 30;
    const low = Math.max(open, close) + 22 + Math.abs(Math.cos(candle.phase + time * 0.001)) * 30;
    const up = close < open;
    const bodyTop = Math.min(open, close);
    const bodyHeight = Math.max(Math.abs(close - open), 8);

    ctx.strokeStyle = up ? "rgba(98,230,183,0.72)" : "rgba(220,74,68,0.7)";
    ctx.fillStyle = up ? "rgba(98,230,183,0.72)" : "rgba(220,74,68,0.65)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x, high);
    ctx.lineTo(x, low);
    ctx.stroke();
    ctx.fillRect(x - Math.max(spacing * 0.22, 3), bodyTop, Math.max(spacing * 0.44, 6), bodyHeight);
  });
};

const drawSignalLine = (time) => {
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(29,143,184,0.9)";
  ctx.beginPath();

  for (let x = 0; x <= width; x += 18) {
    const y =
      height * 0.44 +
      Math.sin(x * 0.014 + time * 0.0013) * 45 +
      Math.cos(x * 0.006 + time * 0.0009) * 62 +
      (pointer.x - 0.5) * 42;

    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
};

const drawNodes = (time) => {
  const nodes = [
    [0.62, 0.24],
    [0.76, 0.32],
    [0.7, 0.55],
    [0.86, 0.48],
    [0.58, 0.7],
  ];

  ctx.strokeStyle = "rgba(216,155,39,0.28)";
  ctx.fillStyle = "rgba(216,155,39,0.82)";
  ctx.lineWidth = 1;

  nodes.forEach(([x1, y1], i) => {
    nodes.slice(i + 1).forEach(([x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(x1 * width, y1 * height);
      ctx.lineTo(x2 * width, y2 * height);
      ctx.stroke();
    });
  });

  nodes.forEach(([x, y], i) => {
    const pulse = 4 + Math.sin(time * 0.002 + i) * 2;
    ctx.beginPath();
    ctx.arc(x * width, y * height, 7 + pulse, 0, Math.PI * 2);
    ctx.fill();
  });
};

const render = (time = 0) => {
  ctx.clearRect(0, 0, width, height);
  drawGrid();
  drawCandles(time);
  drawSignalLine(time);
  drawNodes(time);
  requestAnimationFrame(render);
};

render();

/* ---------- Interactivity enhancements ---------- */

/* Scroll progress bar */
const scrollProgress = document.querySelector("[data-scroll-progress]");
if (scrollProgress) {
  const updateProgress = () => {
    const h = document.documentElement;
    const total = h.scrollHeight - h.clientHeight;
    const pct = total > 0 ? (h.scrollTop / total) * 100 : 0;
    scrollProgress.style.width = pct + "%";
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
}

/* Live market ticker */
const tickerTrack = document.querySelector("[data-ticker-track]");
if (tickerTrack) {
  const symbols = [
    { name: "NIFTY 50", base: 22485 },
    { name: "BANK NIFTY", base: 48215 },
    { name: "SENSEX", base: 74120 },
    { name: "RELIANCE", base: 2932 },
    { name: "TCS", base: 3854 },
    { name: "HDFC BANK", base: 1495 },
    { name: "INFY", base: 1538 },
    { name: "ITC", base: 426 },
    { name: "BTC/USD", base: 68420 },
    { name: "ETH/USD", base: 3280 },
  ];
  const renderTicker = () => {
    const items = symbols
      .map((s) => {
        const drift = (Math.random() - 0.5) * (s.base * 0.012);
        const pct = ((drift / s.base) * 100).toFixed(2);
        const up = drift >= 0;
        const price = (s.base + drift).toLocaleString("en-IN", { maximumFractionDigits: 2 });
        return `<span><b>${s.name}</b> ${price} <span class="${up ? "up" : "down"}">${up ? "▲" : "▼"} ${Math.abs(parseFloat(pct)).toFixed(2)}%</span></span>`;
      })
      .join("");
    // duplicate for seamless loop
    tickerTrack.innerHTML = items + items;
  };
  renderTicker();
  setInterval(renderTicker, 4000);
}

/* Theme toggle with persistence */
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeIcon = document.querySelector("[data-theme-icon]");
const THEME_KEY = "trademind-theme";
const applyTheme = (mode) => {
  document.documentElement.setAttribute("data-theme", mode);
  if (themeIcon) themeIcon.textContent = mode === "dark" ? "☀" : "☾";
};
const savedTheme =
  localStorage.getItem(THEME_KEY) ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
applyTheme(savedTheme);
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });
}

/* Rotator for hero headline */
const rotator = document.querySelector("[data-rotator]");
if (rotator) {
  const words = rotator.querySelectorAll("span");
  let ri = 0;
  const cycle = () => {
    words.forEach((w, i) => w.classList.toggle("is-active", i === ri));
    ri = (ri + 1) % words.length;
  };
  cycle();
  setInterval(cycle, 2400);
}

/* Intersection-based reveal */
const revealEls = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window && revealEls.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

/* Animated counters */
const counters = document.querySelectorAll("[data-counter]");
if (counters.length) {
  const runCounter = (el) => {
    const target = Number(el.dataset.target || 0);
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();
    const step = (t) => {
      const progress = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const co = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          co.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((c) => co.observe(c));
}

/* Button ripple */
document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("click", (event) => {
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = event.clientX - rect.left - size / 2 + "px";
    ripple.style.top = event.clientY - rect.top - size / 2 + "px";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  });
});

/* Toast helper */
const toast = document.querySelector("[data-toast]");
let toastTimer;
const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
};

/* Live form validation (phone + email) */
const phoneInput = queryForm.querySelector('input[name="phone"]');
const emailInput = queryForm.querySelector('input[name="email"]');
const nameInput = queryForm.querySelector('input[name="name"]');

const validatePhone = () => {
  const digits = (phoneInput.value || "").replace(/\D/g, "");
  const ok = digits.length >= 10;
  phoneInput.classList.toggle("is-invalid", phoneInput.value.length > 0 && !ok);
  return ok;
};
const validateEmail = () => {
  const val = emailInput.value.trim();
  if (!val) return true;
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  emailInput.classList.toggle("is-invalid", !ok);
  return ok;
};
phoneInput.addEventListener("input", validatePhone);
emailInput.addEventListener("input", validateEmail);

queryForm.addEventListener(
  "submit",
  (event) => {
    if (!validatePhone() || !validateEmail() || !nameInput.value.trim()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showToast("Please fill required fields correctly.");
      if (!nameInput.value.trim()) nameInput.classList.add("is-invalid");
      return;
    }
    showToast("Query saved locally. Opening email…");
  },
  true
);

nameInput.addEventListener("input", () => {
  if (nameInput.value.trim()) nameInput.classList.remove("is-invalid");
});

/* Smooth anchor scroll with header offset */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const id = anchor.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    const offset = (document.querySelector(".ticker")?.offsetHeight || 0) + 64;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

/* ---------- Advanced tech features ---------- */

/* Site-wide particle network background */
(() => {
  const net = document.querySelector("[data-network]");
  if (!net) return;
  const nctx = net.getContext("2d");
  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  const nodes = [];
  const NODE_COUNT = Math.min(90, Math.floor((window.innerWidth * window.innerHeight) / 22000));
  const mouse = { x: -9999, y: -9999 };
  const setSize = () => {
    W = window.innerWidth;
    H = window.innerHeight;
    net.width = W * DPR;
    net.height = H * DPR;
    net.style.width = W + "px";
    net.style.height = H + "px";
    nctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };
  setSize();
  window.addEventListener("resize", setSize);
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1 + Math.random() * 1.6,
    });
  }
  window.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });
  window.addEventListener("pointerleave", () => { mouse.x = -9999; mouse.y = -9999; });
  const draw = () => {
    nctx.clearRect(0, 0, W, H);
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    const dot = dark ? "rgba(98,230,183,0.85)" : "rgba(20,168,115,0.75)";
    const line = dark ? "rgba(98,230,183," : "rgba(20,168,115,";
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      const dxm = n.x - mouse.x, dym = n.y - mouse.y;
      const dm = Math.hypot(dxm, dym);
      if (dm < 120) {
        n.vx += (dxm / dm) * 0.04;
        n.vy += (dym / dm) * 0.04;
      }
      n.vx = Math.max(-0.9, Math.min(0.9, n.vx));
      n.vy = Math.max(-0.9, Math.min(0.9, n.vy));
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < 140) {
          nctx.strokeStyle = line + (0.18 * (1 - d / 140)).toFixed(3) + ")";
          nctx.lineWidth = 1;
          nctx.beginPath();
          nctx.moveTo(a.x, a.y);
          nctx.lineTo(b.x, b.y);
          nctx.stroke();
        }
      }
    }
    nctx.fillStyle = dot;
    for (const n of nodes) {
      nctx.beginPath();
      nctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      nctx.fill();
    }
    requestAnimationFrame(draw);
  };
  draw();
})();

/* Typewriter */
(() => {
  const el = document.querySelector("[data-typewriter]");
  if (!el) return;
  let lines = [];
  try { lines = JSON.parse(el.dataset.typewriterLines || "[]"); } catch { lines = []; }
  if (!lines.length) return;
  let li = 0, ci = 0, deleting = false;
  const tick = () => {
    const full = lines[li];
    if (!deleting) {
      ci++;
      el.textContent = full.slice(0, ci);
      if (ci === full.length) { deleting = true; setTimeout(tick, 1500); return; }
    } else {
      ci--;
      el.textContent = full.slice(0, ci);
      if (ci === 0) { deleting = false; li = (li + 1) % lines.length; }
    }
    setTimeout(tick, deleting ? 28 : 42);
  };
  tick();
})();

/* 3D tilt on cards */
(() => {
  const tilts = document.querySelectorAll("[data-tilt]");
  if (!tilts.length) return;
  const prm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prm) return;
  tilts.forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * 10;
      const ry = (px - 0.5) * 12;
      el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      el.style.setProperty("--tx", (px * 100).toFixed(1) + "%");
      el.style.setProperty("--ty", (py * 100).toFixed(1) + "%");
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
})();

/* Magnetic primary buttons */
(() => {
  const prm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prm) return;
  const btns = document.querySelectorAll(".btn.primary, .btn.whatsapp, .float-whatsapp");
  btns.forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.22}px)`;
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.transform = "";
    });
  });
})();

/* AI Signal Feed (streaming fake trade signals) */
(() => {
  const feed = document.querySelector("[data-signal-feed]");
  if (!feed) return;
  const latencyEl = document.querySelector("[data-metric-latency]");
  const accuracyEl = document.querySelector("[data-metric-accuracy]");
  const symbols = ["NIFTY", "BANKNIFTY", "RELIANCE", "TCS", "INFY", "HDFCBANK", "ITC", "BTCUSD", "ETHUSD", "SENSEX"];
  const actions = ["BUY", "SELL", "HOLD"];
  const strategies = ["EMA X-over", "RSI Divergence", "VWAP Pullback", "Breakout", "Mean Reversion", "Supertrend", "MACD"];
  const pushSignal = () => {
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    const act = actions[Math.floor(Math.random() * actions.length)];
    const strat = strategies[Math.floor(Math.random() * strategies.length)];
    const conf = (65 + Math.random() * 34).toFixed(1);
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const li = document.createElement("li");
    li.className = "signal-item signal-" + act.toLowerCase();
    li.innerHTML = `
      <span class="sig-time">${now}</span>
      <span class="sig-action">${act}</span>
      <span class="sig-sym">${sym}</span>
      <span class="sig-strat">${strat}</span>
      <span class="sig-conf">${conf}%</span>
    `;
    feed.prepend(li);
    while (feed.children.length > 5) feed.removeChild(feed.lastChild);
    if (latencyEl) latencyEl.textContent = (30 + Math.random() * 40).toFixed(0) + " ms";
    if (accuracyEl) accuracyEl.textContent = (88 + Math.random() * 8).toFixed(1) + "%";
  };
  pushSignal(); pushSignal(); pushSignal();
  setInterval(pushSignal, 2200);
})();

/* Sparklines under hero stats */
(() => {
  const svgs = document.querySelectorAll("[data-sparkline]");
  if (!svgs.length) return;
  svgs.forEach((svg) => {
    const points = 24;
    const arr = [];
    let v = 50;
    for (let i = 0; i < points; i++) {
      v += (Math.random() - 0.45) * 14;
      v = Math.max(12, Math.min(88, v));
      arr.push(v);
    }
    const coords = arr.map((y, i) => `${(i / (points - 1)) * 100},${28 - (y / 100) * 24 - 2}`).join(" ");
    const lastX = 100, lastY = 28 - (arr[arr.length - 1] / 100) * 24 - 2;
    svg.innerHTML = `
      <defs>
        <linearGradient id="sparkFill${Math.random().toString(36).slice(2, 7)}" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="currentColor" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="currentColor" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <polyline points="${coords}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" />
      <circle cx="${lastX}" cy="${lastY}" r="1.8" fill="currentColor" />
    `;
  });
})();

/* FAQ accordion — exclusive open */
(() => {
  const items = document.querySelectorAll(".faq-item");
  items.forEach((el) => {
    el.addEventListener("toggle", () => {
      if (el.open) items.forEach((o) => { if (o !== el) o.open = false; });
    });
  });
})();

/* Command Palette (Ctrl+K / Cmd+K) */
(() => {
  const backdrop = document.querySelector("[data-cmdk]");
  const input = document.querySelector("[data-cmdk-input]");
  const list = document.querySelector("[data-cmdk-list]");
  const opener = document.querySelector("[data-cmdk-open]");
  if (!backdrop || !input || !list) return;
  const cmds = [
    { label: "Go to Services", hint: "section", href: "#services" },
    { label: "Go to Process", hint: "section", href: "#process" },
    { label: "Go to Pricing", hint: "section", href: "#pricing" },
    { label: "Go to FAQ", hint: "section", href: "#faq" },
    { label: "Go to Query Form", hint: "section", href: "#query" },
    { label: "Go to Contact", hint: "section", href: "#contact" },
    { label: "Call Dnyaneshwar (+91 88061 60767)", hint: "action", href: "tel:+918806160767" },
    { label: "Message on WhatsApp", hint: "action", href: "https://wa.me/918806160767" },
    { label: "Send Email", hint: "action", href: "mailto:jadhavdnyaneshwar701@gmail.com" },
    { label: "Toggle Dark / Light Theme", hint: "action", action: "theme" },
    { label: "Export saved queries (CSV)", hint: "action", action: "export" },
  ];
  let idx = 0;
  const render = (q = "") => {
    const filtered = cmds.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
    list.innerHTML = filtered
      .map((c, i) => `<li class="${i === idx ? "is-active" : ""}" data-i="${i}" role="option" aria-selected="${i === idx}">
        <span class="cmdk-label">${c.label}</span>
        <span class="cmdk-hint">${c.hint}</span>
      </li>`)
      .join("");
    list.dataset.results = JSON.stringify(filtered.map((c) => ({ href: c.href || "", action: c.action || "" })));
  };
  const open = () => {
    backdrop.hidden = false;
    document.documentElement.classList.add("cmdk-open");
    idx = 0;
    input.value = "";
    render();
    setTimeout(() => input.focus(), 10);
  };
  const close = () => {
    backdrop.hidden = true;
    document.documentElement.classList.remove("cmdk-open");
  };
  const run = (i) => {
    const results = JSON.parse(list.dataset.results || "[]");
    const target = results[i];
    if (!target) return;
    close();
    if (target.action === "theme") {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    } else if (target.action === "export") {
      exportQueries.click();
    } else if (target.href) {
      if (target.href.startsWith("#")) {
        const el = document.querySelector(target.href);
        if (el) {
          const offset = (document.querySelector(".ticker")?.offsetHeight || 0) + 64;
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: "smooth" });
        }
      } else {
        window.location.href = target.href;
      }
    }
  };
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      backdrop.hidden ? open() : close();
    } else if (!backdrop.hidden) {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowDown") {
        e.preventDefault();
        const len = JSON.parse(list.dataset.results || "[]").length;
        idx = Math.min(Math.max(0, len - 1), idx + 1);
        render(input.value);
      }
      else if (e.key === "ArrowUp") { e.preventDefault(); idx = Math.max(0, idx - 1); render(input.value); }
      else if (e.key === "Enter") { e.preventDefault(); run(idx); }
    }
  });
  input.addEventListener("input", () => { idx = 0; render(input.value); });
  list.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;
    run(Number(li.dataset.i));
  });
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
  opener?.addEventListener("click", open);
})();

/* ---------- Auth (Sign in / Register) ---------- */
(() => {
  const backdrop = document.querySelector("[data-auth]");
  const form = document.querySelector("[data-auth-form]");
  const titleEl = document.querySelector("[data-auth-title]");
  const subEl = document.querySelector("[data-auth-sub]");
  const submitBtn = document.querySelector("[data-auth-submit]");
  const switchText = document.querySelector("[data-auth-switch-text]");
  const switchBtn = document.querySelector("[data-auth-switch]");
  const closeBtn = document.querySelector("[data-auth-close]");
  const errorEl = document.querySelector("[data-auth-error]");
  const tabs = document.querySelectorAll(".auth-tab");
  const nameRow = document.querySelector("[data-auth-name-row]");
  const emailRow = document.querySelector("[data-auth-email-row]");
  const phoneRow = document.querySelector("[data-auth-phone-row]");
  const nameInput = document.getElementById("auth-name");
  const emailField = document.getElementById("auth-email");
  const phoneField = document.getElementById("auth-phone");
  const passwordField = document.getElementById("auth-password");
  const openers = document.querySelectorAll("[data-auth-open]");
  const userChip = document.querySelector("[data-user-chip]");
  const userMenu = document.querySelector("[data-user-menu]");
  const userAvatar = document.querySelector("[data-user-avatar]");
  const userLabel = document.querySelector("[data-user-label]");
  const userName = document.querySelector("[data-user-name]");
  const userIdEl = document.querySelector("[data-user-id]");
  const signoutBtn = document.querySelector("[data-user-signout]");
  const loginBtn = document.querySelector('.auth-btn.ghost[data-auth-open="login"]');
  const registerBtn = document.querySelector('.auth-btn.primary[data-auth-open="register"]');

  if (!backdrop || !form) return;

  const SESSION_KEY = "trademind-auth-session";
  let mode = "login"; // "login" | "register"
  let channel = "email"; // "email" | "phone"

  const setMode = (m) => {
    mode = m;
    if (m === "register") {
      titleEl.textContent = "Create your TradeMind account";
      subEl.textContent = "Save your queries, signals, and algo build requests across devices.";
      submitBtn.textContent = "Create account";
      switchText.textContent = "Already have an account?";
      switchBtn.textContent = "Sign in";
      nameRow.hidden = false;
    } else {
      titleEl.textContent = "Sign in to TradeMind AI";
      subEl.textContent = "Access your algo build requests, saved queries, and AI signals.";
      submitBtn.textContent = "Sign in";
      switchText.textContent = "New to TradeMind AI?";
      switchBtn.textContent = "Create an account";
      nameRow.hidden = true;
    }
  };

  const setChannel = (c) => {
    channel = c;
    tabs.forEach((t) => {
      const active = t.dataset.authTab === c;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
    });
    emailRow.hidden = c !== "email";
    phoneRow.hidden = c !== "phone";
  };

  const showError = (msg) => {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  };
  const clearError = () => {
    errorEl.textContent = "";
    errorEl.hidden = true;
  };

  const open = (m = "login") => {
    setMode(m);
    setChannel("email");
    clearError();
    form.reset();
    backdrop.hidden = false;
    document.documentElement.classList.add("cmdk-open");
    setTimeout(() => emailField?.focus(), 30);
  };

  const close = () => {
    backdrop.hidden = true;
    document.documentElement.classList.remove("cmdk-open");
  };

  const initialsOf = (label) => {
    const s = String(label || "").trim();
    if (!s) return "TM";
    const parts = s.split(/[\s@.+_-]+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const setSignedIn = (session) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    if (loginBtn) loginBtn.hidden = true;
    if (registerBtn) registerBtn.hidden = true;
    if (userChip) {
      userChip.hidden = false;
      userChip.setAttribute("aria-expanded", "false");
    }
    if (userAvatar) userAvatar.textContent = initialsOf(session.name || session.id);
    if (userLabel) userLabel.textContent = session.name ? session.name.split(" ")[0] : "Account";
    if (userName) userName.textContent = session.name || "Signed in";
    if (userIdEl) userIdEl.textContent = session.id || "";
  };

  const setSignedOut = () => {
    localStorage.removeItem(SESSION_KEY);
    if (loginBtn) loginBtn.hidden = false;
    if (registerBtn) registerBtn.hidden = false;
    if (userChip) userChip.hidden = true;
    if (userMenu) userMenu.hidden = true;
  };

  const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
  const validPhone = (v) => String(v).replace(/\D/g, "").length >= 10;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearError();
    const password = (passwordField.value || "").trim();
    if (password.length < 6) {
      showError("Password must be at least 6 characters.");
      return;
    }
    let id = "";
    if (channel === "email") {
      const v = (emailField.value || "").trim();
      if (!validEmail(v)) { showError("Enter a valid email address."); return; }
      id = v;
    } else {
      const v = (phoneField.value || "").trim();
      if (!validPhone(v)) { showError("Enter a valid phone number with country code."); return; }
      id = v;
    }
    if (mode === "register") {
      const n = (nameInput.value || "").trim();
      if (!n) { showError("Please enter your name."); return; }
      setSignedIn({ provider: channel, id, name: n, ts: Date.now() });
      if (typeof showToast === "function") showToast("Account created. Welcome, " + n.split(" ")[0] + "!");
    } else {
      setSignedIn({ provider: channel, id, name: id.split("@")[0] || id, ts: Date.now() });
      if (typeof showToast === "function") showToast("Signed in as " + id);
    }
    close();
  });

  document.querySelectorAll("[data-auth-social]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const provider = btn.dataset.authSocial;
      // Demo: simulate OAuth redirect locally (no backend)
      const fakeId = (provider === "google" ? "demo.user@gmail.com" : "demo-user@github");
      const display = provider === "google" ? "Google User" : "GitHub User";
      setSignedIn({ provider, id: fakeId, name: display, ts: Date.now() });
      if (typeof showToast === "function") showToast("Signed in with " + provider[0].toUpperCase() + provider.slice(1) + " (demo)");
      close();
    });
  });

  tabs.forEach((t) => t.addEventListener("click", () => setChannel(t.dataset.authTab)));

  switchBtn?.addEventListener("click", () => setMode(mode === "login" ? "register" : "login"));

  openers.forEach((b) => {
    b.addEventListener("click", () => open(b.dataset.authOpen || "login"));
  });

  closeBtn?.addEventListener("click", close);
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !backdrop.hidden) { close(); }
  });

  // User chip menu
  userChip?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!userMenu) return;
    userMenu.hidden = !userMenu.hidden;
    userChip.setAttribute("aria-expanded", userMenu.hidden ? "false" : "true");
  });
  document.addEventListener("click", (e) => {
    if (userMenu && !userMenu.hidden && !userMenu.contains(e.target) && e.target !== userChip) {
      userMenu.hidden = true;
      userChip?.setAttribute("aria-expanded", "false");
    }
  });
  signoutBtn?.addEventListener("click", () => {
    setSignedOut();
    if (typeof showToast === "function") showToast("Signed out");
  });

  // Restore session
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw);
      if (session && session.id) setSignedIn(session);
    }
  } catch {}

  // Expose minimal API for command palette / debugging
  window.TradeMindAuth = { open, close, signOut: setSignedOut };
})();
