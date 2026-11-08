// Cổng ra đề của lớp học. Hỗ trợ các bộ bài mặc định (ngay1..ngay5, cu) và các bộ bài Import từ CSV (lưu tại custom-packs/).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as OLD from "./questions-cu.js";
import { NGAY1_TOPICS, NGAY1_SIZE, ngay1Meta, ngay1At } from "./ngay1.js";
import { NGAY2_TOPICS, NGAY2_SIZE, ngay2Meta, ngay2At } from "./ngay2.js";
import { NGAY3_TOPICS, NGAY3_SIZE, ngay3Meta, ngay3At } from "./ngay3.js";
import { NGAY4_TOPICS, NGAY4_SIZE, ngay4Meta, ngay4At } from "./ngay4.js";
import { NGAY5_TOPICS, NGAY5_SIZE, ngay5Meta, ngay5At } from "./ngay5.js";

export * from "./questions-cu.js";
export { NGAY1_SIZE, NGAY2_SIZE, NGAY3_SIZE, NGAY4_SIZE, NGAY5_SIZE };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CUSTOM_PACKS_DIR = path.join(__dirname, "custom-packs");

const KEYS = ["A", "B", "C", "D"];
const shuffle = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// Các buổi có bộ bài riêng (ngoài 'cu')
const PACKS = {
  ngay1: {
    id: "ngay1",
    name: "📘 Ngày 1 · 100 bài mới (có dịch câu), ra theo thứ tự",
    builtin: true,
    size: NGAY1_SIZE,
    topics: NGAY1_TOPICS,
    meta: ngay1Meta,
    at: ngay1At,
  },
  ngay2: {
    id: "ngay2",
    name: "📗 Ngày 2 · 100 bài A2+ khó hơn (dịch câu, chọn đáp án), ra theo thứ tự",
    builtin: true,
    size: NGAY2_SIZE,
    topics: NGAY2_TOPICS,
    meta: ngay2Meta,
    at: ngay2At,
  },
  ngay3: {
    id: "ngay3",
    name: "📙 Ngày 3 · 100 bài dễ hơn Ngày 2 (có điền từ theo nghĩa), ra theo thứ tự",
    builtin: true,
    size: NGAY3_SIZE,
    topics: NGAY3_TOPICS,
    meta: ngay3Meta,
    at: ngay3At,
  },
  ngay4: {
    id: "ngay4",
    name: "📗 Ngày 4 · 100 bài dễ hơn Ngày 3 (Word pattern / Ngữ pháp / Phrasal verb)",
    builtin: true,
    size: NGAY4_SIZE,
    topics: NGAY4_TOPICS,
    meta: ngay4Meta,
    at: ngay4At,
  },
  ngay5: {
    id: "ngay5",
    name: "📘 Ngày 5 · A2 trở xuống (3 điền từ, 1 chọn câu)",
    builtin: true,
    size: NGAY5_SIZE,
    topics: NGAY5_TOPICS,
    meta: ngay5Meta,
    at: ngay5At,
  },
};

export const PACK_IDS = ["ngay1", "ngay2", "ngay3", "ngay4", "ngay5", "cu"];

export const TOPICS = {
  ...OLD.TOPICS,
  ...NGAY1_TOPICS,
  ...NGAY2_TOPICS,
  ...NGAY3_TOPICS,
  ...NGAY4_TOPICS,
  ...NGAY5_TOPICS,
  Translation: ["Translation", "Dịch câu Việt → Anh", "✍️"],
};

export function hasPack(packId) {
  return packId === "cu" || Boolean(PACKS[packId]);
}

export function packList() {
  const list = [
    PACKS.ngay1,
    PACKS.ngay2,
    PACKS.ngay4,
    PACKS.ngay5,
    PACKS.ngay3,
    {
      id: "cu",
      name: "📦 Ngân hàng cũ A2 · ra ngẫu nhiên",
      builtin: true,
      size: (OLD.BANK_SIZE?.mcq || 0) + (OLD.BANK_SIZE?.fill || 0),
    },
  ];
  for (const [id, p] of Object.entries(PACKS)) {
    if (!p.builtin) {
      list.push({
        id,
        name: `📄 [CSV] ${p.rawName || p.name} (${p.size} câu)`,
        rawName: p.rawName || p.name,
        builtin: false,
        size: p.size,
        mcqCount: p.meta.filter((m) => m.type === "mcq").length,
        fillCount: p.meta.filter((m) => m.type === "fill").length,
      });
    }
  }
  return list.map((p) => ({
    id: p.id,
    name: p.name,
    rawName: p.rawName || p.name,
    builtin: Boolean(p.builtin),
    size: p.size || 0,
  }));
}

export const topicList = (pack = "ngay5") => {
  if (pack === "cu") return OLD.topicList();
  const { topics, meta } = PACKS[pack] || PACKS.ngay1;
  return Object.entries(topics)
    .concat(
      Object.entries(TOPICS).filter(
        ([id]) => !topics[id] && meta.some((m) => m.topic === id),
      ),
    )
    .map(([id, [en, vi, icon]]) => ({
      id,
      en,
      vi,
      icon,
      mcq: meta.filter((m) => m.topic === id && m.type === "mcq").length,
      fill: meta.filter((m) => m.topic === id && m.type === "fill").length,
    }))
    .filter((t) => t.mcq + t.fill > 0);
};

export const resetDecks = () => OLD.resetDecks();

export function nextQuestion(settings = {}, n = 0) {
  const { pack = "ngay5", mode = "mix", topic = "all" } = settings;
  if (pack === "cu")
    return OLD.nextQuestion(
      { mode: mode === "translate" ? "fill" : mode, topic },
      n,
    );
  const targetPack = PACKS[pack] || PACKS.ngay1;
  return (
    targetPack.at(n, { mode, topic }) ||
    targetPack.at(n, { mode: "mix", topic: "all" }) ||
    OLD.nextQuestion({ mode: "mix", topic: "all" }, n)
  );
}

// ---- CSV Parser & Builder ----
function detectDelimiter(headerLine) {
  const commas = (headerLine.match(/,/g) || []).length;
  const semis = (headerLine.match(/;/g) || []).length;
  const tabs = (headerLine.match(/\t/g) || []).length;
  if (tabs > commas && tabs > semis) return "\t";
  if (semis > commas) return ";";
  return ",";
}

export function parseCsvRows(csvText) {
  const clean = String(csvText ?? "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  const firstNewline = clean.indexOf("\n");
  const firstLine = firstNewline >= 0 ? clean.slice(0, firstNewline) : clean;
  const delim = detectDelimiter(firstLine);

  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delim) {
      row.push(field.trim());
      field = "";
    } else if (ch === "\n") {
      row.push(field.trim());
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  row.push(field.trim());
  if (row.some((cell) => cell !== "")) rows.push(row);
  return rows;
}

const HEADER_ALIASES = {
  type: ["type", "loai", "dạng", "dang", "kind", "mode"],
  topic: ["topic", "chu_de", "chủ đề", "chude", "category"],
  prompt: ["prompt", "question", "de_bai", "đề bài", "cau_hoi", "câu hỏi", "vi"],
  sub: ["sub", "hint", "nghia", "nghĩa", "goi_y", "gợi ý", "meaning"],
  answer: ["answer", "answers", "correct", "dap_an", "đáp án", "word", "tu_vung", "en"],
  wrong1: ["wrong1", "sai1", "distractor1", "option2"],
  wrong2: ["wrong2", "sai2", "distractor2", "option3"],
  wrong3: ["wrong3", "sai3", "distractor3", "option4"],
  explain: ["explain", "giai_thich", "giải thích", "note"],
  emoji: ["emoji", "icon"],
};

function mapHeaders(headerRow) {
  const normH = headerRow.map((h) =>
    String(h || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_"),
  );
  const map = {};
  for (const [key, aliases] of Object.entries(HEADER_ALIASES)) {
    const idx = normH.findIndex((h) => aliases.includes(h));
    if (idx >= 0) map[key] = idx;
  }
  // Hỗ trợ file CSV 2 cột đơn giản (cột 0 = từ tiếng Anh, cột 1 = nghĩa tiếng Việt)
  if (map.answer == null && headerRow.length === 2) {
    return { isTwoColHeaderless: !normH.includes("answer") && !normH.includes("word"), answer: 0, sub: 1 };
  }
  return map;
}

export function buildCustomPackFromCsv(id, name, csvText) {
  const rows = parseCsvRows(csvText);
  if (!rows.length) {
    throw new Error("File CSV trống, không có dữ liệu.");
  }
  const hMap = mapHeaders(rows[0]);
  const startRow = hMap.isTwoColHeaderless ? 0 : 1;
  if (!hMap.isTwoColHeaderless && hMap.answer == null) {
    throw new Error(
      'File CSV thiếu cột "answer" (Đáp án). Hãy dùng file mẫu có cột: type,topic,prompt,sub,answer,wrong1,wrong2,wrong3,explain,emoji',
    );
  }

  const factories = [];
  const meta = [];
  const topics = {};
  const errors = [];

  for (let r = startRow; r < rows.length; r++) {
    const cells = rows[r];
    const lineNum = r + 1;
    const get = (k) => (hMap[k] != null && cells[hMap[k]] != null ? String(cells[hMap[k]]).trim() : "");

    // Bỏ qua dòng comment bắt đầu bằng #
    if (cells[0] && cells[0].startsWith("#")) continue;

    const rawType = get("type").toLowerCase();
    const rawAnswer = get("answer");
    if (!rawAnswer) {
      errors.push(`Dòng ${lineNum}: Thiếu đáp án (cột answer)`);
      continue;
    }

    const w1 = get("wrong1");
    const w2 = get("wrong2");
    const w3 = get("wrong3");
    const wrongList = [w1, w2, w3].filter(Boolean);

    let qType = "fill";
    let qMode = "spell";
    if (["mcq", "trac_nghiem", "abcd", "choice"].includes(rawType)) {
      qType = "mcq";
      qMode = null;
    } else if (["translate", "dich", "dich_cau", "sentence"].includes(rawType)) {
      qType = "fill";
      qMode = "translate";
    } else if (["fill", "vocab", "tu_vung", "dien_tu", "spell"].includes(rawType)) {
      qType = "fill";
      qMode = "spell";
    } else if (wrongList.length > 0) {
      qType = "mcq";
      qMode = null;
    } else if (rawAnswer.trim().split(/\s+/).length >= 3) {
      qType = "fill";
      qMode = "translate";
    }

    const topicId =
      get("topic") ||
      (qType === "mcq" ? "Grammar" : qMode === "translate" ? "Translation" : "Vocabulary");
    const emoji = get("emoji") || null;

    if (!TOPICS[topicId]) {
      TOPICS[topicId] = [topicId, `Chủ đề ${topicId}`, emoji || "📘"];
    }
    if (!topics[topicId]) {
      topics[topicId] = TOPICS[topicId];
    }

    const answers = rawAnswer
      .split("|")
      .map((a) => a.trim())
      .filter(Boolean);
    const primaryAnswer = answers[0];

    if (qType === "mcq") {
      if (wrongList.length === 0) {
        errors.push(`Dòng ${lineNum}: Câu trắc nghiệm (mcq) cần ít nhất 1 phương án sai (wrong1).`);
        continue;
      }
      const prompt = get("prompt") || get("sub") || "Chọn đáp án đúng";
      const sub = get("sub") || "Chọn đáp án đúng";
      const explain = get("explain") || `${prompt} → ${primaryAnswer}`;
      factories.push(() => {
        const opts = shuffle([primaryAnswer, ...wrongList]);
        return {
          type: "mcq",
          topic: topicId,
          prompt,
          emoji,
          sub,
          options: opts.map((t, idx) => ({ k: KEYS[idx], t })),
          answerKey: KEYS[opts.indexOf(primaryAnswer)],
          answers: [primaryAnswer],
          explain,
        };
      });
      meta.push({
        topic: topicId,
        type: "mcq",
        mode: null,
        raw: { type: "mcq", topic: topicId, prompt, sub, answer: rawAnswer, wrong1: w1, wrong2: w2, wrong3: w3, explain, emoji: emoji || "" },
      });
    } else if (qMode === "translate") {
      const prompt = get("prompt") || get("sub");
      if (!prompt) {
        errors.push(`Dòng ${lineNum}: Câu dịch (translate) cần nội dung tiếng Việt ở cột prompt.`);
        continue;
      }
      const sub = get("sub") || "Dịch sang tiếng Anh";
      const explain = get("explain") || `${prompt} → ${primaryAnswer}`;
      factories.push(() => ({
        type: "fill",
        topic: topicId,
        prompt,
        emoji,
        sub,
        answers,
        mode: "translate",
        hard: true,
        tiles: null,
        full: null,
        explain,
      }));
      meta.push({
        topic: topicId,
        type: "fill",
        mode: "translate",
        raw: { type: "translate", topic: topicId, prompt, sub, answer: rawAnswer, wrong1: "", wrong2: "", wrong3: "", explain, emoji: emoji || "" },
      });
    } else {
      // fill / spell
      const sub = get("sub") || get("prompt") || "Từ vựng tiếng Anh";
      const prompt = get("prompt") || "Điền từ tiếng Anh";
      const explain = get("explain") || `${primaryAnswer} = ${sub}`;
      const lowerAnswers = answers.map((a) => a.toLowerCase());
      factories.push(() => ({
        type: "fill",
        topic: topicId,
        prompt,
        emoji,
        sub,
        answers: lowerAnswers,
        mode: "spell",
        hard: true,
        tiles: null,
        full: null,
        explain,
      }));
      meta.push({
        topic: topicId,
        type: "fill",
        mode: "spell",
        raw: { type: "fill", topic: topicId, prompt, sub, answer: rawAnswer, wrong1: "", wrong2: "", wrong3: "", explain, emoji: emoji || "" },
      });
    }
  }

  if (!factories.length) {
    throw new Error(
      errors.length
        ? `Không có câu hỏi hợp lệ. Lỗi: ${errors.slice(0, 3).join("; ")}`
        : "Không tìm thấy câu hỏi nào trong file CSV.",
    );
  }

  const at = (i, { mode = "mix", topic = "all" } = {}) => {
    const ok = (m) =>
      (topic === "all" || m.topic === topic) &&
      (mode === "mix" ||
        (mode === "mcq" && m.type === "mcq") ||
        (mode === "translate" && m.mode === "translate") ||
        (mode === "fill" && m.type === "fill" && m.mode !== "translate"));
    const idx = meta.map((m, k) => (ok(m) ? k : -1)).filter((k) => k >= 0);
    if (!idx.length) return null;
    const pos = ((i % idx.length) + idx.length) % idx.length;
    return factories[idx[pos]]();
  };

  return {
    id,
    name: `📄 [CSV] ${name} (${factories.length} câu)`,
    rawName: name,
    builtin: false,
    size: factories.length,
    topics,
    meta,
    at,
    errors,
  };
}

function slugify(str) {
  return (
    String(str || "pack")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/gi, "d")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 40) || "custom"
  );
}

export function saveCustomPack({ name, csvText, id }) {
  const cleanName = String(name || "Bộ đề CSV").trim().slice(0, 60) || "Bộ đề CSV";
  const packId = id && id.startsWith("csv_") ? id : `csv_${slugify(cleanName)}`;
  const pack = buildCustomPackFromCsv(packId, cleanName, csvText);
  PACKS[packId] = pack;
  if (!PACK_IDS.includes(packId)) PACK_IDS.push(packId);

  fs.mkdirSync(CUSTOM_PACKS_DIR, { recursive: true });
  const filePath = path.join(CUSTOM_PACKS_DIR, `${packId}.json`);
  fs.writeFileSync(
    filePath,
    JSON.stringify({ id: packId, name: cleanName, updatedAt: Date.now(), csvText }, null, 2),
    "utf8",
  );
  return {
    id: packId,
    name: pack.name,
    rawName: cleanName,
    size: pack.size,
    mcqCount: pack.meta.filter((m) => m.type === "mcq").length,
    fillCount: pack.meta.filter((m) => m.type === "fill").length,
    errors: pack.errors,
  };
}

export function deleteCustomPack(packId) {
  if (!packId || !packId.startsWith("csv_") || !PACKS[packId]) return false;
  delete PACKS[packId];
  const idx = PACK_IDS.indexOf(packId);
  if (idx >= 0) PACK_IDS.splice(idx, 1);
  const filePath = path.join(CUSTOM_PACKS_DIR, `${packId}.json`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  return true;
}

function escapeCsvCell(val) {
  const s = String(val ?? "");
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function exportPackToCsv(packId = "ngay5") {
  const header = ["type", "topic", "prompt", "sub", "answer", "wrong1", "wrong2", "wrong3", "explain", "emoji"];
  const lines = [header.join(",")];

  if (packId === "cu") {
    // Xuất 200 câu từ ngân hàng cũ
    for (let i = 0; i < 200; i++) {
      const q = OLD.nextQuestion({ mode: "mix", topic: "all" }, i);
      if (!q) continue;
      if (q.type === "mcq") {
        const ans = q.answers?.[0] || "";
        const wrongs = (q.options || []).map((o) => o.t).filter((t) => t !== ans);
        lines.push(
          [
            "mcq",
            q.topic || "Grammar",
            q.prompt || "",
            q.sub || "",
            ans,
            wrongs[0] || "",
            wrongs[1] || "",
            wrongs[2] || "",
            q.explain || "",
            q.emoji || "",
          ]
            .map(escapeCsvCell)
            .join(","),
        );
      } else {
        lines.push(
          [
            q.mode === "translate" ? "translate" : "fill",
            q.topic || "Vocabulary",
            q.prompt || "",
            q.sub || "",
            (q.answers || []).join("|"),
            "",
            "",
            "",
            q.explain || "",
            q.emoji || "",
          ]
            .map(escapeCsvCell)
            .join(","),
        );
      }
    }
    return "\uFEFF" + lines.join("\r\n");
  }

  const p = PACKS[packId] || PACKS.ngay5;
  const total = p.size || p.meta?.length || 100;
  for (let i = 0; i < total; i++) {
    const raw = p.meta?.[i]?.raw;
    if (raw) {
      lines.push(
        [
          raw.type,
          raw.topic,
          raw.prompt,
          raw.sub,
          raw.answer,
          raw.wrong1,
          raw.wrong2,
          raw.wrong3,
          raw.explain,
          raw.emoji,
        ]
          .map(escapeCsvCell)
          .join(","),
      );
      continue;
    }
    const q = p.at(i, { mode: "mix", topic: "all" });
    if (!q) continue;
    if (q.type === "mcq") {
      const ans = q.answers?.[0] || "";
      const wrongs = (q.options || []).map((o) => o.t).filter((t) => t !== ans);
      lines.push(
        [
          "mcq",
          q.topic || "Grammar",
          q.prompt || "",
          q.sub || "",
          ans,
          wrongs[0] || "",
          wrongs[1] || "",
          wrongs[2] || "",
          q.explain || "",
          q.emoji || "",
        ]
          .map(escapeCsvCell)
          .join(","),
      );
    } else {
      lines.push(
        [
          q.mode === "translate" ? "translate" : "fill",
          q.topic || "Vocabulary",
          q.prompt || "",
          q.sub || "",
          (q.answers || []).join("|"),
          "",
          "",
          "",
          q.explain || "",
          q.emoji || "",
        ]
          .map(escapeCsvCell)
          .join(","),
      );
    }
  }
  return "\uFEFF" + lines.join("\r\n");
}

function loadCustomPacksFromDisk() {
  try {
    if (!fs.existsSync(CUSTOM_PACKS_DIR)) return;
    const files = fs.readdirSync(CUSTOM_PACKS_DIR).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(CUSTOM_PACKS_DIR, file), "utf8"));
        if (data?.id && data?.csvText) {
          const pack = buildCustomPackFromCsv(data.id, data.name || data.id, data.csvText);
          PACKS[data.id] = pack;
          if (!PACK_IDS.includes(data.id)) PACK_IDS.push(data.id);
        }
      } catch (e) {
        console.warn("[CSV Pack] Bỏ qua file lỗi:", file, e.message);
      }
    }
  } catch (e) {
    console.warn("[CSV Pack] Không đọc được thư mục custom-packs:", e.message);
  }
}

loadCustomPacksFromDisk();

// ---- Chấm câu dịch: bỏ hoa/thường, dấu câu; mở rộng dạng viết tắt (I'm = I am, don't = do not...) ----
const expand = (s) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/\bi'm\b/g, "i am")
    .replace(/\blet's\b/g, "let us")
    .replace(/\bcan't\b/g, "can not")
    .replace(/\bcannot\b/g, "can not")
    .replace(/\bwon't\b/g, "will not")
    .replace(/\b(he|she|it|that|there|here|what|where|who|how)'s\b/g, "$1 is")
    .replace(/\b(you|we|they)'re\b/g, "$1 are")
    .replace(/\b(i|you|we|they|he|she|it)'ll\b/g, "$1 will")
    .replace(/\b(i|you|we|they)'ve\b/g, "$1 have")
    .replace(/\b(i|you|we|they|he|she|it)'d\b/g, "$1 would")
    .replace(/\b([a-z]+)n't\b/g, "$1 not");
const canon = (s) => OLD.norm(expand(s));
const wordCount = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;

export function isAttempt(q, text) {
  if (q.mode !== "translate") return OLD.isFillAttempt(text);
  const t = String(text).trim();
  if (!/^[a-zA-Z0-9'’ .,!?-]{3,90}$/.test(t)) return false;
  const n = wordCount(t),
    target = wordCount(q.answers[0]);
  return n >= Math.max(2, Math.ceil(target * 0.6)) && n <= target + 3;
}
export function checkFill(q, text) {
  if (q.mode !== "translate") return OLD.checkFill(q, text);
  const c = canon(text);
  return q.answers.some((a) => canon(a) === c);
}
