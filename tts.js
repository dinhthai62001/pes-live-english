// Giọng đọc cho lớp học. Chọn bằng TTS_ENGINE trong .env:
//   google (mặc định): giọng Google Translate, trả về <1 giây, không cần cài gì; không chỉnh được tốc độ. Lỗi/mất mạng thì tự dùng giọng máy.
//   say: giọng máy macOS (Linh / Samantha), offline.
//   edge: giọng thần kinh Microsoft qua thư viện `edge-tts` (Python, .venv-tts, tts_edge.py), hay nhưng đôi khi trả trễ.
// (mô tả giọng edge:
//   tiếng Việt: vi-VN-HoaiMyNeural (nữ) / vi-VN-NamMinhNeural (nam), tiếng Anh: en-US-EmmaNeural...
// Mất mạng hoặc chưa cài thì tự lùi về lệnh `say` của macOS (Linh / Samantha) để buổi live không bị im.
// Mỗi câu thành một file (mp3 hoặc wav) lưu cache trong tts-cache/, trang lớp học gọi /tts?l=vi|en&t=...&r=... rồi phát.
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(ROOT, 'tts-cache');
fs.mkdirSync(DIR, { recursive: true });

// Tự động dọn dẹp cache: giữ tối đa 400 file gần nhất để tránh phình ổ cứng và RAM
const MAX_CACHE_FILES = 400;
let lastPrune = Date.now();
function pruneTtsCache() {
  const now = Date.now();
  if (now - lastPrune < 60000) return; // Chỉ kiểm tra tối đa 1 lần mỗi phút
  lastPrune = now;
  try {
    const files = fs.readdirSync(DIR);
    if (files.length <= MAX_CACHE_FILES) return;
    const stats = files
      .map((name) => {
        const p = path.join(DIR, name);
        try {
          return { name, p, mtime: fs.statSync(p).mtimeMs };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.mtime - b.mtime);

    const toDelete = stats.slice(0, stats.length - MAX_CACHE_FILES);
    for (const f of toDelete) {
      try { fs.unlinkSync(f.p); } catch {}
    }
  } catch (e) {
    console.warn('[tts] Lỗi dọn tts-cache:', e.message);
  }
}
setInterval(pruneTtsCache, 300000).unref(); // Dọn mỗi 5 phút

const EDGE_PY = process.env.EDGE_TTS_PY || path.join(ROOT, '.venv-tts', 'bin', 'python');
const EDGE_SCRIPT = path.join(ROOT, 'tts_edge.py');
const ENGINE = process.env.TTS_ENGINE || 'google';
const USE_EDGE = ENGINE === 'edge' && fs.existsSync(EDGE_PY) && fs.existsSync(EDGE_SCRIPT);
const USE_GOOGLE = ENGINE === 'google';

const VOICES = {
  vi: { edge: process.env.TTS_EDGE_VI || 'vi-VN-HoaiMyNeural', say: process.env.TTS_VOICE_VI || 'Linh', sayRate: Number(process.env.TTS_RATE_VI || 200), base: 220 },
  en: { edge: process.env.TTS_EDGE_EN || 'en-US-EmmaNeural', say: process.env.TTS_VOICE_EN || 'Samantha', sayRate: Number(process.env.TTS_RATE_EN || 160), base: 160 },
};

const inflight = new Map();
let active = 0;
const waiting = [];
const acquire = () => new Promise((res) => { if (active < 4) { active++; res(); } else waiting.push(res); });
const release = () => { const n = waiting.shift(); if (n) n(); else active--; };

// Bỏ ký tự điều khiển giọng [[...]] để người xem không "tiêm" lệnh được
const sanitize = (t) => String(t || '').replace(/\[\[|\]\]/g, ' ').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);

const run = (cmd, args, input, timeoutMs = 20000) => new Promise((resolve, reject) => {
  const p = spawn(cmd, args, { stdio: [input == null ? 'ignore' : 'pipe', 'ignore', 'pipe'] });
  let err = '';
  const tm = setTimeout(() => { p.kill('SIGKILL'); reject(new Error('timeout')); }, timeoutMs);
  p.stderr.on('data', (d) => { err += d; });
  p.on('error', (e) => { clearTimeout(tm); reject(e); });
  p.on('close', (code) => { clearTimeout(tm); code === 0 ? resolve() : reject(new Error(err.trim().slice(-200) || `${cmd} exit ${code}`)); });
  if (input != null) p.stdin.end(input);
});

// r = tốc độ yêu cầu từ trang (cùng thang với `say`: 220 vi / 160 en là bình thường)
const edgeRate = (l, r) => {
  const f = r ? r / VOICES[l].base : 1;
  const pct = Math.max(-20, Math.min(40, Math.round((f - 1) * 100) + (l === 'vi' ? 4 : 0)));
  return (pct >= 0 ? '+' : '') + pct + '%';
};

export function ttsFile(lang, text, rate) {
  const l = lang === 'en' ? 'en' : 'vi';
  const t = sanitize(text);
  if (!t) return Promise.reject(new Error('empty'));
  const v = VOICES[l];
  const r = Number(rate) >= 120 && Number(rate) <= 320 ? Math.round(Number(rate)) : 0;
  const keyBase = (eng) => path.join(DIR, `${l}-${crypto.createHash('sha1').update(`${eng}|${eng === 'edge' ? v.edge + edgeRate(l, r) : eng === 'google' ? l : v.say + (r || v.sayRate)}|${t}`).digest('hex').slice(0, 24)}`);
  const edgeFile = keyBase('edge') + '.mp3', sayFile = keyBase('say') + '.wav';
  const gFile = keyBase('google') + '.mp3';
  if (USE_GOOGLE && fs.existsSync(gFile)) return Promise.resolve(gFile);
  if (USE_EDGE && fs.existsSync(edgeFile)) return Promise.resolve(edgeFile);
  if (!USE_EDGE && fs.existsSync(sayFile) && !USE_GOOGLE) return Promise.resolve(sayFile);
  const jobKey = USE_GOOGLE ? gFile : USE_EDGE ? edgeFile : sayFile;
  if (inflight.has(jobKey)) return inflight.get(jobKey);
  const sayJob = async () => {
    if (fs.existsSync(sayFile)) return sayFile;
    const tmp = sayFile + '.tmp.wav';
    await run('say', ['-v', v.say, '-r', String(Math.min(r || v.sayRate, l === 'vi' ? 235 : 190)), '-o', tmp, '--data-format=LEI16@44100'], t);
    fs.renameSync(tmp, sayFile);
    return sayFile;
  };
  const googleFile = keyBase('google') + '.mp3';
  const googleJob = async () => {
    // Google Translate giới hạn ~200 ký tự mỗi lần: tách theo dấu câu rồi nối các đoạn mp3
    const parts = t.match(/[^.!?,;:]+[.!?,;:]*/g)?.reduce((a, p) => { const last = a[a.length - 1]; if (last && (last + p).length <= 180) a[a.length - 1] = last + p; else a.push(p); return a; }, []) || [t];
    const bufs = [];
    for (const p of parts) {
      const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 6000);
      try {
        const res = await fetch(`https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${l}&q=${encodeURIComponent(p.trim())}`, { signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!res.ok) throw new Error('google ' + res.status);
        bufs.push(Buffer.from(await res.arrayBuffer()));
      } finally { clearTimeout(tm); }
    }
    const all = Buffer.concat(bufs);
    if (all.length < 500) throw new Error('empty audio');
    fs.writeFileSync(googleFile + '.tmp', all); fs.renameSync(googleFile + '.tmp', googleFile);
    return googleFile;
  };
  const edgeJob = async () => {
    await acquire();
    try {
      const tmp = edgeFile + '.tmp.mp3';
      await run(EDGE_PY, [EDGE_SCRIPT, v.edge, edgeRate(l, r), tmp], t, 30000);
      if (fs.statSync(tmp).size < 500) throw new Error('empty audio');
      fs.renameSync(tmp, edgeFile);
      return edgeFile;
    } finally {
      release();
    }
  };
  // Giọng thần kinh đôi khi chậm: quá 4,5 giây thì phát tạm giọng máy cho kịp lời, bản mp3 vẫn tạo nền để lần sau dùng
  const job = (async () => {
    try {
      if (USE_GOOGLE) {
        try {
          await acquire();
          try { return await googleJob(); } finally { release(); }
        } catch (e) {
          console.warn('[tts] google lỗi, dùng giọng máy:', e.message);
        }
        await acquire();
        try { return await sayJob(); } finally { release(); }
      }
      if (!USE_EDGE) {
        await acquire();
        try { return await sayJob(); } finally { release(); }
      }
      const edge = edgeJob();
      edge.catch((e) => console.warn('[tts] edge lỗi:', e.message));
      let timer;
      const late = new Promise((res) => { timer = setTimeout(res, 4500, 'late'); });
      const first = await Promise.race([edge.then((f) => f, () => 'fail'), late]);
      clearTimeout(timer);
      if (first !== 'late' && first !== 'fail') return first;
      await acquire();
      try { return await sayJob(); } finally { release(); }
    } finally {
      inflight.delete(jobKey);
      pruneTtsCache();
    }
  })();
  inflight.set(jobKey, job);
  return job;
}
export const ttsEngine = USE_GOOGLE ? 'Google Translate TTS (cần internet, lỗi thì dùng giọng máy)' : USE_EDGE ? 'edge-tts (giọng thần kinh Microsoft, cần internet)' : 'say (giọng máy macOS)';
