// Server: Lớp học tiếng Anh A1 của Pess & Po trên TikTok LIVE.
// Máy chủ điều khiển vòng chơi (ra câu hỏi, chấm bình luận A/B/C/D hoặc từ điền, tính điểm), quản lý chỗ ngồi / hành lang,
// phong chức A1 khi có quà, rồi đẩy mọi thứ qua WebSocket cho màn hình lớp học (public/index.html).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { WebSocketServer } from "ws";
import * as TLC from "tiktok-live-connector";
import { makeThanks, levelInfo, LEVELS } from "./thanks.js";
import { ttsFile, ttsEngine } from "./tts.js";
import {
  saveSession,
  checkReturner,
  checkAndConsumeReturner,
  getAllTimeBoard,
  getAllTimeDonors,
  getRecentSessions,
} from "./vip-history/hallOfFame.js";
import {
  TOPICS,
  BANK_SIZE,
  topicList,
  packList,
  hasPack,
  saveCustomPack,
  deleteCustomPack,
  exportPackToCsv,
  nextQuestion,
  resetDecks,
  parseChoice,
  isAttempt,
  checkFill,
} from "./questions.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- Đọc cấu hình từ file .env ----
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]])
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const PORT = Number(process.env.PORT || 3000);
const SIGN_API_KEY = process.env.SIGN_API_KEY || null;
const DEBUG = process.env.DEBUG === "1";
const VIP_SEATS = Number(process.env.VIP_SEATS || 7); // ghế VIP ở giữa lớp: dành cho 7 bạn tặng nhiều xu nhất (ghế 0 = nhiều nhất, to nhất)
const TOP_SEATS = Number(process.env.TOP_SEATS || 7); // 7 ghế "xuất sắc" ngay dưới ghế VIP: dành cho các bạn đứng đầu bảng thi đua (điểm cao nhất ở giữa)
const REG_SEATS = Number(process.env.REG_SEATS || 24); // ghế thường (8 cột x 3 hàng)
const SEATS = VIP_SEATS + TOP_SEATS + REG_SEATS;
const REG_START = VIP_SEATS + TOP_SEATS; // từ đây là ghế thường

// ---- Trạng thái lớp học ----
const classroom = {
  students: new Map(), // id -> { id, uniqueId, name, avatar, joinedAt, lastSeen, coins, gifts, score, correct, streak, seat }
  totalLikes: 0,
  totalGifts: 0,
  totalCoins: 0, // tổng xu cả lớp đã tặng (cho thanh mục tiêu quà)
};
const seatOwner = new Array(SEATS).fill(null); // chỉ số ghế -> id học sinh (ghế 0 là ghế đẹp nhất, xem SEAT_ORDER ở client)

// ---- Vòng chơi ----
const game = {
  phase: "idle", // idle | intro | question | result | paused
  paused: false,
  number: 0,
  q: null, // câu hỏi đầy đủ (có đáp án)
  pub: null, // bản gửi cho người xem
  pattern: [],
  startedAt: 0,
  phaseEnds: 0,
  phaseTotal: 0,
  answers: new Map(), // id -> { ok, ms, text, attempts, done }
  lastResult: null,
  golden: false,
  goldenQueue: 0,
  classStreak: 0, // số câu liên tiếp cả lớp làm đúng (đúng = ít nhất nửa số bạn trả lời đúng)
  classBest: 0,
  rareGiven: new Set(), // huy hiệu hiếm chỉ trao 1 lần mỗi buổi
  waiting: null,
  leaderId: null,
  leaderRounds: 0,
  timer: null,
  hintTimers: [],
  botTimers: [],
  settings: {
    pack: "ngay5",
    mode: "mix",
    topic: "all",
    introMs: 3500,
    mcqMs: 20000,
    fillMs: 26000,
    resultMs: 11000,
    voice: true,
  },
};

// ---- Kết nối TikTok ----
const Conn = TLC.TikTokLiveConnection || TLC.WebcastPushConnection;
const EV = TLC.WebcastEvent || {};
const CE = TLC.ControlEvent || {};
const E = {
  chat: EV.CHAT || "chat",
  gift: EV.GIFT || "gift",
  like: EV.LIKE || "like",
  member: EV.MEMBER || "member",
  follow: EV.FOLLOW || "follow",
  share: EV.SHARE || "share",
  streamEnd: EV.STREAM_END || "streamEnd",
  disconnected: CE.DISCONNECTED || "disconnected",
  error: CE.ERROR || "error",
};
const tiktokState = {
  username: process.env.TIKTOK_USERNAME || "",
  status: "idle",
  roomId: null,
  error: null,
  viewers: 0,
};
let conn = null;
let retryTimer = null;
let wantConnected = false;

// ---- Express & WebSocket ----
const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders: (res, p) => {
      if (p.endsWith(".html")) res.set("Cache-Control", "no-store");
    },
  }),
);
app.use("/skill-listening", express.static(path.join(__dirname, "video-skill-listening")));
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

function broadcast(msg) {
  const s = JSON.stringify(msg);
  for (const c of wss.clients) if (c.readyState === 1) c.send(s);
}
function setTikTokStatus(patch) {
  Object.assign(tiktokState, patch);
  broadcast({ type: "status", ...tiktokState });
  console.log(
    `[tiktok] ${tiktokState.status}${tiktokState.error ? " – " + tiktokState.error : ""}`,
  );
}

function userOf(d) {
  const u = d.user || d;
  // Bản thư viện mới (proto v3) để ảnh ở avatarThumb/avatarMedium/avatarLarge.urlList; bản cũ ở profilePicture. Bỏ định dạng .heic vì Chrome không hiện được.
  const lists = [
    u.avatarThumb?.urlList,
    u.avatarMedium?.urlList,
    u.avatarLarge?.urlList,
    u.profilePicture?.url,
    u.profilePicture?.urls,
    u.profilePictureUrl && [u.profilePictureUrl],
  ].filter(Array.isArray);
  const all = lists.flat().filter((x) => typeof x === "string" && x);
  const pic = all.find((x) => !/heic/i.test(x)) || all[0] || "";
  return {
    // Ưu tiên tên tài khoản (uniqueId): luôn giống nhau ở bình luận, tim, quà; userId đôi khi thiếu ở một số loại sự kiện
    id: String(
      u.uniqueId || d.uniqueId || u.userId || u.id || d.userId || Math.random(),
    ),
    uniqueId: u.uniqueId || d.uniqueId || "",
    name: u.nickname || d.nickname || u.uniqueId || d.uniqueId || "Ẩn danh",
    avatar: pic,
  };
}
function giftOf(d) {
  const det = d.giftDetails || d.extendedGiftInfo || d.gift || {};
  return {
    giftId: d.giftId ?? det.id,
    giftName: d.giftName || det.giftName || det.name || "Quà tặng",
    diamonds:
      Number(d.diamondCount ?? det.diamondCount ?? det.diamond_count ?? 1) || 1,
    count: Number(d.repeatCount || 1),
    streaking: (d.giftType ?? det.giftType) === 1 && !d.repeatEnd,
  };
}

// =====================================================================
// Chỗ ngồi & hành lang
// =====================================================================
// Hàng chờ ngoài hành lang: người tặng quà trước (nhiều xu trước), rồi người điểm cao, rồi ai đến sớm
const byPriority = (a, b) =>
  (b.coins || 0) - (a.coins || 0) ||
  (b.score || 0) - (a.score || 0) ||
  a.joinedAt - b.joinedAt;
// Ghế trống: mặc định chỉ tìm ghế thường (từ sau ghế VIP); any = true thì tìm cả ghế VIP
const freeIdx = (any = false) => {
  if (any) for (let i = 0; i < VIP_SEATS; i++) if (!seatOwner[i]) return i; // bạn tặng quà: thử ghế VIP trước
  for (let i = REG_START; i < SEATS; i++) if (!seatOwner[i]) return i;
  return -1;
};

function sit(s, i) {
  if (s.seat != null) seatOwner[s.seat] = null;
  s.seat = i;
  seatOwner[i] = s.id;
}
function stand(s) {
  if (s.seat != null) seatOwner[s.seat] = null;
  s.seat = null;
}
// Ghế VIP: 7 bạn tặng nhiều xu nhất (không đang bị phạt đứng) ngồi ghế 0..6 theo thứ tự số xu, người nhiều nhất ở ghế 0 (giữa, to nhất).
// Bạn không thuộc top 7 bị mời ra ghế thường (hết ghế thì chen vào chỗ của bạn ít điểm nhất, nếu bạn đó cũng đã tặng quà).
function arrangeVip() {
  const all = [...classroom.students.values()];
  const top = all
    .filter((s) => s.coins > 0 && !s.standing)
    .sort((a, b) => b.coins - a.coins || (a.reachedAt || 0) - (b.reachedAt || 0))
    .slice(0, VIP_SEATS);
  const topSet = new Set(top);
  for (let i = 0; i < VIP_SEATS && i < SEATS; i++) {
    const o = seatOwner[i] && classroom.students.get(seatOwner[i]);
    if (!o || topSet.has(o)) continue;
    stand(o);
    let j = freeIdx();
    if (j < 0 && o.coins > 0) {
      const victim = all
        .filter((x) => x.seat != null && x.seat >= REG_START && !(x.coins > 0))
        .sort((a, b) => (a.score || 0) - (b.score || 0) || (a.lastSeen || 0) - (b.lastSeen || 0))[0];
      if (victim) { j = victim.seat; stand(victim); }
    }
    if (j >= 0) sit(o, j);
  }
  top.forEach((s) => { if (s.seat != null) { seatOwner[s.seat] = null; s.seat = null; } });
  top.forEach((s, k) => { if (k < SEATS) sit(s, k); });
}
// Ghế xuất sắc: 7 bạn điểm cao nhất bảng thi đua (không thuộc nhóm VIP, không đang bị phạt đứng); ghế VIP_SEATS = điểm cao nhất (giữa)
function arrangeTop() {
  if (!TOP_SEATS) return;
  const all = [...classroom.students.values()];
  const cand = all
    .filter((s) => !s.standing && (s.score || 0) > 0 && !(s.seat != null && s.seat < VIP_SEATS))
    .sort((a, b) => (b.score || 0) - (a.score || 0) || (b.correct || 0) - (a.correct || 0) || a.joinedAt - b.joinedAt)
    .slice(0, TOP_SEATS);
  const set = new Set(cand);
  for (let i = VIP_SEATS; i < REG_START; i++) {
    const o = seatOwner[i] && classroom.students.get(seatOwner[i]);
    if (!o || set.has(o)) continue;
    stand(o);
    const j = freeIdx();
    if (j >= 0) sit(o, j);
  }
  cand.forEach((s) => { if (s.seat != null) { seatOwner[s.seat] = null; s.seat = null; } });
  cand.forEach((s, k) => sit(s, VIP_SEATS + k));
}
const arrangeSeats = () => { arrangeVip(); arrangeTop(); };
const frontLoadDonors = arrangeSeats;
// Ghế trống thì mời hành lang vào, bạn tặng quà trước
function fillSeats() {
  const fillLoop = () => {
    for (;;) {
      const next = [...classroom.students.values()]
        .filter((s) => s.seat == null && !s.standing)
        .sort(byPriority)[0];
      if (!next) break;
      const i = next.coins > 0 ? (freeIdx() >= 0 ? freeIdx() : freeIdx(true)) : freeIdx();
      if (i < 0) break;
      sit(next, i);
    }
  };
  arrangeSeats();
  fillLoop();
  arrangeSeats(); // bạn tặng quà vừa lên ghế VIP để lại ghế thường trống → mời tiếp hành lang vào
  fillLoop();
}
// Cuối mỗi vòng: bạn điểm cao ngoài hành lang được đổi chỗ với bạn ngồi mà điểm thấp hơn.
// Người đã tặng quà không bị đổi xuống; bạn tặng quà ngoài hành lang luôn được ưu tiên vào trước.
function rebalanceByScore(maxSwaps = 8) {
  const swaps = [];
  for (let n = 0; n < maxSwaps; n++) {
    const w = [...classroom.students.values()]
      .filter(
        (s) => s.seat == null && !s.standing && (s.score > 0 || s.coins > 0),
      )
      .sort(byPriority)[0];
    if (!w) break;
    const seated = [...classroom.students.values()].filter(
      (s) => s.seat != null && s.seat >= REG_START && !(s.coins > 0),
    );
    const victim = seated.sort(
      (a, b) =>
        (a.score || 0) - (b.score || 0) ||
        (a.lastSeen || 0) - (b.lastSeen || 0),
    )[0];
    const beats =
      victim && (w.coins > 0 || (w.score || 0) > (victim.score || 0));
    if (!beats) break;
    const i = victim.seat;
    stand(victim);
    sit(w, i);
    swaps.push({ in: brief(w), out: brief(victim) });
  }
  if (swaps.length) {
    frontLoadDonors();
    scheduleRoster();
  }
  return swaps;
}
// Người tặng quà: ngồi luôn nếu còn ghế; lớp kín thì chen vào chỗ của bạn ít đóng góp nhất
function donorSeat(s) {
  s.standing = false;
  if (s.seat != null) {
    frontLoadDonors();
    return { kind: "stay" };
  }
  let i = freeIdx();
  if (i < 0) i = freeIdx(true);
  let evicted = null;
  if (i < 0) {
    const seated = [...classroom.students.values()].filter(
      (x) => x.seat != null,
    );
    const plain = seated
      .filter((x) => !(x.coins > 0) && x.seat >= REG_START)
      .sort(
        (a, b) =>
          (a.score || 0) - (b.score || 0) ||
          (a.lastSeen || 0) - (b.lastSeen || 0),
      );
    const victim =
      plain[0] ||
      seated.sort(
        (a, b) => a.coins - b.coins || (b.reachedAt || 0) - (a.reachedAt || 0),
      )[0];
    if (!victim || (victim.coins > 0 && victim.coins >= s.coins))
      return { kind: "waitlist" };
    i = victim.seat;
    stand(victim);
    evicted = victim;
  }
  sit(s, i);
  frontLoadDonors();
  return { kind: evicted ? "swap" : "from-hall", evicted };
}

const brief = (s) => ({
  id: s.id,
  name: s.name,
  avatar: s.avatar,
  coins: s.coins || 0,
  lv: levelInfo(s.coins || 0),
  nick: s.nick || null,
});
function getRoster() {
  const all = [...classroom.students.values()];
  const waiting = all
    .filter((s) => s.seat == null && !s.standing)
    .sort(byPriority);
  return {
    seats: SEATS,
    vip: VIP_SEATS,
    top: TOP_SEATS,
    total: all.length,
    seated: all
      .filter((s) => s.seat != null)
      .map((s) => ({
        ...brief(s),
        seat: s.seat,
        score: s.score || 0,
        streak: s.streak || 0,
      })),
    standing: all
      .filter((s) => s.standing)
      .sort((a, b) => (a.standAt || 0) - (b.standAt || 0))
      .map((s) => ({ ...brief(s), wrongRun: s.wrongRun || 0 })),
    waitingTotal: waiting.length,
    waiting: waiting.slice(0, 24).map(brief),
  };
}
function getBoard() {
  return [...classroom.students.values()]
    .filter((s) => s.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || b.correct - a.correct || a.joinedAt - b.joinedAt,
    )
    .slice(0, 20)
    .map((s) => ({ ...brief(s), score: s.score, streak: s.streak || 0 }));
}
function getAttendanceBoard() {
  return [...classroom.students.values()]
    .filter((s) => (s.attendanceStars || 0) > 0)
    .sort((a, b) => b.attendanceStars - a.attendanceStars || a.joinedAt - b.joinedAt)
    .slice(0, 10)
    .map((s) => ({ ...brief(s), attendanceStars: s.attendanceStars || 0 }));
}
function broadcastAttendanceBoard() {
  broadcast({ type: "attendance_board", board: getAttendanceBoard() });
}
let rosterTimer = null;
function scheduleRoster() {
  if (rosterTimer) return;
  rosterTimer = setTimeout(() => {
    rosterTimer = null;
    broadcast({ type: "roster", ...getRoster() });
  }, 350);
}

// ---- Học sinh rời lớp: TikTok không báo "người xem rời phòng", nên tự dọn ----
const IDLE_MIN = Number(process.env.STUDENT_IDLE_MIN || 5);
const DONOR_IDLE_MIN = Number(process.env.DONOR_IDLE_MIN || 60);
let liveViewers = null;
function pruneStudents() {
  const now = Date.now();
  let removed = 0;
  const drop = (s) => {
    stand(s);
    classroom.students.delete(s.id);
    removed++;
  };
  for (const s of [...classroom.students.values()]) {
    if (s.bot) {
      if (!bots.on) drop(s);
      continue;
    }
    const limit = (s.coins > 0 ? DONOR_IDLE_MIN : IDLE_MIN) * 60000;
    if (now - (s.lastSeen || s.joinedAt) > limit) drop(s);
  }
  if (liveViewers != null) {
    const extra = classroom.students.size - Math.max(liveViewers, 0);
    if (extra > 0) {
      [...classroom.students.values()]
        .filter((s) => !(s.coins > 0) && !s.bot)
        .sort((a, b) => (a.lastSeen || 0) - (b.lastSeen || 0))
        .slice(0, extra)
        .forEach(drop);
    }
  }
  if (removed) {
    fillSeats();
    scheduleRoster();
  }
}
const pruneTimer = setInterval(pruneStudents, 15000);

// Vào lớp (lần đầu thấy người này): còn ghế thì ngồi, hết thì ra hành lang
function recordStudentAttendance(user) {
  const existing = classroom.students.get(user.id);
  if (existing) {
    existing.lastSeen = Date.now();
    if (user.avatar && !existing.avatar) existing.avatar = user.avatar;
    return false;
  }
  const s = {
    ...user,
    joinedAt: Date.now(),
    lastSeen: Date.now(),
    coins: 0,
    attendanceStars: 0,
    gifts: 0,
    score: 0,
    correct: 0,
    streak: 0,
    seat: null,
  };
  classroom.students.set(s.id, s);
  const i = freeIdx();
  if (i >= 0) sit(s, i);
  broadcast({
    type: "student_join",
    user: brief(s),
    seated: s.seat != null,
    totalStudents: classroom.students.size,
  });
  scheduleRoster();

  // ---- Chào VIP (cả Người Donate lẫn Học sinh giỏi): chỉ đọc 1 lần duy nhất rồi xoá vĩnh viễn khỏi data ----
  const returner = checkAndConsumeReturner({ id: user.id, uniqueId: user.uniqueId, name: user.name });
  if (returner) {
    // Hiển thị banner chào mừng ngay (không delay)
    broadcast({
      type: "vip_return",
      user: brief(s),
      vipType: returner.vipType,
      badgeTitle: returner.badgeTitle,
      greetText: returner.greetText,
      effect: returner.effect,
      // Thông tin học bá
      scholarRank: returner.scholarRank,
      scholarScore: returner.scholarScore,
      scholarDate: returner.scholarDate,
      wins: returner.wins,
      totalWins: returner.totalWins,
      bestScore: returner.bestScore,
      // Thông tin đại gia
      donorRank: returner.donorRank,
      donorCoins: returner.donorCoins,
      donorDate: returner.donorDate,
      donorWins: returner.donorWins,
      totalDonorWins: returner.totalDonorWins,
      totalCoins: returner.totalCoins,
      bestSessionCoins: returner.bestSessionCoins,
      donorRole: returner.donorRole,
    });
    // Đọc lời chào bằng TTS (delay nhẹ để không đè lên âm thanh join)
    if (game.settings.voice && returner.ttsText) {
      setTimeout(async () => {
        try {
          await ttsFile("vi", returner.ttsText);
          broadcast({ type: "vip_tts", text: returner.ttsText, lang: "vi" });
        } catch (e) {
          console.warn("[vip-history] TTS lỗi:", e.message);
        }
      }, 1500);
    }
  }

  return true;
}

// =====================================================================
// Vòng chơi: intro → câu hỏi → kết quả → câu tiếp
// =====================================================================
const letters = (s) =>
  String(s)
    .replace(/[^a-zA-Z]/g, "")
    .split("");
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const kindOf = (q) => (q.mode === "translate" ? "translate" : q.type);
const wordsOf = (q) =>
  q.answers[0]
    .replace(/[.,!?]/g, "")
    .split(/\s+/)
    .filter(Boolean);
// Che chữ từng từ: giữ k chữ đầu, còn lại là dấu gạch
const maskWords = (q, k) =>
  wordsOf(q).map((w) => w.slice(0, k) + "_".repeat(Math.max(0, w.length - k)));
function publicQuestion(q) {
  const [en, vi, icon] = TOPICS[q.topic] || [q.topic, "", "📘"];
  const p = {
    number: game.number,
    golden: !!game.golden,
    type: q.type,
    topic: q.topic,
    topicEn: en,
    topicVi: vi,
    icon,
    prompt: q.prompt,
    emoji: q.emoji,
    sub: q.sub,
  };
  if (q.type === "mcq") p.options = q.options;
  else if (q.mode === "translate")
    p.fill = { mode: "translate", len: wordsOf(q).length, masks: game.pattern };
  else
    p.fill = {
      mode: q.mode,
      len: letters(q.answers[0]).length,
      pattern: game.pattern,
      tiles: q.tiles,
    };
  return p;
}
function revealOne() {
  const hidden = game.pattern.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0);
  if (hidden.length <= 1) return false; // luôn chừa lại ít nhất một chữ
  const i = hidden[Math.floor(Math.random() * hidden.length)];
  game.pattern[i] = letters(game.q.answers[0])[i].toUpperCase();
  return true;
}
const clearTimers = () => {
  clearTimeout(game.timer);
  game.hintTimers.forEach(clearTimeout);
  game.hintTimers = [];
  game.botTimers.forEach(clearTimeout);
  game.botTimers = [];
};
function setPhase(phase, ms) {
  game.phase = phase;
  game.phaseTotal = ms;
  game.phaseEnds = Date.now() + ms;
}

function startRound() {
  clearTimers();
  if (game.paused) {
    game.phase = "paused";
    broadcast({ type: "paused" });
    return;
  }
  applyTransitions();
  const q = nextQuestion(game.settings, game.number);
  if (!q) {
    game.timer = setTimeout(startRound, 3000);
    return;
  }
  game.number++;
  // Câu vàng: mỗi 5 câu, hoặc câu thưởng khi cả lớp đạt mục tiêu quà
  game.golden = game.number % 5 === 0;
  if (!game.golden && game.goldenQueue > 0) {
    game.golden = true;
    game.goldenQueue--;
  }
  game.q = q;
  game.answers.clear();
  game.pub = null;
  game.pattern = [];
  if (q.mode === "translate") game.pattern = maskWords(q, 0);
  else if (q.type === "fill") {
    const w = letters(q.answers[0]);
    game.pattern = Array(w.length).fill("");
    if (q.mode === "spell" && !q.hard) {
      game.pattern[0] = w[0].toUpperCase();
      if (w.length >= 6)
        game.pattern[w.length - 1] = w[w.length - 1].toUpperCase();
    }
  }
  const [en, vi, icon] = TOPICS[q.topic] || [q.topic, "", "📘"];
  setPhase("intro", game.settings.introMs);
  broadcast({
    type: "intro",
    golden: game.golden,
    number: game.number,
    qtype: kindOf(q),
    topicEn: en,
    topicVi: vi,
    icon,
    remainMs: game.settings.introMs,
  });
  game.timer = setTimeout(beginQuestion, game.settings.introMs);
}

function beginQuestion() {
  clearTimers();
  const q = game.q;
  const total =
    q.type === "mcq"
      ? game.settings.mcqMs
      : q.mode === "translate"
        ? Math.max(game.settings.fillMs, 45000)
        : game.settings.fillMs;
  game.startedAt = Date.now();
  setPhase("question", total);
  game.pub = publicQuestion(q);
  broadcast({ type: "question", q: game.pub, remainMs: total, totalMs: total });
  if (q.mode === "translate") {
    // Gợi ý một lần: còn 20 giây thì hiện chữ cái đầu mỗi từ
    game.hintTimers.push(
      setTimeout(
        () => {
          if (game.phase !== "question") return;
          maskWords(q, 1).forEach((m, j) => {
            game.pattern[j] = m;
          });
          broadcast({ type: "hint", pattern: game.pattern });
        },
        Math.max(0, total - 20000),
      ),
    );
  } else if (q.type === "fill") {
    // Gợi ý dần: nửa thời gian hiện thêm một chữ, còn 1/4 thời gian hiện thêm chữ nữa
    [0.5, 0.75].forEach((f) =>
      game.hintTimers.push(
        setTimeout(() => {
          if (game.phase !== "question") return;
          if (revealOne()) broadcast({ type: "hint", pattern: game.pattern });
        }, total * f),
      ),
    );
  }
  game.timer = setTimeout(endRound, total);
  if (bots.on) scheduleBotAnswers();
}

// Chuỗi đúng của cả lớp: câu được tính là "đúng" khi ít nhất nửa số bạn trả lời đúng (và có ít nhất 1 bạn đúng). Đứt chuỗi thì về 0.
function classStreakUpdate(correctN, answeredN) {
  const win = correctN >= 1 && correctN * 2 >= answeredN;
  const prev = game.classStreak;
  game.classStreak = win ? prev + 1 : 0;
  game.classBest = Math.max(game.classBest, game.classStreak);
  return { classWin: win, classStreak: game.classStreak, classBest: game.classBest, streakBroken: win ? 0 : prev };
}

const PROMO_TEXT =
  "Mọi người đừng tặng quà cho mình nha! ❤️ Ghé giỏ hàng chọn một quyển sách từ vựng hoặc luyện đọc tiếng Anh phù hợp bản thân để mỗi ngày giỏi hơn một chút nhé! 🥰";
export const TEASES = [
  "Sách úp mặt rồi, suy nghĩ lại nha! 📖",
  "Đừng buồn, Po cũng hay nhầm lắm! 🌟",
  "Sai một chút thôi, lần sau gỡ lại liền! 💪",
  "Đoán liều hả? Pess thấy hết rồi nha! 👀",
  "Câu sau gỡ gạc nhé, Po tin bạn! 🌟",
  "Sai là mẹ của thành công đó nha! 😄",
  "Hít thở sâu, câu sau mình làm được! 🌬️",
  "Pess không giận đâu, vui lên nào! 💖",
  "Đáp án chạy mất rồi, đuổi theo câu sau nha! 🏃",
  "Sai một lần để nhớ cả đời, vui chưa! 🤣",
];
// Sang câu mới: bạn sai ra đứng cuối lớp (nhường ghế); bạn đang đứng mà đã đúng thì về ngồi,
// hết ghế thì thay một bạn không đúng ở vòng đó (điểm thấp nhất, trừ người tặng quà)
function applyTransitions() {
  const all = [...classroom.students.values()];
  for (const s of all) {
    if (!s.pendingStand) continue;
    s.pendingStand = false;
    if (s.seat == null) continue;
    if (!s.standing) s.standAt = Date.now();
    s.standing = true;
    stand(s);
  }
  const returners = all
    .filter(
      (s) => s.pendingReturn && s.standing && classroom.students.has(s.id),
    )
    .sort(byPriority);
  for (const s of all) s.pendingReturn = false;
  for (const s of returners) {
    let i = s.coins > 0 && freeIdx() < 0 ? freeIdx(true) : freeIdx();
    if (i < 0) {
      const victim = [...classroom.students.values()]
        .filter(
          (x) =>
            x.seat != null &&
            x.seat >= REG_START &&
            !(x.coins > 0) &&
            (x.score || 0) <= (s.score || 0),
        )
        .sort((x, y) =>
          (x.wrongRun || 0) < (y.wrongRun || 0)
            ? 1
            : (x.wrongRun || 0) > (y.wrongRun || 0)
              ? -1
              : (x.score || 0) - (y.score || 0) ||
                (x.lastSeen || 0) - (y.lastSeen || 0),
        )[0];
      if (!victim) {
        s.pendingReturn = true;
        continue;
      }
      i = victim.seat;
      stand(victim); // ra hành lang chờ
    }
    s.standing = false;
    sit(s, i);
  }
  fillSeats();
  scheduleRoster();
}
function endRound() {
  clearTimers();
  if (game.phase !== "question") return;
  const q = game.q;
  const entries = [...game.answers.entries()];
  const prevRank = new Map(getBoard().map((x, i) => [x.id, i])); // thứ hạng trước câu này, để biết ai vừa lật đổ ngôi đầu
  const seatedBefore = new Set(
    [...classroom.students.values()]
      .filter((x) => x.seat != null || x.standing)
      .map((x) => x.id),
  );
  const correct = entries
    .filter(([, a]) => a.ok)
    .sort((a, b) => a[1].ms - b[1].ms);
  const POINTS = [5, 3, 2];
  const okIds = new Set();
  correct.forEach(([id, a], i) => {
    const s = classroom.students.get(id);
    a.pts = (POINTS[i] || 1) * (game.golden ? 2 : 1);
    if (!s) return;
    okIds.add(id);
    s.score = (s.score || 0) + a.pts;
    s.correct = (s.correct || 0) + 1;
    s.streak = (s.streak || 0) + 1;
    a.prevRun = s.wrongRun || 0;
    a.rank = i;
    s.wrongRun = 0;
    s.pendingStand = false;
    if (s.standing) s.pendingReturn = true; // đang đứng mà đúng: sang câu mới thì về ngồi
  });
  for (const s of classroom.students.values())
    if (!okIds.has(s.id) && s.streak) s.streak = 0;
  // Phạt vui: sai thì trừ 1 điểm (không dưới 0). Vẫn ngồi chỗ cũ hiện câu sai; sang câu mới mới ra đứng cuối lớp
  const wrong = [];
  for (const [id, a] of entries) {
    if (a.ok) continue;
    const s = classroom.students.get(id);
    if (!s) continue;
    if ((s.score || 0) > 0) {
      s.score--;
      a.pen = 1;
    }
    s.wrongRun = (s.wrongRun || 0) + 1;
    if (q.mode === "translate") s.trWrong = (s.trWrong || 0) + 1;
    // (không còn phạt đứng cuối lớp: bạn không có ghế thì chờ ở hành lang, điểm cao hơn bạn đang ngồi là được vào)
    wrong.push({
      id,
      name: s.name,
      text: String(a.text || "").slice(0, 14),
      wrongRun: s.wrongRun,
    });
  }
  // Biệt danh vui theo kết quả (tên thật vẫn giữ nguyên, biệt danh hiện thêm bên cạnh).
  // rare = huy hiệu hiếm (mỗi buổi chỉ trao 1 lần, hiện nổi bật); low = biệt danh nhẹ, không đè lên biệt danh khác.
  const awards = [];
  const give = (s, t, i, o = {}) => {
    if (!s || (s.nick && s.nick.t === t)) return false;
    if (o.rare && game.rareGiven.has(t)) return false;
    if (o.low && s.nick && !s.nick.low) return false;
    s.nick = { t, i, rare: !!o.rare, low: !!o.low };
    if (o.rare) game.rareGiven.add(t);
    awards.push({ id: s.id, name: s.name, nick: s.nick });
    return true;
  };
  const kind =
    q.type === "mcq" ? "mcq" : q.mode === "translate" ? "tr" : "fill";
  const total = game.phaseTotal || 20000;
  for (const [id, a] of entries) {
    const s = classroom.students.get(id);
    if (!s) continue;
    const run = kind + "Run";
    if (a.ok) {
      s[run] = (s[run] || 0) + 1;
      if (s.hadWrong) {
        s.recov = (s.recov || 0) + 1;
      }
      s.standStreak = 0;
      const slowest =
        correct.length >= 4 &&
        a.rank === correct.length - 1 &&
        a.ms >= total * 0.7;
      s.slowRun = slowest ? (s.slowRun || 0) + 1 : 0;
      if (
        a.rank === 0 &&
        a.ms <= 1000 &&
        give(s, "Cậu bé 1 giây", "⚡", { rare: true })
      ) {
        /* hiếm */
      } else if (
        a.ms >= total - 5000 &&
        give(s, "Cú đêm", "🦉", { rare: true })
      ) {
        /* hiếm */
      } else if (a.rank === 0 && a.ms <= 2000) give(s, "Chớp nhoáng", "⚡");
      else if (a.rank === 1 && a.ms <= 4000) give(s, "Á quân tia chớp", "🥈");
      else if (a.prevRun >= 4) give(s, "Lội ngược dòng", "🌊");
      else if (a.prevRun >= 2) give(s, "Quay xe ngoạn mục", "🚀");
      else if (s.hadWrong && s.recov === 3) {
        s.hadWrong = false;
        give(s, "Lì đòn", "🛡️");
      } else if (s.hadWrong && s.recov === 1) give(s, "Sửa sai cực nhanh", "🌱");
      else if (kind === "tr" && s.trRun === 3)
        give(s, "Thánh dịch chuẩn", "🌐");
      else if (kind === "tr" && s.trRun === 5) give(s, "Đại sứ song ngữ", "🌍");
      else if (kind === "mcq" && s.mcqRun === 4) give(s, "Mắt thần", "👁️");
      else if (kind === "mcq" && s.mcqRun === 6) give(s, "Cỗ máy trắc nghiệm", "🎯");
      else if (kind === "fill" && s.fillRun === 3)
        give(s, "Thần đồng 3 chữ", "🔤");
      else if (kind === "fill" && s.fillRun === 5) give(s, "Phù thủy từ vựng", "🪄");
      else if (s.correct === 10) give(s, "Mười lần chính xác", "🎖️");
      else if (s.streak === 7) give(s, "Chuỗi chuẩn bảy câu", "💫");
      else if (s.streak === 8) give(s, "Bền bỉ không bỏ cuộc", "💪");
      else if (game.golden && a.rank === 1) give(s, "Ánh sao câu vàng", "🌟");
      else if (s.streak >= 5) give(s, "Học bá liên hoàn", "🔥");
      else if (game.golden && a.rank === 0) give(s, "Vua câu vàng", "👑");
      else if (s.streak === 3) give(s, "Cao thủ nóng máy", "✨");
      else if (s.slowRun === 2) give(s, "Rùa vàng", "🐢");
    } else {
      s[run] = 0;
      s.hadWrong = true;
      s.recov = 0;
      s.slowRun = 0;
      s.standStreak = (s.standStreak || 0) + 1;
      if (q.mode === "translate" && (s.trWrong || 0) >= 2)
        give(s, "Thánh dịch sai", "🤣");
      else if ((s.wrongRun || 0) >= 3) give(s, "Chúa tể đoán liều", "🎲");
    }
  }
  // Theo thứ hạng bảng điểm: ngôi đầu, lật đổ, đua nhau
  const nb = getBoard();
  const lead = nb[0] && classroom.students.get(nb[0].id);
  if (lead) {
    if (game.leaderId === lead.id) game.leaderRounds++;
    else {
      const was = prevRank.get(lead.id);
      game.leaderId = lead.id;
      game.leaderRounds = 1;
      if (was !== undefined && was >= 4)
        give(lead, "Kẻ lật đổ", "🗡️", { rare: true });
    }
    if (game.leaderRounds === 5) give(lead, "Ngai vàng", "👑", { rare: true });
  }
  for (let i = 0; i < Math.min(4, nb.length - 1); i++) {
    if (nb[i].score >= 3 && Math.abs(nb[i].score - nb[i + 1].score) <= 1) {
      give(classroom.students.get(nb[i].id), "Đang đua nhau", "⚔️", {
        low: true,
      });
      give(classroom.students.get(nb[i + 1].id), "Đang đua nhau", "⚔️", {
        low: true,
      });
      break;
    }
  }

  const dist = {};
  if (q.type === "mcq")
    for (const [, a] of entries) dist[a.key] = (dist[a.key] || 0) + 1;

  const shown = entries
    .map(([id, a]) => ({
      id,
      text: String(a.text || "").slice(0, 12),
      ok: !!a.ok,
      pts: a.pts || 0,
      pen: a.pen || 0,
    }))
    .filter((a) => seatedBefore.has(a.id));
  const top3 = correct.slice(0, 10).map(([id, a]) => {
    const s = classroom.students.get(id);
    return {
      ...(s ? brief(s) : { id, name: "Bạn ẩn danh", avatar: "", lv: null }),
      ms: a.ms,
      pts: a.pts,
    };
  });
  const answer =
    q.type === "mcq"
      ? { key: q.answerKey, text: q.answers[0] }
      : {
          text: q.answers[0],
          alts: q.answers.slice(1),
          full: q.mode === "sentence" && q.full ? cap(q.full) : null,
        };

  game.lastResult = {
    number: game.number,
    qtype: kindOf(q),
    answer,
    explain: q.explain || "",
    emoji: q.emoji,
    correctCount: correct.length,
    correctNames: correct
      .slice(0, 12)
      .map(([id]) => classroom.students.get(id)?.name)
      .filter(Boolean),
    answeredCount: entries.length,
    top3,
    dist,
    answers: shown,
    golden: !!game.golden,
    wrong: wrong.slice(0, 8),
    awards: awards.slice(0, 4),
    wrongCount: wrong.length,
    ...classStreakUpdate(correct.length, entries.length),
    firstPrevRank: top3[0] ? (prevRank.has(top3[0].id) ? prevRank.get(top3[0].id) : -1) : -1, // hạng của bạn nhanh nhất trước câu này (0 = top 1)
    tease: wrong.length
      ? TEASES[Math.floor(Math.random() * TEASES.length)]
      : "",
    board: getBoard(),
  };
  // Qua câu mới khi trang lớp học báo đã đọc xong (/api/result-done). resMs chỉ là mức chờ tối đa phòng khi không có trang nào phát được tiếng.
  const resMs = Math.max(
    game.settings.resultMs,
    q.mode === "translate" ? 26000 : 22000,
  );
  setPhase("result", resMs);
  broadcast({
    type: "result",
    ...game.lastResult,
    remainMs: resMs,
    totalMs: resMs,
  });
  const swaps = rebalanceByScore();
  if (swaps.length) broadcast({ type: "seat_swap", swaps });
  scheduleRoster();
  game.timer = setTimeout(startRound, resMs);
}

// Một bình luận có phải đáp án không? true = đã tính là đáp án (không hiện lên chat)
function processAnswer(user, text) {
  if (game.phase !== "question" || !game.q) return false;
  const q = game.q;
  const s = classroom.students.get(user.id);
  if (!s) return false;
  const prev = game.answers.get(user.id);
  if (q.type === "mcq") {
    const key = parseChoice(q, text);
    if (!key) return false;
    if (prev) return true;
    game.answers.set(user.id, {
      ok: key === q.answerKey,
      ms: Date.now() - game.startedAt,
      text: key,
      key,
      done: true,
    });
  } else {
    if (!isAttempt(q, text)) return false;
    if (prev?.done) return true;
    const a = prev || { attempts: 0, ok: false, done: false };
    a.attempts++;
    a.text = String(text).trim();
    a.ok = checkFill(q, text);
    a.ms = Date.now() - game.startedAt;
    a.done = a.ok || a.attempts >= 3;
    game.answers.set(user.id, a);
    if (prev) return true; // lần thử lại: không báo thêm
  }
  broadcast({ type: "answered", id: user.id, count: game.answers.size });
  if (
    q.type === "fill" &&
    q.mode === "spell" &&
    [...game.answers.values()].filter((answer) => answer.ok).length >= 15
  ) {
    endRound();
  }
  return true;
}

function skipRound() {
  if (game.phase === "question") endRound();
  else if (game.phase === "intro") beginQuestion();
  else if (
    game.phase === "result" ||
    game.phase === "paused" ||
    game.phase === "ended" ||
    game.phase === "idle"
  ) {
    game.paused = false;
    startRound();
  }
}

// ---- Màn hình chờ trước giờ live: đếm ngược tới giờ rồi tự vào học ----
function startWaiting(startAt) {
  clearTimers();
  game.paused = false;
  game.phase = "waiting";
  game.waiting = { startAt };
  broadcast({ type: "waiting", startAt, now: Date.now() });
  game.timer = setTimeout(goLive, Math.max(0, startAt - Date.now()));
}
function goLive() {
  clearTimers();
  game.waiting = null;
  game.phase = "idle";
  broadcast({ type: "wait_go" });
  game.timer = setTimeout(startRound, 5000); // chừa thời gian cho màn "BẮT ĐẦU!"
}
function parseStartTime(v) {
  if (v?.inMin != null) return Date.now() + Number(v.inMin) * 60000;
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(v?.time || ""));
  if (!m) return null;
  const d = new Date();
  d.setHours(Number(m[1]), Number(m[2]), 0, 0);
  if (d.getTime() < Date.now() - 60000) d.setDate(d.getDate() + 1); // giờ đã qua thì hiểu là ngày mai
  return d.getTime();
}

function snapshot() {
  return {
    classStreak: game.classStreak,
    classBest: game.classBest,
    waiting:
      game.phase === "waiting" && game.waiting
        ? { startAt: game.waiting.startAt, now: Date.now() }
        : null,
    phase: game.phase,
    paused: game.paused,
    number: game.number,
    remainMs: Math.max(0, game.phaseEnds - Date.now()),
    totalMs: game.phaseTotal,
    q: game.phase === "question" || game.phase === "result" ? game.pub : null,
    intro:
      game.phase === "intro" && game.q
        ? {
            golden: !!game.golden,
            qtype: kindOf(game.q),
            topicEn: (TOPICS[game.q.topic] || [])[0],
            topicVi: (TOPICS[game.q.topic] || [])[1],
            icon: (TOPICS[game.q.topic] || [])[2],
          }
        : null,
    answeredIds: game.phase === "question" ? [...game.answers.keys()] : [],
    result: game.phase === "result" ? game.lastResult : null,
    ended:
      game.phase === "ended"
        ? {
            board: getBoard(),
            donors: getDonors(),
            stats: {
              students: classroom.students.size,
              likes: classroom.totalLikes,
              gifts: classroom.totalGifts,
              coins: classroom.totalCoins,
            },
          }
        : null,
    settings: game.settings,
  };
}

// =====================================================================
// Bạn ảo (chạy thử không cần live)
// =====================================================================
const BOT_NAMES = [
  "Thu Trang",
  "Hoàng Nam",
  "Ngọc Hân",
  "Đức Huy",
  "Bảo Ngọc",
  "Quốc Bảo",
  "Mai Linh",
  "Tuấn Kiệt",
  "Khánh Vy",
  "Gia Hưng",
  "Phương Thảo",
  "Minh Anh",
  "Lan Chi",
  "Thanh Tùng",
  "Thảo My",
  "Hải Đăng",
  "Bích Ngọc",
  "Anh Thư",
  "Duy Khang",
  "Yến Nhi",
  "Kim Ngân",
  "Tâm An",
  "Hạnh Dung",
  "Việt Anh",
  "Cẩm Tú",
  "Nhật Minh",
  "Diệu Linh",
  "Hà My",
  "Xuân Bách",
  "Thùy Dương",
];
const bots = { on: false };
function spawnBots(n) {
  bots.on = true;
  const have = [...classroom.students.values()].filter((s) => s.bot).length;
  for (let i = have; i < have + n; i++) {
    const name = `${BOT_NAMES[i % BOT_NAMES.length]}${i >= BOT_NAMES.length ? " " + Math.floor(i / BOT_NAMES.length + 1) : ""}`;
    const user = { id: "bot_" + i, uniqueId: "bot" + i, name, avatar: "" };
    recordStudentAttendance(user);
    classroom.students.get(user.id).bot = true;
  }
  if (game.phase === "question") scheduleBotAnswers();
}
function scheduleBotAnswers() {
  const q = game.q;
  const total = game.phaseTotal;
  for (const s of classroom.students.values()) {
    if (!s.bot || Math.random() < 0.15) continue;
    const t = 1200 + Math.pow(Math.random(), 1.6) * (total * 0.85 - 1200);
    const tm = setTimeout(() => {
      if (game.q !== q || game.phase !== "question") return;
      const user = { id: s.id, name: s.name, avatar: "" };
      const good = Math.random() < 0.62;
      let text;
      if (q.type === "mcq") {
        const wrong = q.options.filter((o) => o.k !== q.answerKey);
        text = good
          ? q.answerKey
          : wrong[Math.floor(Math.random() * wrong.length)].k;
      } else {
        text = good ? q.answers[0] : q.answers[0].slice(0, -1) + "x";
      }
      processAnswer(user, text);
    }, t);
    game.botTimers.push(tm);
  }
}

// =====================================================================
// Bình luận, quà, tim
// =====================================================================
function handleComment(user, text) {
  recordStudentAttendance(user);
  const clean = String(text || "").trim();
  if (processAnswer(user, clean)) return;
  broadcast({
    type: "chat",
    user: { id: user.id, name: user.name },
    text: clean,
  });
}

// ---- Mục tiêu quà của cả lớp: đạt mốc xu thì có phần thưởng (fx = hiệu ứng trên màn hình, golden = số câu vàng thưởng) ----
// Đổi mốc bằng .env: GIFT_GOALS=100,300,600,1000 (phần thưởng giữ theo thứ tự mặc định)
const GOAL_DEFAULTS = [
  { reward: "Pess & Po nhảy múa 💃", fx: "dance" },
  { reward: "Mưa pháo hoa cả lớp 🎆", fx: "fireworks" },
  { reward: "Thêm một câu vàng ⚡", fx: "golden", golden: 1 },
  { reward: "Thêm hai câu vàng ⚡⚡", fx: "golden", golden: 2 },
  { reward: "Đại tiệc cả lớp 🎉", fx: "party", golden: 2 },
];
const GOAL_NEEDS = (process.env.GIFT_GOALS || "100,300,600,1000,2000")
  .split(",")
  .map(Number)
  .filter((x) => x > 0);
const GIFT_GOALS = GOAL_NEEDS.map((need, i) => ({
  need,
  ...GOAL_DEFAULTS[Math.min(i, GOAL_DEFAULTS.length - 1)],
}));
const goalsBetween = (from, to) =>
  GIFT_GOALS.filter((x) => x.need > from && x.need <= to);
// Đại gia của buổi: top 3 bạn tặng nhiều xu nhất
function getDonors() {
  return [...classroom.students.values()]
    .filter((s) => s.coins > 0)
    .sort((a, b) => b.coins - a.coins || a.joinedAt - b.joinedAt)
    .slice(0, 3)
    .map((s) => ({ ...brief(s), coins: s.coins }));
}

function handleGift(user, g) {
  recordStudentAttendance(user);
  classroom.totalGifts += g.count;
  const coinsBefore = classroom.totalCoins;
  classroom.totalCoins += g.coins;
  for (const gl of goalsBetween(coinsBefore, classroom.totalCoins)) {
    if (gl.golden) game.goldenQueue += gl.golden;
    setTimeout(
      () =>
        broadcast({
          type: "goal_reached",
          goal: gl.need,
          reward: gl.reward,
          fx: gl.fx,
          totalCoins: classroom.totalCoins,
        }),
      4500,
    );
  }
  const s = classroom.students.get(user.id);
  const prevCoins = s.coins || 0;
  s.coins = prevCoins + g.coins;
  s.attendanceStars = (s.attendanceStars || 0) + g.coins * 10;
  s.gifts = (s.gifts || 0) + g.count;
  s.reachedAt = Date.now();
  if (!s.nick || s.nick.low) s.nick = { t: "Hoàng gia tặng quà", i: "💝" }; // người tặng quà được cả lớp gọi tên riêng

  const res = donorSeat(s);
  const thanks = makeThanks({
    name: user.name,
    giftName: g.giftName,
    coins: g.coins,
    total: s.coins,
    prevCoins,
    seat: res.kind,
    evicted: res.evicted?.name || null,
  });
  broadcast({
    type: "gift",
    user: brief(s),
    thanks,
    giftName: g.giftName,
    count: g.count,
    coins: g.coins,
    evicted: res.evicted ? brief(res.evicted) : null,
    totalGifts: classroom.totalGifts,
    totalCoins: classroom.totalCoins,
  });
  scheduleRoster();
  broadcastAttendanceBoard();
}

function handleLike(user, count, total) {
  recordStudentAttendance(user);
  const s = classroom.students.get(user.id);
  s.attendanceStars = (s.attendanceStars || 0) + Math.max(0, count);
  classroom.totalLikes += count;
  broadcast({
    type: "like",
    user: { id: user.id, name: user.name },
    count,
    total: total || classroom.totalLikes,
  });
  broadcastAttendanceBoard();
}

function handleShare(user) {
  recordStudentAttendance(user);
  const s = classroom.students.get(user.id);
  s.attendanceStars = (s.attendanceStars || 0) + 2;
  broadcast({ type: "share", user: { id: user.id, name: user.name } });
  broadcastAttendanceBoard();
}

// ---- Kết nối phòng TikTok LIVE ----
async function connectTikTok(username) {
  username = String(username || "")
    .replace(/^@/, "")
    .trim();
  if (!username)
    return setTikTokStatus({
      status: "error",
      error: "Chưa nhập username TikTok",
    });

  await disconnectTikTok(false);
  wantConnected = true;
  tiktokState.username = username;
  liveViewers = null;
  setTikTokStatus({ status: "connecting", error: null, roomId: null });

  const opts = { processInitialData: false };
  if (SIGN_API_KEY) opts.signApiKey = SIGN_API_KEY;
  conn = new Conn(username, opts);

  conn.on(E.chat, (d) => {
    const user = userOf(d);
    const text = String(d.comment ?? d.content ?? "");
    if (DEBUG)
      console.log(
        "[chat]",
        user.name,
        text,
        "| avatar:",
        user.avatar ? user.avatar.slice(0, 90) : "(không có)",
      );
    handleComment(user, text);
  });
  conn.on(E.gift, (d) => {
    const g = giftOf(d);
    if (DEBUG) console.log("[gift]", JSON.stringify(d).slice(0, 300));
    if (g.streaking) return;
    handleGift(userOf(d), { ...g, coins: g.diamonds * g.count });
  });
  conn.on(E.like, (d) =>
    handleLike(userOf(d), Number(d.likeCount || 1), d.totalLikeCount),
  );
  conn.on(E.member, (d) => recordStudentAttendance(userOf(d)));
  conn.on(EV.ROOM_USER || "roomUser", (d) => {
    if (Number.isFinite(d?.viewerCount)) liveViewers = d.viewerCount;
  });
  conn.on(E.follow, (d) => {
    const user = userOf(d);
    recordStudentAttendance(user);
    const s = classroom.students.get(user.id);
    s.attendanceStars = (s.attendanceStars || 0) + 1;
    broadcast({ type: "follow", user: { id: user.id, name: user.name } });
    broadcastAttendanceBoard();
  });
  conn.on(E.share, (d) => handleShare(userOf(d)));
  conn.on(E.streamEnd, () => {
    setTikTokStatus({ status: "ended", error: "Buổi live đã kết thúc" });
    scheduleRetry();
  });
  conn.on(E.disconnected, () => {
    if (wantConnected) {
      setTikTokStatus({ status: "disconnected" });
      scheduleRetry();
    }
  });
  conn.on(E.error, (e) =>
    console.warn("[tiktok] error event", e?.message || e),
  );

  try {
    const st = await conn.connect();
    setTikTokStatus({
      status: "connected",
      roomId: st?.roomId || null,
      error: null,
    });
  } catch (err) {
    setTikTokStatus({
      status: "error",
      error: (err?.message || String(err)).slice(0, 200),
    });
    scheduleRetry();
  }
}
function scheduleRetry() {
  if (!wantConnected) return;
  clearTimeout(retryTimer);
  retryTimer = setTimeout(
    () => wantConnected && connectTikTok(tiktokState.username),
    20000,
  );
}
async function disconnectTikTok(manual = true) {
  if (manual) wantConnected = false;
  clearTimeout(retryTimer);
  if (conn) {
    try {
      conn.removeAllListeners?.();
      await conn.disconnect();
    } catch {}
    conn = null;
  }
  if (manual) setTikTokStatus({ status: "idle", roomId: null, error: null });
}

// ---- REST API ----
const stateOut = () => ({
  tiktok: tiktokState,
  game: snapshot(),
  stats: {
    students: classroom.students.size,
    seats: SEATS,
    seated: seatOwner.filter(Boolean).length,
    likes: classroom.totalLikes,
    gifts: classroom.totalGifts,
  },
  packs: packList(),
  topics: topicList(game.settings.pack),
  bank: BANK_SIZE,
  levels: LEVELS,
});
app.get("/api/state", (_req, res) => res.json({ ok: true, ...stateOut() }));

// ---- Quản lý Bộ đề CSV (Import / Export / Mẫu) ----
app.get("/api/packs", (_req, res) => {
  res.json({
    ok: true,
    packs: packList(),
    activePack: game.settings.pack,
    topics: topicList(game.settings.pack),
  });
});

app.get("/api/packs/sample.csv", (_req, res) => {
  const samplePath = path.join(__dirname, "public", "mau-cau-hoi.csv");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="mau-cau-hoi-pess-po.csv"',
  );
  if (fs.existsSync(samplePath)) {
    const raw = fs.readFileSync(samplePath, "utf8");
    res.send(raw.startsWith("\uFEFF") ? raw : "\uFEFF" + raw);
  } else {
    res.send(exportPackToCsv("ngay5"));
  }
});

app.get("/api/packs/export", (req, res) => {
  const packId = String(req.query.pack || game.settings.pack || "ngay5");
  if (!hasPack(packId)) {
    return res.status(404).json({ ok: false, error: "Không tìm thấy bộ đề." });
  }
  const csv = exportPackToCsv(packId);
  const safeFile = packId.replace(/[^a-zA-Z0-9_-]/g, "_");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="bo-de-${safeFile}.csv"`,
  );
  res.send(csv);
});

app.post("/api/packs/import", (req, res) => {
  try {
    const { name, csvText, activate = true } = req.body || {};
    if (!csvText || !String(csvText).trim()) {
      return res
        .status(400)
        .json({ ok: false, error: "Nội dung file CSV trống." });
    }
    const saved = saveCustomPack({ name, csvText });
    if (activate) {
      game.settings.pack = saved.id;
      game.settings.topic = "all";
    }
    broadcast({
      type: "setting",
      settings: game.settings,
      packs: packList(),
      topics: topicList(game.settings.pack),
    });
    res.json({
      ok: true,
      pack: saved,
      packs: packList(),
      settings: game.settings,
      topics: topicList(game.settings.pack),
    });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message || "Lỗi đọc file CSV" });
  }
});

app.delete("/api/packs/:id", (req, res) => {
  const packId = req.params.id;
  if (!packId.startsWith("csv_")) {
    return res
      .status(400)
      .json({ ok: false, error: "Chỉ có thể xoá bộ đề CSV tự thêm." });
  }
  const ok = deleteCustomPack(packId);
  if (!ok) {
    return res
      .status(404)
      .json({ ok: false, error: "Không tìm thấy bộ đề CSV cần xoá." });
  }
  if (game.settings.pack === packId) {
    game.settings.pack = "ngay5";
    game.settings.topic = "all";
  }
  broadcast({
    type: "setting",
    settings: game.settings,
    packs: packList(),
    topics: topicList(game.settings.pack),
  });
  res.json({
    ok: true,
    packs: packList(),
    settings: game.settings,
    topics: topicList(game.settings.pack),
  });
});
// Hall of Fame – Top 1-2-3 Học sinh & Đại gia Donate mọi buổi học
app.get("/api/hall-of-fame", (_req, res) =>
  res.json({
    ok: true,
    allTime: getAllTimeBoard(20),
    donors: getAllTimeDonors(20),
    sessions: getRecentSessions(10),
  }),
);
// Test: giả lập user VIP quay lại (dùng khi debug)
app.get("/api/hall-of-fame/check/:uniqueId", (req, res) => {
  const result = checkReturner(req.params.uniqueId, req.query.name || "Test User");
  res.json({ ok: true, result });
});
// Giọng đọc: /tts?l=vi|en&t=câu cần đọc  -> file WAV
app.get("/tts", async (req, res) => {
  const text = String(req.query.t || "");
  if (!text.trim()) return res.status(400).end();
  try {
    const file = await ttsFile(
      req.query.l === "en" ? "en" : "vi",
      text,
      req.query.r,
    );
    res.set("Cache-Control", "public, max-age=86400");
    res.type(file.endsWith(".mp3") ? "audio/mpeg" : "audio/wav").sendFile(file);
  } catch (e) {
    console.warn("[tts]", e.message);
    res.status(500).end();
  }
});
// Trang lớp học báo đã đọc xong kết quả → sang câu mới ngay (chỉ nhận đúng câu đang ở màn kết quả)
app.post("/api/result-done", (req, res) => {
  const n = Number(req.body?.number);
  if (game.phase === "result" && n === game.number && !game.paused)
    startRound();
  res.json({ ok: true });
});
app.post("/api/connect", (req, res) => {
  connectTikTok(req.body?.username || tiktokState.username);
  res.json({ ok: true });
});
app.post("/api/disconnect", async (_req, res) => {
  await disconnectTikTok(true);
  res.json({ ok: true });
});

app.post("/api/control", (req, res) => {
  const { action, value } = req.body || {};
  if (action === "wait") {
    const at = parseStartTime(value);
    if (!at)
      return res.status(400).json({ ok: false, error: "Giờ không hợp lệ" });
    startWaiting(at);
  } else if (action === "wait_now") {
    if (game.phase === "waiting") goLive();
  } else if (action === "skip") {
    if (game.phase === "waiting") goLive();
    else skipRound();
  } else if (action === "pause") {
    clearTimers();
    game.paused = true;
    game.phase = "paused";
    broadcast({ type: "setting", paused: true });
    broadcast({ type: "paused" });
  } else if (action === "restart") {
    // Bắt đầu lại từ câu 1: quên các câu đã ra, xoá điểm/chuỗi/hàng đứng (ghế ngồi giữ nguyên)
    clearTimers();
    resetDecks();
    game.rareGiven.clear();
    game.classStreak = 0;
    game.classBest = 0;
    game.leaderId = null;
    game.leaderRounds = 0;
    game.number = 0;
    game.q = null;
    game.pub = null;
    game.lastResult = null;
    game.golden = false;
    game.answers.clear();
    for (const s of classroom.students.values()) {
      s.score = 0;
      s.correct = 0;
      s.streak = 0;
      s.mcqRun = 0;
      s.trRun = 0;
      s.fillRun = 0;
      s.recov = 0;
      s.hadWrong = false;
      s.slowRun = 0;
      s.standStreak = 0;
      s.wrongRun = 0;
      s.trWrong = 0;
      s.nick = null;
      s.pendingStand = false;
      s.pendingReturn = false;
      s.standing = false;
    }
    fillSeats();
    broadcast({ type: "board", board: [] });
    scheduleRoster();
    game.paused = false;
    startRound();
  } else if (action === "listening") {
    // Tạm dừng bài tập, phát video luyện nghe (1 người nói, ~1 phút) full bảng
    clearTimers();
    game.paused = true;
    game.listening = true;
    game.phase = "paused";
    const ep = value?.episode || "Espisode1";
    const dir = path.join(__dirname, "video-skill-listening", ep);
    const f = fs.existsSync(dir) ? fs.readdirSync(dir).find((x) => x.endsWith(".mp4")) : null;
    if (!f) return res.status(404).json({ ok: false, error: "Không thấy video listening" });
    let title = "";
    try { title = fs.readFileSync(path.join(dir, "ytb.md"), "utf8").replace(/^Tên video\s*/i, "").trim(); } catch {}
    broadcast({ type: "listening", url: `/skill-listening/${encodeURIComponent(ep)}/${encodeURIComponent(f)}`, title });
  } else if (action === "listening_done") {
    if (game.listening) {
      game.listening = false;
      game.paused = false;
      broadcast({ type: "listening_end" });
      game.timer = setTimeout(startRound, 3000);
    }
  } else if (action === "hearts") broadcast({ type: "hearts" });
  else if (action === "speak") {
    const text = String(value?.text || "").trim().slice(0, 500);
    if (!text) return res.status(400).json({ ok: false, error: "Lời đọc đang trống" });
    const speaker = value?.speaker === "mi" ? "mi" : "bop";
    broadcast({ type: "custom_speech", text, speaker });
  }
  else if (action === "follow_cta") broadcast({ type: "follow_cta" });
  else if (action === "promo") broadcast({ type: "promo", text: PROMO_TEXT });
  else if (action === "end") {
    clearTimers();
    game.paused = true;
    game.phase = "ended";
    const finalBoard = getBoard();
    const finalDonors = getDonors();

    // ---- Lưu vào vip-history khi bấm kết thúc bài học ----
    // 1. Học sinh giỏi: CHỈ LẤY TOP 1, 2, 3
    const top3 = finalBoard.slice(0, 3).map((s) => ({
      ...s,
      uniqueId: classroom.students.get(s.id)?.uniqueId || s.id,
      correct: classroom.students.get(s.id)?.correct || 0,
      streak: classroom.students.get(s.id)?.streak || 0,
    }));

    // 2. Người nạp tiền: THÊM HẾT TẤT CẢ những ai đã nạp tiền (coins > 0)
    const allDonors = [...classroom.students.values()]
      .filter((s) => (s.coins || 0) > 0)
      .sort((a, b) => (b.coins || 0) - (a.coins || 0) || (a.joinedAt || 0) - (b.joinedAt || 0))
      .map((s, i) => ({
        rank: i + 1,
        id: s.id,
        uniqueId: s.uniqueId || s.id,
        name: s.name,
        avatar: s.avatar,
        coins: s.coins || 0,
      }));

    if (top3.length > 0 || allDonors.length > 0) saveSession(top3, allDonors);

    broadcast({
      type: "ended",
      board: finalBoard,
      donors: finalDonors,
      stats: {
        students: classroom.students.size,
        likes: classroom.totalLikes,
        gifts: classroom.totalGifts,
        coins: classroom.totalCoins,
      },
    });

    // Dọn danh sách học sinh buổi cũ để sẵn sàng chào đón buổi học mới
    classroom.students.clear();
    seatOwner.fill(null);
    classroom.totalGifts = 0;
    classroom.totalCoins = 0;
    classroom.totalLikes = 0;
    scheduleRoster();
  } else if (action === "play") {
    game.paused = false;
    broadcast({ type: "setting", paused: false });
    if (game.phase === "waiting") goLive();
    else if (game.phase === "idle" || game.phase === "paused" || game.phase === "ended") startRound();
  } else if (action === "settings" && value) {
    const st = game.settings;
    if (hasPack(value.pack) && value.pack !== st.pack) {
      st.pack = value.pack;
      st.topic = "all";
    }
    if (["mix", "mcq", "fill", "translate"].includes(value.mode))
      st.mode = value.mode;
    // Chủ đề phải thuộc bộ bài đang chọn; không thì về "tất cả" (tránh lọc ra rỗng rồi tự rơi về bộ cũ)
    if (value.topic === "all" || topicList(st.pack).some((x) => x.id === value.topic))
      st.topic = value.topic;
    else st.topic = "all";
    if (typeof value.voice === "boolean") st.voice = value.voice;
    for (const k of ["mcqMs", "fillMs", "resultMs"])
      if (Number(value[k]) >= 5000 && Number(value[k]) <= 90000)
        st[k] = Number(value[k]);
    broadcast({
      type: "setting",
      settings: st,
      packs: packList(),
      topics: topicList(st.pack),
    });
  } else if (action === "reset_scores") {
    for (const s of classroom.students.values()) {
      s.score = 0;
      s.correct = 0;
      s.streak = 0;
      s.mcqRun = 0;
      s.trRun = 0;
      s.fillRun = 0;
      s.recov = 0;
      s.hadWrong = false;
      s.slowRun = 0;
      s.standStreak = 0;
      s.wrongRun = 0;
      s.trWrong = 0;
      s.nick = null;
    }
    broadcast({ type: "board", board: [] });
    scheduleRoster();
  } else if (action === "reset_attendance") {
    classroom.students.clear();
    seatOwner.fill(null);
    classroom.totalGifts = 0;
    classroom.totalCoins = 0;
    game.goldenQueue = 0;
    classroom.totalLikes = 0;
    bots.on = false;
    broadcast({ type: "attendance_reset" });
  } else if (action === "reset_all") {
    clearTimers();
    resetDecks();
    game.rareGiven.clear();
    game.classStreak = 0;
    game.classBest = 0;
    game.leaderId = null;
    game.leaderRounds = 0;
    game.number = 0;
    game.q = null;
    game.pub = null;
    game.lastResult = null;
    game.golden = false;
    game.goldenQueue = 0;
    game.answers.clear();
    game.listening = false;
    game.paused = false;
    classroom.students.clear();
    seatOwner.fill(null);
    classroom.totalGifts = 0;
    classroom.totalCoins = 0;
    classroom.totalLikes = 0;
    bots.on = false;
    broadcast({ type: "attendance_reset" });
    broadcast({ type: "board", board: [] });
    scheduleRoster();
    startRound();
  }
  res.json({ ok: true, game: snapshot() });
  if (action === "end") {
    // Đợi response kết thúc để giao diện nhận được trạng thái buổi live cuối cùng.
    setTimeout(() => shutdownServer(), 1500).unref();
  }
});

// Giả lập sự kiện để kiểm tra khi chưa live
app.post("/api/sim", (req, res) => {
  const b = req.body || {};
  const name =
    b.name ||
    BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)] +
      " " +
      Math.floor(Math.random() * 900 + 100);
  const user = {
    id: "sim_" + name,
    uniqueId: name,
    name,
    avatar: b.avatar || "",
  };
  if (b.type === "chat") handleComment(user, b.text ?? "chào Pess và Po");
  else if (b.type === "answer") handleComment(user, b.text ?? "A");
  else if (b.type === "gift") {
    const coins = Number(b.coins || 1);
    handleGift(user, {
      giftId: 1,
      giftName:
        b.giftName ||
        (coins >= 1500
          ? "Vương miện 👑"
          : coins >= 500
            ? "Cúp thủ khoa 🏆"
            : coins >= 200
              ? "Hộp quà sách 📚"
              : coins >= 50
                ? "Bó hoa 💐"
                : coins >= 10
                  ? "Bông hồng điểm 10 🌹"
                  : "Hoa nhỏ 🌸"),
      diamonds: coins,
      count: 1,
      coins,
    });
  } else if (b.type === "like") handleLike(user, Number(b.count || 15));
  else if (b.type === "follow") {
    recordStudentAttendance(user);
    const s = classroom.students.get(user.id);
    s.attendanceStars = (s.attendanceStars || 0) + 1;
    broadcast({ type: "follow", user: { id: user.id, name: user.name } });
    broadcastAttendanceBoard();
  } else if (b.type === "share") handleShare(user);
  else if (b.type === "join") recordStudentAttendance(user);
  else if (b.type === "crowd") spawnBots(Math.min(Number(b.n || 20), 400));
  else if (b.type === "bots_off") {
    bots.on = false;
    pruneStudents();
  }
  res.json({ ok: true });
});

// Khi client WebSocket kết nối: gửi trạng thái ban đầu
wss.on("connection", (ws) => {
  ws.isAlive = true;
  ws.on("pong", () => {
    ws.isAlive = true;
  });
  ws.send(
    JSON.stringify({
      type: "init",
      tiktok: tiktokState,
      game: snapshot(),
      stats: {
        totalLikes: classroom.totalLikes,
        totalGifts: classroom.totalGifts,
        totalCoins: classroom.totalCoins,
      },
      goals: GIFT_GOALS,
      roster: getRoster(),
      board: getBoard(),
      attendanceBoard: getAttendanceBoard(),
      levels: LEVELS,
      packs: packList(),
      topics: topicList(game.settings.pack),
    }),
  );
});

// Heartbeat định kỳ 30s để phát hiện và dọn zombie connection khi trình duyệt/OBS ngắt kết nối
const wsHeartbeatTimer = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.isAlive === false) {
      ws.terminate();
      continue;
    }
    ws.isAlive = false;
    ws.ping();
  }
}, 30000);

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  🎓 LỚP HỌC TIẾNG ANH A1 CỦA PESS & PO - TIKTOK LIVE`);
  console.log(`======================================================`);
  console.log(
    `  Màn hình lớp học (TikTok LIVE Studio / OBS): http://localhost:${PORT}/?clean=1`,
  );
  console.log(
    `  Màn hình lớp học (Xem trên Web):             http://localhost:${PORT}/`,
  );
  console.log(
    `  Bảng điều khiển cho Streamer:                 http://localhost:${PORT}/control.html`,
  );
  console.log(
    `  Giọng đọc: lệnh say của macOS (Linh tiếng Việt, Samantha tiếng Anh); tắt bằng nút ở control.html hoặc ?voice=0`,
  );
  console.log(
    `  Bộ bài: Ngày 1 (100 bài mới, có dịch câu) · ngân hàng cũ: ${BANK_SIZE.mcq} câu chọn đáp án, ${BANK_SIZE.fill} câu điền từ · ${SEATS} ghế`,
  );
  console.log(`======================================================\n`);
  if (tiktokState.username) connectTikTok(tiktokState.username);
  // Không tự chạy vòng chơi khi khởi động server. Bắt đầu bằng nút Tiếp Tục
  // trong control.html hoặc đặt lịch ở Màn Hình Chờ.
});

async function shutdownServer() {
  clearTimers();
  clearInterval(pruneTimer);
  clearInterval(wsHeartbeatTimer);
  await disconnectTikTok(true);

  for (const client of wss.clients) client.terminate();
  wss.close();

  const forceExit = setTimeout(() => process.exit(0), 5000);
  forceExit.unref();
  server.close(() => process.exit(0));
}
