// Bộ bài Ngày 5: từ vựng và câu mẫu ở mức A2 trở xuống.
// Nhịp cố định: 3 câu điền từ tiếng Anh theo nghĩa tiếng Việt, rồi 1 câu chọn câu đúng.
const KEYS = ["A", "B", "C", "D"];
const shuffle = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const NGAY5_TOPICS = {
  Vocabulary: ["Vocabulary", "Điền từ tiếng Anh theo nghĩa tiếng Việt", "🔤"],
  Sentence: ["Choose the Sentence", "Chọn câu tiếng Anh đúng", "🔎"],
};

// [từ tiếng Anh, nghĩa tiếng Việt]
const WORDS = [
  ["apple", "quả táo"], ["banana", "quả chuối"], ["bread", "bánh mì"],
  ["cheese", "phô mai"], ["chicken", "thịt gà"], ["coffee", "cà phê"],
  ["dinner", "bữa tối"], ["eggs", "trứng"], ["fish", "cá"], ["fruit", "trái cây"],
  ["grapes", "quả nho"], ["lunch", "bữa trưa"], ["milk", "sữa"], ["rice", "cơm, gạo"],
  ["sugar", "đường"], ["water", "nước"], ["breakfast", "bữa sáng"], ["vegetables", "rau củ"],
  ["family", "gia đình"], ["friend", "bạn bè"], ["mother", "mẹ"], ["father", "bố"],
  ["sister", "chị/em gái"], ["brother", "anh/em trai"], ["child", "đứa trẻ"],
  ["children", "trẻ em"], ["teacher", "giáo viên"], ["student", "học sinh"],
  ["doctor", "bác sĩ"], ["nurse", "y tá"], ["house", "ngôi nhà"], ["bedroom", "phòng ngủ"],
  ["kitchen", "nhà bếp"], ["bathroom", "phòng tắm"], ["garden", "vườn"],
  ["window", "cửa sổ"], ["door", "cửa ra vào"], ["table", "cái bàn"], ["chair", "cái ghế"],
  ["school", "trường học"], ["office", "văn phòng"], ["shop", "cửa hàng"],
  ["market", "chợ"], ["hospital", "bệnh viện"], ["station", "nhà ga"],
  ["airport", "sân bay"], ["street", "đường phố"], ["park", "công viên"],
  ["morning", "buổi sáng"], ["afternoon", "buổi chiều"], ["evening", "buổi tối"],
  ["weekend", "cuối tuần"], ["Monday", "thứ Hai"], ["summer", "mùa hè"],
  ["winter", "mùa đông"], ["weather", "thời tiết"], ["sunny", "có nắng"],
  ["rainy", "có mưa"], ["cloudy", "nhiều mây"], ["hungry", "đói"],
  ["thirsty", "khát"], ["tired", "mệt"], ["happy", "vui vẻ"], ["busy", "bận rộn"],
  ["early", "sớm"], ["late", "muộn"], ["cheap", "rẻ"], ["expensive", "đắt"],
  ["beautiful", "đẹp"], ["friendly", "thân thiện"], ["important", "quan trọng"],
  ["easy", "dễ"], ["difficult", "khó"], [" arrive", "đến"], ["answer", "trả lời"],
  ["ask", "hỏi"], ["buy", "mua"], ["clean", "dọn dẹp"], ["cook", "nấu ăn"],
  [" help", "giúp đỡ"], ["listen", "lắng nghe"], [" open", "mở"], [" speak", "nói"],
].map(([word, meaning]) => [word.trim(), meaning]);

// [câu tiếng Việt, câu đúng, ba câu sai] — câu ngắn, ngữ pháp cơ bản.
const SENTENCES = [
  ["Tôi đi học bằng xe buýt.", "I go to school by bus.", ["I goes to school by bus.", "I go to school on bus.", "I going to school by bus."]],
  ["Cô ấy thích đọc sách.", "She likes reading books.", ["She like reading books.", "She likes read books.", "She is like reading books."]],
  ["Họ đang chơi bóng đá.", "They are playing football.", ["They is playing football.", "They are play football.", "They playing football."]],
  ["Anh trai tôi làm việc ở ngân hàng.", "My brother works at a bank.", ["My brother work at a bank.", "My brother working at a bank.", "My brother works in bank."]],
  ["Bạn có thể giúp tôi không?", "Can you help me?", ["Do you can help me?", "Can you to help me?", "Can you helps me?"]],
  ["Hôm qua chúng tôi ở nhà.", "We were at home yesterday.", ["We was at home yesterday.", "We are at home yesterday.", "We were home in yesterday."]],
  ["Mẹ tôi đang nấu bữa tối.", "My mother is cooking dinner.", ["My mother cooking dinner.", "My mother are cooking dinner.", "My mother is cook dinner."]],
  ["Cửa hàng mở cửa lúc chín giờ.", "The shop opens at nine o'clock.", ["The shop open at nine o'clock.", "The shop opens in nine o'clock.", "The shop opening at nine o'clock."]],
  ["Tôi không uống cà phê.", "I do not drink coffee.", ["I am not drink coffee.", "I does not drink coffee.", "I do not drinks coffee."]],
  ["Trời hôm nay rất đẹp.", "The weather is very nice today.", ["The weather are very nice today.", "The weather very nice today.", "The weather is very nicely today."]],
  ["Cô ấy đến trường sớm.", "She arrives at school early.", ["She arrive at school early.", "She arrives to school early.", "She is arrive at school early."]],
  ["Chúng tôi thường ăn trưa lúc mười hai giờ.", "We usually have lunch at twelve.", ["We usually has lunch at twelve.", "We have usually lunch at twelve.", "We usually have lunch in twelve."]],
  ["Bạn đang nghe nhạc à?", "Are you listening to music?", ["Do you listening to music?", "Are you listen to music?", "Is you listening to music?"]],
  ["Tôi đã mua một chiếc áo mới hôm qua.", "I bought a new shirt yesterday.", ["I buy a new shirt yesterday.", "I bought yesterday a new shirt.", "I did bought a new shirt yesterday."]],
  ["Em gái tôi cao hơn tôi.", "My sister is taller than me.", ["My sister is more tall than me.", "My sister taller than me.", "My sister is tallest than me."]],
  ["Có một quyển sách trên bàn.", "There is a book on the table.", ["There are a book on the table.", "There is book on the table.", "It is a book on table."]],
  ["Họ sẽ thăm bà vào Chủ nhật.", "They will visit Grandma on Sunday.", ["They will visits Grandma on Sunday.", "They visit Grandma in Sunday.", "They are will visit Grandma on Sunday."]],
  ["Tôi muốn một cốc nước.", "I would like a glass of water.", ["I like a glass water.", "I would like glass of water.", "I would likes a glass of water."]],
  ["Anh ấy không thể bơi.", "He cannot swim.", ["He cannot swims.", "He does not can swim.", "He cannot to swim."]],
  ["Chúng tôi sống trong một căn hộ nhỏ.", "We live in a small apartment.", ["We lives in a small apartment.", "We live on a small apartment.", "We are live in a small apartment."]],
];

const makeWord = ([word, meaning]) => ({
  type: "fill", topic: "Vocabulary", prompt: "Điền từ tiếng Anh", emoji: null,
  sub: meaning, answers: [word.toLowerCase()], mode: "spell", hard: true,
  tiles: null, full: null, explain: `${word} = ${meaning}`,
});
const makeSentence = ([vi, correct, wrong]) => {
  const options = shuffle([correct, ...wrong]);
  return {
    type: "mcq", topic: "Sentence", prompt: vi, emoji: null,
    sub: "Chọn câu tiếng Anh đúng",
    options: options.map((t, i) => ({ k: KEYS[i], t })),
    answerKey: KEYS[options.indexOf(correct)], answers: [correct],
    explain: `${vi} → ${correct}`,
  };
};

const SIZE = Math.min(WORDS.length, SENTENCES.length * 4);
const meta = Array.from({ length: SIZE }, (_, i) => ({
  topic: i % 4 === 3 ? "Sentence" : "Vocabulary",
  type: i % 4 === 3 ? "mcq" : "fill",
  mode: i % 4 === 3 ? null : "spell",
}));
export const NGAY5_SIZE = SIZE;
export const ngay5Meta = meta;
export function ngay5At(i) {
  const index = ((i % SIZE) + SIZE) % SIZE;
  return index % 4 === 3
    ? makeSentence(SENTENCES[Math.floor(index / 4) % SENTENCES.length])
    : makeWord(WORDS[index - Math.floor(index / 4)]);
}
