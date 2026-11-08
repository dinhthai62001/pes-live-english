// Bộ bài "Ngày 1": 100 bài mới, trình độ cao hơn ngân hàng cũ (questions-cu.js).
// Gồm 3 dạng: 'mcq' (chọn A/B/C/D, B1), 'Pick' (1 câu tiếng Việt + 4 câu tiếng Anh, A2) và 'translate' (dịch câu Việt → Anh, 3–7 từ, có giải thích mẫu câu + thì).
// Thứ tự ra bài cố định (xen kẽ 3 dạng, dễ → khó), hết 100 câu thì lặp lại từ đầu.

const KEYS = ['A', 'B', 'C', 'D'];
const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

export const NGAY1_TOPICS = {
  Translate: ['Translate', 'Dịch câu Việt → Anh', '🌐'],
  Pick: ['Pick the Sentence', 'Chọn câu tiếng Anh đúng', '🔎'],
  Passive: ['Passive Voice', 'Câu bị động', '🔄'],
  Conditionals: ['Conditionals', 'Câu điều kiện loại 0, 2', '🔀'],
  Reported: ['Reported Speech', 'Câu gián tiếp', '🗣️'],
  B1Vocab: ['Word Power', 'Từ vựng nâng cao', '💎'],
};

// ---- Dịch câu: [tiếng Việt, [các đáp án nhận], "Mẫu câu · Thì"] ----
const T = [
  ['Tôi đi học bằng xe buýt.', ['I go to school by bus.'], 'Mẫu: go to + nơi chốn; by + phương tiện · Thì: hiện tại đơn (thói quen).'],
  ['Cô ấy thích đọc sách.', ['She likes reading books.', 'She likes to read books.', 'She likes reading.', 'She likes books.'], 'Mẫu: like + V-ing (thích làm gì) · Thì: hiện tại đơn (she → likes).'],
  ['Bạn đến từ đâu?', ['Where are you from?'], 'Mẫu: Where + be + S + from? · Thì: hiện tại đơn (động từ be).'],
  ['Mẹ tôi đang ngủ.', ['My mother is sleeping.', 'My mom is sleeping.', 'My mum is sleeping.'], 'Mẫu: be + V-ing · Thì: hiện tại tiếp diễn (đang làm).'],
  ['Hôm nay trời nóng quá.', ['It is very hot today.', 'It is too hot today.', 'It is so hot today.'], 'Mẫu: It is + tính từ (nói về thời tiết) · Thì: hiện tại đơn.'],
  ['Tôi thức dậy lúc sáu giờ.', ['I get up at six.', 'I wake up at six.', 'I get up at 6.', 'I wake up at 6.'], 'Mẫu: get up; at + giờ · Thì: hiện tại đơn (thói quen).'],
  ['Bạn sống ở đâu?', ['Where do you live?'], 'Mẫu: Where + do + S + V? · Thì: hiện tại đơn (câu hỏi).'],
  ['Cô ấy không thích cà phê.', ['She does not like coffee.'], 'Mẫu: S + does not (doesn\'t) + V nguyên mẫu · Thì: hiện tại đơn (phủ định).'],
  ['Bạn có thích âm nhạc không?', ['Do you like music?'], 'Mẫu: Do + S + V? · Thì: hiện tại đơn (câu hỏi Yes/No).'],
  ['Làm ơn đóng cửa lại.', ['Please close the door.', 'Please shut the door.', 'Please close the door again.'], 'Mẫu: Please + V nguyên mẫu (yêu cầu lịch sự) · Câu mệnh lệnh.'],
  ['Bạn có thể giúp tôi không?', ['Can you help me?', 'Could you help me?'], 'Mẫu: Can + S + V? (nhờ giúp) · Động từ khuyết thiếu, không chia thì.'],
  ['Tôi bị đau đầu.', ['I have a headache.', 'I have got a headache.'], 'Mẫu: have a + tên bệnh (headache, cold, fever) · Thì: hiện tại đơn.'],
  ['Chúng ta hãy đi bơi.', ['Let us go swimming.', 'Let us go for a swim.'], 'Mẫu: Let\'s + V; go + V-ing (đi làm hoạt động) · Câu rủ rê.'],
  ['Anh ấy lái xe rất nhanh.', ['He drives very fast.', 'He drives really fast.'], 'Mẫu: V + trạng từ (fast giữ nguyên) · Thì: hiện tại đơn (he → drives).'],
  ['Cô ấy giỏi nấu ăn.', ['She is good at cooking.'], 'Mẫu: be good at + V-ing (giỏi việc gì) · Thì: hiện tại đơn.'],
  ['Tôi đang học tiếng Anh.', ['I am learning English.', 'I am studying English.'], 'Mẫu: be + V-ing · Thì: hiện tại tiếp diễn (đang làm).'],
  ['Hôm qua tôi đã xem phim.', ['I watched a movie yesterday.', 'I saw a movie yesterday.', 'I watched a film yesterday.', 'I saw a film yesterday.', 'I watched movies yesterday.'], 'Mẫu: V-ed / V2 + yesterday · Thì: quá khứ đơn (việc đã xong).'],
  ['Cô ấy đã mua một cái váy mới.', ['She bought a new dress.'], 'Mẫu: S + V2 (buy → bought, bất quy tắc) · Thì: quá khứ đơn.'],
  ['Chúng tôi đã ở nhà tối qua.', ['We were at home last night.', 'We were home last night.'], 'Mẫu: were at + nơi chốn; last night · Thì: quá khứ đơn (be → was/were).'],
  ['Anh ấy bị mất ví.', ['He lost his wallet.', 'He has lost his wallet.'], 'Mẫu: S + V2 (lose → lost) + his (của anh ấy) · Thì: quá khứ đơn.'],
  ['Chúng tôi đã đợi một giờ.', ['We waited for an hour.', 'We waited an hour.', 'We have waited for an hour.'], 'Mẫu: wait for + khoảng thời gian · Thì: quá khứ đơn.'],
  ['Tôi quên mang theo ô.', ['I forgot to bring an umbrella.', 'I forgot my umbrella.', 'I forgot to bring my umbrella.'], 'Mẫu: forget to + V (quên làm gì) · Thì: quá khứ đơn (forget → forgot).'],
  ['Tôi thường ăn sáng lúc bảy giờ.', ['I usually have breakfast at seven.', 'I usually eat breakfast at seven.', 'I usually have breakfast at 7.', 'I usually eat breakfast at 7.'], 'Mẫu: trạng từ tần suất (usually) đứng trước động từ · Thì: hiện tại đơn.'],
  ['Bạn có bao nhiêu cái bút?', ['How many pens do you have?', 'How many pens have you got?'], 'Mẫu: How many + danh từ số nhiều + do you have? · Thì: hiện tại đơn.'],
  ['Bạn nên nghỉ ngơi.', ['You should take a rest.', 'You should rest.', 'You should have a rest.', 'You should relax.'], 'Mẫu: should + V nguyên mẫu (lời khuyên) · Động từ khuyết thiếu.'],
  ['Ngày mai tôi sẽ gặp bạn.', ['I will see you tomorrow.', 'I will meet you tomorrow.', 'I am going to see you tomorrow.', 'I am going to meet you tomorrow.'], 'Mẫu: will + V nguyên mẫu · Thì: tương lai đơn (quyết định, dự đoán).'],
  ['Chúng tôi sắp đi du lịch.', ['We are going to travel.', 'We are going on a trip.', 'We are going to take a trip.'], 'Mẫu: be going to + V (sắp, dự định) · Thì: tương lai gần.'],
  ['Chúng tôi sẽ đi du lịch vào mùa hè.', ['We will travel in summer.', 'We will travel in the summer.', 'We are going to travel in summer.', 'We are going to travel in the summer.'], 'Mẫu: will + V; in + mùa · Thì: tương lai đơn.'],
  ['Nếu mưa, tôi sẽ ở nhà.', ['If it rains, I will stay home.', 'If it rains, I will stay at home.'], 'Mẫu: If + hiện tại đơn, will + V · Câu điều kiện loại 1 (có thể xảy ra).'],
  ['Cô ấy cao hơn anh trai.', ['She is taller than her brother.'], 'Mẫu: tính từ ngắn + er + than (so sánh hơn) · Thì: hiện tại đơn (be).'],
  ['Đây là quyển sách hay nhất.', ['This is the best book.', 'This is the best book ever.'], 'Mẫu: the + best / adj-est (so sánh nhất) · Thì: hiện tại đơn (be).'],
  ['Tôi phải làm bài tập về nhà.', ['I have to do my homework.', 'I must do my homework.', 'I have to do homework.'], 'Mẫu: have to + V (bắt buộc, do hoàn cảnh) · Thì: hiện tại đơn.'],
  ['Tôi muốn một ly nước.', ['I would like a glass of water.', 'I want a glass of water.', 'I would like a glass of water please.'], 'Mẫu: would like + danh từ (muốn, lịch sự); a glass of + N · Thì: hiện tại.'],
  ['Bạn không nên ăn quá nhiều đường.', ['You should not eat too much sugar.', 'You should not eat so much sugar.'], 'Mẫu: should not (shouldn\'t) + V; too much + danh từ không đếm được · Lời khuyên.'],
  ['Bạn đã ăn trưa chưa?', ['Have you had lunch yet?', 'Have you eaten lunch yet?', 'Have you had your lunch yet?', 'Have you eaten yet?'], 'Mẫu: Have + S + V3 + yet? (đã ... chưa?) · Thì: hiện tại hoàn thành.'],
  ['Tôi chưa bao giờ đến Pháp.', ['I have never been to France.', 'I have never gone to France.', 'I have never visited France.'], 'Mẫu: have never been to + nơi chốn (chưa từng đến) · Thì: hiện tại hoàn thành.'],
  ['Tôi chưa làm xong bài tập.', ['I have not finished my homework yet.', 'I have not finished my homework.', 'I have not done my homework yet.', 'I have not done my homework.'], 'Mẫu: have not + V3 (finish → finished); yet = chưa · Thì: hiện tại hoàn thành (phủ định).'],
  ['Tôi đã học tiếng Anh hai năm.', ['I have studied English for two years.', 'I have learned English for two years.', 'I have learnt English for two years.', 'I have studied English for 2 years.', 'I have learned English for 2 years.'], 'Mẫu: have + V3 + for + khoảng thời gian · Thì: hiện tại hoàn thành.'],
  ['Tôi mong được gặp bạn.', ['I look forward to seeing you.', 'I am looking forward to seeing you.', 'I am looking forward to meeting you.', 'I look forward to meeting you.'], 'Mẫu: look forward to + V-ing (mong được làm gì) · Thì: hiện tại đơn.'],
];

// ---- Chọn đáp án (trình độ B1): [chủ đề, câu, đáp án đúng, [3 đáp án sai], giải thích, nghĩa tiếng Việt] ----
const M = [
  ['Passive', 'English ___ in many countries.', 'is spoken', ['speaks', 'is speak', 'speaking'], 'Bị động hiện tại đơn: is/are + V3.', 'Tiếng Anh được nói ở nhiều nước.'],
  ['Passive', 'This house ___ in 1990.', 'was built', ['built', 'is built', 'has built'], 'Bị động quá khứ đơn: was/were + V3.', 'Ngôi nhà này được xây năm 1990.'],
  ['Passive', 'The room ___ right now.', 'is being cleaned', ['is cleaned', 'cleans', 'was cleaning'], 'Bị động tiếp diễn: is/are being + V3.', 'Căn phòng đang được dọn.'],
  ['Passive', 'The homework ___ by tomorrow.', 'must be finished', ['must finish', 'must finished', 'must be finish'], 'Bị động với modal: must + be + V3.', 'Bài tập phải được làm xong trước ngày mai.'],
  ['Passive', 'The windows ___ by the boy yesterday.', 'were broken', ['broke', 'are broken', 'have broke'], 'Bị động quá khứ đơn: were + V3 (broken).', 'Cửa sổ bị cậu bé làm vỡ hôm qua.'],
  ['Conditionals', 'If I ___ rich, I would travel the world.', 'were', ['am', 'will be', 'would be'], 'Điều kiện loại 2: If + quá khứ (were), would + V.', 'Nếu tôi giàu, tôi sẽ đi vòng quanh thế giới.'],
  ['Conditionals', 'If she ___ harder, she would pass the exam.', 'studied', ['studies', 'will study', 'would study'], 'Điều kiện loại 2: If + quá khứ đơn, would + V.', 'Nếu cô ấy học chăm hơn thì sẽ đỗ.'],
  ['Conditionals', 'I would buy a car if I ___ more money.', 'had', ['have', 'will have', 'would have'], 'Điều kiện loại 2: If + quá khứ đơn (had).', 'Tôi sẽ mua xe nếu có nhiều tiền hơn.'],
  ['Conditionals', 'If you heat ice, it ___.', 'melts', ['melt', 'melted', 'would melt'], 'Điều kiện loại 0 (sự thật): If + hiện tại, hiện tại.', 'Đun nóng đá thì nó tan chảy.'],
  ['Conditionals', 'What would you do if you ___ lost?', 'got', ['get', 'will get', 'would get'], 'Điều kiện loại 2: If + quá khứ đơn (got).', 'Bạn sẽ làm gì nếu bị lạc?'],
  ['Reported', 'She said, "I am tired." → She said that she ___ tired.', 'was', ['is', 'were', 'be'], 'Gián tiếp: lùi thì, am/is → was.', 'Cô ấy nói rằng cô ấy mệt.'],
  ['Reported', 'He said, "I live in Hanoi." → He said he ___ in Hanoi.', 'lived', ['lives', 'live', 'living'], 'Gián tiếp: hiện tại đơn → quá khứ đơn.', 'Anh ấy nói anh ấy sống ở Hà Nội.'],
  ['Reported', 'He told me ___ late.', 'not to be', ['don\'t be', 'not be', 'be not'], 'Gián tiếp mệnh lệnh phủ định: told + O + not to + V.', 'Anh ấy bảo tôi đừng đến muộn.'],
  ['Relative', 'The hotel ___ we stayed was lovely.', 'where', ['who', 'which', 'whose'], 'where thay cho nơi chốn.', 'Khách sạn nơi chúng tôi ở rất đẹp.'],
  ['Relative', 'He is the man ___ car was stolen.', 'whose', ['who', 'which', 'whom'], 'whose + danh từ = của người mà.', 'Ông ấy là người bị mất xe.'],
  ['Relative', 'This is the film ___ I told you about.', 'that', ['who', 'where', 'whose'], 'that/which thay cho vật.', 'Đây là bộ phim tôi đã kể cho bạn.'],
  ['Perfect', 'I ___ here since 2020.', 'have lived', ['lived', 'live', 'am living'], 'since + mốc thời gian → hiện tại hoàn thành.', 'Tôi sống ở đây từ năm 2020.'],
  ['Perfect', 'She has just ___ home.', 'come', ['came', 'coming', 'comes'], 'has/have + V3 (come → come).', 'Cô ấy vừa về nhà.'],
  ['Perfect', 'How long ___ you known him?', 'have', ['did', 'do', 'are'], 'How long + have + S + V3?', 'Bạn biết anh ấy được bao lâu rồi?'],
  ['Perfect', 'I ___ my keys. I can\'t find them.', 'have lost', ['lose', 'am losing', 'was lose'], 'Hiện tại hoàn thành: kết quả còn ở hiện tại.', 'Tôi làm mất chìa khóa, không tìm thấy.'],
  ['Modals', 'You ___ have told me earlier! (đáng lẽ nên)', 'should', ['will', 'shall', 'can'], 'should have + V3 = đáng lẽ nên (đã không làm).', 'Đáng lẽ bạn nên nói với tôi sớm hơn!'],
  ['Modals', 'He ___ be at home. His car is outside. (chắc chắn)', 'must', ['can\'t', 'might not', 'shouldn\'t'], 'must + V = chắc chắn là (suy đoán).', 'Anh ấy chắc là ở nhà, xe còn ngoài kia.'],
  ['Modals', 'You don\'t ___ come if you are busy.', 'have to', ['must', 'should to', 'can to'], 'don\'t have to = không cần phải.', 'Bạn không cần đến nếu bận.'],
  ['Modals', '___ I borrow your pen, please? (xin phép lịch sự)', 'Could', ['Must', 'Shall', 'Need'], 'Could I...? = xin phép lịch sự.', 'Cho tôi mượn bút của bạn nhé?'],
  ['Gerund', 'He suggested ___ to the beach.', 'going', ['to go', 'go', 'went'], 'suggest + V-ing.', 'Anh ấy gợi ý đi biển.'],
  ['Gerund', 'I\'m used to ___ up early.', 'getting', ['get', 'got', 'to get'], 'be used to + V-ing = quen với việc.', 'Tôi quen dậy sớm rồi.'],
  ['Gerund', 'I look forward ___ you soon.', 'to seeing', ['to see', 'seeing', 'for see'], 'look forward to + V-ing.', 'Tôi mong sớm gặp bạn.'],
  ['Phrasal', 'We need to come ___ with a solution.', 'up', ['on', 'off', 'in'], 'come up with = nghĩ ra.', 'Chúng ta cần nghĩ ra giải pháp.'],
  ['Phrasal', 'I\'ll ___ you up at the airport.', 'pick', ['take', 'put', 'get'], 'pick up = đón.', 'Tôi sẽ đón bạn ở sân bay.'],
  ['Phrasal', 'The meeting was ___ off because of the storm.', 'called', ['taken', 'set', 'kept'], 'call off = hủy.', 'Cuộc họp bị hủy vì bão.'],
  ['Preps', 'He is allergic ___ peanuts.', 'to', ['of', 'with', 'at'], 'allergic to.', 'Anh ấy bị dị ứng đậu phộng.'],
  ['Preps', 'I\'m not satisfied ___ the service.', 'with', ['of', 'at', 'by'], 'satisfied with.', 'Tôi không hài lòng với dịch vụ.'],
  ['Linking', 'She was tired; ___, she kept working.', 'however', ['because', 'so', 'therefore'], 'however = tuy nhiên.', 'Cô ấy mệt, tuy nhiên vẫn làm việc.'],
  ['B1Vocab', '“reliable” nghĩa là gì?', 'đáng tin cậy', ['nhút nhát', 'hào phóng', 'lười biếng'], 'reliable = đáng tin cậy (a reliable friend).', null],
  ['B1Vocab', '“improve” nghĩa là gì?', 'cải thiện', ['phá hủy', 'giấu đi', 'quên mất'], 'improve = cải thiện, tiến bộ hơn.', null],
  ['B1Vocab', '“achieve” nghĩa là gì?', 'đạt được', ['từ bỏ', 'trì hoãn', 'tranh cãi'], 'achieve = đạt được (achieve a goal).', null],
];

// ---- Chọn câu tiếng Anh đúng (A2, ngắn): [câu tiếng Việt, đáp án đúng, [3 đáp án sai], giải thích] ----
const V = [
  ['Tôi thích ăn cơm.', 'I like eating rice.', ['I like eat rice.', 'I likes eating rice.', 'I am like eating rice.'], 'Mẫu: like + V-ing (thích làm gì) · Thì: hiện tại đơn, I giữ nguyên "like".'],
  ['Cô ấy đang đọc sách.', 'She is reading a book.', ['She is read a book.', 'She are reading a book.', 'She reading a book.'], 'Mẫu: be + V-ing · Thì: hiện tại tiếp diễn (she → is).'],
  ['Hôm qua tôi đi chợ.', 'I went to the market yesterday.', ['I go to the market yesterday.', 'I goed to the market yesterday.', 'I was go to the market yesterday.'], 'Mẫu: go to + nơi chốn · Thì: quá khứ đơn (go → went, bất quy tắc).'],
  ['Bạn có chị gái không?', 'Do you have a sister?', ['Does you have a sister?', 'You have a sister?', 'Are you have a sister?'], 'Mẫu: Do + S + V nguyên mẫu? · Thì: hiện tại đơn (you → do).'],
  ['Trời đang mưa.', 'It is raining.', ['It is rain.', 'It raining.', 'It are raining.'], 'Mẫu: be + V-ing · Thì: hiện tại tiếp diễn (it → is).'],
  ['Tôi sẽ gọi cho bạn tối nay.', 'I will call you tonight.', ['I will to call you tonight.', 'I calling you tonight.', 'I will called you tonight.'], 'Mẫu: will + V nguyên mẫu · Thì: tương lai đơn.'],
  ['Anh ấy không có xe.', 'He does not have a car.', ['He do not have a car.', 'He does not has a car.', 'He not have a car.'], 'Mẫu: does not (doesn\'t) + V nguyên mẫu · Thì: hiện tại đơn (he → does).'],
  ['Chúng tôi ở đó hai ngày.', 'We stayed there for two days.', ['We stay there two days ago.', 'We stayed there since two days.', 'We were stay there two days.'], 'Mẫu: for + khoảng thời gian · Thì: quá khứ đơn (stay → stayed).'],
  ['Tôi muốn đi du lịch.', 'I want to travel.', ['I want travel.', 'I wanting to travel.', 'I want traveling.'], 'Mẫu: want to + V nguyên mẫu · Thì: hiện tại đơn.'],
  ['Cô ấy có một con mèo.', 'She has a cat.', ['She have a cat.', 'She has an cat.', 'She is have a cat.'], 'Mẫu: S + has / have + N · she → has; a + từ bắt đầu bằng phụ âm · hiện tại đơn.'],
  ['Bạn bao nhiêu tuổi?', 'How old are you?', ['How age are you?', 'How old you are?', 'What old are you?'], 'Mẫu: How old + be + S? (hỏi tuổi) · Thì: hiện tại đơn.'],
  ['Hôm nay tôi rất bận.', 'I am very busy today.', ['I very busy today.', 'I am very busily today.', 'I busy very today.'], 'Mẫu: be + tính từ (very + adj) · Thì: hiện tại đơn.'],
  ['Anh ấy chạy nhanh hơn tôi.', 'He runs faster than me.', ['He runs more fast than me.', 'He runs fastest than me.', 'He run faster than me.'], 'Mẫu: adj-er + than (so sánh hơn) · Thì: hiện tại đơn (he → runs).'],
  ['Tôi chưa ăn sáng.', 'I have not had breakfast yet.', ['I do not had breakfast yet.', 'I have not have breakfast yet.', 'I am not had breakfast yet.'], 'Mẫu: have not + V3 (had); yet = chưa · Thì: hiện tại hoàn thành.'],
  ['Mình ăn tối nhé.', 'Let us have dinner.', ['Let us having dinner.', 'Let us to have dinner.', 'Let us has dinner.'], 'Mẫu: Let\'s + V nguyên mẫu (rủ rê) · Câu đề nghị.'],
  ['Quyển sách ở trên bàn.', 'The book is on the table.', ['The book is in the table.', 'The book are on the table.', 'The book on is the table.'], 'Mẫu: be + on + vật có bề mặt · Thì: hiện tại đơn (book số ít → is).'],
  ['Tôi thường dậy sớm.', 'I usually get up early.', ['I get usually up early.', 'I am usually get up early.', 'I usually getting up early.'], 'Mẫu: trạng từ tần suất (usually) đứng trước động từ · Thì: hiện tại đơn.'],
  ['Mẹ tôi nấu ăn rất ngon.', 'My mother cooks very well.', ['My mother cook very well.', 'My mother cooks very good.', 'My mother is cook very well.'], 'Mẫu: V + well (trạng từ của good) · Thì: hiện tại đơn (mother → cooks).'],
  ['Bạn đã từng ăn sushi chưa?', 'Have you ever eaten sushi?', ['Did you ever eaten sushi?', 'Have you ever eat sushi?', 'Do you ever eaten sushi?'], 'Mẫu: Have + S + ever + V3? (đã từng) · Thì: hiện tại hoàn thành.'],
  ['Hôm qua cô ấy bị ốm.', 'She was sick yesterday.', ['She is sick yesterday.', 'She were sick yesterday.', 'She sick yesterday.'], 'Mẫu: was / were + tính từ · Thì: quá khứ đơn (she → was).'],
  ['Tôi biết bơi.', 'I can swim.', ['I can swimming.', 'I can to swim.', 'I cans swim.'], 'Mẫu: can + V nguyên mẫu (có thể, biết) · Động từ khuyết thiếu.'],
  ['Họ đang chơi bóng đá.', 'They are playing football.', ['They is playing football.', 'They playing football.', 'They are play football.'], 'Mẫu: be + V-ing · Thì: hiện tại tiếp diễn (they → are).'],
  ['Đừng nói chuyện ở đây.', 'Do not talk here.', ['Not talk here.', 'Do not talking here.', 'No talk here.'], 'Mẫu: Don\'t + V nguyên mẫu (cấm, đừng) · Câu mệnh lệnh phủ định.'],
  ['Anh ấy là bác sĩ.', 'He is a doctor.', ['He is doctor.', 'He are a doctor.', 'He a doctor.'], 'Mẫu: be + a + nghề nghiệp · Thì: hiện tại đơn (he → is).'],
  ['Cái này rẻ hơn.', 'This is cheaper.', ['This is more cheap.', 'This is cheapest.', 'This cheaper.'], 'Mẫu: tính từ ngắn + er (so sánh hơn) · Thì: hiện tại đơn.'],
];

// Dựng câu hỏi mới mỗi lần bốc (đảo thứ tự đáp án A/B/C/D)
const makeMcq = ([topic, prompt, correct, wrong, explain, sub]) => {
  const opts = shuffle([correct, ...wrong]);
  return { type: 'mcq', topic, prompt, emoji: null, sub: sub || null, options: opts.map((t, i) => ({ k: KEYS[i], t })), answerKey: KEYS[opts.indexOf(correct)], answers: [correct], explain: explain || '' };
};
// Câu dịch dạng trắc nghiệm: 1 câu tiếng Việt, 4 đáp án tiếng Anh (chọn A/B/C/D)
const makeViPick = ([vi, correct, wrong, explain]) => {
  const opts = shuffle([correct, ...wrong]);
  return { type: 'mcq', topic: 'Pick', prompt: vi, emoji: null, sub: 'Chọn câu tiếng Anh đúng', options: opts.map((t, i) => ({ k: KEYS[i], t })), answerKey: KEYS[opts.indexOf(correct)], answers: [correct], explain };
};
const makeTr = ([vi, answers, explain]) => ({
  type: 'fill', topic: 'Translate', prompt: vi, emoji: null, sub: 'Dịch sang tiếng Anh', answers, mode: 'translate', tiles: null, full: null, explain,
});

// Xen kẽ ba danh sách theo tỉ lệ số câu, mỗi danh sách giữ nguyên thứ tự dễ → khó.
// Dùng chung cho mọi buổi (ngay2.js...): buildPack({ T, M, V }) trả về { size, meta, at(i, {mode, topic}) }.
// Điền từ: cho một từ tiếng Việt, hiện các ô chữ cái để gõ từ tiếng Anh. [từ tiếng Anh, nghĩa tiếng Việt, câu ví dụ]. hard = không lộ sẵn chữ cái nào, chỉ gợi ý dần theo thời gian.
const makeSpell = ([en, vi, ex]) => ({
  type: 'fill', topic: 'Spell', prompt: 'Điền từ tiếng Anh', emoji: null, sub: vi, answers: [en.toLowerCase()], mode: 'spell', hard: true, tiles: null, full: null,
  explain: `${en} = ${vi}${ex ? ' · ' + ex : ''}`,
});
export function buildPack({ T, M, V, W = [] }) {
  // Mục nào có thuộc tính .theme thì câu hỏi được gán vào chủ đề đó (dùng cho bộ bài theo chủ đề).
  const th = (mk) => (d) => () => { const q = mk(d); if (d.theme) q.topic = d.theme; return q; };
  const lists = [{ a: T.map(th(makeTr)) }, { a: M.map(th(makeMcq)) }, { a: V.map(th(makeViPick)) }];
  if (W.length) lists.push({ a: W.map(th(makeSpell)) });
  const total = lists.reduce((s, l) => s + l.a.length, 0);
  const order = [];
  const taken = lists.map(() => 0);
  for (let i = 0; i < total; i++) {
    let best = 0, bestGap = -Infinity;
    lists.forEach((l, k) => {
      if (taken[k] >= l.a.length) return;
      const gap = ((i + 1) * l.a.length) / total - taken[k];
      if (gap > bestGap) { bestGap = gap; best = k; }
    });
    order.push(lists[best].a[taken[best]++]);
  }
  const meta = order.map((mk) => { const q = mk(); return { topic: q.topic, type: q.type, mode: q.mode || null }; });
  // i = số thứ tự (0-based) trong danh sách đã lọc theo chế độ / chủ đề
  const at = (i, { mode = 'mix', topic = 'all' } = {}) => {
    const ok = (m) => (topic === 'all' || m.topic === topic) && (mode === 'mix' || (mode === 'mcq' && m.type === 'mcq') || (mode === 'translate' && m.mode === 'translate') || (mode === 'fill' && m.type === 'fill' && m.mode !== 'translate'));
    const idx = meta.map((m, k) => (ok(m) ? k : -1)).filter((k) => k >= 0);
    if (!idx.length) return null;
    return order[idx[i % idx.length]]();
  };
  return { size: order.length, meta, at };
}

const PACK = buildPack({ T, M, V });
export const NGAY1_SIZE = PACK.size;
export const ngay1Meta = PACK.meta;
export const ngay1At = PACK.at;
