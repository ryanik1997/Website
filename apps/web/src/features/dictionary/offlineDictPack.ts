/**
 * Gói từ điển offline cơ bản (không cần mạng / AI).
 * Dùng cho free/basic; AI dictionary chỉ khi Pro (dictionary_ai).
 */
import type { DictResult } from '@ryan/core'

type PackEntry = Omit<DictResult, 'word'> & { word: string }

function e(
  word: string,
  pos: string,
  meaning: string,
  example: string,
  exampleVi: string,
  extra?: Partial<PackEntry>,
): PackEntry {
  return {
    word,
    pos,
    definitions: [{ meaning, example, exampleVi }],
    ...extra,
  }
}

/** ~120 từ/cụm thông dụng A1–B2 */
const PACK: PackEntry[] = [
  e('abandon', 'verb', 'từ bỏ, bỏ rơi', 'They abandoned the old car.', 'Họ bỏ lại chiếc xe cũ.', { ipaUS: 'əˈbændən', synonyms: ['leave', 'desert'], level: 'B2' }),
  e('ability', 'noun', 'khả năng, năng lực', 'She has the ability to lead.', 'Cô ấy có khả năng lãnh đạo.', { ipaUS: 'əˈbɪləti', level: 'A2' }),
  e('achieve', 'verb', 'đạt được, hoàn thành', 'He achieved his goals.', 'Anh ấy đạt được mục tiêu.', { ipaUS: 'əˈtʃiːv', level: 'B1' }),
  e('advantage', 'noun', 'lợi thế, ưu điểm', 'One advantage is lower cost.', 'Một ưu điểm là chi phí thấp hơn.', { level: 'B1' }),
  e('affect', 'verb', 'ảnh hưởng đến', 'Climate change affects everyone.', 'Biến đổi khí hậu ảnh hưởng mọi người.', { level: 'B1' }),
  e('although', 'conjunction', 'mặc dù', 'Although it rained, we went out.', 'Mặc dù mưa, chúng tôi vẫn đi.', { level: 'A2' }),
  e('analyze', 'verb', 'phân tích', 'We need to analyze the data.', 'Chúng ta cần phân tích dữ liệu.', { level: 'B2' }),
  e('approach', 'noun', 'cách tiếp cận; verb: tiếp cận', 'A new approach to teaching.', 'Một cách tiếp cận mới trong giảng dạy.', { level: 'B2' }),
  e('argue', 'verb', 'tranh luận; cho rằng', 'Some people argue that...', 'Một số người cho rằng...', { level: 'B1' }),
  e('benefit', 'noun', 'lợi ích', 'Exercise has many benefits.', 'Tập thể dục có nhiều lợi ích.', { level: 'B1' }),
  e('cause', 'noun', 'nguyên nhân; verb: gây ra', 'What caused the problem?', 'Điều gì gây ra vấn đề?', { level: 'A2' }),
  e('challenge', 'noun', 'thách thức', 'It was a big challenge.', 'Đó là một thách thức lớn.', { level: 'B1' }),
  e('climate', 'noun', 'khí hậu', 'The climate is changing.', 'Khí hậu đang thay đổi.', { level: 'B1' }),
  e('common', 'adjective', 'phổ biến, chung', 'This is a common mistake.', 'Đây là lỗi phổ biến.', { level: 'A2' }),
  e('community', 'noun', 'cộng đồng', 'Our local community helped.', 'Cộng đồng địa phương đã giúp đỡ.', { level: 'B1' }),
  e('compare', 'verb', 'so sánh', 'Compare the two options.', 'Hãy so sánh hai lựa chọn.', { level: 'A2' }),
  e('consider', 'verb', 'xem xét, cân nhắc', 'Please consider my request.', 'Xin hãy xem xét yêu cầu của tôi.', { level: 'B1' }),
  e('create', 'verb', 'tạo ra', 'She created a new app.', 'Cô ấy tạo ra một ứng dụng mới.', { level: 'A2' }),
  e('culture', 'noun', 'văn hóa', 'Language and culture are linked.', 'Ngôn ngữ và văn hóa liên kết với nhau.', { level: 'B1' }),
  e('decision', 'noun', 'quyết định', 'It was a hard decision.', 'Đó là quyết định khó khăn.', { level: 'A2' }),
  e('develop', 'verb', 'phát triển', 'Children develop quickly.', 'Trẻ em phát triển nhanh.', { level: 'A2' }),
  e('difference', 'noun', 'sự khác biệt', 'There is a clear difference.', 'Có sự khác biệt rõ ràng.', { level: 'A2' }),
  e('economy', 'noun', 'nền kinh tế', 'The economy is growing.', 'Nền kinh tế đang tăng trưởng.', { level: 'B1' }),
  e('education', 'noun', 'giáo dục', 'Education is important.', 'Giáo dục rất quan trọng.', { level: 'A2' }),
  e('effect', 'noun', 'tác động, hiệu ứng', 'The effect was positive.', 'Tác động là tích cực.', { level: 'B1' }),
  e('efficient', 'adjective', 'hiệu quả (tiết kiệm)', 'An efficient system saves time.', 'Hệ thống hiệu quả tiết kiệm thời gian.', { level: 'B2' }),
  e('environment', 'noun', 'môi trường', 'We must protect the environment.', 'Chúng ta phải bảo vệ môi trường.', { level: 'B1' }),
  e('example', 'noun', 'ví dụ', 'For example, many cities...', 'Ví dụ, nhiều thành phố...', { level: 'A1' }),
  e('experience', 'noun', 'kinh nghiệm; trải nghiệm', 'Work experience matters.', 'Kinh nghiệm làm việc rất quan trọng.', { level: 'A2' }),
  e('factor', 'noun', 'yếu tố', 'Cost is an important factor.', 'Chi phí là một yếu tố quan trọng.', { level: 'B1' }),
  e('government', 'noun', 'chính phủ', 'The government announced a plan.', 'Chính phủ công bố một kế hoạch.', { level: 'B1' }),
  e('however', 'adverb', 'tuy nhiên', 'However, not everyone agrees.', 'Tuy nhiên, không phải ai cũng đồng ý.', { level: 'B1' }),
  e('improve', 'verb', 'cải thiện', 'Practice will improve your English.', 'Luyện tập sẽ cải thiện tiếng Anh của bạn.', { level: 'A2' }),
  e('include', 'verb', 'bao gồm', 'The price includes tax.', 'Giá đã bao gồm thuế.', { level: 'A2' }),
  e('increase', 'verb', 'tăng lên', 'Prices continue to increase.', 'Giá cả tiếp tục tăng.', { level: 'A2' }),
  e('individual', 'noun', 'cá nhân', 'Each individual is unique.', 'Mỗi cá nhân là độc đáo.', { level: 'B1' }),
  e('information', 'noun', 'thông tin', 'I need more information.', 'Tôi cần thêm thông tin.', { level: 'A2' }),
  e('issue', 'noun', 'vấn đề', 'This is a serious issue.', 'Đây là vấn đề nghiêm trọng.', { level: 'B1' }),
  e('knowledge', 'noun', 'kiến thức', 'Knowledge is power.', 'Kiến thức là sức mạnh.', { level: 'A2' }),
  e('level', 'noun', 'mức độ, cấp độ', 'What is your English level?', 'Trình độ tiếng Anh của bạn là gì?', { level: 'A2' }),
  e('major', 'adjective', 'chính, lớn', 'A major change is needed.', 'Cần một thay đổi lớn.', { level: 'B1' }),
  e('method', 'noun', 'phương pháp', 'This method works well.', 'Phương pháp này hiệu quả.', { level: 'B1' }),
  e('necessary', 'adjective', 'cần thiết', 'Sleep is necessary for health.', 'Ngủ là cần thiết cho sức khỏe.', { level: 'B1' }),
  e('opinion', 'noun', 'quan điểm', 'In my opinion, ...', 'Theo quan điểm của tôi, ...', { level: 'A2' }),
  e('opportunity', 'noun', 'cơ hội', 'This is a great opportunity.', 'Đây là cơ hội tuyệt vời.', { level: 'B1' }),
  e('pollution', 'noun', 'ô nhiễm', 'Air pollution is rising.', 'Ô nhiễm không khí đang tăng.', { level: 'B1' }),
  e('population', 'noun', 'dân số', 'The population is growing.', 'Dân số đang tăng.', { level: 'B1' }),
  e('possible', 'adjective', 'có thể', 'Is it possible to finish today?', 'Có thể hoàn thành hôm nay không?', { level: 'A2' }),
  e('problem', 'noun', 'vấn đề', 'We solved the problem.', 'Chúng tôi đã giải quyết vấn đề.', { level: 'A1' }),
  e('process', 'noun', 'quy trình', 'Learning is a long process.', 'Học tập là quá trình dài.', { level: 'B1' }),
  e('provide', 'verb', 'cung cấp', 'Schools provide free books.', 'Trường cung cấp sách miễn phí.', { level: 'B1' }),
  e('reason', 'noun', 'lý do', 'What is the reason?', 'Lý do là gì?', { level: 'A2' }),
  e('reduce', 'verb', 'giảm', 'We should reduce waste.', 'Chúng ta nên giảm rác thải.', { level: 'B1' }),
  e('require', 'verb', 'yêu cầu', 'This job requires skill.', 'Công việc này đòi hỏi kỹ năng.', { level: 'B1' }),
  e('research', 'noun', 'nghiên cứu', 'Further research is needed.', 'Cần nghiên cứu thêm.', { level: 'B1' }),
  e('result', 'noun', 'kết quả', 'The results were good.', 'Kết quả tốt.', { level: 'A2' }),
  e('society', 'noun', 'xã hội', 'Technology changes society.', 'Công nghệ thay đổi xã hội.', { level: 'B1' }),
  e('solution', 'noun', 'giải pháp', 'We need a better solution.', 'Chúng ta cần giải pháp tốt hơn.', { level: 'B1' }),
  e('technology', 'noun', 'công nghệ', 'Technology improves life.', 'Công nghệ cải thiện cuộc sống.', { level: 'A2' }),
  e('therefore', 'adverb', 'do đó', 'Therefore, we must act.', 'Do đó, chúng ta phải hành động.', { level: 'B2' }),
  e('transport', 'noun', 'giao thông, vận tải', 'Public transport is cheap.', 'Giao thông công cộng rẻ.', { level: 'B1' }),
  e('various', 'adjective', 'nhiều, đa dạng', 'There are various options.', 'Có nhiều lựa chọn khác nhau.', { level: 'B1' }),
  e('according to', 'phrase', 'theo (ai/cái gì)', 'According to the report, ...', 'Theo báo cáo, ...', { level: 'B1' }),
  e('as a result', 'phrase', 'kết quả là', 'As a result, sales increased.', 'Kết quả là doanh số tăng.', { level: 'B1' }),
  e('for example', 'phrase', 'ví dụ', 'For example, Japan...', 'Ví dụ, Nhật Bản...', { level: 'A2' }),
  e('in addition', 'phrase', 'ngoài ra', 'In addition, costs fell.', 'Ngoài ra, chi phí giảm.', { level: 'B1' }),
  e('in conclusion', 'phrase', 'kết luận', 'In conclusion, I believe...', 'Kết luận, tôi tin rằng...', { level: 'B1' }),
  e('in my opinion', 'phrase', 'theo tôi', 'In my opinion, education is key.', 'Theo tôi, giáo dục là then chốt.', { level: 'A2' }),
  e('on the other hand', 'phrase', 'mặt khác', 'On the other hand, risks remain.', 'Mặt khác, rủi ro vẫn còn.', { level: 'B1' }),
  e('due to', 'phrase', 'do (nguyên nhân)', 'Due to rain, the match was delayed.', 'Do mưa, trận đấu bị hoãn.', { level: 'B1' }),
  e('instead of', 'phrase', 'thay vì', 'Walk instead of driving.', 'Đi bộ thay vì lái xe.', { level: 'A2' }),
  e('rely on', 'phrase', 'dựa vào', 'Don\'t rely on luck.', 'Đừng dựa vào may mắn.', { level: 'B1' }),
  e('take place', 'phrase', 'diễn ra', 'The meeting will take place tomorrow.', 'Cuộc họp sẽ diễn ra vào ngày mai.', { level: 'B1' }),
  e('make sense', 'phrase', 'hợp lý, có nghĩa', 'That doesn\'t make sense.', 'Điều đó không hợp lý.', { level: 'B1' }),
  e('look up', 'phrase', 'tra cứu', 'Look up the word in a dictionary.', 'Tra từ trong từ điển.', { level: 'A2' }),
  e('give up', 'phrase', 'bỏ cuộc', 'Never give up learning.', 'Đừng bao giờ bỏ cuộc học.', { level: 'A2' }),
  e('carry out', 'phrase', 'thực hiện', 'They carried out the plan.', 'Họ thực hiện kế hoạch.', { level: 'B2' }),
  e('deal with', 'phrase', 'xử lý, đối phó', 'How do you deal with stress?', 'Bạn xử lý căng thẳng thế nào?', { level: 'B1' }),
  e('focus on', 'phrase', 'tập trung vào', 'Focus on your goals.', 'Tập trung vào mục tiêu của bạn.', { level: 'B1' }),
  e('lead to', 'phrase', 'dẫn đến', 'Smoking can lead to disease.', 'Hút thuốc có thể dẫn đến bệnh.', { level: 'B1' }),
  e('contribute to', 'phrase', 'góp phần vào', 'Exercise contributes to health.', 'Tập thể dục góp phần vào sức khỏe.', { level: 'B2' }),
  e('be aware of', 'phrase', 'nhận thức được', 'Be aware of the risks.', 'Hãy nhận thức rủi ro.', { level: 'B2' }),
  e('in order to', 'phrase', 'để (mục đích)', 'I study in order to improve.', 'Tôi học để cải thiện.', { level: 'B1' }),
  e('as well as', 'phrase', 'cũng như', 'English as well as French.', 'Tiếng Anh cũng như tiếng Pháp.', { level: 'B1' }),
  e('such as', 'phrase', 'chẳng hạn như', 'Sports such as football.', 'Thể thao chẳng hạn như bóng đá.', { level: 'A2' }),
  e('rather than', 'phrase', 'hơn là', 'Walk rather than drive.', 'Đi bộ hơn là lái xe.', { level: 'B2' }),
  e('responsible for', 'phrase', 'chịu trách nhiệm về', 'Who is responsible for this?', 'Ai chịu trách nhiệm việc này?', { level: 'B1' }),
  e('interested in', 'phrase', 'quan tâm đến', 'I am interested in history.', 'Tôi quan tâm đến lịch sử.', { level: 'A2' }),
  e('good at', 'phrase', 'giỏi về', 'She is good at math.', 'Cô ấy giỏi toán.', { level: 'A2' }),
  e('depend on', 'phrase', 'phụ thuộc vào', 'Success depends on effort.', 'Thành công phụ thuộc vào nỗ lực.', { level: 'B1' }),
  e('agree with', 'phrase', 'đồng ý với', 'I agree with your idea.', 'Tôi đồng ý với ý kiến của bạn.', { level: 'A2' }),
  e('disagree with', 'phrase', 'không đồng ý với', 'I disagree with that view.', 'Tôi không đồng ý quan điểm đó.', { level: 'A2' }),
  e('look forward to', 'phrase', 'mong đợi', 'I look forward to hearing from you.', 'Tôi mong được nghe tin từ bạn.', { level: 'B1' }),
  e('take care of', 'phrase', 'chăm sóc', 'Take care of your health.', 'Hãy chăm sóc sức khỏe của bạn.', { level: 'A2' }),
  e('get used to', 'phrase', 'làm quen với', 'I got used to waking early.', 'Tôi đã quen dậy sớm.', { level: 'B1' }),
  e('be used to', 'phrase', 'quen với', 'I am used to the noise.', 'Tôi quen với tiếng ồn.', { level: 'B1' }),
  e('make sure', 'phrase', 'đảm bảo', 'Make sure you lock the door.', 'Hãy chắc chắn khóa cửa.', { level: 'A2' }),
  e('find out', 'phrase', 'tìm ra, phát hiện', 'We need to find out why.', 'Chúng ta cần tìm ra lý do.', { level: 'A2' }),
  e('point out', 'phrase', 'chỉ ra', 'He pointed out the mistake.', 'Anh ấy chỉ ra lỗi sai.', { level: 'B1' }),
  e('set up', 'phrase', 'thiết lập, thành lập', 'They set up a company.', 'Họ thành lập một công ty.', { level: 'B1' }),
  e('figure out', 'phrase', 'hiểu ra, tìm cách', 'I can\'t figure out this problem.', 'Tôi không giải được bài này.', { level: 'B1' }),
  e('come up with', 'phrase', 'nghĩ ra', 'She came up with a solution.', 'Cô ấy nghĩ ra một giải pháp.', { level: 'B2' }),
  e('end up', 'phrase', 'cuối cùng thì', 'We ended up staying home.', 'Cuối cùng chúng tôi ở nhà.', { level: 'B1' }),
  e('turn out', 'phrase', 'hóa ra', 'It turned out to be true.', 'Hóa ra điều đó là đúng.', { level: 'B1' }),
  e('work out', 'phrase', 'giải quyết; tập gym', 'Things will work out.', 'Mọi thứ sẽ ổn thôi.', { level: 'B1' }),
  e('break down', 'phrase', 'hỏng; suy sụp', 'The car broke down.', 'Xe bị hỏng.', { level: 'B1' }),
  e('bring about', 'phrase', 'mang lại, gây ra', 'This will bring about change.', 'Điều này sẽ mang lại thay đổi.', { level: 'B2' }),
  e('put off', 'phrase', 'hoãn lại', 'Don\'t put off your homework.', 'Đừng hoãn bài tập.', { level: 'B1' }),
  e('run out of', 'phrase', 'hết (cái gì)', 'We ran out of time.', 'Chúng tôi hết thời gian.', { level: 'B1' }),
  e('keep up with', 'phrase', 'theo kịp', 'It\'s hard to keep up with news.', 'Khó theo kịp tin tức.', { level: 'B2' }),
  e('cut down on', 'phrase', 'giảm bớt', 'Cut down on sugar.', 'Hãy giảm đường.', { level: 'B1' }),
  e('look after', 'phrase', 'chăm sóc', 'Can you look after my dog?', 'Bạn có thể trông chó giúp tôi không?', { level: 'A2' }),
  e('look for', 'phrase', 'tìm kiếm', 'I am looking for a job.', 'Tôi đang tìm việc.', { level: 'A1' }),
  e('think about', 'phrase', 'nghĩ về', 'Think about your future.', 'Hãy nghĩ về tương lai của bạn.', { level: 'A1' }),
  e('talk about', 'phrase', 'nói về', 'Let\'s talk about the plan.', 'Hãy nói về kế hoạch.', { level: 'A1' }),
  e('worry about', 'phrase', 'lo lắng về', 'Don\'t worry about it.', 'Đừng lo về việc đó.', { level: 'A2' }),
  e('listen to', 'phrase', 'lắng nghe', 'Listen to the teacher.', 'Hãy lắng nghe giáo viên.', { level: 'A1' }),
  e('belong to', 'phrase', 'thuộc về', 'This book belongs to me.', 'Cuốn sách này thuộc về tôi.', { level: 'A2' }),
  e('consist of', 'phrase', 'bao gồm', 'The team consists of five people.', 'Nhóm gồm năm người.', { level: 'B1' }),
  e('based on', 'phrase', 'dựa trên', 'The film is based on a book.', 'Phim dựa trên một cuốn sách.', { level: 'B1' }),
  e('related to', 'phrase', 'liên quan đến', 'This is related to your topic.', 'Điều này liên quan đến chủ đề của bạn.', { level: 'B1' }),
  e('similar to', 'phrase', 'tương tự', 'Your idea is similar to mine.', 'Ý bạn tương tự ý tôi.', { level: 'A2' }),
  e('different from', 'phrase', 'khác với', 'This is different from that.', 'Cái này khác cái kia.', { level: 'A2' }),
  e('famous for', 'phrase', 'nổi tiếng vì', 'Paris is famous for art.', 'Paris nổi tiếng về nghệ thuật.', { level: 'A2' }),
  e('available', 'adjective', 'có sẵn', 'Is this room available?', 'Phòng này còn trống không?', { level: 'A2' }),
  e('significant', 'adjective', 'đáng kể, quan trọng', 'A significant improvement.', 'Sự cải thiện đáng kể.', { level: 'B2' }),
  e('essential', 'adjective', 'thiết yếu', 'Water is essential for life.', 'Nước thiết yếu cho sự sống.', { level: 'B1' }),
  e('global', 'adjective', 'toàn cầu', 'Global warming is real.', 'Nóng lên toàn cầu là thật.', { level: 'B1' }),
  e('local', 'adjective', 'địa phương', 'Support local businesses.', 'Hỗ trợ doanh nghiệp địa phương.', { level: 'A2' }),
  e('modern', 'adjective', 'hiện đại', 'Modern technology helps us.', 'Công nghệ hiện đại giúp chúng ta.', { level: 'A2' }),
  e('traditional', 'adjective', 'truyền thống', 'Traditional food is popular.', 'Đồ ăn truyền thống rất phổ biến.', { level: 'B1' }),
  e('successful', 'adjective', 'thành công', 'She is a successful writer.', 'Cô ấy là nhà văn thành công.', { level: 'A2' }),
  e('difficult', 'adjective', 'khó', 'This exam is difficult.', 'Bài thi này khó.', { level: 'A1' }),
  e('important', 'adjective', 'quan trọng', 'Health is important.', 'Sức khỏe rất quan trọng.', { level: 'A1' }),
  e('useful', 'adjective', 'hữu ích', 'This app is useful.', 'Ứng dụng này hữu ích.', { level: 'A1' }),
  e('renewable', 'adjective', 'tái tạo được', 'Renewable energy is clean.', 'Năng lượng tái tạo sạch.', { level: 'B2' }),
  e('sustainable', 'adjective', 'bền vững', 'We need sustainable growth.', 'Chúng ta cần tăng trưởng bền vững.', { level: 'B2' }),
]

const BY_KEY = new Map<string, PackEntry>()
for (const item of PACK) {
  BY_KEY.set(item.word.toLowerCase().trim(), item)
}

export function offlineDictSize(): number {
  return PACK.length
}

export function lookupOfflineDict(word: string): DictResult | null {
  const key = word.toLowerCase().trim().replace(/\s+/g, ' ')
  if (!key) return null
  const hit = BY_KEY.get(key)
  if (hit) return { ...hit, word: hit.word }

  // Thử dạng số nhiều đơn giản
  if (key.endsWith('ies') && key.length > 4) {
    const alt = BY_KEY.get(`${key.slice(0, -3)}y`)
    if (alt) return { ...alt }
  }
  if (key.endsWith('s') && key.length > 2) {
    const alt = BY_KEY.get(key.slice(0, -1))
    if (alt) return { ...alt }
  }
  if (key.endsWith('ed') && key.length > 3) {
    const alt = BY_KEY.get(key.slice(0, -2)) ?? BY_KEY.get(key.slice(0, -1))
    if (alt) return { ...alt }
  }
  if (key.endsWith('ing') && key.length > 4) {
    const alt = BY_KEY.get(key.slice(0, -3))
    if (alt) return { ...alt }
  }
  return null
}

export function listOfflineDictSample(limit = 20): string[] {
  return PACK.slice(0, limit).map(p => p.word)
}
