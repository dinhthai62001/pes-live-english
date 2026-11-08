// vip-history/hallOfFame.js
// Lưu Top 1-2-3 Học bá & TOÀN BỘ học sinh nạp tiền (Donate) khi kết thúc buổi học.
// Khi user đó (học bá hoặc người donate) quay lại live → phát hiện danh hiệu, chào mừng 1 lần rồi XOÁ KHỎI DATA để không bị đọc lại.
//
// Dữ liệu ghi vào: vip-history/data.json
// API sử dụng:
//   saveSession(top3Array, allDonorsArray) → ghi kết quả khi bấm kết thúc bài học
//   checkAndConsumeReturner(user)         → chào 1 lần và xoá khỏi data.json ngay lập tức

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data.json');

// RAM cache để chống gọi trùng lặp trong cùng phiên chạy (giới hạn tối đa 500 mục)
const greetedCache = new Set();
function addGreeted(key) {
  if (!key) return;
  if (greetedCache.size > 500) {
    const first = greetedCache.values().next().value;
    greetedCache.delete(first);
  }
  greetedCache.add(key);
}

// Chuẩn hoá chuỗi để so khớp linh hoạt không lo lệch hoa thường, khoảng trắng
function norm(str) {
  return String(str || '').trim().toLowerCase();
}

// ---- Helpers đọc/ghi file với In-Memory Cache ----
let inMemoryData = null;

function loadData(forceReload = false) {
  if (inMemoryData && !forceReload) return inMemoryData;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      if (!parsed.sessions) parsed.sessions = [];
      if (!parsed.allTime) parsed.allTime = {};
      inMemoryData = parsed;
      return inMemoryData;
    }
  } catch (e) {
    console.warn('[vip-history] Không đọc được data.json:', e.message);
  }
  inMemoryData = { sessions: [], allTime: {} };
  return inMemoryData;
}

function saveData(data) {
  inMemoryData = data;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.warn('[vip-history] Không ghi được data.json:', e.message);
  }
}

// Cấp bậc danh hiệu đại gia theo tổng số xu tích luỹ
export function getDonorRoleTitle(totalCoins = 0) {
  if (totalCoins >= 3000) return 'Tỷ phú bảo trợ kim cương 👑💎';
  if (totalCoins >= 1500) return 'Tỷ phú của lớp 💎';
  if (totalCoins >= 500) return 'Đại gia xế hộp 🚗';
  if (totalCoins >= 200) return 'Đại gia phố vàng 💵';
  if (totalCoins >= 50) return 'Mạnh thường quân nhí 🪙';
  if (totalCoins >= 10) return 'Đại gia tập sự 🌱';
  return 'Mạnh thường quân hảo tâm 💖';
}

// ---- Lưu kết quả khi BẤM KẾT THÚC BÀI HỌC ----
// top3: CHỈ LẤY TOP 1, 2, 3 học sinh giỏi nhất [{ rank, uniqueId, name, avatar, score, correct, streak }]
// allDonors: THÊM HẾT TẤT CẢ các bạn đã nạp tiền [{ rank, uniqueId, name, avatar, coins }]
export function saveSession(top3 = [], allDonors = []) {
  const data = loadData();
  const now = new Date();
  const sessionId = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);

  // 1. Chỉ lấy đúng Top 1, 2, 3 điểm cao nhất
  const cleanTop3 = (top3 || []).slice(0, 3).map((s, i) => ({
    rank: i + 1,
    uniqueId: String(s.uniqueId || s.id || s.name || ''),
    name: String(s.name || 'Ẩn danh'),
    avatar: s.avatar || '',
    score: s.score || 0,
    correct: s.correct || 0,
    streak: s.streak || 0,
  }));

  // 2. Thêm HẾT tất cả các bạn nạp tiền (coins > 0)
  const cleanDonors = (allDonors || [])
    .filter((s) => (s.coins || 0) > 0)
    .map((s, i) => ({
      rank: s.rank || i + 1,
      uniqueId: String(s.uniqueId || s.id || s.name || ''),
      name: String(s.name || 'Ẩn danh'),
      avatar: s.avatar || '',
      coins: s.coins || 0,
    }));

  const session = {
    sessionId,
    date: now.toLocaleDateString('vi-VN'),
    dateISO: now.toISOString(),
    top3: cleanTop3,
    topDonors: cleanDonors,
  };

  data.sessions.unshift(session);
  if (data.sessions.length > 100) data.sessions = data.sessions.slice(0, 100);

  // Cập nhật Top 1-2-3 học sinh vào allTime
  for (const entry of cleanTop3) {
    if (!entry.uniqueId) continue;
    const rec = data.allTime[entry.uniqueId] || initUserRecord(entry.name, entry.avatar);
    rec.name = entry.name;
    if (entry.avatar) rec.avatar = entry.avatar;
    if (!rec.wins) rec.wins = { rank1: 0, rank2: 0, rank3: 0 };
    rec.wins[`rank${entry.rank}`] = (rec.wins[`rank${entry.rank}`] || 0) + 1;
    rec.totalScore = (rec.totalScore || 0) + entry.score;
    rec.totalSessions = (rec.totalSessions || 0) + 1;
    rec.bestScore = Math.max(rec.bestScore || 0, entry.score);
    rec.lastSession = sessionId;
    rec.lastRank = entry.rank;
    data.allTime[entry.uniqueId] = rec;
    // Xoá cache để cho phép chào lại nếu vừa đạt thành tích mới
    greetedCache.delete(norm(entry.uniqueId));
    greetedCache.delete(norm(entry.name));
  }

  // Cập nhật TẤT CẢ người nạp tiền vào allTime
  for (const entry of cleanDonors) {
    if (!entry.uniqueId) continue;
    const rec = data.allTime[entry.uniqueId] || initUserRecord(entry.name, entry.avatar);
    rec.name = entry.name;
    if (entry.avatar) rec.avatar = entry.avatar;
    if (!rec.donorWins) rec.donorWins = { rank1: 0, rank2: 0, rank3: 0 };
    if (entry.rank <= 3) {
      rec.donorWins[`rank${entry.rank}`] = (rec.donorWins[`rank${entry.rank}`] || 0) + 1;
    }
    rec.donorSessions = (rec.donorSessions || 0) + 1;
    rec.bestSessionCoins = Math.max(rec.bestSessionCoins || 0, entry.coins);
    rec.lastDonorSession = sessionId;
    rec.lastDonorRank = entry.rank;
    rec.lastDonorCoins = entry.coins;
    rec.totalCoins = (rec.totalCoins || 0) + entry.coins;
    rec.donorRole = getDonorRoleTitle(rec.totalCoins || 0);
    data.allTime[entry.uniqueId] = rec;
    // Xoá cache để cho phép chào lại nếu vừa nạp tiền ở buổi kết thúc này
    greetedCache.delete(norm(entry.uniqueId));
    greetedCache.delete(norm(entry.name));
  }

  saveData(data);
  console.log(
    `[vip-history] Kết thúc bài học! Đã lưu buổi ${sessionId}: Học bá Top 3 [${cleanTop3.map((x) => `#${x.rank} ${x.name}(${x.score}đ)`).join(', ')}] | Đại gia nạp tiền (${cleanDonors.length} bạn): [${cleanDonors.map((x) => `#${x.rank} ${x.name}(${x.coins}xu)`).join(', ')}]`,
  );
  return session;
}

function initUserRecord(name = '', avatar = '') {
  return {
    name,
    avatar,
    wins: { rank1: 0, rank2: 0, rank3: 0 },
    totalScore: 0,
    totalSessions: 0,
    bestScore: 0,
    lastSession: null,
    lastRank: null,
    totalCoins: 0,
    donorWins: { rank1: 0, rank2: 0, rank3: 0 },
    bestSessionCoins: 0,
    donorSessions: 0,
    lastDonorSession: null,
    lastDonorRank: null,
    lastDonorCoins: 0,
    donorRole: 'Mạnh thường quân hảo tâm 💖',
  };
}

// ---- Tìm kiếm VIP trong data.json linh hoạt theo uniqueId, id, hoặc name ----
function findVipEntry(data, userTarget) {
  const targetUid = typeof userTarget === 'object' ? String(userTarget.uniqueId || userTarget.id || '') : String(userTarget || '');
  const targetId = typeof userTarget === 'object' ? String(userTarget.id || '') : '';
  const targetName = typeof userTarget === 'object' ? String(userTarget.name || '') : '';

  const nTargetUid = norm(targetUid);
  const nTargetId = norm(targetId);
  const nTargetName = norm(targetName);

  // 1. Tìm trong allTime
  let matchedKey = null;
  let rec = null;

  for (const [key, val] of Object.entries(data.allTime || {})) {
    const nKey = norm(key);
    const nValName = norm(val.name);

    if (
      (nTargetUid && nKey === nTargetUid) ||
      (nTargetId && nKey === nTargetId) ||
      (nTargetName && (nKey === nTargetName || nValName === nTargetName)) ||
      (nTargetUid && nValName === nTargetUid)
    ) {
      matchedKey = key;
      rec = val;
      break;
    }
  }

  // 2. Tìm trong sessions (nếu allTime không thấy)
  let scholarSession = null;
  let scholarEntry = null;
  let donorSession = null;
  let donorEntry = null;

  for (const sess of data.sessions || []) {
    if (!scholarEntry && sess.top3) {
      scholarEntry = sess.top3.find(
        (x) =>
          (nTargetUid && norm(x.uniqueId) === nTargetUid) ||
          (nTargetId && norm(x.uniqueId) === nTargetId) ||
          (nTargetName && (norm(x.uniqueId) === nTargetName || norm(x.name) === nTargetName)),
      );
      if (scholarEntry) scholarSession = sess;
    }

    if (!donorEntry && sess.topDonors) {
      donorEntry = sess.topDonors.find(
        (x) =>
          (nTargetUid && norm(x.uniqueId) === nTargetUid) ||
          (nTargetId && norm(x.uniqueId) === nTargetId) ||
          (nTargetName && (norm(x.uniqueId) === nTargetName || norm(x.name) === nTargetName)),
      );
      if (donorEntry) donorSession = sess;
    }
  }

  if (!rec && !scholarEntry && !donorEntry) return null;

  return {
    matchedKey,
    rec: rec || {
      name: targetName || donorEntry?.name || scholarEntry?.name || 'Ẩn danh',
      avatar: donorEntry?.avatar || scholarEntry?.avatar || '',
      wins: { rank1: 0, rank2: 0, rank3: 0 },
      totalScore: scholarEntry?.score || 0,
      totalCoins: donorEntry?.coins || 0,
      donorWins: { rank1: 0, rank2: 0, rank3: 0 },
      bestScore: scholarEntry?.score || 0,
      donorRole: getDonorRoleTitle(donorEntry?.coins || 0),
    },
    scholarSession,
    scholarEntry,
    donorSession,
    donorEntry,
  };
}

// ---- Kiểm tra thông tin VIP ----
export function checkReturner(userTarget, optionalName = '') {
  if (!userTarget) return null;
  const user = typeof userTarget === 'object' ? userTarget : { uniqueId: userTarget, name: optionalName || userTarget };
  const data = loadData();

  const found = findVipEntry(data, user);
  if (!found) return null;

  const { rec, scholarSession, scholarEntry, donorSession, donorEntry } = found;

  const scholarWins = rec.wins || { rank1: 0, rank2: 0, rank3: 0 };
  const totalScholarWins = (scholarWins.rank1 || 0) + (scholarWins.rank2 || 0) + (scholarWins.rank3 || 0);

  const donorWins = rec.donorWins || { rank1: 0, rank2: 0, rank3: 0 };
  const totalDonorWins = (donorWins.rank1 || 0) + (donorWins.rank2 || 0) + (donorWins.rank3 || 0);
  const totalCoins = rec.totalCoins || donorEntry?.coins || 0;

  // Điều kiện để được coi là VIP:
  // 1. Từng lọt top 3 điểm học tập
  // 2. Hoặc từng nạp tiền (có trong topDonors hoặc totalCoins > 0)
  const isScholar = totalScholarWins > 0 || Boolean(scholarEntry);
  const isDonor = totalCoins > 0 || Boolean(donorEntry);

  if (!isScholar && !isDonor) return null;

  let vipType = 'scholar';
  if (isScholar && isDonor) vipType = 'combo';
  else if (isDonor) vipType = 'donor';

  const greeting = pickComprehensiveGreeting({
    name: user.name || rec.name,
    vipType,
    scholarRank: scholarEntry?.rank || rec.lastRank || null,
    scholarScore: scholarEntry?.score || 0,
    scholarDate: scholarSession?.date || '',
    scholarWins,
    totalScholarWins,
    bestScore: rec.bestScore || 0,
    donorRank: donorEntry?.rank || rec.lastDonorRank || null,
    donorCoins: donorEntry?.coins || rec.lastDonorCoins || totalCoins || 0,
    donorDate: donorSession?.date || '',
    donorWins,
    totalDonorWins,
    totalCoins,
    bestSessionCoins: rec.bestSessionCoins || totalCoins || 0,
    donorRole: rec.donorRole || getDonorRoleTitle(totalCoins),
  });

  return {
    isVip: true,
    vipType,
    uniqueId: user.uniqueId || found.matchedKey || user.id || '',
    name: user.name || rec.name,
    scholarRank: scholarEntry?.rank || rec.lastRank || null,
    scholarScore: scholarEntry?.score || 0,
    scholarDate: scholarSession?.date || '',
    wins: scholarWins,
    totalWins: totalScholarWins,
    bestScore: rec.bestScore || 0,
    donorRank: donorEntry?.rank || rec.lastDonorRank || null,
    donorCoins: donorEntry?.coins || rec.lastDonorCoins || totalCoins || 0,
    donorDate: donorSession?.date || '',
    donorWins,
    totalDonorWins,
    totalCoins,
    bestSessionCoins: rec.bestSessionCoins || totalCoins || 0,
    donorRole: rec.donorRole || getDonorRoleTitle(totalCoins),
    ...greeting,
  };
}

// ---- Kiểm tra và XOÁ KHỎI DATA ngay sau khi chào (Chỉ đọc 1 lần duy nhất cho cả Học sinh & Người Donate) ----
export function checkAndConsumeReturner(userTarget, optionalName = '') {
  if (!userTarget) return null;
  const user = typeof userTarget === 'object' ? userTarget : { uniqueId: userTarget, name: optionalName || userTarget };

  const checkKey1 = norm(user.uniqueId || user.id);
  const checkKey2 = norm(user.name);

  // Đã từng chào trong phiên live này -> không chào lại
  if ((checkKey1 && greetedCache.has(checkKey1)) || (checkKey2 && greetedCache.has(checkKey2))) {
    return null;
  }

  const data = loadData();
  const found = findVipEntry(data, user);
  if (!found) return null;

  const returner = checkReturner(user);
  if (!returner) return null;

  // Đánh dấu vào RAM cache ngay lập tức
  if (checkKey1) addGreeted(checkKey1);
  if (checkKey2) addGreeted(checkKey2);
  if (found.matchedKey) addGreeted(norm(found.matchedKey));
  if (returner.name) addGreeted(norm(returner.name));

  // XOÁ TRIỆT ĐỂ KHỎI DATA.JSON ĐỂ KHÔNG BAO GIỜ BỊ ĐỌC LẠI NỮA
  try {
    const keysToRemove = new Set([
      norm(user.uniqueId),
      norm(user.id),
      norm(user.name),
      norm(found.matchedKey),
      norm(returner.name),
      norm(returner.uniqueId),
    ].filter(Boolean));

    // 1. Xoá khỏi allTime
    for (const key of Object.keys(data.allTime || {})) {
      const rec = data.allTime[key];
      if (keysToRemove.has(norm(key)) || (rec && keysToRemove.has(norm(rec.name)))) {
        delete data.allTime[key];
      }
    }

    // 2. Lọc bỏ khỏi top3 và topDonors trong toàn bộ các buổi học
    for (const sess of data.sessions || []) {
      if (sess.top3) {
        sess.top3 = sess.top3.filter((x) => !keysToRemove.has(norm(x.uniqueId)) && !keysToRemove.has(norm(x.name)));
      }
      if (sess.topDonors) {
        sess.topDonors = sess.topDonors.filter((x) => !keysToRemove.has(norm(x.uniqueId)) && !keysToRemove.has(norm(x.name)));
      }
    }

    // Loại bỏ buổi học nếu cả 2 danh sách đều rỗng
    data.sessions = (data.sessions || []).filter(
      (s) => (s.top3 && s.top3.length > 0) || (s.topDonors && s.topDonors.length > 0),
    );

    saveData(data);
    console.log(
      `[vip-history] ✅ Đã chào [${returner.vipType.toUpperCase()}] ${returner.name} và XOÁ VĨNH VIỄN khỏi data.json. Sẽ không bị đọc lại khi vào lại!`,
    );
  } catch (err) {
    console.warn(`[vip-history] Lỗi khi xoá user khỏi data:`, err.message);
  }

  return returner;
}

// ---- Lấy bảng danh dự tổng sắp ----
export function getAllTimeBoard(limit = 10) {
  const data = loadData();
  return Object.entries(data.allTime)
    .map(([uid, r]) => ({ uniqueId: uid, ...r }))
    .sort(
      (a, b) =>
        ((b.wins?.rank1 || 0) - (a.wins?.rank1 || 0)) ||
        ((b.wins?.rank2 || 0) - (a.wins?.rank2 || 0)) ||
        ((b.totalScore || 0) - (a.totalScore || 0)) ||
        ((b.totalCoins || 0) - (a.totalCoins || 0)),
    )
    .slice(0, limit);
}

// Bảng xếp hạng đại gia mọi thời đại
export function getAllTimeDonors(limit = 10) {
  const data = loadData();
  return Object.entries(data.allTime)
    .map(([uid, r]) => ({ uniqueId: uid, ...r }))
    .filter((x) => (x.totalCoins || 0) > 0)
    .sort((a, b) => (b.totalCoins || 0) - (a.totalCoins || 0))
    .slice(0, limit);
}

export function getRecentSessions(limit = 10) {
  const data = loadData();
  return data.sessions.slice(0, limit);
}

// =====================================================================
// KHO LỜI CHÀO VIP – ĐA DẠNG PHONG CÁCH
// =====================================================================

// --- 1. COMBO VỪA HỌC BÁ VỪA ĐẠI GIA (QUÝ TỘC TOÀN DIỆN) ---
const GREET_COMBO = [
  {
    badgeTitle: '👑 ĐẠI GIA HỌC BÁ TOÀN NĂNG',
    text: '🌟 Trời ơi! {name} – vừa là Quán quân tri thức vừa là Nhà tài trợ của lớp đã vào! Con nhà người ta đây rồi!',
    tts: 'Trời ơi! {name} vừa học giỏi vừa là đại gia của lớp đã vào! Pess và Po kính chào con nhà người ta!',
    effect: 'gold',
  },
  {
    badgeTitle: '💎 THỦ KHOA QUÝ TỘC',
    text: '👑 Đứng đầu bảng điểm #{scholarRank}, lại còn nạp ủng hộ lớp! {name} ngự giá, cả lớp nghiêm chào!',
    tts: 'Thủ khoa quý tộc {name} đã vào lớp! Vừa thông minh vừa hào phóng, lớp mình vỗ tay đón chào nào!',
    effect: 'gold',
  },
  {
    badgeTitle: '⚡ HUYỀN THOẠI TOÀN NĂNG',
    text: '🚀 Tiền tài và trí tuệ hội tụ tại {name}! Đã ủng hộ {totalCoins} xu và từng lên đỉnh vinh quang. Đẳng cấp quá!',
    tts: 'Huyền thoại {name} đã vào lớp! Người vừa giàu vừa học giỏi nhất lớp, chào mừng bạn!',
    effect: 'gold',
  },
  {
    badgeTitle: '🏆 BÁ CHỦ LỚP HỌC',
    text: '✨ {name} bước vào, hào quang sáng bừng cả phòng live! Vừa chuẩn bị ẵm điểm #1 vừa giữ ghế VIP!',
    tts: 'Bá chủ lớp học {name} đã vào! Hôm nay lại tiếp tục ẵm giải nhất và ngồi ghế VIP nhé!',
    effect: 'gold',
  },
];

// --- 2. ĐẠI GIA DONATE TOP 1 (CHỦ TỊCH / NHÀ TÀI TRỢ KIM CƯƠNG) ---
const GREET_DONOR_TOP1 = [
  {
    badgeTitle: '💎 NHÀ TÀI TRỢ KIM CƯƠNG',
    text: '💰 Chủ tịch {name} – Mạnh thường quân số 1 của lớp đã vào! Pess và Po xin phép trải thảm đỏ đón sếp ạ!',
    tts: 'Chủ tịch {name}, mạnh thường quân số một của lớp đã vào! Pess và Po xin phép trải thảm đỏ đón sếp!',
    effect: 'gold',
  },
  {
    badgeTitle: '👑 ĐẠI GIA BẢO TRỢ VÀNG',
    text: '🏎️ Đại gia {name} đã tới! Buổi trước ủng hộ {donorCoins} xu nuôi cả lớp! Ghế VIP số 0 to nhất lớp đã lau sẵn cho sếp!',
    tts: 'Đại gia {name} đã tới rồi! Ghế VIP số không to nhất lớp đã chuẩn bị sẵn cho sếp, mời sếp an tọa!',
    effect: 'gold',
  },
  {
    badgeTitle: '🥂 SẾP LỚN GIÁ ĐÁO',
    text: '✨ Tiếng ting ting quen thuộc vọng về! Vị cứu tinh {name} (tổng {totalCoins} xu) đã online, cả lớp vỗ tay nồng nhiệt!',
    tts: 'Vị cứu tinh {name} với tổng {totalCoins} xu ủng hộ lớp đã online! Cả lớp vỗ tay rộn ràng đón sếp!',
    effect: 'gold',
  },
  {
    badgeTitle: '🪙 TỶ PHÚ TÀI TRỢ',
    text: '💖 {name} ơi, Pess Po nhớ đại gia quá! Hôm nay vào nghe giảng giải trí thôi nha, ghế VIP luôn dành cho sếp!',
    tts: 'Đại gia {name} đã vào lớp! Hôm nay vào nghe giảng giải trí thôi nha sếp ơi, chào mừng sếp!',
    effect: 'gold',
  },
  {
    badgeTitle: '🌟 MẠNH THƯỜNG QUÂN VÔ ĐỊCH',
    text: '🎉 Xin thông báo: Nhà tài trợ độc quyền {name} đã vào phòng! Không khí tự nhiên thấy sang chảnh hẳn lên~',
    tts: 'Nhà tài trợ độc quyền {name} đã vào phòng! Không khí lớp học tự nhiên sang chảnh hẳn lên!',
    effect: 'gold',
  },
];

// --- 3. ĐẠI GIA DONATE TOP 2 - TOP 3 (PHÓ CHỦ TỊCH / ĐẠI GIA XẾ HỘP) ---
const GREET_DONOR_TOP23 = [
  {
    badgeTitle: '💵 PHÓ CHỦ TỊCH LỚP HỌC',
    text: '🌹 {name} – Top #{donorRank} Donate buổi trước ({donorCoins} xu) đã trở lại! Hàng ghế VIP giữa lớp vẫy gọi bạn!',
    tts: 'Phó chủ tịch {name}, top donate buổi trước đã trở lại! Chào mừng đại gia vào lớp!',
    effect: 'silver',
  },
  {
    badgeTitle: '🚗 ĐẠI GIA XẾ HỘP',
    text: '💎 Mạnh thường quân {name} đã vào chỗ! Po đã pha sẵn một ly trà sữa đặc biệt mời sếp ngồi học!',
    tts: 'Mạnh thường quân {name} đã vào lớp! Po đã pha sẵn trà sữa ngon mời sếp nha!',
    effect: 'silver',
  },
  {
    badgeTitle: '⭐ NHÀ BẢO TRỢ THÂN THIẾT',
    text: '✨ Chào đón {name} (tổng {totalCoins} xu)! Lớp học hôm nay lại tràn đầy năng lượng và tài lộc nhờ có bạn rồi!',
    tts: 'Chào đón {name}! Lớp học hôm nay lại tràn ngập năng lượng và tài lộc nhờ có bạn!',
    effect: 'silver',
  },
  {
    badgeTitle: '🎁 VỊ KHÁCH QUÝ TỘC',
    text: '🪙 {name} – Đại gia hảo tâm đã vào lớp! Hôm nay bạn thích ngồi ghế nào cứ chỉ tay một cái là có ngay!',
    tts: 'Đại gia {name} đã vào lớp! Hôm nay thích ngồi ghế nào là có ngay ghế đó nhé!',
    effect: 'silver',
  },
];

// --- 4. TẤT CẢ CÁC BẠN NẠP TIỀN CÒN LẠI (HẢO TÂM / CỔ VŨ) ---
const GREET_DONOR_GENERAL = [
  {
    badgeTitle: '💖 MẠNH THƯỜNG QUÂN HẢO TÂM',
    text: '🌸 {name} – Mạnh thường quân từng ủng hộ {donorCoins} xu cho lớp đã trở lại! Pess & Po cảm ơn bạn rất nhiều!',
    tts: '{name} mạnh thường quân của lớp đã vào! Pess và Po cảm ơn bạn rất nhiều!',
    effect: 'bronze',
  },
  {
    badgeTitle: '⭐ NHÀ TÀI TRỢ DỄ THƯƠNG',
    text: '✨ Chào mừng {name} (đã ủng hộ {totalCoins} xu) đã vào lớp! Lớp mình lại thêm rực rỡ rồi!',
    tts: 'Chào mừng {name} đã vào lớp! Pess và Po chúc bạn có một buổi học thật vui vẻ!',
    effect: 'bronze',
  },
  {
    badgeTitle: '🎁 BẠN TỐT CỦA LỚP',
    text: '🪙 {name} quay lại rồi! Cảm ơn tấm lòng vàng của bạn đã tiếp sức cho lớp học Pess & Po!',
    tts: 'Chào mừng {name} quay lại lớp học! Cảm ơn tấm lòng vàng của bạn nhé!',
    effect: 'bronze',
  },
];

// --- 5. HỌC BÁ TOP 1 (QUÁN QUÂN TRI THỨC) ---
const GREET_SCHOLAR_TOP1 = [
  {
    badgeTitle: '🏆 QUÁN QUÂN TRI THỨC',
    text: 'Nhà vô địch {name} đã quay lại rồi! Lần trước bạn đứng #1 với {scholarScore}đ – lớp sẵn sàng thách đấu chưa?',
    tts: 'Nhà vô địch {name} đã quay lại! Lần trước bạn đứng nhất với {scholarScore} điểm. Chào mừng bạn!',
    effect: 'gold',
  },
  {
    badgeTitle: '👑 VUA TIẾNG ANH',
    text: '🏆 {name} – quán quân buổi {scholarDate} – đã vào lớp! Cả lớp vỗ tay chào đón thủ khoa nào~',
    tts: 'Quán quân {name} đã vào lớp! Cả lớp vỗ tay chào mừng thủ khoa nào.',
    effect: 'gold',
  },
  {
    badgeTitle: '⚡ KỶ LỤC GIA',
    text: '⚡ {name} – người từng phá vỡ mọi kỷ lục với {scholarScore}đ – đã online! Hôm nay có bảo vệ ngai vàng không?',
    tts: '{name} người từng đứng nhất với {scholarScore} điểm đã online! Hôm nay bảo vệ ngai vàng nhé!',
    effect: 'gold',
  },
];

// --- 6. HỌC BÁ TOP 2 - TOP 3 ---
const GREET_SCHOLAR_TOP23 = [
  {
    badgeTitle: '🥈 Á QUÂN TRI THỨC',
    text: '🥈 {name} – Á quân buổi {scholarDate} với {scholarScore}đ – đã vào lớp! Hôm nay quyết tâm leo lên #1 chưa?',
    tts: '{name} á quân buổi trước với {scholarScore} điểm đã vào lớp! Hôm nay leo lên nhất không?',
    effect: 'silver',
  },
  {
    badgeTitle: '🥉 TOP 3 XUẤT SẮC',
    text: '🥉 {name} – Top 3 buổi {scholarDate} – đã vào lớp! Từ huy chương đồng lên vàng chỉ cách 1 bước thôi~',
    tts: '{name} top ba buổi trước đã vào lớp! Hôm nay leo cao hơn nhé!',
    effect: 'bronze',
  },
  {
    badgeTitle: '🔥 CAO THỦ TRỞ LẠI',
    text: '✨ {name} với {scholarScore}đ buổi trước đã trở lại! Pess & Po tin hôm nay bạn sẽ bứt phá ngoạn mục!',
    tts: 'Cao thủ {name} đã trở lại! Hôm nay bứt phá lên ngôi đầu nhé!',
    effect: 'silver',
  },
];

// Hàm chọn lời chào tổng hợp
function pickComprehensiveGreeting(ctx) {
  let pool;
  if (ctx.vipType === 'combo') {
    pool = GREET_COMBO;
  } else if (ctx.vipType === 'donor') {
    if (ctx.donorRank === 1 || ctx.totalCoins >= 500) {
      pool = GREET_DONOR_TOP1;
    } else if (ctx.donorRank && ctx.donorRank <= 3) {
      pool = GREET_DONOR_TOP23;
    } else {
      pool = GREET_DONOR_GENERAL;
    }
  } else {
    // scholar
    if (ctx.scholarRank === 1) {
      pool = GREET_SCHOLAR_TOP1;
    } else {
      pool = GREET_SCHOLAR_TOP23;
    }
  }

  const tmpl = pool[Math.floor(Math.random() * pool.length)];
  const fill = (s) =>
    String(s || '')
      .replace(/{name}/g, ctx.name)
      .replace(/{scholarRank}/g, ctx.scholarRank || 1)
      .replace(/{scholarScore}/g, ctx.scholarScore || 0)
      .replace(/{scholarDate}/g, ctx.scholarDate || '')
      .replace(/{totalWins}/g, ctx.totalScholarWins || 0)
      .replace(/{bestScore}/g, ctx.bestScore || 0)
      .replace(/{donorRank}/g, ctx.donorRank || 1)
      .replace(/{donorCoins}/g, ctx.donorCoins || 0)
      .replace(/{totalCoins}/g, ctx.totalCoins || 0)
      .replace(/{bestSessionCoins}/g, ctx.bestSessionCoins || 0)
      .replace(/{donorRole}/g, ctx.donorRole || '');

  return {
    badgeTitle: fill(tmpl.badgeTitle || 'KHÁCH MỜI DANH DỰ'),
    greetText: fill(tmpl.text),
    ttsText: fill(tmpl.tts),
    effect: tmpl.effect || 'gold',
  };
}
