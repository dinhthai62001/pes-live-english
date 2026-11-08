// Chức vụ theo cấp độ A1 + lời cảm ơn của Pess & Po.
// - Cấp (level) tính theo TỔNG số xu bạn đó tặng trong buổi live: lên cấp thì được phong chức mới.
// - Độ hoành tráng của hiệu ứng/lời cảm ơn tính theo số xu của MỘT lần tặng (TIERS).
// - Ghế ngồi: lớp đầy thì bạn tặng quà được chen vào, xem seatNote() bên dưới.

export const LEVELS = [
  {
    lv: 1,
    min: 1,
    code: "A1.1",
    role: "Đại gia tập sự",
    en: "Rich Rookie",
    icon: "🌱",
    color: "#7dd3fc",
    perk: "có chỗ ngồi trong lớp, ví còn mỏng nhưng tim thì dày",
  },
  {
    lv: 2,
    min: 10,
    code: "A1.2",
    role: "Đại gia nhí",
    en: "Little Tycoon",
    icon: "🪙",
    color: "#86efac",
    perk: "ngồi gần bảng, được Pess pha trà sữa mời",
  },
  {
    lv: 3,
    min: 50,
    code: "A1.3",
    role: "Đại gia phố",
    en: "Street Boss",
    icon: "💵",
    color: "#fcd34d",
    perk: "được Po bao trà đá cả phố",
  },
  {
    lv: 4,
    min: 200,
    code: "A1.4",
    role: "Đại gia xế hộp",
    en: "Car Baron",
    icon: "🚗",
    color: "#fdba74",
    perk: "được Po lái xe đưa đón tận nhà",
  },
  {
    lv: 5,
    min: 500,
    code: "A1.5",
    role: "Tỷ phú",
    en: "Billionaire",
    icon: "💎",
    color: "#f9a8d4",
    perk: "tên in trên bảng vàng cả buổi",
  },
  {
    lv: 6,
    min: 1500,
    code: "A1.6",
    role: "Vua đại gia",
    en: "Mega Tycoon",
    icon: "👑",
    color: "#fb7185",
    perk: "ngồi ghế đẹp nhất, Pess & Po quạt mát cả buổi",
  },
];

// Cấp theo tổng xu; chưa tặng thì null
export function levelOf(coins) {
  let r = null;
  for (const l of LEVELS) if (coins >= l.min) r = l;
  return r;
}
export const nextLevel = (coins) => LEVELS.find((l) => l.min > coins) || null;
export const levelInfo = (coins) => {
  const l = levelOf(coins);
  return l
    ? {
        lv: l.lv,
        code: l.code,
        role: l.role,
        en: l.en,
        icon: l.icon,
        color: l.color,
      }
    : null;
};

// Mức một lần tặng (độ dài lời, hiệu ứng)
export const TIERS = [
  {
    level: 1,
    min: 1,
    fx: 1,
    hold: 4500,
    bop: [
      "A! {n} ơi! Cảm ơn bạn nha! Po nhận được tình yêu rồi!",
      "TING TING! Cảm ơn {n}! Hôm nay Po có động lực chấm bài rồi!",
      "{n} dễ thương quá! Po gửi bạn một nghìn cái high five!",
      "Cảm ơn {n} nha! Chúc bạn học đâu nhớ đó, ngủ đâu ngon đó!",
      "Ôi vui quá! {n} vừa gửi quà cho Po! Po cười tới mang tai rồi!",
      "{n} ơi, Po gửi bạn một chiếc ôm thật to từ bục giảng!",
      "Cả lớp ơi! Gửi một tràng pháo tay thật lớn cho {n} nào!",
      "Cảm ơn {n}! Po chúc bạn hôm nay gặp toàn chuyện vui!",
    ],
  },
  {
    level: 2,
    min: 10,
    fx: 2,
    hold: 5000,
    bop: [
      "Ôi trời ơi! {n} đáng yêu quá! Po xin phép nhảy một điệu ăn mừng!",
      "Cảm ơn {n}! Chúc bạn tiền vào như nước, niềm vui đầy nhà!",
      "Cả lớp ơi, cùng hô thật to: CẢM ƠN {n}!",
      "{n} làm Po vui quá! Hôm nay bài giảng phải hay gấp đôi!",
      "Po xin gửi {n} danh hiệu: Học sinh có trái tim vàng!",
      "Pess ơi! {n} vừa gửi quà! Mau lấy hoa ra tặng bạn nào!",
      "Cảm ơn {n} nha! Chúc bạn luôn xinh tươi, đẹp trai và gặp nhiều may mắn!",
      "Po vui đến mức muốn viết tên {n} lên bảng bằng chữ thật to!",
    ],
  },
  {
    level: 3,
    min: 50,
    fx: 3,
    hold: 5500,
    bop: [
      "Cả lớp đứng lên! Chào đón người bạn tuyệt vời {n} nào!",
      "Cảm ơn {n}! Po xin tặng bạn một tràng pháo tay dài ba tiết học!",
      "{n} ơi! Bạn chính là vitamin vui vẻ của lớp mình hôm nay!",
      "Po xin trao huy chương trái tim vàng cho {n}! Pess, mang huy chương ra đây!",
      "Ôi vui quá! Po muốn mở nhạc ăn mừng cho {n} ngay lập tức!",
      "Chúc {n} ngày càng thành công, ví luôn đầy và nụ cười luôn tươi!",
      "Cả lớp ơi! Hôm nay chúng ta có một ngôi sao mang tên {n}!",
      "Po cảm ơn {n} thật nhiều! Bạn đã tiếp thêm năng lượng cho cả lớp!",
      "Pess ơi, ghi vào sổ vàng đi! Hôm nay {n} làm Po hạnh phúc quá!",
    ],
  },
  {
    level: 4,
    min: 200,
    fx: 4,
    hold: 6500,
    bop: [
      "Woa! {n} xuất hiện là lớp học sáng bừng như có đèn sân khấu!",
      "Cảm ơn {n}! Po xin tặng bạn một chiếc vương miện siêu cấp đáng yêu!",
      "Cả lớp vỗ tay! Chúng ta có một nhà tài trợ niềm vui tuyệt vời!",
      "{n} ơi! Po chúc bạn thành công rực rỡ, hạnh phúc ngập tràn!",
      "Po xin phép đứng nghiêm chào đón {n}! Một người bạn quá tuyệt vời!",
      "Pess ơi! Chuẩn bị nhạc chiến thắng! Chúng ta ăn mừng vì {n} nào!",
      "Cảm ơn {n}! Bạn vừa biến lớp học hôm nay thành một lễ hội!",
      "Po xin trao danh hiệu VIP của tình yêu thương cho {n}!",
      "Ôi mẹ ơi! Po vui đến mức muốn múa phụ họa luôn rồi!",
      "{n} xứng đáng có mười điểm cộng và một tràng pháo tay thật lớn!",
    ],
  },
  {
    level: 5,
    min: 500,
    fx: 5,
    hold: 7500,
    bop: [
      "CẢ LỚP ƠI! HÃY DÀNH TRÀNG PHÁO TAY LỚN NHẤT CHO {n}!",
      "Po xin trao vương miện người truyền năng lượng tích cực cho {n}!",
      "Ôi {n} ơi! Po vui đến mức muốn nhảy từ bục giảng xuống sân khấu!",
      "Pess ơi! Hôm nay lớp mình có đại tiệc! Tất cả là nhờ {n}!",
      "Cảm ơn {n}! Po chúc bạn cuộc sống luôn ngập tràn điều kỳ diệu!",
      "Xin thông báo! Một nhân vật tuyệt vời mang tên {n} vừa làm cả lớp bùng nổ!",
      "Po xin gửi {n} một cái ôm xuyên màn hình và một triệu lời cảm ơn!",
      "Cả lớp cùng hô: {n} TUYỆT VỜI! {n} TUYỆT VỜI!",
      "Po vui quá! Tim Po đang nhảy điệu Cha Cha Cha vì {n}!",
      "Chúc {n} luôn gặp quý nhân, làm gì cũng thuận lợi, đi đâu cũng được yêu thương!",
    ],
  },
  {
    level: 6,
    min: 1500,
    fx: 6,
    hold: 9000,
    bop: [
      "DỪNG TẤT CẢ! SIÊU SAO {n} ĐÃ XUẤT HIỆN! CẢ LỚP ĂN MỪNG NÀO!",
      "CẢ LỚP ĐỨNG DẬY! CHÚNG TA CÓ MỘT HUYỀN THOẠI MANG TÊN {n}!",
      "Po xin cúi đầu cảm ơn {n}! Bạn tuyệt vời hơn cả điểm 10!",
      "Pess ơi! Mở nhạc chiến thắng! Hôm nay chúng ta dành sân khấu cho {n}!",
      "Xin trao danh hiệu huyền thoại của lớp học cho {n}! Một tràng pháo tay!",
      "Cảm ơn {n}! Po chúc bạn vạn sự như ý, triệu điều may mắn!",
      "Ôi trời ơi! Po vui quá! Cảm giác như cả lớp vừa vô địch thế giới!",
      "Cả lớp cùng hô vang: {n} LÀ SỐ MỘT! {n} LÀ SỐ MỘT!",
      "Po xin tặng {n} một chiếc ôm thật to, một nghìn nụ cười và vô vàn lời cảm ơn!",
      "Hôm nay là ngày đặc biệt! Vì có {n}, lớp mình trở thành lớp học hạnh phúc nhất!",
      "Po xin tuyên bố: {n} chính là ngôi sao sáng nhất trong trái tim Pess và Po!",
      "Xin cảm ơn {n}! Chúc bạn luôn giàu niềm vui, giàu sức khỏe và giàu cả may mắn!",
    ],
  },
];

// MỖI lượt tặng quà chỉ nói ĐÚNG MỘT câu: lời cảm ơn ngắn, hài hước, trending (luôn có tên người tặng). who = người nói
export const WISHES = [
  ["bop", "Cảm ơn {n}! Học phí hôm nay hơi bị chất lượng nha!"],
  ["mi", "Cảm ơn {n}! Bạn vừa khiến cô Pess có thêm động lực lên lớp!"],
  ["bop", "Ối giời ơi! Đại gia lớp mình xuất hiện rồi! Cảm ơn {n}!"],
  ["mi", "Cảm ơn {n}! Điểm cộng tinh thần, cô Pess cho hẳn mười điểm!"],
  ["bop", "Cả lớp ơi! Một tràng pháo tay cho {n} nào!"],
  ["mi", "Cảm ơn {n}! Hôm nay cô Pess giảng bài bằng cả trái tim!"],
  ["bop", "Alo alo! Tín hiệu giàu sang đã được gửi đến lớp! Cảm ơn {n}!"],
  ["mi", "Cảm ơn {n}! Chúc bạn học đâu nhớ đó, thi đâu đậu đó!"],
  ["bop", "Bạn vừa buff tinh thần cho Po lên max level rồi!"],
  ["mi", "Cảm ơn {n}! Năng lượng tích cực này cô Pess xin nhận hết nha!"],
  ["bop", "Lớp mình hôm nay có nhà tài trợ kim cương rồi! Cảm ơn {n}!"],
  ["mi", "Cảm ơn {n}! Chúc bạn tiền vào như nước, kiến thức đầy như kho!"],
  ["bop", "Po đang định gọi kiểm tra bài cũ, mà thấy bạn dễ thương quá!"],
  ["mi", "Cảm ơn {n}! Cô Pess xin phép cộng thêm một điểm may mắn cho bạn!"],
  ["bop", "Ô kê! Donate chất lượng, tinh thần học tập lên nóc!"],
  ["mi", "Cảm ơn {n}! Bạn đúng là vitamin vui vẻ của lớp mình!"],
  ["bop", "Po xin phép lưu tên bạn vào danh sách học sinh ưu tú!"],
  ["mi", "Cảm ơn {n}! Chúc bạn ngày càng xinh đẹp, thành công và học giỏi!"],
  ["bop", "Đang giảng bài mà Po vui ngang trúng số vậy đó! Cảm ơn {n}!"],
  ["mi", "Cảm ơn {n}! Cô Pess nhận quà, gửi lại bạn một trời may mắn!"],
];
// Quà lớn (fx từ 4): vẫn một câu, to tiếng hơn một chút
export const HYPE = [
  ["bop", "Cảm ơn {n}! Cả lớp vỗ tay chúc mừng nào!"],
  ["mi", "Cảm ơn {n}! Bắn pháo hoa thôi!"],
  ["bop", "Cảm ơn {n}! Quá trời quá đất, đại gia là đây!"],
  ["mi", "Cảm ơn {n}, trùm cuối của lớp, bái phục!"],
];

const cap = (x) => (x ? x[0].toUpperCase() + x.slice(1) : x);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
// Không lặp lại câu vừa dùng
const lastWish = new Set();
function pickWish(list) {
  let w;
  for (let i = 0; i < 8; i++) {
    w = pick(list);
    if (!lastWish.has(w[1])) break;
  }
  lastWish.add(w[1]);
  if (lastWish.size > 10) lastWish.delete(lastWish.values().next().value);
  return w;
}
const fill = (s, v) => s.replace(/\{(\w)\}/g, (_, k) => v[k] ?? "");
const tierFor = (coins) =>
  TIERS.reduce((t, x) => (coins >= x.min ? x : t), TIERS[0]);

// ev: { name, giftName, coins (một lần), total (tổng sau khi tặng), prevCoins, seat: 'new'|'from-hall'|'swap'|'stay'|'waitlist', evicted (tên người nhường chỗ | null) }
export function makeThanks(ev) {
  const t = tierFor(ev.coins);
  const v = { n: ev.name, g: ev.giftName, c: ev.coins };
  const L = levelOf(ev.total);
  const before = levelOf(ev.prevCoins || 0);
  const promoted = !!L && (!before || L.lv > before.lv);
  const nx = nextLevel(ev.total);

  const nm = ev.name.length > 14 ? ev.name.slice(0, 13) + "…" : ev.name;
  const out =
    ev.evicted && ev.evicted.length > 14
      ? ev.evicted.slice(0, 13) + "…"
      : ev.evicted;
  let seatLine = "";
  if (ev.seat === "swap")
    seatLine = `Lớp kín mà ${nm} tặng quà nên Pess mời vào ngồi! ${out} ra hành lang chờ nha!`;
  else if (ev.seat === "from-hall")
    seatLine = `${nm} được mời từ hành lang vào ngồi rồi nè!`;
  else if (ev.seat === "waitlist")
    seatLine = `Lớp đang kín, ${nm} đứng đầu hàng chờ nha. Có chỗ là Pess gọi liền!`;

  const gname =
    String(ev.giftName || "")
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .replace(/\s+/g, " ")
      .trim() || "quà";
  let rankLine;
  if (promoted) {
    rankLine = pick([
      `Chúc mừng ${nm}! Bạn được phong ${L.role}, cấp ${L.code} ${L.en}! ${cap(L.perk)}!`,
      `Chúc mừng ${nm} lên ${L.role}, cấp ${L.code}! Pess trao huy hiệu cho bạn nè!`,
    ]);
  } else if (L && nx && t.fx >= 2) {
    rankLine = `Cảm ơn ${nm} đã tặng ${gname}! Bạn là ${L.role} ${L.code}, thêm ${nx.min - ev.total} xu là lên ${nx.role}!`;
  } else if (L && !nx) {
    rankLine = `Cảm ơn ${nm} đã tặng ${gname}! Bạn đã là ${L.role}, cao nhất lớp!`;
  } else {
    rankLine = `Cảm ơn ${nm} đã tặng ${gname}!`;
  }
  // Chỉ MỘT câu, bốc ngẫu nhiên từ câu theo mức quà (TIERS) và kho lời cảm ơn chung (WISHES; quà lớn thêm HYPE)
  const pool = [
    ...t.bop.map((x) => ["bop", x]),
    ...WISHES,
    ...(t.fx >= 4 ? HYPE : []),
  ];
  const w = pickWish(pool);
  const line = { who: w[0], text: fill(w[1], { ...v, n: nm, g: gname }) };
  const lines = [line];

  return {
    level: t.level,
    tierName: L ? L.role : "Học sinh",
    color: L ? L.color : "#9fb4c8",
    icon: L ? L.icon : "🎁",
    code: L ? L.code : "",
    fx: Math.min(6, t.fx + (promoted && L && L.lv >= 5 ? 1 : 0)),
    hold: t.hold,
    promoted,
    perk: L ? L.perk : "",
    seat: ev.seat,
    lines,
  };
}
