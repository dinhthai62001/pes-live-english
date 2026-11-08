// Bộ bài "Ngày 3": 100 bài, dễ hơn Ngày 2 một xíu (câu ngắn hơn, thì quen thuộc: hiện tại, quá khứ, tương lai, hiện tại hoàn thành, so sánh, bị động cơ bản, điều kiện loại 1–2).
// 4 dạng: dịch câu Việt → Anh (30), chọn A/B/C/D (25), chọn câu tiếng Anh đúng (20) và MỚI: điền từ — cho từ tiếng Việt, hiện các ô chữ cái để gõ từ tiếng Anh (25, hơi khó, không lộ sẵn chữ cái).
// Ra theo thứ tự dễ → khó, hết 100 câu thì lặp lại.
import { buildPack } from './ngay1.js';

export const NGAY3_TOPICS = {
  Translate: ['Translate', 'Dịch câu Việt → Anh', '🌐'],
  Pick: ['Pick the Sentence', 'Chọn câu tiếng Anh đúng', '🔎'],
  Spell: ['Spell It!', 'Điền từ tiếng Anh theo nghĩa', '🔤'],
  Tenses: ['Tenses', 'Các thì quen thuộc', '⏳'],
  Passive: ['Passive Voice', 'Câu bị động', '🔄'],
  Conditionals: ['Conditionals', 'Câu điều kiện loại 1, 2', '🔀'],
  Modals: ['Modal Verbs', 'Động từ khuyết thiếu', '💡'],
  Compare: ['Comparisons', 'So sánh', '📏'],
  Gerund: ['Gerund & Infinitive', 'V-ing hay to V', '✍️'],
  Preps: ['Prepositions', 'Giới từ', '📍'],
  Quantity: ['Quantity', 'Lượng từ', '🥛'],
  B1Vocab: ['Word Power', 'Từ vựng thường gặp', '💎'],
};

// ---- Dịch câu: [tiếng Việt, [các đáp án nhận], "Mẫu câu · Thì"] (dấu câu và hoa/thường được bỏ qua khi chấm) ----
const T = [
  ['Tôi thức dậy lúc sáu giờ mỗi ngày.', ['I get up at six every day.', 'I wake up at six every day.', 'I get up at 6 every day.', 'I wake up at 6 every day.', 'Every day I get up at six.'], 'Mẫu: get up + at + giờ · Thì: hiện tại đơn (thói quen).'],
  ['Cô ấy đang đọc một quyển sách.', ['She is reading a book.', 'She is reading one book.'], 'Mẫu: be + V-ing · Thì: hiện tại tiếp diễn (đang làm).'],
  ['Bạn đến từ đâu?', ['Where are you from?', 'Where do you come from?'], 'Mẫu: Where + be + S + from? · Thì: hiện tại đơn.'],
  ['Hôm qua tôi đi chợ với mẹ.', ['I went to the market with my mother yesterday.', 'I went to the market with my mom yesterday.', 'I went to the market with my mum yesterday.', 'Yesterday I went to the market with my mother.', 'Yesterday I went to the market with my mom.', 'Yesterday I went to the market with my mum.'], 'Mẫu: go to + nơi chốn; with + người · Thì: quá khứ đơn (go → went).'],
  ['Cô ấy không thích ăn cá.', ['She does not like fish.', 'She does not like eating fish.', 'She does not like to eat fish.'], 'Mẫu: does not + V nguyên mẫu · Thì: hiện tại đơn (phủ định).'],
  ['Bạn có thể giúp tôi không?', ['Can you help me?', 'Could you help me?', 'Can you help me please?', 'Could you help me please?'], 'Mẫu: Can/Could + S + V? (nhờ giúp) · Động từ khuyết thiếu.'],
  ['Ngày mai tôi sẽ gặp bạn.', ['I will see you tomorrow.', 'I will meet you tomorrow.', 'I am going to see you tomorrow.', 'I am going to meet you tomorrow.', 'Tomorrow I will see you.'], 'Mẫu: will + V nguyên mẫu · Thì: tương lai đơn.'],
  ['Anh ấy lái xe rất nhanh.', ['He drives very fast.', 'He drives really fast.', 'He drives so fast.'], 'Mẫu: V + trạng từ (fast không đổi) · Thì: hiện tại đơn (he → drives).'],
  ['Chúng tôi ở nhà tối qua.', ['We stayed at home last night.', 'We stayed home last night.', 'We were at home last night.', 'We were home last night.', 'Last night we stayed at home.'], 'Mẫu: stay at home; last night · Thì: quá khứ đơn.'],
  ['Tôi đang học tiếng Anh.', ['I am learning English.', 'I am studying English.', 'I am learning to speak English.'], 'Mẫu: be + V-ing · Thì: hiện tại tiếp diễn.'],
  ['Cô ấy có một con mèo nhỏ.', ['She has a small cat.', 'She has got a small cat.', 'She has a little cat.', 'She has a small kitten.'], 'Mẫu: has + a + adj + N · Thì: hiện tại đơn (she → has).'],
  ['Trời đang mưa to.', ['It is raining heavily.', 'It is raining hard.', 'It is raining a lot.', 'It is raining heavy.'], 'Mẫu: It is + V-ing (thời tiết) · Thì: hiện tại tiếp diễn.'],
  ['Bạn thích môn học nào nhất?', ['Which subject do you like best?', 'Which subject do you like the most?', 'What subject do you like best?', 'What subject do you like the most?', 'Which subject do you like most?'], 'Mẫu: Which + N + do you like best? · Thì: hiện tại đơn.'],
  ['Tôi đã làm xong bài tập rồi.', ['I have finished my homework.', 'I have done my homework.', 'I have already finished my homework.', 'I have already done my homework.', 'I finished my homework already.'], 'Mẫu: have + V3 (finish → finished) · Thì: hiện tại hoàn thành (kết quả ở hiện tại).'],
  ['Mẹ tôi nấu ăn rất ngon.', ['My mother cooks very well.', 'My mom cooks very well.', 'My mum cooks very well.', 'My mother cooks really well.', 'My mother is a very good cook.', 'My mom is a very good cook.', 'My mum is a very good cook.', 'My mother cooks delicious food.'], 'Mẫu: V + well (trạng từ của good) · Thì: hiện tại đơn.'],
  ['Họ đang chơi bóng đá ở sân.', ['They are playing football in the yard.', 'They are playing soccer in the yard.', 'They are playing football on the field.', 'They are playing soccer on the field.', 'They are playing football at the field.', 'They are playing football in the field.', 'They are playing football at the stadium.'], 'Mẫu: be + V-ing; play + môn thể thao · Thì: hiện tại tiếp diễn.'],
  ['Tôi chưa bao giờ đến Đà Nẵng.', ['I have never been to Da Nang.', 'I have never visited Da Nang.', 'I have never gone to Da Nang.', 'I have never been to Danang.', 'I have never visited Danang.'], 'Mẫu: have never been to + nơi chốn · Thì: hiện tại hoàn thành (chưa từng).'],
  ['Bạn nên uống nhiều nước.', ['You should drink a lot of water.', 'You should drink more water.', 'You should drink lots of water.', 'You should drink plenty of water.', 'You should drink much water.'], 'Mẫu: should + V nguyên mẫu (lời khuyên) · Động từ khuyết thiếu.'],
  ['Cái áo này rẻ hơn cái kia.', ['This shirt is cheaper than that one.', 'This shirt is cheaper than that shirt.', 'This is cheaper than that one.', 'This dress is cheaper than that one.', 'This T-shirt is cheaper than that one.'], 'Mẫu: tính từ ngắn + er + than (so sánh hơn) · Thì: hiện tại đơn.'],
  ['Hôm nay tôi thấy mệt.', ['I feel tired today.', 'I am tired today.', 'I am feeling tired today.', 'Today I feel tired.', 'Today I am tired.'], 'Mẫu: feel / be + tính từ (cảm giác) · Thì: hiện tại.'],
  ['Cô ấy đã mua một cái váy mới hôm qua.', ['She bought a new dress yesterday.', 'Yesterday she bought a new dress.', 'She bought a new skirt yesterday.', 'Yesterday she bought a new skirt.'], 'Mẫu: S + V2 (buy → bought, bất quy tắc) · Thì: quá khứ đơn.'],
  ['Nếu trời mưa, chúng tôi sẽ ở nhà.', ['If it rains, we will stay at home.', 'If it rains, we will stay home.', 'We will stay at home if it rains.', 'We will stay home if it rains.', 'If it rains, we will stay indoors.'], 'Mẫu: If + hiện tại đơn, will + V · Câu điều kiện loại 1 (có thể xảy ra).'],
  ['Tôi muốn một ly nước cam.', ['I would like a glass of orange juice.', 'I want a glass of orange juice.', 'I would like a glass of orange juice please.', 'I would like an orange juice.', 'I want an orange juice.'], 'Mẫu: would like + N (muốn, lịch sự); a glass of + N · Thì: hiện tại.'],
  ['Anh ấy là học sinh giỏi nhất lớp.', ['He is the best student in the class.', 'He is the best student in our class.', 'He is the best pupil in the class.', 'He is the best student of the class.', 'He is the best student in his class.'], 'Mẫu: the + best (so sánh nhất) + in + nhóm · Thì: hiện tại đơn.'],
  ['Tôi phải đi ngủ sớm tối nay.', ['I have to go to bed early tonight.', 'I must go to bed early tonight.', 'Tonight I have to go to bed early.', 'I have to go to sleep early tonight.', 'I need to go to bed early tonight.'], 'Mẫu: have to + V (phải làm gì) · Thì: hiện tại đơn.'],
  ['Cửa hàng này mở cửa lúc tám giờ.', ['This shop opens at eight.', 'This store opens at eight.', 'This shop opens at 8.', 'This store opens at 8.', 'This shop opens at eight o\'clock.', 'This store opens at eight o\'clock.', 'This shop is open at eight.'], 'Mẫu: opens + at + giờ (lịch cố định) · Thì: hiện tại đơn.'],
  ['Bạn đã ăn sáng chưa?', ['Have you had breakfast yet?', 'Have you eaten breakfast yet?', 'Have you had your breakfast yet?', 'Have you eaten yet?', 'Did you have breakfast yet?', 'Have you had breakfast?', 'Have you eaten breakfast?'], 'Mẫu: Have + S + V3 + yet? (đã ... chưa?) · Thì: hiện tại hoàn thành.'],
  ['Chúng tôi đã đợi xe buýt nửa tiếng.', ['We waited for the bus for half an hour.', 'We waited for the bus for thirty minutes.', 'We waited half an hour for the bus.', 'We have waited for the bus for half an hour.', 'We were waiting for the bus for half an hour.'], 'Mẫu: wait for + N; for + khoảng thời gian · Thì: quá khứ đơn.'],
  ['Chị tôi làm việc ở một ngân hàng.', ['My sister works at a bank.', 'My sister works in a bank.', 'My older sister works at a bank.', 'My elder sister works at a bank.', 'My sister is working at a bank.'], 'Mẫu: work at / in + nơi làm việc · Thì: hiện tại đơn (sister → works).'],
  ['Tối nay bạn có rảnh không?', ['Are you free tonight?', 'Are you free this evening?', 'Do you have time tonight?', 'Are you free tonight?', 'Do you have free time tonight?'], 'Mẫu: Are you + tính từ (free)? · Thì: hiện tại đơn (hỏi về kế hoạch).'],
];

// ---- Chọn đáp án (A2–B1 nhẹ): [chủ đề, câu, đáp án đúng, [3 đáp án sai], giải thích, nghĩa tiếng Việt] ----
const M = [
  ['Tenses', 'She ___ to school by bike every day.', 'goes', ['go', 'going', 'is go'], 'Hiện tại đơn: chủ ngữ she → động từ thêm -es (goes).', 'Mỗi ngày cô ấy đạp xe đến trường.'],
  ['Tenses', 'Look! The children ___ in the garden.', 'are playing', ['play', 'plays', 'played'], 'Hiện tại tiếp diễn (are + V-ing) cho việc đang diễn ra ngay lúc nói.', 'Nhìn kìa! Bọn trẻ đang chơi trong vườn.'],
  ['Tenses', 'I ___ a movie last night.', 'watched', ['watch', 'watching', 'have watch'], 'Quá khứ đơn (V-ed) cho việc đã xong, có mốc "last night".', 'Tối qua tôi đã xem phim.'],
  ['Tenses', 'We ___ to Hue next month.', 'are going to travel', ['travel yesterday', 'travelled', 'have travel'], 'be going to + V cho dự định trong tương lai.', 'Tháng sau chúng tôi sẽ đi Huế.'],
  ['Modals', 'You ___ wear a helmet. It is the law.', 'must', ['can', 'may', 'would'], 'must = bắt buộc, phải (theo luật).', 'Bạn phải đội mũ bảo hiểm, đó là luật.'],
  ['Modals', '___ I open the window? It is hot.', 'May', ['Must', 'Will', 'Shall to'], 'May I...? = xin phép lịch sự.', 'Cho tôi mở cửa sổ nhé? Nóng quá.'],
  ['Modals', 'You ___ eat so much sugar. It is bad for you.', 'should not', ['should', 'must to', 'can to'], 'should not (shouldn\'t) = không nên.', 'Bạn không nên ăn nhiều đường, nó có hại.'],
  ['Compare', 'This bag is ___ than that one.', 'cheaper', ['cheap', 'more cheap', 'cheapest'], 'Tính từ ngắn: thêm -er + than (so sánh hơn).', 'Cái túi này rẻ hơn cái kia.'],
  ['Compare', 'She is the ___ girl in our class.', 'tallest', ['taller', 'more tall', 'tall'], 'So sánh nhất: the + adj-est.', 'Cô ấy là bạn gái cao nhất lớp.'],
  ['Compare', 'This film is ___ than the book.', 'more interesting', ['interestinger', 'most interesting', 'interesting'], 'Tính từ dài: more + adj + than.', 'Bộ phim này hay hơn quyển sách.'],
  ['Passive', 'English ___ in many countries.', 'is spoken', ['speaks', 'is speak', 'speaking'], 'Bị động hiện tại đơn: is/are + V3.', 'Tiếng Anh được nói ở nhiều nước.'],
  ['Passive', 'This house ___ in 1990.', 'was built', ['built', 'is built', 'has built'], 'Bị động quá khứ đơn: was/were + V3.', 'Ngôi nhà này được xây năm 1990.'],
  ['Conditionals', 'If it rains tomorrow, we ___ at home.', 'will stay', ['stay', 'would stay', 'stayed'], 'Điều kiện loại 1: If + hiện tại đơn, will + V.', 'Nếu mai mưa, chúng tôi sẽ ở nhà.'],
  ['Conditionals', 'If I ___ rich, I would buy a big house.', 'were', ['am', 'will be', 'would be'], 'Điều kiện loại 2: If + quá khứ (were), would + V.', 'Nếu tôi giàu, tôi sẽ mua nhà lớn.'],
  ['Gerund', 'She enjoys ___ to music.', 'listening', ['listen', 'to listen', 'listened'], 'enjoy + V-ing.', 'Cô ấy thích nghe nhạc.'],
  ['Gerund', 'I want ___ a new phone.', 'to buy', ['buying', 'buy', 'bought'], 'want + to V.', 'Tôi muốn mua điện thoại mới.'],
  ['Gerund', 'He is good at ___ football.', 'playing', ['play', 'to play', 'played'], 'Sau giới từ (at) dùng V-ing.', 'Anh ấy chơi bóng đá giỏi.'],
  ['Preps', 'The meeting is ___ Monday.', 'on', ['in', 'at', 'by'], 'on + thứ trong tuần.', 'Cuộc họp vào thứ Hai.'],
  ['Preps', 'She was born ___ 2005.', 'in', ['on', 'at', 'for'], 'in + năm / tháng / mùa.', 'Cô ấy sinh năm 2005.'],
  ['Preps', 'I am afraid ___ spiders.', 'of', ['from', 'with', 'about'], 'afraid of = sợ.', 'Tôi sợ nhện.'],
  ['Quantity', 'How ___ sugar do you want in your tea?', 'much', ['many', 'few', 'a lot'], 'much + danh từ không đếm được (sugar).', 'Bạn muốn bao nhiêu đường trong trà?'],
  ['Quantity', 'There are only a ___ apples left.', 'few', ['little', 'much', 'any'], 'a few + danh từ đếm được số nhiều.', 'Chỉ còn một vài quả táo.'],
  ['B1Vocab', '“borrow” nghĩa là gì?', 'mượn', ['cho mượn', 'mua', 'trả lại'], 'borrow = mượn (borrow a book from a friend).', null],
  ['B1Vocab', '“advice” nghĩa là gì?', 'lời khuyên', ['lời xin lỗi', 'lời mời', 'lời hứa'], 'advice = lời khuyên (không đếm được: some advice).', null],
  ['B1Vocab', '“dangerous” nghĩa là gì?', 'nguy hiểm', ['xinh đẹp', 'thú vị', 'rẻ tiền'], 'dangerous = nguy hiểm (a dangerous road).', null],
];

// ---- Chọn câu tiếng Anh đúng (A2): [câu tiếng Việt, đáp án đúng, [3 đáp án sai], giải thích] ----
const V = [
  ['Tôi thích ăn cơm.', 'I like eating rice.', ['I like eat rice.', 'I likes eating rice.', 'I am like eating rice.'], 'Mẫu: like + V-ing (thích làm gì) · Thì: hiện tại đơn.'],
  ['Cô ấy đang nấu ăn.', 'She is cooking.', ['She is cook.', 'She are cooking.', 'She cooking.'], 'Mẫu: be + V-ing · Thì: hiện tại tiếp diễn (she → is).'],
  ['Hôm qua tôi đi làm bằng xe buýt.', 'I went to work by bus yesterday.', ['I go to work by bus yesterday.', 'I goed to work by bus yesterday.', 'I was go to work by bus yesterday.'], 'Mẫu: go to + nơi chốn; by + phương tiện · Thì: quá khứ đơn (go → went).'],
  ['Bạn có anh trai không?', 'Do you have a brother?', ['Does you have a brother?', 'You have a brother?', 'Are you have a brother?'], 'Mẫu: Do + S + V nguyên mẫu? · Thì: hiện tại đơn.'],
  ['Anh ấy không có xe máy.', 'He does not have a motorbike.', ['He do not have a motorbike.', 'He does not has a motorbike.', 'He not have a motorbike.'], 'Mẫu: does not + V nguyên mẫu · Thì: hiện tại đơn (he → does).'],
  ['Tôi sẽ gọi cho bạn tối nay.', 'I will call you tonight.', ['I will to call you tonight.', 'I calling you tonight.', 'I will called you tonight.'], 'Mẫu: will + V nguyên mẫu · Thì: tương lai đơn.'],
  ['Họ đang chơi bóng đá.', 'They are playing football.', ['They is playing football.', 'They playing football.', 'They are play football.'], 'Mẫu: be + V-ing · Thì: hiện tại tiếp diễn (they → are).'],
  ['Cô ấy hay dậy sớm.', 'She often gets up early.', ['She gets often up early.', 'She often get up early.', 'She is often get up early.'], 'Mẫu: trạng từ tần suất (often) đứng trước động từ · Thì: hiện tại đơn.'],
  ['Chúng tôi đã ở đó hai ngày.', 'We stayed there for two days.', ['We stay there two days ago.', 'We stayed there since two days.', 'We were stay there two days.'], 'Mẫu: for + khoảng thời gian · Thì: quá khứ đơn.'],
  ['Tôi muốn đi du lịch.', 'I want to travel.', ['I want travel.', 'I wanting to travel.', 'I want traveling.'], 'Mẫu: want to + V nguyên mẫu · Thì: hiện tại đơn.'],
  ['Hôm nay tôi rất bận.', 'I am very busy today.', ['I very busy today.', 'I am very busily today.', 'I busy very today.'], 'Mẫu: be + very + tính từ · Thì: hiện tại đơn.'],
  ['Anh ấy chạy nhanh hơn tôi.', 'He runs faster than me.', ['He runs more fast than me.', 'He runs fastest than me.', 'He run faster than me.'], 'Mẫu: adj-er + than (so sánh hơn) · Thì: hiện tại đơn.'],
  ['Tôi chưa ăn sáng.', 'I have not had breakfast yet.', ['I do not had breakfast yet.', 'I have not have breakfast yet.', 'I am not had breakfast yet.'], 'Mẫu: have not + V3 (had); yet = chưa · Thì: hiện tại hoàn thành.'],
  ['Mình đi ăn tối nhé.', 'Let us have dinner.', ['Let us having dinner.', 'Let us to have dinner.', 'Let us has dinner.'], 'Mẫu: Let\'s + V nguyên mẫu (rủ rê).'],
  ['Quyển sách ở trên bàn.', 'The book is on the table.', ['The book is in the table.', 'The book are on the table.', 'The book on is the table.'], 'Mẫu: be + on + vật có bề mặt · Thì: hiện tại đơn.'],
  ['Hôm qua cô ấy bị ốm.', 'She was sick yesterday.', ['She is sick yesterday.', 'She were sick yesterday.', 'She sick yesterday.'], 'Mẫu: was / were + tính từ · Thì: quá khứ đơn (she → was).'],
  ['Tôi biết bơi.', 'I can swim.', ['I can swimming.', 'I can to swim.', 'I cans swim.'], 'Mẫu: can + V nguyên mẫu (có thể, biết) · Động từ khuyết thiếu.'],
  ['Đừng nói chuyện ở đây.', 'Do not talk here.', ['Not talk here.', 'Do not talking here.', 'No talk here.'], 'Mẫu: Don\'t + V nguyên mẫu (đừng) · Câu mệnh lệnh phủ định.'],
  ['Bạn bao nhiêu tuổi?', 'How old are you?', ['How age are you?', 'How old you are?', 'What old are you?'], 'Mẫu: How old + be + S? (hỏi tuổi) · Thì: hiện tại đơn.'],
  ['Mẹ tôi nấu ăn rất giỏi.', 'My mother cooks very well.', ['My mother cook very well.', 'My mother cooks very good.', 'My mother is cook very well.'], 'Mẫu: V + well (trạng từ của good) · Thì: hiện tại đơn (mother → cooks).'],
];

// ---- Điền từ theo nghĩa (hơi khó, không lộ sẵn chữ cái): [từ tiếng Anh, nghĩa tiếng Việt, câu ví dụ] ----
const W = [
  ['umbrella', 'cái ô, cái dù', 'Take an umbrella, it may rain.'],
  ['library', 'thư viện', 'I read books in the library.'],
  ['neighbor', 'hàng xóm', 'My neighbor is very kind.'],
  ['airport', 'sân bay', 'We arrived at the airport early.'],
  ['vegetable', 'rau củ', 'Eat more vegetables.'],
  ['hospital', 'bệnh viện', 'He works in a hospital.'],
  ['delicious', 'ngon', 'This cake is delicious.'],
  ['holiday', 'kỳ nghỉ', 'We had a long holiday.'],
  ['dictionary', 'từ điển', 'I look up new words in a dictionary.'],
  ['restaurant', 'nhà hàng', 'We had dinner at a restaurant.'],
  ['apartment', 'căn hộ', 'They live in a small apartment.'],
  ['address', 'địa chỉ', 'Please write your address.'],
  ['journey', 'chuyến đi', 'It was a long journey.'],
  ['popular', 'phổ biến, nổi tiếng', 'Football is popular in Vietnam.'],
  ['dangerous', 'nguy hiểm', 'This road is dangerous at night.'],
  ['comfortable', 'thoải mái', 'This sofa is very comfortable.'],
  ['expensive', 'đắt đỏ', 'That bag is too expensive.'],
  ['experience', 'kinh nghiệm, trải nghiệm', 'She has a lot of experience.'],
  ['explain', 'giải thích', 'Can you explain this word?'],
  ['accident', 'tai nạn', 'There was an accident on the road.'],
  ['necessary', 'cần thiết', 'Water is necessary for life.'],
  ['traffic', 'giao thông, xe cộ', 'The traffic is heavy in the morning.'],
  ['successful', 'thành công', 'He is a successful businessman.'],
  ['pollution', 'sự ô nhiễm', 'Pollution is a big problem in cities.'],
  ['environment', 'môi trường', 'We must protect the environment.'],
];

const PACK = buildPack({ T, M, V, W });
export const NGAY3_SIZE = PACK.size;
export const ngay3Meta = PACK.meta;
export const ngay3At = PACK.at;
