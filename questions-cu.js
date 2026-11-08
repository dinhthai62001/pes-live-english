// Ngân hàng bài tập tiếng Anh A1 cho lớp học LIVE.
// Hai dạng: 'mcq' (chọn A/B/C/D) và 'fill' (điền từ, người xem gõ đáp án vào bình luận).
// Một nửa là bài soạn tay (ngữ pháp, hội thoại), một nửa sinh từ danh sách từ vựng (xem VOCAB) nên ra được rất nhiều câu.

const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
const sample = (a, n) => shuffle(a).slice(0, n);

// ---- Chủ đề: nhãn hiển thị trên bảng ----
export const TOPICS = {
  Travel: ['Travel', 'Du lịch', '🧳'],
  Health: ['Health', 'Sức khỏe', '🩺'],
  Shopping: ['Shopping & Money', 'Mua sắm, tiền bạc', '🛍️'],
  Food: ['Food & Cooking', 'Ẩm thực, nấu ăn', '🍳'],
  Home: ['Home', 'Nhà cửa, đồ gia dụng', '🏠'],
  Clothes: ['Clothes & Looks', 'Quần áo, ngoại hình', '👕'],
  Jobs: ['Jobs & Work', 'Nghề nghiệp, công việc', '💼'],
  Hobbies: ['Hobbies & Sport', 'Sở thích, thể thao', '⚽'],
  Tech: ['Tech & Media', 'Công nghệ, truyền thông', '💻'],
  Nature: ['Weather & Nature', 'Thời tiết, thiên nhiên', '🌋'],
  Places: ['City & Places', 'Thành phố, địa điểm', '🏰'],
  Feelings: ['Feelings & Character', 'Cảm xúc, tính cách', '😊'],
  Verbs: ['Useful Verbs', 'Động từ thông dụng', '🏃'],
  Adjectives: ['Adjectives', 'Tính từ', '✨'],
  Frequency: ['Time & Frequency', 'Thời gian, tần suất', '⏰'],
  School: ['School & Study', 'Học tập, trường lớp', '🎓'],
  Numbers: ['Numbers & Amounts', 'Số thứ tự, số lượng', '🔢'],
  Time: ['Telling the Time', 'Nói giờ', '🕒'],
  Opposites: ['Opposites', 'Từ trái nghĩa', '↔️'],
  OddOne: ['Odd One Out', 'Tìm từ khác loại', '🔍'],
  PastSimple: ['Past Simple', 'Quá khứ đơn', '⏪'],
  Compare: ['Comparatives', 'So sánh hơn, so sánh nhất', '📏'],
  Future: ['Future', 'Tương lai: will, going to', '🔮'],
  Perfect: ['Present Perfect', 'Hiện tại hoàn thành', '✅'],
  Modals: ['Modal Verbs', 'Động từ khuyết thiếu', '💡'],
  Quantity: ['Quantifiers', 'Từ chỉ số lượng', '🥛'],
  Preps: ['Prepositions', 'Giới từ', '📌'],
  Linking: ['Linking Words & If', 'Liên từ, câu điều kiện', '🔗'],
  Gerund: ['-ing or to?', 'Động từ + -ing / to', '🔁'],
  Relative: ['Relative Clauses', 'Mệnh đề quan hệ', '👥'],
  Articles: ['Articles & Possessives', 'Mạo từ, sở hữu', '🔤'],
  WordForms: ['Adjective or Adverb?', 'Tính từ hay trạng từ', '🔧'],
  QForms: ['Question Forms', 'Câu hỏi, câu hỏi đuôi', '❓'],
  Phrasal: ['Phrasal Verbs', 'Cụm động từ', '🧩'],
  Functions: ['Everyday English', 'Giao tiếp hằng ngày', '💬'],
};

// ---- Từ vựng A2: en|vi|emoji|cờ (v = bỏ câu Việt→Anh, e = bỏ câu đoán emoji, f = bỏ câu điền từ, x = không dùng làm từ "khác loại") ----
// Dùng chính tả Mỹ (organize, neighbor...) để người xem gõ đáp án dễ khớp.
const VOCAB_RAW = {
  Travel: `ticket|cái vé|🎫;passport|hộ chiếu|🛂;luggage|hành lý|🧳;suitcase|va li;flight|chuyến bay|✈️;platform|sân ga;passenger|hành khách;tourist|khách du lịch;guide|hướng dẫn viên;reception|quầy lễ tân;reservation|sự đặt chỗ;delay|sự chậm trễ;abroad|ở nước ngoài;souvenir|quà lưu niệm|🎁;camping|cắm trại|⛺;harbor|bến cảng;crossroads|ngã tư;roundabout|vòng xuyến;pavement|vỉa hè;journey|hành trình;trip|chuyến đi ngắn;customs|hải quan;timetable|lịch tàu xe;insurance|bảo hiểm du lịch;backpack|ba lô du lịch|🎒`,
  Health: `headache|đau đầu;toothache|đau răng;stomachache|đau bụng;fever|sốt;cough|cái ho;medicine|thuốc;pill|viên thuốc|💊;bandage|băng gạc;injury|vết thương;ambulance|xe cứu thương|🚑;appointment|cuộc hẹn khám;patient|bệnh nhân;healthy|khỏe mạnh;exercise|tập thể dục;diet|chế độ ăn;allergy|dị ứng;wound|vết thương hở;rest|nghỉ ngơi;recover|hồi phục;symptom|triệu chứng;prescription|đơn thuốc;surgeon|bác sĩ phẫu thuật;crutches|cái nạng;stress|căng thẳng`,
  Shopping: `price|giá cả;discount|giảm giá;receipt|biên lai;cashier|thu ngân;customer|khách hàng;bargain|món hời;sale|đợt khuyến mãi;wallet|ví tiền|👛;coin|đồng xu|🪙;cash|tiền mặt;change|tiền thối;refund|hoàn tiền;basket|cái giỏ|🧺;trolley|xe đẩy hàng;size|cỡ số;pay|trả tiền;spend|tiêu tiền;save|tiết kiệm;borrow|mượn;lend|cho mượn;owe|nợ;shopping mall|trung tâm thương mại|f;queue|hàng người xếp;label|nhãn mác;brand|thương hiệu`,
  Food: `recipe|công thức nấu ăn;ingredient|nguyên liệu;slice|lát cắt;boil|đun sôi;fry|chiên rán;bake|nướng bánh;roast|quay;chop|băm nhỏ;pour|rót;spicy|cay;sweet|ngọt;sour|chua;bitter|đắng;salty|mặn;delicious|ngon tuyệt;raw|sống;menu|thực đơn;tip|tiền boa;vegetarian|người ăn chay;dessert|món tráng miệng;snack|đồ ăn vặt;flour|bột mì;sugar|đường;salt|muối;oil|dầu ăn;garlic|tỏi;mushroom|nấm|🍄;lettuce|xà lách|🥬;shrimp|con tôm|🦐;beef|thịt bò|🥩;pork|thịt heo;seafood|hải sản;yogurt|sữa chua;pepper|hạt tiêu;sauce|nước sốt;toast|bánh mì nướng|🍞;pancake|bánh kếp|🥞`,
  Home: `furniture|đồ nội thất;curtain|rèm cửa;carpet|tấm thảm;cupboard|tủ bếp;shelf|cái kệ;balcony|ban công;stairs|cầu thang;attic|gác mái;basement|tầng hầm;neighbor|hàng xóm;rent|tiền thuê nhà;apartment|căn hộ;microwave|lò vi sóng;vacuum|máy hút bụi;dishwasher|máy rửa bát;iron|bàn ủi|;towel|khăn tắm;soap|xà phòng|🧼;toothbrush|bàn chải đánh răng|🪥;shampoo|dầu gội;pillow|cái gối;blanket|cái chăn;laundry|quần áo cần giặt;rubbish|rác;broom|cái chổi|🧹;bucket|cái xô|🪣;ladder|cái thang;drawer|ngăn kéo`,
  Clothes: `uniform|đồng phục;costume|trang phục hóa trang;pocket|túi áo;belt|thắt lưng;button|cúc áo;zip|khóa kéo;sleeve|tay áo;collar|cổ áo;tie|cà vạt|👔;sandals|dép quai hậu|🩴;trainers|giày thể thao|👟;fashion|thời trang;jewelry|trang sức;ring|chiếc nhẫn|💍;necklace|dây chuyền;earrings|bông tai;handbag|túi xách|👜;curly|xoăn;straight|thẳng;slim|mảnh mai;blond|vàng hoe;bald|hói;beard|râu quai nón;mustache|ria mép;freckles|tàn nhang;scarf|khăn quàng|🧣;raincoat|áo mưa`,
  Jobs: `manager|quản lý;employee|nhân viên;salary|tiền lương;interview|buổi phỏng vấn;career|sự nghiệp;colleague|đồng nghiệp;lawyer|luật sư;journalist|nhà báo;architect|kiến trúc sư;scientist|nhà khoa học;electrician|thợ điện;plumber|thợ ống nước;mechanic|thợ máy;designer|nhà thiết kế;photographer|nhiếp ảnh gia;accountant|kế toán;secretary|thư ký;vet|bác sĩ thú y;actor|diễn viên;musician|nhạc sĩ;factory|nhà máy|🏭;meeting|cuộc họp;deadline|hạn chót;retire|nghỉ hưu;apply|nộp đơn xin việc;engineer|kỹ sư;businessman|doanh nhân;mayor|thị trưởng`,
  Hobbies: `hobby|sở thích;collect|sưu tầm;gardening|làm vườn;fishing|câu cá|🎣;cycling|đạp xe;jogging|chạy bộ;climbing|leo núi|🧗;skiing|trượt tuyết|⛷️;skating|trượt băng|⛸️;surfing|lướt sóng|🏄;painting|vẽ tranh|🎨;knitting|đan len|🧶;chess|cờ vua|♟️;puzzle|trò xếp hình|🧩;match|trận đấu;team|đội;coach|huấn luyện viên;champion|nhà vô địch;score|ghi bàn;goal|bàn thắng|🥅;referee|trọng tài;tournament|giải đấu;gym|phòng tập thể hình|🏋️;racket|cây vợt|🏸;helmet|mũ bảo hiểm|⛑️;cartoon|phim hoạt hình`,
  Tech: `laptop|máy tính xách tay|💻;screen|màn hình;keyboard|bàn phím|⌨️;password|mật khẩu;website|trang web;online|trực tuyến;download|tải xuống;message|tin nhắn;camera|máy ảnh|📷;headphones|tai nghe|🎧;battery|cục pin|🔋;charger|bộ sạc;printer|máy in|🖨️;newspaper|tờ báo|📰;magazine|tạp chí;article|bài báo;channel|kênh truyền hình;program|chương trình;documentary|phim tài liệu;comedy|phim hài;headline|tiêu đề báo;advertisement|mẩu quảng cáo;application|ứng dụng;signal|tín hiệu;microphone|micro|🎤`,
  Nature: `temperature|nhiệt độ;thunder|tiếng sấm;lightning|tia chớp|⚡;fog|sương mù;flood|trận lũ;drought|hạn hán;earthquake|động đất;volcano|núi lửa|🌋;desert|sa mạc|🏜️;jungle|rừng rậm;valley|thung lũng;waterfall|thác nước;cave|hang động;cliff|vách đá;coast|bờ biển;wave|con sóng|🌊;environment|môi trường;pollution|ô nhiễm;recycle|tái chế|♻️;planet|hành tinh|🪐;breeze|làn gió nhẹ;humid|ẩm ướt;freezing|lạnh cóng;windy|có gió;cloudy|nhiều mây;sunny|có nắng;foggy|có sương mù;hurricane|cơn bão lớn;glacier|sông băng`,
  Places: `gallery|phòng triển lãm;theater|nhà hát|🎭;castle|lâu đài|🏰;palace|cung điện;tower|tòa tháp|🗼;statue|bức tượng|🗽;fountain|đài phun nước|⛲;skyscraper|nhà chọc trời;suburb|vùng ngoại ô;square|quảng trường;traffic|giao thông;embassy|đại sứ quán;prison|nhà tù;temple|ngôi đền|🛕;lighthouse|ngọn hải đăng;campsite|khu cắm trại;playground|sân chơi;cafe|quán cà phê;mosque|nhà thờ Hồi giáo|🕌;bakery|tiệm bánh|🥖;market|khu chợ;library|thư viện|📚;hospital|bệnh viện|🏥;airport|sân bay;station|nhà ga|🚉;stadium|sân vận động|🏟️`,
  Feelings: `nervous|hồi hộp;excited|hào hứng;bored|buồn chán;embarrassed|ngượng ngùng;jealous|ghen tị;proud|tự hào;lonely|cô đơn;worried|lo ngại;relaxed|thư giãn;shy|nhút nhát;confident|tự tin;generous|hào phóng;honest|trung thực;polite|lịch sự;rude|thô lỗ;selfish|ích kỷ;brave|dũng cảm;clever|thông minh;creative|sáng tạo;friendly|thân thiện;stubborn|bướng bỉnh;curious|tò mò;cheerful|vui tươi;lazy|lười biếng;upset|buồn bực;surprised|ngạc nhiên|😲;scared|sợ hãi|😨;disappointed|thất vọng`,
  Verbs: `arrive|đến nơi;leave|rời đi;return|quay lại;remember|nhớ lại;forget|quên;decide|quyết định;choose|lựa chọn;explain|giải thích;invite|mời;refuse|từ chối;accept|chấp nhận;agree|đồng ý;improve|cải thiện;practice|luyện tập;prepare|chuẩn bị;plan|lên kế hoạch;organize|tổ chức;discover|khám phá;invent|phát minh;destroy|phá hủy;repair|sửa chữa;carry|mang vác;throw|ném;catch|bắt lấy;climb|leo trèo;hurry|vội vã;notice|để ý thấy;recognize|nhận ra;suggest|đề nghị;promise|hứa;warn|cảnh báo;complain|phàn nàn;celebrate|ăn mừng;marry|kết hôn;protect|bảo vệ;attend|tham dự;receive|nhận được;continue|tiếp tục;allow|cho phép;enjoy|tận hưởng;hurt|làm đau;introduce|giới thiệu;order|gọi món;pretend|giả vờ`,
  Adjectives: `fantastic|tuyệt vời;terrible|tồi tệ;boring|nhàm chán;interesting|thú vị;dangerous|nguy hiểm;safe|an toàn;modern|hiện đại;ancient|cổ xưa;popular|được ưa chuộng;famous|nổi tiếng;useful|hữu ích;useless|vô dụng;comfortable|thoải mái;crowded|đông đúc;empty|trống rỗng;narrow|hẹp;wide|rộng;thick|dày;thin|mỏng;sharp|sắc bén;smooth|mịn màng;rough|thô ráp;soft|mềm mại;wet|ướt;dry|khô;bright|sáng chói;dark|tối;loud|ồn ào;silent|im lặng;tiny|nhỏ xíu;huge|khổng lồ;typical|điển hình;special|đặc biệt;strange|kỳ lạ;enough|đủ;whole|toàn bộ;dirty|bẩn thỉu;sensible|biết điều`,
  Frequency: `always|luôn luôn;usually|thường xuyên;often|thường;sometimes|thỉnh thoảng;rarely|hiếm khi;never|không bao giờ;already|đã rồi;yet|chưa;recently|gần đây;suddenly|đột nhiên;immediately|ngay lập tức;nowadays|ngày nay;century|thế kỷ;decade|thập kỷ;weekend|cuối tuần;midnight|nửa đêm;fortnight|hai tuần;anniversary|ngày kỷ niệm;schedule|lịch trình;tonight|tối nay;lately|dạo gần đây;eventually|cuối cùng thì;meanwhile|trong lúc đó`,
  School: `subject|môn học;exam|kỳ thi;degree|bằng cấp;university|trường đại học;lecture|bài giảng;tutor|gia sư;scholarship|học bổng;grade|điểm số;mistake|lỗi sai;vocabulary|từ vựng;grammar|ngữ pháp;pronunciation|phát âm;translate|dịch;research|nghiên cứu;project|dự án;experiment|thí nghiệm;calculator|máy tính bỏ túi;campus|khuôn viên trường;graduate|tốt nghiệp;education|nền giáo dục;knowledge|kiến thức;cheat|gian lận;revise|ôn tập;fail|thi trượt;pass|thi đỗ;dormitory|ký túc xá`,
  Numbers: `first|thứ nhất;second|thứ hai;third|thứ ba;fourth|thứ tư;fifth|thứ năm;sixth|thứ sáu;seventh|thứ bảy;eighth|thứ tám;ninth|thứ chín;tenth|thứ mười;twelfth|thứ mười hai;twentieth|thứ hai mươi;hundred|một trăm;thousand|một nghìn;million|một triệu;half|một nửa;quarter|một phần tư;double|gấp đôi;twice|hai lần;dozen|một tá;pair|một cặp;percent|phần trăm;billion|một tỷ;triple|gấp ba`,
};
// Nhóm có thể ra câu "khác loại" (tách bạch, không trùng nghĩa)
const ODD_VI = {
  Food: 'nguyên liệu / món ăn', Clothes: 'quần áo hoặc ngoại hình', Jobs: 'nghề nghiệp hoặc công việc', Hobbies: 'sở thích hoặc thể thao',
  Tech: 'công nghệ hoặc truyền thông', Nature: 'thời tiết hoặc thiên nhiên', Feelings: 'cảm xúc hoặc tính cách', Home: 'đồ dùng trong nhà',
  Health: 'sức khỏe', Travel: 'du lịch',
};

const VOCAB = [];
for (const [cat, raw] of Object.entries(VOCAB_RAW)) {
  for (const it of raw.split(';')) {
    const [en, vi, emoji, flags] = it.trim().split('|');
    VOCAB.push({ en, vi, emoji: emoji || null, flags: flags || '', cat });
  }
}
const byCat = (cat) => VOCAB.filter((v) => v.cat === cat);

// ---- Bộ dựng câu hỏi ----
const KEYS = 'ABCD';
function mcq(topic, prompt, correct, wrong, o = {}) {
  const opts = shuffle([correct, ...wrong]);
  return {
    type: 'mcq', topic, prompt, emoji: o.emoji || null, sub: o.sub || null,
    options: opts.map((t, i) => ({ k: KEYS[i], t })),
    answerKey: KEYS[opts.indexOf(correct)], answers: [correct], explain: o.explain || '',
  };
}
function fill(topic, prompt, answers, o = {}) {
  return {
    type: 'fill', topic, prompt, emoji: o.emoji || null, sub: o.sub || null,
    answers, mode: o.mode || 'sentence', tiles: o.tiles || null,
    full: o.full || null, explain: o.explain || '',
  };
}
const isWord = (w) => /^[a-zA-Z]{3,12}$/.test(w);
const scramble = (w) => {
  let t = w;
  for (let i = 0; i < 8 && t === w; i++) t = shuffle(w.split('')).join('');
  return t.toUpperCase().split('');
};

const bank = { mcq: [], fill: [] };
const add = (q) => bank[q.type].push(q);

// 1) Từ vựng sinh tự động
for (const v of VOCAB) {
  const same = byCat(v.cat).filter((x) => x.en !== v.en);
  const note = `${v.en} = ${v.vi}${v.emoji ? ' ' + v.emoji : ''}`;
  const topic = v.cat;
  if (same.length >= 3) {
    // Anh -> Việt
    add(mcq(topic, `“${v.en}” nghĩa là gì?`, v.vi, sample(same, 3).map((x) => x.vi), { explain: note }));
    // Việt -> Anh
    if (!v.flags.includes('v')) add(mcq(topic, `“${v.vi}” tiếng Anh là gì?`, v.en, sample(same, 3).map((x) => x.en), { explain: note }));
    // Emoji -> Anh (chỉ khi emoji này là duy nhất trong nhóm)
    if (v.emoji && !v.flags.includes('e') && !same.some((x) => x.emoji === v.emoji)) {
      const sameEmoji = same.filter((x) => x.emoji);
      if (sameEmoji.length >= 3) add(mcq(topic, 'Đây là gì?', v.en, sample(sameEmoji, 3).map((x) => x.en), { emoji: v.emoji, explain: note }));
    }
  }
  if (isWord(v.en) && !v.flags.includes('f')) {
    add(fill(topic, 'Điền từ tiếng Anh', [v.en.toLowerCase()], { mode: 'spell', emoji: v.emoji, sub: v.vi, explain: note }));
    add(fill(topic, 'Sắp xếp các chữ cái thành từ đúng', [v.en.toLowerCase()], { mode: 'scramble', tiles: scramble(v.en), emoji: v.emoji, sub: v.vi, explain: note }));
  }
}

// 2) Nói giờ: kém / hơn, rưỡi, kém 15 (A2)
const HOURS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const CLOCK_FACES = ['🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛'];
const HALF_FACES = ['🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧'];
const hw = (h) => HOURS[(h + 11) % 12]; // h = 1..12 (kể cả 13 -> one)
const TIMES = [
  [0, (h) => `${hw(h)} o'clock`, (h) => `${h}:00`],
  [15, (h) => `quarter past ${hw(h)}`, (h) => `${h}:15`],
  [30, (h) => `half past ${hw(h)}`, (h) => `${h}:30`],
  [45, (h) => `quarter to ${hw(h + 1)}`, (h) => `${h}:45`],
  [10, (h) => `ten past ${hw(h)}`, (h) => `${h}:10`],
  [20, (h) => `twenty past ${hw(h)}`, (h) => `${h}:20`],
  [40, (h) => `twenty to ${hw(h + 1)}`, (h) => `${h}:40`],
  [50, (h) => `ten to ${hw(h + 1)}`, (h) => `${h}:50`],
];
for (let h = 1; h <= 12; h++) {
  for (const [m, say, dig] of sample(TIMES, 4)) {
    const correct = `It's ${say(h)}.`;
    const wrong = TIMES.filter(([mm]) => mm !== m).map(([, s2]) => `It's ${s2(h)}.`);
    wrong.push(`It's ${TIMES[1][1](((h + 2) % 12) + 1)}.`);
    const face = m === 0 ? CLOCK_FACES[h - 1] : m === 30 ? HALF_FACES[h - 1] : '🕒';
    add(mcq('Time', 'What time is it?', correct, sample(wrong.filter((w) => w !== correct), 3), { emoji: m === 0 || m === 30 ? face : null, sub: m === 0 || m === 30 ? null : dig(h), explain: `${dig(h)} = ${say(h)}` }));
  }
}
for (const h of [3, 6, 9, 12, 5, 8]) {
  add(fill('Time', `It's half past ______.`, [hw(h)], { mode: 'sentence', emoji: HALF_FACES[h - 1], sub: `Bây giờ là ${h}:30`, explain: `${h}:30 = half past ${hw(h)}` }));
  add(fill('Time', `It's quarter ___ ${hw(h + 1)}.`, ['to'], { mode: 'sentence', sub: `Bây giờ là ${h}:45`, explain: `${h}:45 = quarter to ${hw(h + 1)}` }));
  add(fill('Time', `It's quarter ___ ${hw(h)}.`, ['past'], { mode: 'sentence', sub: `Bây giờ là ${h}:15`, explain: `${h}:15 = quarter past ${hw(h)}` }));
}

// 3) Trái nghĩa (A2)
const OPP = [
  ['polite', 'rude', 'g1'], ['safe', 'dangerous', 'g2'], ['careful', 'careless', 'g2'], ['empty', 'full', 'g3'], ['wide', 'narrow', 'g4'], ['thick', 'thin', 'g4'],
  ['smooth', 'rough', 'g5'], ['wet', 'dry', 'g6'], ['bright', 'dark', 'g7'], ['loud', 'quiet', 'g8'], ['arrive', 'leave', 'g9'], ['remember', 'forget', 'g10'],
  ['borrow', 'lend', 'g11'], ['win', 'lose', 'g12'], ['always', 'never', 'g13'], ['inside', 'outside', 'g14'], ['ancient', 'modern', 'g15'], ['useful', 'useless', 'g16'],
  ['generous', 'selfish', 'g17'], ['accept', 'refuse', 'g18'], ['agree', 'disagree', 'g18'], ['increase', 'decrease', 'g19'], ['push', 'pull', 'g20'], ['spend', 'save', 'g11'],
  ['success', 'failure', 'g21'], ['mess', 'order', 'g22'], ['ceiling', 'floor', 'g23'], ['expand', 'shrink', 'g19'], ['lonely', 'sociable', 'g24'], ['heavy', 'light', 'g25'],
];
const OPP_POOL = OPP.flatMap(([a, b, g]) => [[a, g], [b, g]]);
for (const [a, b, g] of OPP) {
  for (const [x, y] of [[a, b], [b, a]]) {
    const wrongs = sample(OPP_POOL.filter(([w, gg]) => gg !== g && w !== y && w !== x), 3).map(([w]) => w);
    add(mcq('Opposites', `Từ trái nghĩa của “${x}” là gì?`, y, wrongs, { emoji: '↔️', explain: `${x} ↔ ${y}` }));
    if (isWord(y)) add(fill('Opposites', `${x}  ↔  ______`, [y], { mode: 'spell', emoji: '↔️', sub: 'Điền từ trái nghĩa', explain: `${x} ↔ ${y}` }));
  }
}

// 4) Tìm từ khác loại
for (const [cat, viName] of Object.entries(ODD_VI)) {
  const members = byCat(cat).filter((m) => !m.flags.includes('x'));
  const outsiders = VOCAB.filter((v) => v.cat !== cat && !v.flags.includes('x') && ODD_VI[v.cat]);
  if (members.length < 3 || outsiders.length < 3) continue;
  for (let i = 0; i < Math.min(12, members.length); i++) {
    const odd = rnd(outsiders);
    add(mcq('OddOne', `Từ nào KHÔNG thuộc nhóm ${viName}?`, odd.en, sample(members, 3).map((m) => m.en), { emoji: '🔍', explain: `${odd.en} (${odd.vi}) không thuộc nhóm ${viName}.` }));
  }
}

// 5) Soạn tay: ngữ pháp & giao tiếp A2
// mcq: [chủ đề, đề, đáp án đúng, [3 đáp án sai], giải thích, gợi ý tiếng Việt]
const G = [
  // quá khứ đơn
  ['PastSimple', 'Yesterday I ___ to the market.', 'went', ['go', 'goed', 'gone'], 'go → went (bất quy tắc).', 'Hôm qua tôi đi chợ.'],
  ['PastSimple', 'She ___ a film last night.', 'watched', ['watch', 'watches', 'watching'], 'Quá khứ có quy tắc thêm -ed.', 'Tối qua cô ấy xem phim.'],
  ['PastSimple', 'We ___ pizza for dinner on Sunday.', 'ate', ['eat', 'eated', 'eaten'], 'eat → ate.', 'Chủ nhật chúng tôi ăn pizza.'],
  ['PastSimple', 'He ___ his keys yesterday.', 'lost', ['losed', 'lose', 'loses'], 'lose → lost.', 'Hôm qua anh ấy làm mất chìa khóa.'],
  ['PastSimple', 'I ___ TV last night. (phủ định)', 'didn\'t watch', ['don\'t watch', 'didn\'t watched', 'not watch'], 'didn\'t + động từ nguyên mẫu.', 'Tối qua tôi không xem tivi.'],
  ['PastSimple', '___ you go to the party last week?', 'Did', ['Do', 'Were', 'Have'], 'Câu hỏi quá khứ dùng Did.', 'Tuần trước bạn có đi dự tiệc không?'],
  ['PastSimple', 'They ___ in London in 2019.', 'lived', ['live', 'lives', 'living'], 'Quá khứ có quy tắc: lived.', 'Họ sống ở Luân Đôn năm 2019.'],
  ['PastSimple', 'My sister ___ me a gift.', 'gave', ['gived', 'given', 'give'], 'give → gave.', 'Chị tôi tặng tôi một món quà.'],
  ['PastSimple', 'I ___ new shoes last week.', 'bought', ['buyed', 'buy', 'buys'], 'buy → bought.', 'Tuần trước tôi mua giày mới.'],
  ['PastSimple', 'Where ___ you yesterday?', 'were', ['was', 'did', 'are'], 'Quá khứ của are là were.', 'Hôm qua bạn ở đâu?'],
  ['PastSimple', 'She ___ her homework before dinner.', 'did', ['done', 'doed', 'does'], 'do → did.', 'Cô ấy làm bài tập trước bữa tối.'],
  ['PastSimple', 'He didn\'t ___ the answer.', 'know', ['knew', 'known', 'knows'], 'Sau didn\'t dùng động từ nguyên mẫu.', 'Anh ấy không biết đáp án.'],
  ['PastSimple', 'I ___ him at the station two days ago.', 'saw', ['seen', 'see', 'sawed'], 'see → saw.', 'Hai ngày trước tôi gặp anh ấy ở nhà ga.'],
  ['PastSimple', 'They ___ a lot of photos on holiday.', 'took', ['taked', 'taken', 'take'], 'take → took.', 'Họ chụp nhiều ảnh trong kỳ nghỉ.'],
  ['PastSimple', 'When ___ you born?', 'were', ['was', 'did', 'are'], 'you đi với were ở quá khứ.', 'Bạn sinh ra khi nào?'],
  ['PastSimple', 'I ___ breakfast this morning. (không ăn)', 'didn\'t have', ['don\'t had', 'didn\'t had', 'not have'], 'didn\'t + động từ nguyên mẫu.', 'Sáng nay tôi không ăn sáng.'],
  ['PastSimple', 'He ___ his arm when he fell off the bike.', 'broke', ['breaked', 'broken', 'break'], 'break → broke.', 'Anh ấy gãy tay khi ngã xe.'],
  ['PastSimple', 'The film ___ at eight and finished at ten.', 'started', ['start', 'starts', 'starting'], 'Quá khứ có quy tắc: started.', 'Phim bắt đầu lúc 8 giờ và kết thúc lúc 10 giờ.'],
  // so sánh
  ['Compare', 'My brother is ___ than me.', 'taller', ['tall', 'more tall', 'tallest'], 'Tính từ ngắn + -er.', 'Anh tôi cao hơn tôi.'],
  ['Compare', 'This book is ___ than that one.', 'more interesting', ['interestinger', 'most interesting', 'more interest'], 'Tính từ dài dùng more + tính từ.', 'Quyển này thú vị hơn quyển kia.'],
  ['Compare', 'Today is ___ than yesterday.', 'hotter', ['hoter', 'more hot', 'hottest'], 'Gấp đôi phụ âm cuối: hot → hotter.', 'Hôm nay nóng hơn hôm qua.'],
  ['Compare', 'She is ___ than her sister.', 'happier', ['happyer', 'more happy', 'happiest'], 'Đuôi -y đổi thành -ier.', 'Cô ấy vui hơn chị mình.'],
  ['Compare', 'English is ___ than Math for me.', 'easier', ['easyer', 'more easy', 'easiest'], 'easy → easier.', 'Với tôi tiếng Anh dễ hơn Toán.'],
  ['Compare', 'This is the ___ film of the year.', 'best', ['better', 'good', 'most good'], 'good → better → best.', 'Đây là bộ phim hay nhất năm.'],
  ['Compare', 'Everest is the ___ mountain in the world.', 'highest', ['higher', 'high', 'most high'], 'So sánh nhất: the + -est.', 'Everest là ngọn núi cao nhất thế giới.'],
  ['Compare', 'This is the ___ restaurant in town.', 'most expensive', ['more expensive', 'expensivest', 'expensive'], 'Tính từ dài: the most + tính từ.', 'Đây là nhà hàng đắt nhất thị trấn.'],
  ['Compare', 'My house is ___ than yours.', 'bigger', ['biger', 'more big', 'biggest'], 'big → bigger.', 'Nhà tôi to hơn nhà bạn.'],
  ['Compare', 'He is not as ___ as his brother.', 'strong', ['stronger', 'strongest', 'more strong'], 'as + tính từ gốc + as.', 'Anh ấy không khỏe bằng anh trai.'],
  ['Compare', 'Her English is ___ than before.', 'better', ['gooder', 'more good', 'best'], 'good → better.', 'Tiếng Anh của cô ấy giỏi hơn trước.'],
  ['Compare', 'Traveling by train is ___ than by car.', 'safer', ['safe', 'more safe', 'safest'], 'safe → safer.', 'Đi tàu an toàn hơn đi ô tô.'],
  ['Compare', 'This test was ___ than I expected.', 'worse', ['worst', 'badder', 'more bad'], 'bad → worse → worst.', 'Bài kiểm tra này tệ hơn tôi nghĩ.'],
  ['Compare', 'Who is the ___ student in your class?', 'tallest', ['taller', 'tall', 'most tall'], 'the + tính từ ngắn + -est.', 'Ai là học sinh cao nhất lớp bạn?'],
  // tương lai
  ['Future', 'Look at the clouds! It ___ rain.', 'is going to', ['will to', 'is go to', 'going to'], 'going to: dự đoán từ dấu hiệu hiện tại.', 'Nhìn mây kìa! Trời sắp mưa.'],
  ['Future', 'I think it ___ be sunny tomorrow.', 'will', ['is', 'does', 'are'], 'will: dự đoán, ý kiến.', 'Tôi nghĩ mai trời sẽ nắng.'],
  ['Future', 'I\'m tired. I ___ go to bed early tonight.', 'think I\'ll', ['am thinking to', 'thinking', 'will thinking'], 'Quyết định ngay lúc nói dùng will.', 'Tôi mệt. Tối nay chắc tôi đi ngủ sớm.'],
  ['Future', 'What are you ___ to do this weekend?', 'going', ['go', 'will', 'went'], 'be going to + động từ.', 'Cuối tuần này bạn định làm gì?'],
  ['Future', 'She ___ be late. She\'s still at work.', 'might', ['mights', 'mighting', 'is might'], 'might: có thể (không chắc).', 'Cô ấy có thể sẽ đến muộn.'],
  ['Future', 'Don\'t worry. I ___ help you with your bags.', 'will', ['am', 'did', 'does'], 'will: đề nghị giúp ngay lúc nói.', 'Đừng lo, tôi sẽ giúp bạn xách túi.'],
  ['Future', 'Next year I ___ to learn the guitar.', 'am going', ['go', 'did', 'was'], 'am going to: kế hoạch đã định.', 'Năm sau tôi định học guitar.'],
  ['Future', 'We ___ the cinema at 7. I\'ve bought the tickets.', 'are going to', ['will to', 'go for', 'are go to'], 'Đã có kế hoạch rõ ràng: be going to.', 'Chúng tôi sẽ đi xem phim lúc 7 giờ.'],
  // hiện tại hoàn thành
  ['Perfect', 'I have ___ been to Japan.', 'never', ['ever', 'yesterday', 'last'], 'never: chưa bao giờ.', 'Tôi chưa bao giờ đến Nhật Bản.'],
  ['Perfect', 'Have you ___ eaten sushi?', 'ever', ['never', 'yesterday', 'ago'], 'ever dùng trong câu hỏi: đã từng.', 'Bạn đã từng ăn sushi chưa?'],
  ['Perfect', 'She has ___ finished her homework.', 'already', ['yet', 'ago', 'last'], 'already: đã ... rồi.', 'Cô ấy đã làm xong bài tập rồi.'],
  ['Perfect', 'I haven\'t done it ___.', 'yet', ['already', 'ago', 'last'], 'yet: chưa (câu phủ định, câu hỏi).', 'Tôi vẫn chưa làm xong.'],
  ['Perfect', 'We have lived here ___ 2015.', 'since', ['for', 'ago', 'from'], 'since + mốc thời gian.', 'Chúng tôi sống ở đây từ năm 2015.'],
  ['Perfect', 'He has worked here ___ three years.', 'for', ['since', 'ago', 'from'], 'for + khoảng thời gian.', 'Anh ấy làm ở đây được ba năm.'],
  ['Perfect', 'I have ___ my phone. I can\'t find it.', 'lost', ['lose', 'losing', 'losed'], 'have + quá khứ phân từ: lost.', 'Tôi làm mất điện thoại rồi.'],
  ['Perfect', 'She has ___ to London twice.', 'been', ['be', 'was', 'being'], 'be → been.', 'Cô ấy đã đến Luân Đôn hai lần.'],
  ['Perfect', 'They have ___ the movie already.', 'seen', ['saw', 'see', 'seeing'], 'see → seen.', 'Họ đã xem phim rồi.'],
  ['Perfect', 'Have you ___ your lunch yet?', 'had', ['have', 'has', 'having'], 'have → had.', 'Bạn ăn trưa chưa?'],
  // động từ khuyết thiếu
  ['Modals', 'You ___ wear a seat belt in a car. (bắt buộc)', 'must', ['can', 'might', 'would'], 'must: bắt buộc.', 'Bạn phải thắt dây an toàn.'],
  ['Modals', 'You ___ smoke here. (cấm)', 'mustn\'t', ['don\'t have to', 'needn\'t', 'isn\'t'], 'mustn\'t: cấm.', 'Bạn không được hút thuốc ở đây.'],
  ['Modals', 'You ___ come early. The class starts at 10. (không cần)', 'don\'t have to', ['mustn\'t', 'can\'t', 'shouldn\'t'], 'don\'t have to: không cần thiết.', 'Bạn không cần đến sớm.'],
  ['Modals', 'You look ill. You ___ see a doctor.', 'should', ['would', 'might', 'did'], 'should: lời khuyên.', 'Trông bạn ốm, nên đi khám.'],
  ['Modals', '___ I borrow your pen, please?', 'Can', ['Does', 'Am', 'Did'], 'Can I...? xin phép.', 'Cho tôi mượn bút của bạn được không?'],
  ['Modals', '___ you help me carry this box?', 'Could', ['Did', 'Are', 'Do'], 'Could you...? nhờ vả lịch sự.', 'Bạn có thể giúp tôi bê hộp này không?'],
  ['Modals', 'I ___ swim when I was five.', 'could', ['can', 'must', 'should'], 'could: khả năng trong quá khứ.', 'Tôi biết bơi từ năm lên năm.'],
  ['Modals', '___ we go to the park? (đề nghị)', 'Shall', ['Do', 'Are', 'Does'], 'Shall we...? đề nghị cùng làm.', 'Mình đi công viên nhé?'],
  ['Modals', 'Why ___ we have a picnic?', 'don\'t', ['aren\'t', 'doesn\'t', 'can\'t'], 'Why don\'t we...? gợi ý.', 'Sao mình không đi dã ngoại nhỉ?'],
  ['Modals', 'I ___ like a cup of tea, please.', 'would', ['do', 'am', 'will'], 'I\'d like = tôi muốn (lịch sự).', 'Cho tôi một tách trà.'],
  ['Modals', 'Would you like ___ coffee?', 'some', ['any', 'a', 'an'], 'Lời mời dùng some.', 'Bạn dùng chút cà phê nhé?'],
  ['Modals', 'He has been working all day. He ___ be tired.', 'must', ['mustn\'t', 'to', 'do'], 'must be: chắc hẳn là.', 'Anh ấy làm cả ngày, chắc mệt rồi.'],
  // từ chỉ số lượng
  ['Quantity', 'How ___ water do you drink a day?', 'much', ['many', 'few', 'a lot'], 'much + danh từ không đếm được.', 'Mỗi ngày bạn uống bao nhiêu nước?'],
  ['Quantity', 'How ___ eggs do we need?', 'many', ['much', 'little', 'any'], 'many + danh từ đếm được số nhiều.', 'Chúng ta cần bao nhiêu quả trứng?'],
  ['Quantity', 'There isn\'t ___ milk left.', 'any', ['many', 'a few', 'few'], 'Câu phủ định dùng any.', 'Không còn chút sữa nào.'],
  ['Quantity', 'I have ___ friends here. (rất ít)', 'few', ['little', 'a little', 'much'], 'few + danh từ đếm được: rất ít.', 'Tôi có rất ít bạn ở đây.'],
  ['Quantity', 'We have ___ time. Hurry up! (rất ít)', 'little', ['few', 'many', 'a few'], 'little + danh từ không đếm được.', 'Chúng ta còn rất ít thời gian.'],
  ['Quantity', 'She has ___ homework today. (khá nhiều)', 'a lot of', ['many of', 'much of', 'a lots'], 'a lot of = nhiều.', 'Hôm nay cô ấy có nhiều bài tập.'],
  ['Quantity', 'There are ___ people in the room. (không ai)', 'no', ['none', 'any', 'not'], 'no + danh từ = không có.', 'Trong phòng không có ai.'],
  ['Quantity', 'Would you like ___ more rice? (một chút)', 'a little', ['a few', 'many', 'few'], 'a little + danh từ không đếm được.', 'Bạn ăn thêm chút cơm nhé?'],
  ['Quantity', 'It\'s ___ cold to go swimming today.', 'too', ['very', 'so', 'enough'], 'too + tính từ + to + V: quá ... để làm gì.', 'Hôm nay lạnh quá không đi bơi được.'],
  ['Quantity', 'She isn\'t old ___ to drive.', 'enough', ['too', 'very', 'much'], 'tính từ + enough: đủ.', 'Cô bé chưa đủ tuổi lái xe.'],
  // giới từ
  ['Preps', 'I\'ll see you ___ Monday morning.', 'on', ['in', 'at', 'by'], 'on + thứ, ngày.', 'Hẹn gặp bạn sáng thứ Hai.'],
  ['Preps', 'We usually have lunch ___ noon.', 'at', ['in', 'on', 'by'], 'at + giờ cụ thể.', 'Chúng tôi thường ăn trưa lúc 12 giờ.'],
  ['Preps', 'He was born ___ 1998.', 'in', ['on', 'at', 'by'], 'in + năm.', 'Anh ấy sinh năm 1998.'],
  ['Preps', 'She walked ___ the bridge. (băng qua)', 'across', ['between', 'behind', 'among'], 'across = băng qua.', 'Cô ấy đi bộ qua cầu.'],
  ['Preps', 'The post office is ___ the bank and the library.', 'between', ['among', 'across', 'under'], 'between = ở giữa hai vật.', 'Bưu điện nằm giữa ngân hàng và thư viện.'],
  ['Preps', 'The plane flew ___ the clouds. (phía trên)', 'above', ['under', 'behind', 'among'], 'above = ở phía trên.', 'Máy bay bay trên các đám mây.'],
  ['Preps', 'She is good ___ playing the piano.', 'at', ['in', 'on', 'with'], 'good at + V-ing.', 'Cô ấy chơi piano giỏi.'],
  ['Preps', 'I\'m interested ___ music.', 'in', ['on', 'at', 'about'], 'interested in.', 'Tôi quan tâm đến âm nhạc.'],
  ['Preps', 'He is afraid ___ spiders.', 'of', ['from', 'about', 'for'], 'afraid of.', 'Anh ấy sợ nhện.'],
  ['Preps', 'Thank you ___ your help.', 'for', ['to', 'of', 'about'], 'thank you for.', 'Cảm ơn bạn đã giúp.'],
  ['Preps', 'I\'m waiting ___ the bus.', 'for', ['to', 'at', 'on'], 'wait for.', 'Tôi đang đợi xe buýt.'],
  ['Preps', 'We arrived ___ the airport at nine.', 'at', ['to', 'on', 'into'], 'arrive at + nơi nhỏ, arrive in + thành phố.', 'Chúng tôi đến sân bay lúc 9 giờ.'],
  ['Preps', 'We arrived ___ Hanoi yesterday.', 'in', ['to', 'on', 'into'], 'arrive in + thành phố, nước.', 'Hôm qua chúng tôi đến Hà Nội.'],
  ['Preps', 'He lives ___ the second floor.', 'on', ['in', 'at', 'by'], 'on + tầng.', 'Anh ấy sống ở tầng hai.'],
  // liên từ & điều kiện
  ['Linking', 'I was tired ___ I went to bed early.', 'so', ['but', 'because', 'although'], 'so: chỉ kết quả.', 'Tôi mệt nên đi ngủ sớm.'],
  ['Linking', 'He didn\'t go out ___ it was raining.', 'because', ['so', 'but', 'or'], 'because: chỉ lý do.', 'Anh ấy không ra ngoài vì trời mưa.'],
  ['Linking', 'I like tea, ___ I don\'t like coffee.', 'but', ['so', 'because', 'or'], 'but: đối lập.', 'Tôi thích trà nhưng không thích cà phê.'],
  ['Linking', '___ it was cold, she went swimming.', 'Although', ['Because', 'So', 'But'], 'Although: mặc dù.', 'Dù trời lạnh, cô ấy vẫn đi bơi.'],
  ['Linking', 'Hurry up, ___ you\'ll miss the bus.', 'or', ['and', 'but', 'so'], 'or: nếu không thì.', 'Nhanh lên, không bạn sẽ lỡ xe buýt.'],
  ['Linking', 'If it ___ tomorrow, we will stay at home.', 'rains', ['will rain', 'rain', 'raining'], 'If + hiện tại đơn, will + V.', 'Nếu mai trời mưa, chúng tôi ở nhà.'],
  ['Linking', 'If you study hard, you ___ the exam.', 'will pass', ['passes', 'passed', 'to pass'], 'Câu điều kiện loại 1.', 'Nếu học chăm, bạn sẽ đỗ.'],
  ['Linking', 'I\'ll call you when I ___ home.', 'get', ['will get', 'got', 'getting'], 'Sau when dùng hiện tại đơn.', 'Tôi sẽ gọi bạn khi về đến nhà.'],
  ['Linking', 'Wait here ___ I come back.', 'until', ['because', 'although', 'so'], 'until: cho đến khi.', 'Đợi ở đây đến khi tôi quay lại.'],
  ['Linking', 'I stayed at home ___ I felt ill.', 'because', ['although', 'but', 'or'], 'because: vì.', 'Tôi ở nhà vì thấy ốm.'],
  // -ing hay to
  ['Gerund', 'I enjoy ___ to music.', 'listening', ['listen', 'to listen', 'listened'], 'enjoy + V-ing.', 'Tôi thích nghe nhạc.'],
  ['Gerund', 'She wants ___ a doctor.', 'to be', ['being', 'be', 'been'], 'want + to + V.', 'Cô ấy muốn làm bác sĩ.'],
  ['Gerund', 'He decided ___ a new car.', 'to buy', ['buying', 'buy', 'bought'], 'decide + to + V.', 'Anh ấy quyết định mua xe mới.'],
  ['Gerund', 'We finished ___ the room at six.', 'cleaning', ['to clean', 'clean', 'cleaned'], 'finish + V-ing.', 'Chúng tôi dọn xong phòng lúc 6 giờ.'],
  ['Gerund', 'I\'m looking forward to ___ you.', 'seeing', ['see', 'to see', 'saw'], 'look forward to + V-ing.', 'Tôi mong được gặp bạn.'],
  ['Gerund', 'She can\'t stop ___. The joke was so funny.', 'laughing', ['to laugh', 'laugh', 'laughed'], 'stop + V-ing: ngừng làm gì.', 'Cô ấy không nhịn được cười.'],
  ['Gerund', 'Would you like ___ with us?', 'to come', ['coming', 'come', 'came'], 'would like + to + V.', 'Bạn có muốn đi cùng chúng tôi không?'],
  ['Gerund', 'He avoided ___ the question.', 'answering', ['to answer', 'answer', 'answered'], 'avoid + V-ing.', 'Anh ấy tránh trả lời câu hỏi.'],
  // mệnh đề quan hệ
  ['Relative', 'The man ___ lives next door is a doctor.', 'who', ['which', 'whose', 'where'], 'who thay cho người.', 'Người đàn ông ở cạnh nhà là bác sĩ.'],
  ['Relative', 'This is the book ___ I told you about.', 'that', ['who', 'where', 'whose'], 'that/which thay cho vật.', 'Đây là quyển sách tôi đã kể với bạn.'],
  ['Relative', 'That\'s the school ___ I studied.', 'where', ['who', 'whose', 'when'], 'where thay cho nơi chốn.', 'Đó là ngôi trường tôi từng học.'],
  ['Relative', 'She\'s the girl ___ bike was stolen.', 'whose', ['who', 'which', 'where'], 'whose chỉ sở hữu.', 'Cô ấy là cô gái bị mất xe đạp.'],
  ['Relative', 'A dentist is a person ___ looks after your teeth.', 'who', ['which', 'where', 'what'], 'who thay cho người.', 'Nha sĩ là người chăm sóc răng của bạn.'],
  ['Relative', 'A library is a place ___ you can borrow books.', 'where', ['who', 'which', 'whose'], 'where thay cho nơi chốn.', 'Thư viện là nơi bạn mượn được sách.'],
  // mạo từ & sở hữu
  ['Articles', '___ moon goes around the Earth.', 'The', ['A', 'An', 'Some'], 'the: vật duy nhất.', 'Mặt trăng quay quanh Trái Đất.'],
  ['Articles', 'This is Tom\'s bag. It\'s ___.', 'his', ['him', 'he', 'he\'s'], 'his: của anh ấy (đứng một mình).', 'Đây là túi của Tom, của anh ấy.'],
  ['Articles', 'Is this pen ___? (của bạn)', 'yours', ['your', 'you', 'yourself'], 'yours: của bạn (đứng một mình).', 'Cây bút này của bạn à?'],
  ['Articles', 'My parents live in Da Nang. ___ house is big.', 'Their', ['They', 'Them', 'There'], 'their: của họ.', 'Nhà của bố mẹ tôi rất to.'],
  ['Articles', 'The dog is wagging ___ tail.', 'its', ['it\'s', 'their', 'itself'], 'its: của nó (it\'s = it is).', 'Con chó đang vẫy đuôi.'],
  ['Articles', 'I need ___ umbrella. It\'s raining.', 'an', ['a', 'some', 'two'], 'umbrella bắt đầu bằng nguyên âm → an.', 'Tôi cần một cái ô vì trời mưa.'],
  ['Articles', 'He plays ___ guitar very well.', 'the', ['a', 'an', 'some'], 'the + tên nhạc cụ.', 'Anh ấy chơi guitar rất giỏi.'],
  // tính từ hay trạng từ
  ['WordForms', 'She sings ___.', 'beautifully', ['beautiful', 'beauty', 'beautify'], 'Trạng từ bổ nghĩa động từ: -ly.', 'Cô ấy hát rất hay.'],
  ['WordForms', 'He drives very ___.', 'carefully', ['careful', 'care', 'careless'], 'careful → carefully.', 'Anh ấy lái xe rất cẩn thận.'],
  ['WordForms', 'It was a very ___ film. I cried.', 'sad', ['sadly', 'sadness', 'to sad'], 'Tính từ đứng trước danh từ.', 'Bộ phim rất buồn, tôi đã khóc.'],
  ['WordForms', 'She plays tennis very ___.', 'well', ['good', 'nice', 'goodly'], 'good (tính từ) → well (trạng từ).', 'Cô ấy chơi quần vợt rất giỏi.'],
  ['WordForms', 'He is a very ___ driver.', 'good', ['well', 'goodly', 'best'], 'Tính từ đứng trước danh từ.', 'Anh ấy là tài xế rất giỏi.'],
  ['WordForms', 'The test was ___ easy. Everyone passed.', 'really', ['real', 'reality', 'more'], 'Trạng từ bổ nghĩa cho tính từ.', 'Bài kiểm tra rất dễ nên ai cũng đỗ.'],
  ['WordForms', 'She spoke so ___ that I couldn\'t hear her.', 'quietly', ['quiet', 'quieter', 'quietness'], 'Trạng từ bổ nghĩa động từ.', 'Cô ấy nói nhỏ đến nỗi tôi không nghe được.'],
  ['WordForms', 'The soup smells ___.', 'delicious', ['deliciously', 'deliciousness', 'delight'], 'smell + tính từ.', 'Món súp thơm ngon.'],
  // dạng câu hỏi
  ['QForms', '___ do you usually get up? – At six.', 'What time', ['How', 'Where', 'Who'], 'What time = mấy giờ.', 'Bạn thường dậy lúc mấy giờ?'],
  ['QForms', '___ long is the film? – Two hours.', 'How', ['What', 'Which', 'Who'], 'How long = bao lâu.', 'Bộ phim dài bao lâu?'],
  ['QForms', '___ do you go to the gym? – Twice a week.', 'How often', ['How much', 'How long', 'How many'], 'How often = bao lâu một lần.', 'Bạn đi tập bao lâu một lần?'],
  ['QForms', '___ bag is this? – It\'s mine.', 'Whose', ['Who', 'Who\'s', 'What'], 'Whose = của ai.', 'Cái túi này của ai?'],
  ['QForms', '___ you been to Paris? – Yes, twice.', 'Have', ['Did', 'Are', 'Do'], 'Have you been...? hiện tại hoàn thành.', 'Bạn đã đến Paris chưa?'],
  ['QForms', 'You like jazz, ___ you?', 'don\'t', ['do', 'aren\'t', 'didn\'t'], 'Câu hỏi đuôi: khẳng định → phủ định.', 'Bạn thích nhạc jazz, đúng không?'],
  ['QForms', 'She is a nurse, ___?', 'isn\'t she', ['doesn\'t she', 'is she', 'isn\'t he'], 'Câu hỏi đuôi với to be.', 'Cô ấy là y tá, đúng không?'],
  ['QForms', 'They didn\'t come, ___?', 'did they', ['didn\'t they', 'do they', 'were they'], 'Phủ định → khẳng định.', 'Họ không đến, đúng không?'],
  ['QForms', '___ is the nearest bank? – Over there.', 'Where', ['When', 'Who', 'Why'], 'Where = ở đâu.', 'Ngân hàng gần nhất ở đâu?'],
  ['QForms', '___ did you buy that jacket? – Last Saturday.', 'When', ['Where', 'What', 'Who'], 'When = khi nào.', 'Bạn mua áo đó khi nào?'],
  // cụm động từ
  ['Phrasal', 'Please ___ your shoes before you enter.', 'take off', ['take on', 'put off', 'turn off'], 'take off = cởi ra.', 'Hãy cởi giày trước khi vào.'],
  ['Phrasal', 'It\'s cold. ___ your jacket!', 'Put on', ['Take off', 'Turn on', 'Get up'], 'put on = mặc vào.', 'Trời lạnh, mặc áo khoác vào!'],
  ['Phrasal', 'Can you ___ the TV? It\'s too loud.', 'turn down', ['turn up', 'turn into', 'turn on'], 'turn down = vặn nhỏ.', 'Bạn vặn nhỏ tivi được không?'],
  ['Phrasal', 'I\'m ___ for my keys. Have you seen them?', 'looking', ['watching', 'seeing', 'finding'], 'look for = tìm kiếm.', 'Tôi đang tìm chìa khóa.'],
  ['Phrasal', 'The plane ___ at 6 a.m.', 'took off', ['took on', 'took up', 'took in'], 'take off = cất cánh.', 'Máy bay cất cánh lúc 6 giờ sáng.'],
  ['Phrasal', 'Please ___ this form.', 'fill in', ['fill at', 'fill to', 'fill by'], 'fill in = điền vào.', 'Vui lòng điền vào mẫu này.'],
  ['Phrasal', 'I get ___ well with my neighbors.', 'on', ['in', 'at', 'up'], 'get on with = hòa thuận với.', 'Tôi hòa thuận với hàng xóm.'],
  ['Phrasal', 'He gave ___ smoking last year.', 'up', ['in', 'out', 'off'], 'give up = từ bỏ.', 'Năm ngoái anh ấy bỏ thuốc.'],
  ['Phrasal', 'Please ___ the lights when you leave.', 'turn off', ['turn on', 'turn up', 'turn in'], 'turn off = tắt.', 'Khi đi hãy tắt đèn.'],
  ['Phrasal', 'We ran ___ of milk.', 'out', ['off', 'up', 'down'], 'run out of = hết.', 'Chúng tôi hết sữa rồi.'],
  ['Phrasal', 'Please ___ your name on the list.', 'write down', ['write on', 'write in up', 'write out of'], 'write down = ghi lại.', 'Hãy ghi tên vào danh sách.'],
  ['Phrasal', 'I\'ll pick you ___ at the station at six.', 'up', ['out', 'off', 'down'], 'pick up = đón.', 'Tôi sẽ đón bạn ở nhà ga lúc 6 giờ.'],
  // giao tiếp hằng ngày
  ['Functions', 'Excuse me, how do I get to the station? – ___', 'Go straight and turn left.', ['I\'m fine, thanks.', 'It\'s two o\'clock.', 'Yes, I do.'], 'Chỉ đường: Go straight, turn left.'],
  ['Functions', 'Could I have the bill, please? – ___', 'Of course. Here you are.', ['Nice to meet you.', 'No, I\'m not.', 'See you later.'], 'Đáp lại lời nhờ: Of course.'],
  ['Functions', 'Would you like to come to my party? – ___', 'Yes, I\'d love to!', ['Yes, I do.', 'Yes, I am.', 'I\'m fine.'], 'Nhận lời mời: I\'d love to!'],
  ['Functions', 'What\'s the matter? – ___', 'I have a headache.', ['I\'m a teacher.', 'It\'s on the table.', 'At seven.'], 'What\'s the matter? = bạn bị sao thế?'],
  ['Functions', 'How much is this shirt? – ___', 'It\'s twenty dollars.', ['It\'s twenty o\'clock.', 'It\'s twenty years.', 'I have twenty.'], 'Hỏi giá: How much...?'],
  ['Functions', 'Can I help you? – ___', 'I\'m looking for a jacket.', ['I\'m fine, thanks.', 'It\'s Monday.', 'You\'re welcome.'], 'Nhân viên hỏi: Can I help you?'],
  ['Functions', 'What do you think of this film? – ___', 'I think it\'s great!', ['It\'s at seven o\'clock.', 'Yes, I think.', 'I\'m thinking home.'], 'Hỏi ý kiến: What do you think of...?'],
  ['Functions', 'Sorry I\'m late! – ___', 'Never mind.', ['You\'re welcome.', 'Same to you.', 'Good idea.'], 'Never mind = không sao.'],
  ['Functions', 'Why don\'t we go to the beach? – ___', 'Good idea!', ['No, we don\'t.', 'Yes, we are.', 'It\'s near.'], 'Đáp lại gợi ý: Good idea!'],
  ['Functions', 'Hello, can I speak to Anna, please? – ___', 'Speaking.', ['Nice to meet you.', 'I am speak.', 'It\'s me phone.'], 'Nghe điện thoại: Speaking = tôi đây.'],
  ['Functions', 'Have a nice weekend! – ___', 'You too!', ['Yes, I have.', 'It\'s Saturday.', 'I\'m sorry.'], 'You too = bạn cũng vậy nhé.'],
  ['Functions', 'I\'m sorry, I can\'t come. – ___', 'Don\'t worry.', ['You\'re welcome.', 'Happy birthday.', 'Good morning.'], 'Don\'t worry = đừng lo.'],
  ['Functions', 'Do you mind if I open the window? – ___', 'No, go ahead.', ['Yes, I am.', 'I\'m open.', 'Sorry, you opened.'], 'No, go ahead = không sao, cứ mở.'],
  ['Functions', 'Could you tell me the way to the museum? – ___', 'Sure. It\'s next to the park.', ['Yes, I could.', 'I\'m a museum.', 'At eight.'], 'Chỉ đường: It\'s next to...'],
  ['Functions', 'I\'d like a table for two, please. – ___', 'Certainly. Follow me.', ['I\'m twenty.', 'It\'s two o\'clock.', 'You\'re two.'], 'Đặt bàn nhà hàng.'],
  ['Functions', 'Would you like sugar in your tea? – ___', 'No, thanks. I don\'t take sugar.', ['Yes, I am.', 'No, I don\'t like.', 'I\'m tea.'], 'Từ chối lịch sự: No, thanks.'],
];
for (const [topic, prompt, correct, wrong, explain, sub] of G) add(mcq(topic, prompt, correct, wrong, { explain, sub }));

// fill: [chủ đề, câu có ___, [đáp án nhận], gợi ý tiếng Việt, giải thích]
const F = [
  ['PastSimple', 'Yesterday we ___ to the zoo. (go)', ['went'], 'Hôm qua chúng tôi đi sở thú.', 'go → went.'],
  ['PastSimple', 'She ___ a letter last week. (write)', ['wrote'], 'Tuần trước cô ấy viết một lá thư.', 'write → wrote.'],
  ['PastSimple', 'I ___ my keys yesterday. (lose)', ['lost'], 'Hôm qua tôi làm mất chìa khóa.', 'lose → lost.'],
  ['PastSimple', 'They ___ a movie last night. (see)', ['saw'], 'Tối qua họ xem phim.', 'see → saw.'],
  ['PastSimple', 'He ___ a new bike for his birthday. (get)', ['got'], 'Anh ấy được tặng xe đạp mới.', 'get → got.'],
  ['PastSimple', 'We ___ pasta for lunch yesterday. (eat)', ['ate'], 'Hôm qua chúng tôi ăn mì Ý.', 'eat → ate.'],
  ['PastSimple', 'She ___ me a lovely present. (give)', ['gave'], 'Cô ấy tặng tôi một món quà đẹp.', 'give → gave.'],
  ['PastSimple', 'I ___ my phone at home this morning. (leave)', ['left'], 'Sáng nay tôi để quên điện thoại ở nhà.', 'leave → left.'],
  ['PastSimple', 'He ___ his leg when he was ten. (break)', ['broke'], 'Anh ấy gãy chân năm mười tuổi.', 'break → broke.'],
  ['PastSimple', 'The children ___ very loudly. (sing)', ['sang'], 'Bọn trẻ hát rất to.', 'sing → sang.'],
  ['PastSimple', 'I didn\'t ___ the way. (know)', ['know'], 'Tôi không biết đường.', 'didn\'t + V nguyên mẫu.'],
  ['PastSimple', 'I didn\'t ___ TV last night. (watch)', ['watch'], 'Tối qua tôi không xem tivi.', 'didn\'t + V nguyên mẫu.'],
  ['PastSimple', '___ you go out last night?', ['did'], 'Tối qua bạn có đi chơi không?', 'Câu hỏi quá khứ: Did...?'],
  ['PastSimple', 'Where ___ you yesterday? (be)', ['were'], 'Hôm qua bạn ở đâu?', 'you → were.'],
  ['PastSimple', 'He ___ at home last night. (be)', ['was'], 'Tối qua anh ấy ở nhà.', 'he → was.'],
  ['Compare', 'My brother is ___ than me. (tall)', ['taller'], 'Anh tôi cao hơn tôi.', 'tall → taller.'],
  ['Compare', 'This is the ___ cake I\'ve ever eaten. (good)', ['best'], 'Đây là cái bánh ngon nhất tôi từng ăn.', 'good → best.'],
  ['Compare', 'Today is ___ than yesterday. (cold)', ['colder'], 'Hôm nay lạnh hơn hôm qua.', 'cold → colder.'],
  ['Compare', 'This bag is ___ than that one. (cheap)', ['cheaper'], 'Cái túi này rẻ hơn cái kia.', 'cheap → cheaper.'],
  ['Compare', 'She is the ___ girl in the class. (tall)', ['tallest'], 'Cô ấy là bạn nữ cao nhất lớp.', 'tall → tallest.'],
  ['Compare', 'This film is ___ than the book. (bad)', ['worse'], 'Bộ phim này tệ hơn quyển sách.', 'bad → worse.'],
  ['Future', 'Look at those clouds! It is going ___ rain.', ['to'], 'Nhìn mây kìa! Trời sắp mưa.', 'be going to + V.'],
  ['Future', 'I think I ___ pass the exam. (sẽ)', ['will', 'll'], 'Tôi nghĩ mình sẽ đỗ.', 'will + V.'],
  ['Future', 'We are ___ to visit Hue next month.', ['going'], 'Tháng sau chúng tôi định thăm Huế.', 'be going to.'],
  ['Perfect', 'I have ___ finished my homework. (rồi)', ['already'], 'Tôi đã làm xong bài tập rồi.', 'already = đã ... rồi.'],
  ['Perfect', 'Have you finished your work ___? (chưa)', ['yet'], 'Bạn làm xong việc chưa?', 'yet = chưa.'],
  ['Perfect', 'We have lived here ___ 2018.', ['since'], 'Chúng tôi sống ở đây từ năm 2018.', 'since + mốc thời gian.'],
  ['Perfect', 'She has worked here ___ five years.', ['for'], 'Cô ấy làm ở đây năm năm rồi.', 'for + khoảng thời gian.'],
  ['Perfect', 'I have never ___ sushi. (eat)', ['eaten'], 'Tôi chưa bao giờ ăn sushi.', 'eat → eaten.'],
  ['Perfect', 'He has ___ to Japan three times. (be)', ['been'], 'Anh ấy đã đến Nhật ba lần.', 'be → been.'],
  ['Modals', 'You ___ wear a helmet. It\'s the law. (bắt buộc)', ['must'], 'Bạn phải đội mũ bảo hiểm.', 'must = bắt buộc.'],
  ['Modals', 'You ___ park here. It\'s forbidden. (cấm)', ['mustn\'t', 'must not'], 'Bạn không được đỗ xe ở đây.', 'mustn\'t = cấm.'],
  ['Modals', 'I\'m very tired. I ___ go to bed early. (nên)', ['should'], 'Tôi rất mệt, nên đi ngủ sớm.', 'should = nên.'],
  ['Modals', '___ we go to the cinema? (đề nghị)', ['shall'], 'Mình đi xem phim nhé?', 'Shall we...?'],
  ['Modals', 'I would ___ a coffee, please. (muốn)', ['like'], 'Cho tôi một ly cà phê.', 'would like = muốn.'],
  ['Modals', 'Why ___ we have a picnic? (gợi ý)', ['don\'t', 'do not'], 'Sao mình không đi dã ngoại nhỉ?', 'Why don\'t we...?'],
  ['Quantity', 'How ___ sugar do you want?', ['much'], 'Bạn muốn bao nhiêu đường?', 'much + danh từ không đếm được.'],
  ['Quantity', 'How ___ students are there in your class?', ['many'], 'Lớp bạn có bao nhiêu học sinh?', 'many + danh từ đếm được.'],
  ['Quantity', 'There are only ___ apples left. (rất ít)', ['few'], 'Chỉ còn rất ít quả táo.', 'few + danh từ đếm được.'],
  ['WordForms', 'He drives very ___. (careful)', ['carefully'], 'Anh ấy lái xe rất cẩn thận.', 'careful → carefully.'],
  ['WordForms', 'She speaks English very ___. (good)', ['well'], 'Cô ấy nói tiếng Anh rất giỏi.', 'good → well.'],
  ['Linking', 'If it rains, we ___ stay at home.', ['will', 'll'], 'Nếu trời mưa, chúng tôi sẽ ở nhà.', 'Điều kiện loại 1.'],
  ['Linking', 'I\'ll wait ___ you finish. (cho đến khi)', ['until'], 'Tôi sẽ đợi đến khi bạn xong.', 'until = cho đến khi.'],
  ['Linking', 'I was tired, ___ I went to bed early. (nên)', ['so'], 'Tôi mệt nên đi ngủ sớm.', 'so = nên.'],
  ['Linking', 'I like tea, ___ I don\'t like coffee.', ['but'], 'Tôi thích trà nhưng không thích cà phê.', 'but = nhưng.'],
  ['Linking', '___ it was cold, he went swimming. (mặc dù)', ['although', 'though'], 'Dù trời lạnh, anh ấy vẫn đi bơi.', 'although = mặc dù.'],
  ['Linking', 'Do you want tea ___ coffee?', ['or'], 'Bạn muốn trà hay cà phê?', 'or = hoặc.'],
  ['Preps', 'He is afraid ___ dogs.', ['of'], 'Anh ấy sợ chó.', 'afraid of.'],
  ['Preps', 'She is good ___ cooking.', ['at'], 'Cô ấy nấu ăn giỏi.', 'good at.'],
  ['Preps', 'I\'m interested ___ history.', ['in'], 'Tôi quan tâm đến lịch sử.', 'interested in.'],
  ['Preps', 'Thank you ___ your help.', ['for'], 'Cảm ơn bạn đã giúp.', 'thank you for.'],
  ['Preps', 'We arrived ___ the station at nine.', ['at'], 'Chúng tôi đến nhà ga lúc 9 giờ.', 'arrive at.'],
  ['Relative', 'The man ___ lives next door is a doctor.', ['who', 'that'], 'Người đàn ông ở cạnh nhà là bác sĩ.', 'who thay cho người.'],
  ['Relative', 'This is the book ___ I told you about.', ['that', 'which'], 'Đây là quyển sách tôi đã kể.', 'that/which thay cho vật.'],
  ['Relative', 'She is the girl ___ bike was stolen.', ['whose'], 'Cô ấy là cô gái bị mất xe.', 'whose = của người mà.'],
  ['Articles', 'This pen is not mine. It\'s ___. (của bạn)', ['yours'], 'Cây bút này là của bạn.', 'yours = của bạn.'],
  ['Articles', 'The cat is washing ___ face.', ['its'], 'Con mèo đang rửa mặt.', 'its = của nó.'],
  ['Phrasal', 'Please take ___ your shoes. (cởi)', ['off'], 'Làm ơn cởi giày.', 'take off.'],
  ['Phrasal', 'It\'s cold. Put ___ your coat.', ['on'], 'Trời lạnh, mặc áo khoác vào.', 'put on.'],
  ['Phrasal', 'Please turn ___ the lights. (tắt)', ['off'], 'Làm ơn tắt đèn.', 'turn off.'],
  ['Phrasal', 'We ran ___ of milk.', ['out'], 'Chúng tôi hết sữa.', 'run out of.'],
  ['Phrasal', 'I get ___ well with my sister.', ['on'], 'Tôi hòa thuận với chị mình.', 'get on with.'],
  ['Phrasal', 'Don\'t give ___! Try again. (bỏ cuộc)', ['up'], 'Đừng bỏ cuộc, thử lại đi!', 'give up.'],
  ['Phrasal', 'I\'m looking ___ my keys.', ['for'], 'Tôi đang tìm chìa khóa.', 'look for.'],
  ['QForms', 'You like jazz, ___ you? (câu hỏi đuôi)', ['don\'t', 'do not'], 'Bạn thích nhạc jazz, đúng không?', 'Khẳng định → phủ định.'],
  ['QForms', '___ often do you go swimming?', ['how'], 'Bạn đi bơi bao lâu một lần?', 'How often...?'],
  ['QForms', '___ bag is this? It\'s mine.', ['whose'], 'Cái túi này của ai?', 'Whose = của ai.'],
  ['Gerund', 'I enjoy ___ to music. (listen)', ['listening'], 'Tôi thích nghe nhạc.', 'enjoy + V-ing.'],
  ['Gerund', 'She wants ___ be a pilot.', ['to'], 'Cô ấy muốn làm phi công.', 'want to + V.'],
  ['Gerund', 'I\'m looking forward to ___ you. (see)', ['seeing'], 'Tôi mong được gặp bạn.', 'look forward to + V-ing.'],
];
for (const [topic, prompt, answers, sub, explain] of F) {
  add(fill(topic, prompt, answers, { mode: 'sentence', sub, explain, full: prompt.replace('___', answers[0]).replace(/\s*\(.*?\)/, '') }));
}

export const BANK_SIZE = { mcq: bank.mcq.length, fill: bank.fill.length };
export const topicList = () => Object.entries(TOPICS).map(([id, [en, vi, icon]]) => ({ id, en, vi, icon, mcq: bank.mcq.filter((q) => q.topic === id).length, fill: bank.fill.filter((q) => q.topic === id).length })).filter((t) => t.mcq + t.fill > 0);

// ---- Bốc câu: xáo trộn, hết thì xáo lại; không lặp chủ đề liền nhau ----
const decks = { mcq: [], fill: [] };
let lastTopic = null;
function draw(kind, topic) {
  const pool = bank[kind].filter((q) => !topic || topic === 'all' || q.topic === topic);
  if (!pool.length) return null;
  const used = decks[kind];
  let cand = pool.filter((q) => !used.includes(q));
  if (!cand.length) { for (const q of pool) { const i = used.indexOf(q); if (i >= 0) used.splice(i, 1); } cand = pool; }
  let pick = null;
  for (let i = 0; i < 8; i++) { pick = rnd(cand); if (pick.topic !== lastTopic || cand.length < 3) break; }
  used.push(pick);
  return pick;
}
export function resetDecks() { decks.mcq.length = 0; decks.fill.length = 0; lastTopic = null; }
// mode: mix | mcq | fill; n: số câu đã ra (để xen kẽ 2 trắc nghiệm / 1 điền từ)
export function nextQuestion({ mode = 'mix', topic = 'all' } = {}, n = 0) {
  const want = mode === 'mix' ? ['mcq', 'fill', 'mcq'][n % 3] : mode;
  const q = draw(want, topic) || draw(want === 'mcq' ? 'fill' : 'mcq', topic);
  if (q) lastTopic = q.topic;
  return q;
}

// ---- Chấm điểm ----
export function norm(s) {
  return String(s ?? '').toLowerCase().replace(/[’‘`´]/g, "'").replace(/'/g, '').replace(/[.,!?;:"“”()]/g, ' ').replace(/\s+/g, ' ').trim();
}
// Trả về 'A'..'D' nếu bình luận là một đáp án trắc nghiệm hợp lệ, ngược lại null
export function parseChoice(q, text) {
  const t = norm(text).replace(/^(dap an|đáp án|chon|chọn|answer|ans)\s+/, '');
  if (/^[abcd]$/.test(t)) return t.toUpperCase();
  const hit = q.options.find((o) => norm(o.t) === t);
  return hit ? hit.k : null;
}
export const isFillAttempt = (text) => /^[a-zA-Z' ’]{1,24}$/.test(String(text).trim()) && String(text).trim().split(/\s+/).length <= 2;
export const checkFill = (q, text) => q.answers.map(norm).includes(norm(text));
