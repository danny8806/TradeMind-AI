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
const whatsappNumber = "91880616076";

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
