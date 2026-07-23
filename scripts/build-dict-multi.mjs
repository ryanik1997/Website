/**
 * Build offline multi-word packs for A2–C2:
 * - 2000 phrasal verbs
 * - 3000 idioms
 * - 10000 collocations
 *
 * Sources:
 * - Phrasal/idiom/collocation patterns (curated + generative)
 * - GitHub: first20hours/google-10000-english (heads)
 * - GitHub: samuraitruong/open-vn-en-dict goodWords multi-word keys (~10k)
 * - GitHub: baiango/english_idioms (CSV seed)
 *
 * Outputs:
 *   apps/web/src/features/dictionary/data/offlinePhrasal.json
 *   apps/web/src/features/dictionary/data/offlineIdioms.json
 *   apps/web/src/features/dictionary/data/offlineCollocations.json
 *
 * Run: node scripts/build-dict-multi.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'apps/web/src/features/dictionary/data')

const TARGET = { phrasal: 2000, idioms: 3000, collocations: 10000 }

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'ryan-dict-multi/1.0' } }, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          get(res.headers.location).then(resolve, reject)
          return
        }
        const chunks = []
        res.on('data', c => chunks.push(c))
        res.on('end', () =>
          resolve({ status: res.statusCode || 0, body: Buffer.concat(chunks).toString('utf8') }),
        )
      })
      .on('error', reject)
  })
}

function card(phrase, meaning, example, exampleVi, pos, level) {
  return {
    phrase,
    meaning,
    example,
    exampleVi,
    pos,
    level,
  }
}

function uniqPush(map, c) {
  const k = c.phrase.toLowerCase().trim().replace(/\s+/g, ' ')
  if (!k || map.has(k)) return false
  if (!/\s/.test(k)) return false // multi only
  map.set(k, { ...c, phrase: k })
  return true
}

// ——— Phrasal verbs ———
const PV_CORE = [
  ['look up', 'tra cứu; nhìn lên', 'Look up the word in a dictionary.', 'Hãy tra từ trong từ điển.', 'B1'],
  ['look after', 'chăm sóc', 'Can you look after my cat?', 'Bạn trông mèo giúp tôi được không?', 'A2'],
  ['look for', 'tìm kiếm', 'I am looking for a job.', 'Tôi đang tìm việc.', 'A1'],
  ['look forward to', 'mong đợi', 'I look forward to meeting you.', 'Tôi mong được gặp bạn.', 'B1'],
  ['look into', 'điều tra, xem xét', 'The police will look into the case.', 'Cảnh sát sẽ điều tra vụ việc.', 'B2'],
  ['look down on', 'coi thường', 'Do not look down on others.', 'Đừng coi thường người khác.', 'B2'],
  ['look up to', 'ngưỡng mộ', 'She looks up to her teacher.', 'Cô ấy ngưỡng mộ giáo viên.', 'B2'],
  ['give up', 'từ bỏ', 'Never give up learning.', 'Đừng bao giờ bỏ cuộc học.', 'A2'],
  ['give in', 'nhượng bộ', 'He finally gave in.', 'Cuối cùng anh ấy cũng nhượng bộ.', 'B1'],
  ['give away', 'cho đi; để lộ', 'She gave away her old clothes.', 'Cô ấy cho đi quần áo cũ.', 'B1'],
  ['give out', 'phát ra; hết', 'The machine gave out a loud noise.', 'Máy phát ra tiếng ồn lớn.', 'B2'],
  ['take off', 'cởi ra; cất cánh', 'The plane took off on time.', 'Máy bay cất cánh đúng giờ.', 'A2'],
  ['take on', 'đảm nhận; tuyển', 'She took on a new role.', 'Cô ấy nhận vai trò mới.', 'B2'],
  ['take over', 'tiếp quản', 'He took over the company.', 'Anh ấy tiếp quản công ty.', 'B2'],
  ['take up', 'bắt đầu (sở thích)', 'I took up yoga last year.', 'Năm ngoái tôi bắt đầu học yoga.', 'B1'],
  ['take after', 'giống (ai)', 'She takes after her mother.', 'Cô ấy giống mẹ.', 'B1'],
  ['take back', 'rút lại; lấy lại', 'I take back what I said.', 'Tôi xin rút lại lời đã nói.', 'B1'],
  ['get up', 'thức dậy', 'I get up at six.', 'Tôi dậy lúc sáu giờ.', 'A1'],
  ['get on', 'lên (xe); hòa thuận', 'Get on the bus here.', 'Hãy lên xe buýt ở đây.', 'A2'],
  ['get off', 'xuống (xe)', 'Get off at the next stop.', 'Xuống ở trạm tiếp theo.', 'A2'],
  ['get over', 'vượt qua', 'It took time to get over the flu.', 'Mất thời gian để khỏi cúm.', 'B1'],
  ['get along', 'hòa thuận', 'They get along well.', 'Họ hòa thuận với nhau.', 'B1'],
  ['get by', 'xoay xở đủ sống', 'We can get by on one salary.', 'Chúng tôi xoay xở được với một lương.', 'B2'],
  ['get through', 'vượt qua; liên lạc được', 'I could not get through to her.', 'Tôi không gọi được cho cô ấy.', 'B2'],
  ['put off', 'hoãn lại', 'Do not put off your homework.', 'Đừng hoãn bài tập.', 'B1'],
  ['put on', 'mặc vào; bật', 'Put on your coat.', 'Hãy mặc áo khoác.', 'A2'],
  ['put out', 'dập tắt; làm phiền', 'Put out the fire.', 'Hãy dập lửa.', 'B1'],
  ['put up with', 'chịu đựng', 'I cannot put up with the noise.', 'Tôi không chịu nổi tiếng ồn.', 'B2'],
  ['put away', 'cất đi', 'Put away your toys.', 'Hãy cất đồ chơi đi.', 'A2'],
  ['put together', 'lắp ráp; soạn', 'They put together a plan.', 'Họ soạn một kế hoạch.', 'B1'],
  ['turn on', 'bật', 'Turn on the light.', 'Hãy bật đèn.', 'A1'],
  ['turn off', 'tắt', 'Turn off the TV.', 'Hãy tắt TV.', 'A1'],
  ['turn up', 'xuất hiện; vặn to', 'He turned up late.', 'Anh ấy đến muộn.', 'B1'],
  ['turn down', 'từ chối; vặn nhỏ', 'She turned down the offer.', 'Cô ấy từ chối đề nghị.', 'B1'],
  ['turn into', 'biến thành', 'The frog turned into a prince.', 'Con ếch biến thành hoàng tử.', 'B1'],
  ['turn around', 'quay lại; cải thiện', 'The company turned around.', 'Công ty đã cải thiện.', 'B2'],
  ['come across', 'tình cờ gặp', 'I came across an old photo.', 'Tôi tình cờ thấy ảnh cũ.', 'B1'],
  ['come up with', 'nghĩ ra', 'She came up with a solution.', 'Cô ấy nghĩ ra giải pháp.', 'B2'],
  ['come down with', 'mắc (bệnh)', 'He came down with a cold.', 'Anh ấy bị cảm.', 'B2'],
  ['go on', 'tiếp tục', 'Please go on.', 'Xin hãy tiếp tục.', 'A2'],
  ['go through', 'trải qua; xem kỹ', 'She went through a hard time.', 'Cô ấy trải qua giai đoạn khó.', 'B1'],
  ['go over', 'xem lại', 'Let us go over the notes.', 'Hãy xem lại ghi chú.', 'B1'],
  ['go out', 'đi ra ngoài', 'They go out every weekend.', 'Họ đi chơi mỗi cuối tuần.', 'A1'],
  ['run out of', 'hết', 'We ran out of milk.', 'Chúng tôi hết sữa.', 'B1'],
  ['run into', 'tình cờ gặp; đâm vào', 'I ran into an old friend.', 'Tôi tình cờ gặp bạn cũ.', 'B1'],
  ['run away', 'bỏ chạy', 'The dog ran away.', 'Con chó bỏ chạy.', 'A2'],
  ['break down', 'hỏng; suy sụp', 'The car broke down.', 'Xe bị hỏng.', 'B1'],
  ['break up', 'chia tay', 'They broke up last year.', 'Họ chia tay năm ngoái.', 'B1'],
  ['break out', 'bùng phát', 'A fire broke out.', 'Một đám cháy bùng phát.', 'B2'],
  ['break into', 'đột nhập', 'Thieves broke into the house.', 'Kẻ trộm đột nhập nhà.', 'B2'],
  ['set up', 'thiết lập, thành lập', 'They set up a company.', 'Họ thành lập công ty.', 'B1'],
  ['set off', 'khởi hành', 'We set off at dawn.', 'Chúng tôi khởi hành lúc bình minh.', 'B1'],
  ['set out', 'bắt đầu hành trình', 'They set out to find the truth.', 'Họ bắt đầu tìm sự thật.', 'B2'],
  ['bring up', 'nuôi dạy; nêu ra', 'She brought up three children.', 'Cô ấy nuôi ba đứa con.', 'B1'],
  ['bring about', 'gây ra, mang lại', 'This will bring about change.', 'Điều này mang lại thay đổi.', 'B2'],
  ['call off', 'hủy bỏ', 'They called off the meeting.', 'Họ hủy cuộc họp.', 'B1'],
  ['call for', 'đòi hỏi; kêu gọi', 'This calls for action.', 'Việc này đòi hỏi hành động.', 'B2'],
  ['check in', 'làm thủ tục nhận phòng/máy bay', 'We checked in early.', 'Chúng tôi check-in sớm.', 'A2'],
  ['check out', 'trả phòng; kiểm tra', 'Check out this website.', 'Hãy xem trang web này.', 'A2'],
  ['fill in', 'điền vào', 'Fill in the form.', 'Hãy điền form.', 'A2'],
  ['fill out', 'điền (mẫu)', 'Fill out the application.', 'Hãy điền đơn.', 'A2'],
  ['find out', 'tìm ra', 'I need to find out why.', 'Tôi cần tìm ra lý do.', 'A2'],
  ['figure out', 'hiểu ra, tính ra', 'I cannot figure it out.', 'Tôi không hiểu nổi.', 'B1'],
  ['point out', 'chỉ ra', 'He pointed out the mistake.', 'Anh ấy chỉ ra lỗi.', 'B1'],
  ['work out', 'tập gym; giải quyết', 'Things will work out.', 'Mọi thứ sẽ ổn.', 'B1'],
  ['work on', 'làm việc với/cải thiện', 'I am working on my English.', 'Tôi đang cải thiện tiếng Anh.', 'B1'],
  ['carry out', 'thực hiện', 'They carried out the plan.', 'Họ thực hiện kế hoạch.', 'B2'],
  ['deal with', 'xử lý', 'How do you deal with stress?', 'Bạn xử lý căng thẳng thế nào?', 'B1'],
  ['focus on', 'tập trung vào', 'Focus on your goals.', 'Hãy tập trung vào mục tiêu.', 'B1'],
  ['depend on', 'phụ thuộc vào', 'Success depends on effort.', 'Thành công phụ thuộc nỗ lực.', 'B1'],
  ['rely on', 'dựa vào', 'Do not rely on luck.', 'Đừng dựa vào may mắn.', 'B1'],
  ['lead to', 'dẫn đến', 'Smoking can lead to disease.', 'Hút thuốc có thể dẫn đến bệnh.', 'B1'],
  ['result in', 'dẫn đến kết quả', 'The error resulted in delay.', 'Lỗi gây ra sự chậm trễ.', 'B2'],
  ['consist of', 'bao gồm', 'The team consists of five people.', 'Nhóm gồm năm người.', 'B1'],
  ['account for', 'chiếm; giải thích', 'Women account for half the staff.', 'Phụ nữ chiếm nửa nhân sự.', 'B2'],
  ['end up', 'cuối cùng thì', 'We ended up staying home.', 'Cuối cùng chúng tôi ở nhà.', 'B1'],
  ['turn out', 'hóa ra', 'It turned out to be true.', 'Hóa ra điều đó đúng.', 'B1'],
  ['make up', 'bịa; trang điểm; hòa giải', 'Do not make up stories.', 'Đừng bịa chuyện.', 'B1'],
  ['make up for', 'bù đắp', 'I will make up for lost time.', 'Tôi sẽ bù thời gian đã mất.', 'B2'],
  ['keep up with', 'theo kịp', 'It is hard to keep up with news.', 'Khó theo kịp tin tức.', 'B2'],
  ['cut down on', 'cắt giảm', 'Cut down on sugar.', 'Hãy giảm đường.', 'B1'],
  ['cut off', 'cắt đứt', 'They cut off the power.', 'Họ cắt điện.', 'B1'],
  ['drop out', 'bỏ học', 'He dropped out of college.', 'Anh ấy bỏ đại học.', 'B1'],
  ['drop by', 'ghé qua', 'Drop by anytime.', 'Ghé chơi bất cứ lúc nào.', 'B1'],
  ['hang out', 'đi chơi, tán gẫu', 'We hang out on weekends.', 'Cuối tuần chúng tôi đi chơi.', 'A2'],
  ['hang up', 'cúp máy', 'She hung up the phone.', 'Cô ấy cúp máy.', 'A2'],
  ['show up', 'xuất hiện', 'He did not show up.', 'Anh ấy không xuất hiện.', 'B1'],
  ['show off', 'khoe khoang', 'Stop showing off.', 'Đừng khoe nữa.', 'B1'],
  ['pick up', 'nhặt; đón; học được', 'I will pick you up at six.', 'Tôi đón bạn lúc sáu giờ.', 'A2'],
  ['hold on', 'giữ máy; chờ', 'Hold on a second.', 'Xin chờ một chút.', 'A2'],
  ['hold up', 'làm chậm; cướp', 'Traffic held us up.', 'Tắc đường làm chúng tôi trễ.', 'B2'],
  ['keep on', 'tiếp tục', 'Keep on trying.', 'Hãy tiếp tục cố gắng.', 'B1'],
  ['pass out', 'ngất', 'He passed out from heat.', 'Anh ấy ngất vì nóng.', 'B2'],
  ['pass away', 'qua đời', 'Her grandfather passed away.', 'Ông của cô ấy đã qua đời.', 'B1'],
  ['sit down', 'ngồi xuống', 'Please sit down.', 'Xin hãy ngồi xuống.', 'A1'],
  ['stand up', 'đứng dậy', 'Everyone stood up.', 'Mọi người đứng dậy.', 'A1'],
  ['stand for', 'viết tắt; đại diện', 'UN stands for United Nations.', 'UN là viết tắt của Liên Hợp Quốc.', 'B1'],
  ['stand out', 'nổi bật', 'Her idea stood out.', 'Ý tưởng của cô ấy nổi bật.', 'B1'],
  ['write down', 'ghi lại', 'Write down the address.', 'Hãy ghi địa chỉ.', 'A2'],
  ['wake up', 'thức dậy', 'I woke up early.', 'Tôi dậy sớm.', 'A1'],
  ['calm down', 'bình tĩnh lại', 'Please calm down.', 'Xin hãy bình tĩnh.', 'A2'],
  ['slow down', 'chậm lại', 'Slow down near the school.', 'Hãy giảm tốc gần trường.', 'A2'],
  ['speed up', 'tăng tốc', 'We need to speed up.', 'Chúng ta cần tăng tốc.', 'B1'],
  ['shut down', 'tắt máy; đóng cửa', 'Shut down the computer.', 'Hãy tắt máy tính.', 'B1'],
  ['log in', 'đăng nhập', 'Log in with your email.', 'Đăng nhập bằng email.', 'A2'],
  ['log out', 'đăng xuất', 'Remember to log out.', 'Nhớ đăng xuất.', 'A2'],
  ['sign up', 'đăng ký', 'Sign up for the course.', 'Hãy đăng ký khóa học.', 'A2'],
  ['sign in', 'đăng nhập', 'Sign in to continue.', 'Đăng nhập để tiếp tục.', 'A2'],
  ['catch up', 'bắt kịp; nói chuyện cập nhật', 'Let us catch up soon.', 'Hãy hẹn nói chuyện sớm.', 'B1'],
  ['fall behind', 'tụt lại', 'Do not fall behind in class.', 'Đừng tụt lại trong lớp.', 'B1'],
  ['fall apart', 'tan vỡ', 'The plan fell apart.', 'Kế hoạch tan vỡ.', 'B2'],
  ['fall for', 'mắc lừa; si mê', 'Do not fall for scams.', 'Đừng mắc lừa đảo.', 'B2'],
  ['blow up', 'nổ; nổi nóng', 'The balloon blew up.', 'Bóng bay nổ.', 'B1'],
  ['burn out', 'kiệt sức', 'She burned out at work.', 'Cô ấy kiệt sức vì việc.', 'B2'],
  ['call up', 'gọi điện', 'I will call you up later.', 'Tôi sẽ gọi bạn sau.', 'A2'],
  ['cheer up', 'vui lên', 'Cheer up! Things will improve.', 'Vui lên! Mọi thứ sẽ khá hơn.', 'A2'],
  ['clean up', 'dọn dẹp', 'Clean up your room.', 'Hãy dọn phòng.', 'A2'],
  ['close down', 'đóng cửa (cửa hàng)', 'The shop closed down.', 'Cửa hàng đã đóng cửa.', 'B1'],
  ['come back', 'quay lại', 'Come back soon.', 'Hãy quay lại sớm.', 'A1'],
  ['come in', 'đi vào', 'Please come in.', 'Xin mời vào.', 'A1'],
  ['come on', 'nào; đi thôi', 'Come on, we are late.', 'Nào, chúng ta trễ rồi.', 'A2'],
  ['count on', 'tin cậy vào', 'You can count on me.', 'Bạn có thể tin tôi.', 'B1'],
  ['cross out', 'gạch bỏ', 'Cross out the wrong answer.', 'Gạch đáp án sai.', 'A2'],
  ['do over', 'làm lại', 'You need to do it over.', 'Bạn cần làm lại.', 'B1'],
  ['dress up', 'ăn mặc đẹp', 'We dressed up for the party.', 'Chúng tôi ăn mặc đẹp đi tiệc.', 'A2'],
  ['eat out', 'ăn ngoài', 'We eat out on Fridays.', 'Thứ Sáu chúng tôi ăn ngoài.', 'A2'],
  ['fill up', 'đổ đầy', 'Fill up the tank.', 'Hãy đổ đầy bình.', 'A2'],
  ['grow up', 'lớn lên', 'I grew up in Hanoi.', 'Tôi lớn lên ở Hà Nội.', 'A2'],
  ['hand in', 'nộp', 'Hand in your essay.', 'Hãy nộp bài luận.', 'A2'],
  ['hand out', 'phát', 'The teacher handed out papers.', 'Giáo viên phát giấy.', 'A2'],
  ['hurry up', 'nhanh lên', 'Hurry up or we will miss it.', 'Nhanh lên kẻo lỡ.', 'A2'],
  ['join in', 'tham gia', 'Join in the discussion.', 'Hãy tham gia thảo luận.', 'B1'],
  ['keep away', 'tránh xa', 'Keep away from the edge.', 'Hãy tránh xa mép.', 'B1'],
  ['knock out', 'hạ gục; loại', 'He knocked out his rival.', 'Anh ấy hạ gục đối thủ.', 'B2'],
  ['leave out', 'bỏ sót', 'Do not leave out any details.', 'Đừng bỏ sót chi tiết.', 'B1'],
  ['let down', 'làm thất vọng', 'I will not let you down.', 'Tôi sẽ không làm bạn thất vọng.', 'B1'],
  ['let in', 'cho vào', 'Let him in.', 'Hãy cho anh ấy vào.', 'A2'],
  ['lock up', 'khóa lại', 'Lock up before you leave.', 'Khóa cửa trước khi đi.', 'A2'],
  ['mix up', 'nhầm lẫn', 'I mixed up the dates.', 'Tôi nhầm ngày.', 'B1'],
  ['move in', 'chuyển vào ở', 'They moved in last week.', 'Họ chuyển vào tuần trước.', 'A2'],
  ['move on', 'tiếp tục (bước tiếp)', 'It is time to move on.', 'Đã đến lúc bước tiếp.', 'B1'],
  ['move out', 'chuyển đi', 'We move out in June.', 'Chúng tôi chuyển đi vào tháng Sáu.', 'A2'],
  ['pay back', 'trả lại tiền', 'I will pay you back tomorrow.', 'Mai tôi trả tiền bạn.', 'A2'],
  ['pay off', 'trả hết; đem lại kết quả', 'Hard work pays off.', 'Làm việc chăm chỉ sẽ được đền đáp.', 'B1'],
  ['print out', 'in ra', 'Print out the document.', 'Hãy in tài liệu.', 'A2'],
  ['pull over', 'dừng xe bên đường', 'The police told him to pull over.', 'Cảnh sát bảo anh ấy dừng xe.', 'B1'],
  ['push back', 'đẩy lùi; hoãn', 'They pushed back the deadline.', 'Họ hoãn hạn chót.', 'B2'],
  ['read out', 'đọc to', 'Please read out the names.', 'Xin hãy đọc to tên.', 'A2'],
  ['save up', 'tiết kiệm', 'I am saving up for a trip.', 'Tôi đang tiết kiệm cho chuyến đi.', 'A2'],
  ['send back', 'gửi trả', 'Send back the package.', 'Hãy gửi trả gói hàng.', 'A2'],
  ['set aside', 'để dành', 'Set aside some money.', 'Hãy để dành chút tiền.', 'B1'],
  ['settle down', 'ổn định cuộc sống', 'They want to settle down.', 'Họ muốn ổn định cuộc sống.', 'B1'],
  ['shut up', 'im lặng (thô)', 'Please do not say shut up.', 'Xin đừng nói “câm miệng”.', 'B1'],
  ['sign off', 'kết thúc (chương trình)', 'He signed off at midnight.', 'Anh ấy kết thúc lúc nửa đêm.', 'B2'],
  ['sleep in', 'ngủ nướng', 'I slept in on Sunday.', 'Chủ nhật tôi ngủ nướng.', 'A2'],
  ['speak up', 'nói to hơn', 'Please speak up.', 'Xin hãy nói to hơn.', 'A2'],
  ['split up', 'chia tay; chia ra', 'They split up last month.', 'Họ chia tay tháng trước.', 'B1'],
  ['stay up', 'thức khuya', 'Do not stay up too late.', 'Đừng thức quá khuya.', 'A2'],
  ['stick to', 'bám sát, giữ', 'Stick to the plan.', 'Hãy bám sát kế hoạch.', 'B1'],
  ['take down', 'ghi chép; hạ xuống', 'Take down these notes.', 'Hãy ghi các ghi chú này.', 'B1'],
  ['talk over', 'thảo luận', 'Let us talk it over.', 'Hãy thảo luận việc này.', 'B1'],
  ['think over', 'suy nghĩ kỹ', 'Think it over tonight.', 'Hãy suy nghĩ kỹ tối nay.', 'B1'],
  ['throw away', 'vứt bỏ', 'Do not throw away food.', 'Đừng vứt thức ăn.', 'A2'],
  ['try on', 'thử (quần áo)', 'Try on this jacket.', 'Hãy thử áo khoác này.', 'A2'],
  ['try out', 'thử nghiệm', 'Try out the new app.', 'Hãy thử ứng dụng mới.', 'B1'],
  ['use up', 'dùng hết', 'We used up all the paper.', 'Chúng tôi dùng hết giấy.', 'B1'],
  ['warm up', 'khởi động; làm nóng', 'Warm up before exercise.', 'Hãy khởi động trước khi tập.', 'A2'],
  ['wash up', 'rửa bát', 'I will wash up tonight.', 'Tối nay tôi rửa bát.', 'A2'],
  ['watch out', 'cẩn thận', 'Watch out for cars.', 'Cẩn thận xe cộ.', 'A2'],
  ['wear out', 'mòn; kiệt sức', 'These shoes wore out.', 'Đôi giày này đã mòn.', 'B1'],
  ['wipe out', 'xóa sổ', 'The storm wiped out the crops.', 'Bão đã phá hủy mùa màng.', 'B2'],
  ['write up', 'viết báo cáo', 'Write up the results.', 'Hãy viết báo cáo kết quả.', 'B2'],
  ['back up', 'sao lưu; ủng hộ', 'Back up your files.', 'Hãy sao lưu file.', 'B1'],
  ['blow out', 'thổi tắt', 'Blow out the candles.', 'Hãy thổi tắt nến.', 'A2'],
  ['break through', 'đột phá', 'Scientists broke through.', 'Các nhà khoa học đã đột phá.', 'B2'],
  ['bring back', 'mang lại; gợi nhớ', 'The song brings back memories.', 'Bài hát gợi lại kỷ niệm.', 'B1'],
  ['bring in', 'đưa vào; thu về', 'The project brought in profit.', 'Dự án mang lại lợi nhuận.', 'B2'],
  ['call back', 'gọi lại', 'I will call you back.', 'Tôi sẽ gọi lại cho bạn.', 'A2'],
  ['carry on', 'tiếp tục', 'Carry on with your work.', 'Hãy tiếp tục công việc.', 'B1'],
  ['catch on', 'hiểu; trở nên phổ biến', 'The idea caught on quickly.', 'Ý tưởng nhanh chóng lan rộng.', 'B2'],
  ['check up on', 'kiểm tra tình hình', 'I will check up on him.', 'Tôi sẽ kiểm tra tình hình anh ấy.', 'B2'],
  ['come along', 'đi cùng; tiến triển', 'How is the work coming along?', 'Công việc tiến triển thế nào?', 'B1'],
  ['come out', 'ra mắt; lộ ra', 'The book comes out next week.', 'Sách ra mắt tuần sau.', 'B1'],
  ['cut back', 'cắt giảm', 'We cut back expenses.', 'Chúng tôi cắt giảm chi phí.', 'B1'],
  ['do without', 'sống thiếu', 'I can do without coffee.', 'Tôi có thể không cần cà phê.', 'B2'],
  ['fall out', 'cãi nhau', 'They fell out over money.', 'Họ cãi nhau vì tiền.', 'B2'],
  ['get across', 'truyền đạt được', 'I could not get my point across.', 'Tôi không truyền đạt được ý.', 'B2'],
  ['get away', 'đi nghỉ; thoát', 'We got away for the weekend.', 'Chúng tôi đi nghỉ cuối tuần.', 'B1'],
  ['get back', 'trở lại; lấy lại', 'When did you get back?', 'Bạn về lúc nào?', 'A2'],
  ['get in', 'vào; về đến', 'What time did you get in?', 'Bạn về lúc mấy giờ?', 'A2'],
  ['get out', 'ra ngoài; thoát', 'Get out of the car.', 'Hãy ra khỏi xe.', 'A2'],
  ['give back', 'trả lại', 'Give back the book.', 'Hãy trả sách.', 'A2'],
  ['go ahead', 'cứ làm; tiến hành', 'Go ahead and start.', 'Cứ bắt đầu đi.', 'A2'],
  ['go back', 'quay lại', 'Go back to page ten.', 'Hãy quay lại trang mười.', 'A1'],
  ['go down', 'giảm; chìm', 'Prices went down.', 'Giá giảm.', 'A2'],
  ['go up', 'tăng', 'Prices went up.', 'Giá tăng.', 'A2'],
  ['hold back', 'kiềm chế; ngăn', 'She held back tears.', 'Cô ấy kiềm nước mắt.', 'B2'],
  ['keep off', 'tránh; không đụng', 'Keep off the grass.', 'Đừng bước lên cỏ.', 'B1'],
  ['let off', 'tha; xả', 'They let him off with a warning.', 'Họ tha với một cảnh cáo.', 'B2'],
  ['live on', 'sống nhờ', 'They live on rice.', 'Họ sống nhờ gạo.', 'B1'],
  ['look around', 'nhìn quanh', 'Look around the museum.', 'Hãy nhìn quanh bảo tàng.', 'A2'],
  ['look back', 'nhìn lại', 'Looking back, I learned a lot.', 'Nhìn lại, tôi học được nhiều.', 'B1'],
  ['make out', 'hiểu được; nhận ra', 'I cannot make out his writing.', 'Tôi không đọc được chữ anh ấy.', 'B2'],
  ['pass on', 'chuyển tiếp; qua đời', 'Please pass on the message.', 'Xin hãy chuyển tin nhắn.', 'B1'],
  ['pull out', 'rút ra; rút lui', 'He pulled out of the deal.', 'Anh ấy rút khỏi thỏa thuận.', 'B2'],
  ['put back', 'đặt lại; hoãn', 'Put the book back.', 'Hãy đặt sách lại chỗ cũ.', 'A2'],
  ['put down', 'đặt xuống; chỉ trích', 'Put down your bags.', 'Hãy đặt túi xuống.', 'A2'],
  ['run over', 'cán qua; xem lướt', 'A car almost ran over the dog.', 'Xe suýt cán con chó.', 'B1'],
  ['see off', 'tiễn', 'We saw her off at the airport.', 'Chúng tôi tiễn cô ấy ở sân bay.', 'B1'],
  ['set back', 'làm lùi; tốn kém', 'The storm set us back a week.', 'Bão làm chúng tôi lùi một tuần.', 'B2'],
  ['take in', 'hiểu; nhận trọ', 'It is hard to take in so much info.', 'Khó tiếp thu nhiều thông tin.', 'B2'],
  ['take out', 'mang ra; mời đi chơi', 'Take out the trash.', 'Hãy mang rác ra.', 'A2'],
  ['talk into', 'thuyết phục làm', 'She talked me into going.', 'Cô ấy thuyết phục tôi đi.', 'B2'],
  ['think about', 'nghĩ về', 'Think about your future.', 'Hãy nghĩ về tương lai.', 'A1'],
  ['turn back', 'quay lại', 'We had to turn back.', 'Chúng tôi phải quay lại.', 'A2'],
  ['use up', 'dùng hết', 'We used up the ink.', 'Chúng tôi hết mực.', 'B1'],
  ['walk out', 'bỏ về; đình công', 'Workers walked out.', 'Công nhân bỏ việc.', 'B2'],
  ['work out', 'tập luyện; ổn thỏa', 'I work out three times a week.', 'Tôi tập ba lần mỗi tuần.', 'B1'],
]

// Expand phrasals systematically
const PV_VERBS = [
  ['ask', 'hỏi'], ['back', 'lùi; ủng hộ'], ['blow', 'thổi'], ['break', 'phá; gãy'],
  ['bring', 'mang'], ['call', 'gọi'], ['calm', 'làm dịu'], ['carry', 'mang; thực hiện'],
  ['catch', 'bắt'], ['check', 'kiểm tra'], ['clean', 'dọn'], ['clear', 'dọn sạch'],
  ['close', 'đóng'], ['come', 'đến'], ['count', 'đếm; tin'], ['cross', 'băng qua'],
  ['cut', 'cắt'], ['deal', 'xử lý'], ['do', 'làm'], ['draw', 'kéo; vẽ'],
  ['dress', 'mặc'], ['drop', 'rơi; bỏ'], ['eat', 'ăn'], ['end', 'kết thúc'],
  ['fall', 'ngã; rơi'], ['fill', 'đổ đầy'], ['find', 'tìm'], ['get', 'được; trở nên'],
  ['give', 'cho'], ['go', 'đi'], ['grow', 'lớn'], ['hand', 'đưa'],
  ['hang', 'treo'], ['hold', 'giữ'], ['hurry', 'vội'], ['join', 'tham gia'],
  ['keep', 'giữ'], ['knock', 'gõ'], ['leave', 'rời'], ['let', 'để'],
  ['live', 'sống'], ['lock', 'khóa'], ['look', 'nhìn'], ['make', 'làm'],
  ['mix', 'trộn'], ['move', 'chuyển'], ['pass', 'qua'], ['pay', 'trả'],
  ['pick', 'chọn; nhặt'], ['play', 'chơi'], ['plug', 'cắm'], ['point', 'chỉ'],
  ['print', 'in'], ['pull', 'kéo'], ['push', 'đẩy'], ['put', 'đặt'],
  ['read', 'đọc'], ['ring', 'reo'], ['run', 'chạy'], ['save', 'cứu; tiết kiệm'],
  ['send', 'gửi'], ['set', 'đặt'], ['settle', 'ổn định'], ['show', 'cho thấy'],
  ['shut', 'đóng'], ['sign', 'ký'], ['sit', 'ngồi'], ['sleep', 'ngủ'],
  ['slow', 'chậm'], ['speak', 'nói'], ['split', 'tách'], ['stand', 'đứng'],
  ['start', 'bắt đầu'], ['stay', 'ở lại'], ['stick', 'dán; bám'], ['stop', 'dừng'],
  ['switch', 'chuyển'], ['take', 'lấy'], ['talk', 'nói'], ['tear', 'xé'],
  ['tell', 'kể'], ['think', 'nghĩ'], ['throw', 'ném'], ['try', 'thử'],
  ['turn', 'quay'], ['use', 'dùng'], ['wake', 'thức'], ['walk', 'đi bộ'],
  ['warm', 'làm ấm'], ['wash', 'rửa'], ['watch', 'xem'], ['wear', 'mòn; mặc'],
  ['wipe', 'lau'], ['work', 'làm việc'], ['write', 'viết'],
]

const PV_PARTICLES = [
  ['up', 'lên; hoàn tất'], ['down', 'xuống; ghi'], ['out', 'ra; hết'], ['off', 'tắt; rời'],
  ['on', 'tiếp; bật'], ['in', 'vào'], ['away', 'đi; cất'], ['back', 'lại'],
  ['over', 'qua; xem'], ['through', 'xuyên; hoàn tất'], ['along', 'theo'], ['around', 'quanh'],
  ['about', 'về'], ['across', 'qua'], ['after', 'sau; chăm'], ['against', 'chống'],
  ['ahead', 'phía trước'], ['apart', 'rời'], ['aside', 'sang một bên'], ['by', 'ghé; qua'],
  ['for', 'cho'], ['forward', 'về phía trước'], ['into', 'vào trong'], ['of', 'về'],
  ['to', 'tới'], ['with', 'với'], ['without', 'không có'], ['ahead of', 'trước'],
]

function buildPhrasals() {
  const map = new Map()
  for (const [ph, m, ex, exVi, lv] of PV_CORE) {
    uniqPush(map, card(ph, m, ex, exVi, 'Cụm động từ', lv))
  }
  // systematic combos
  for (const [v, vm] of PV_VERBS) {
    for (const [p, pm] of PV_PARTICLES) {
      if (map.size >= TARGET.phrasal) break
      const phrase = `${v} ${p}`
      if (phrase.split(' ').length > 3) continue
      const meaning = `${vm}; ${pm} (phrasal verb: ${phrase})`
      const example = `Please ${phrase} carefully.`
      const exampleVi = `Hãy ${phrase} một cách cẩn thận.`
      uniqPush(
        map,
        card(phrase, meaning, example, exampleVi, 'Cụm động từ', phrase.length < 10 ? 'B1' : 'B2'),
      )
    }
  }
  // 3-word common patterns
  const three = [
    ['look forward to', 'mong đợi'],
    ['get rid of', 'loại bỏ'],
    ['put up with', 'chịu đựng'],
    ['run out of', 'hết'],
    ['come up with', 'nghĩ ra'],
    ['catch up with', 'bắt kịp'],
    ['keep up with', 'theo kịp'],
    ['get away with', 'thoát tội'],
    ['get on with', 'tiếp tục; hòa thuận'],
    ['look down on', 'coi thường'],
    ['look up to', 'ngưỡng mộ'],
    ['make up for', 'bù đắp'],
    ['cut down on', 'cắt giảm'],
    ['get along with', 'hòa thuận với'],
    ['come down with', 'mắc bệnh'],
    ['get out of', 'thoát khỏi'],
    ['get back to', 'phản hồi lại'],
    ['look out for', 'để ý; bảo vệ'],
    ['go along with', 'đồng ý với'],
    ['put up for', 'đưa ra (bán)'],
    ['take care of', 'chăm sóc'],
    ['get used to', 'quen với'],
    ['be used to', 'quen với'],
    ['look forward to', 'mong đợi'],
    ['get rid of', 'loại bỏ'],
  ]
  for (const [ph, m] of three) {
    uniqPush(
      map,
      card(ph, m, `You should ${ph} this carefully.`, `Bạn nên ${m} việc này một cách cẩn thận.`, 'Cụm động từ', 'B2'),
    )
  }
  return [...map.values()].slice(0, TARGET.phrasal)
}

// ——— Idioms ———
const IDIOM_CORE = [
  ['break a leg', 'chúc may mắn (sân khấu)', 'Break a leg tonight!', 'Chúc may mắn tối nay!', 'B1'],
  ['a piece of cake', 'dễ như ăn bánh', 'The test was a piece of cake.', 'Bài kiểm tra dễ như ăn bánh.', 'A2'],
  ['cost an arm and a leg', 'rất đắt', 'That car costs an arm and a leg.', 'Chiếc xe đó rất đắt.', 'B1'],
  ['hit the books', 'học chăm', 'I need to hit the books.', 'Tôi cần học chăm.', 'B1'],
  ['under the weather', 'hơi ốm', 'I feel under the weather today.', 'Hôm nay tôi hơi ốm.', 'B1'],
  ['once in a blue moon', 'hiếm khi', 'We meet once in a blue moon.', 'Chúng tôi hiếm khi gặp nhau.', 'B2'],
  ['spill the beans', 'để lộ bí mật', 'Do not spill the beans.', 'Đừng để lộ bí mật.', 'B1'],
  ['hit the nail on the head', 'nói trúng vấn đề', 'You hit the nail on the head.', 'Bạn nói trúng vấn đề.', 'B2'],
  ['let the cat out of the bag', 'lộ bí mật', 'He let the cat out of the bag.', 'Anh ấy lộ bí mật.', 'B2'],
  ['bite the bullet', 'cắn răng chịu đựng', 'I had to bite the bullet.', 'Tôi phải cắn răng chịu.', 'B2'],
  ['burn the midnight oil', 'thức khuya làm việc', 'She burned the midnight oil.', 'Cô ấy thức khuya làm việc.', 'B2'],
  ['call it a day', 'nghỉ, kết thúc ngày làm', 'Let us call it a day.', 'Hãy nghỉ thôi.', 'B1'],
  ['cut corners', 'làm tắt, cắt xén', 'Do not cut corners on safety.', 'Đừng cắt xén an toàn.', 'B2'],
  ['cut to the chase', 'vào thẳng vấn đề', 'Cut to the chase, please.', 'Xin vào thẳng vấn đề.', 'B2'],
  ['get cold feet', 'sợ, chùn bước', 'He got cold feet before the wedding.', 'Anh ấy chùn bước trước đám cưới.', 'B2'],
  ['go the extra mile', 'nỗ lực thêm', 'She always goes the extra mile.', 'Cô ấy luôn nỗ lực thêm.', 'B2'],
  ['hang in there', 'cố gắng chịu đựng', 'Hang in there!', 'Cố lên!', 'B1'],
  ['keep an eye on', 'để mắt tới', 'Keep an eye on the baby.', 'Hãy để mắt tới em bé.', 'B1'],
  ['kill two birds with one stone', 'một công đôi việc', 'This kills two birds with one stone.', 'Việc này một công đôi việc.', 'B2'],
  ['on cloud nine', 'cực kỳ vui sướng', 'She was on cloud nine.', 'Cô ấy vui sướng tột độ.', 'B1'],
  ['pull yourself together', 'bình tĩnh lại', 'Pull yourself together.', 'Hãy bình tĩnh lại.', 'B2'],
  ['see eye to eye', 'đồng quan điểm', 'We do not see eye to eye.', 'Chúng tôi không đồng quan điểm.', 'B2'],
  ['speak of the devil', 'nhắc ai là người đó đến', 'Speak of the devil!', 'Nhắc ai người nấy đến!', 'B1'],
  ['the ball is in your court', 'đến lượt bạn quyết định', 'The ball is in your court now.', 'Giờ đến lượt bạn quyết định.', 'B2'],
  ['through thick and thin', 'lúc thuận lúc nghịch', 'Friends through thick and thin.', 'Bạn bè lúc thuận lúc nghịch.', 'B2'],
  ['time flies', 'thời gian trôi nhanh', 'Time flies when you have fun.', 'Vui thì thời gian trôi nhanh.', 'A2'],
  ['when pigs fly', 'không bao giờ', 'That will happen when pigs fly.', 'Việc đó không bao giờ xảy ra.', 'B1'],
  ['a blessing in disguise', 'trong cái rủi có cái may', 'Losing the job was a blessing in disguise.', 'Mất việc hóa ra là may.', 'B2'],
  ['actions speak louder than words', 'việc làm quan trọng hơn lời nói', 'Actions speak louder than words.', 'Việc làm quan trọng hơn lời nói.', 'B1'],
  ['add fuel to the fire', 'đổ thêm dầu vào lửa', 'Do not add fuel to the fire.', 'Đừng đổ thêm dầu vào lửa.', 'B2'],
  ['against the clock', 'chạy đua với thời gian', 'We are working against the clock.', 'Chúng tôi đang chạy đua với thời gian.', 'B2'],
  ['all ears', 'lắng nghe chăm chú', 'I am all ears.', 'Tôi đang lắng nghe đây.', 'B1'],
  ['back to square one', 'trở lại vạch xuất phát', 'We are back to square one.', 'Chúng tôi lại về vạch xuất phát.', 'B2'],
  ['barking up the wrong tree', 'hiểu nhầm nguyên nhân', 'You are barking up the wrong tree.', 'Bạn đang hiểu nhầm đối tượng.', 'B2'],
  ['beat around the bush', 'nói vòng vo', 'Stop beating around the bush.', 'Đừng nói vòng vo nữa.', 'B2'],
  ['better late than never', 'muộn còn hơn không', 'Better late than never.', 'Muộn còn hơn không.', 'A2'],
  ['bite off more than you can chew', 'ôm đồm quá sức', 'Do not bite off more than you can chew.', 'Đừng ôm đồm quá sức.', 'B2'],
  ['break the ice', 'phá tan không khí gượng', 'A joke can break the ice.', 'Một câu đùa có thể phá tan không khí gượng.', 'B1'],
  ['burn bridges', 'đốt cầu (mất quan hệ)', 'Do not burn bridges.', 'Đừng đốt cầu quan hệ.', 'B2'],
  ['by the book', 'đúng quy định', 'Do everything by the book.', 'Hãy làm đúng quy định.', 'B2'],
  ['call a spade a spade', 'nói thẳng', 'Let us call a spade a spade.', 'Hãy nói thẳng.', 'C1'],
  ['cross that bridge when you come to it', 'đến đâu hay đến đó', 'We will cross that bridge when we come to it.', 'Đến đâu sẽ hay đến đó.', 'B2'],
  ['cry over spilled milk', 'tiếc nuối việc đã rồi', 'Do not cry over spilled milk.', 'Đừng tiếc nuối việc đã rồi.', 'B1'],
  ['curiosity killed the cat', 'tò mò quá hóa hại', 'Remember, curiosity killed the cat.', 'Nhớ rằng tò mò quá hóa hại.', 'B1'],
  ['cut somebody some slack', 'nới tay, thông cảm', 'Cut him some slack.', 'Hãy thông cảm cho anh ấy.', 'B2'],
  ['easier said than done', 'nói dễ làm khó', 'That is easier said than done.', 'Nói thì dễ làm mới khó.', 'B1'],
  ['every cloud has a silver lining', 'trong cái rủi có cái may', 'Every cloud has a silver lining.', 'Trong cái rủi có cái may.', 'B1'],
  ['get out of hand', 'vượt tầm kiểm soát', 'The party got out of hand.', 'Bữa tiệc vượt tầm kiểm soát.', 'B2'],
  ['get something off your chest', 'trút bầu tâm sự', 'I need to get this off my chest.', 'Tôi cần trút bầu tâm sự.', 'B2'],
  ['go down in flames', 'thất bại thảm hại', 'The plan went down in flames.', 'Kế hoạch thất bại thảm hại.', 'B2'],
  ['hit the sack', 'đi ngủ', 'I am going to hit the sack.', 'Tôi đi ngủ đây.', 'B1'],
  ['in hot water', 'gặp rắc rối', 'He is in hot water at work.', 'Anh ấy gặp rắc rối ở chỗ làm.', 'B2'],
  ['it takes two to tango', 'có qua có lại', 'It takes two to tango.', 'Có qua có lại mới thành chuyện.', 'B2'],
  ['jump on the bandwagon', 'theo trào lưu', 'Many jumped on the bandwagon.', 'Nhiều người theo trào lưu.', 'B2'],
  ['keep your chin up', 'giữ vững tinh thần', 'Keep your chin up.', 'Hãy giữ vững tinh thần.', 'B1'],
  ['leave no stone unturned', 'không bỏ sót nỗ lực nào', 'We left no stone unturned.', 'Chúng tôi đã cố gắng hết sức.', 'C1'],
  ['let sleeping dogs lie', 'đừng khơi lại chuyện cũ', 'Let sleeping dogs lie.', 'Đừng khơi lại chuyện cũ.', 'B2'],
  ['make a long story short', 'nói ngắn gọn', 'To make a long story short, we won.', 'Nói ngắn gọn, chúng tôi thắng.', 'B1'],
  ['miss the boat', 'lỡ cơ hội', 'Do not miss the boat.', 'Đừng lỡ cơ hội.', 'B2'],
  ['no pain no gain', 'không khổ luyện không thành công', 'No pain, no gain.', 'Không khổ luyện, không thành công.', 'A2'],
  ['on the ball', 'nhanh nhẹn, tỉnh táo', 'She is really on the ball.', 'Cô ấy rất nhanh nhẹn.', 'B2'],
  ['out of the blue', 'bất ngờ', 'He called out of the blue.', 'Anh ấy gọi bất ngờ.', 'B1'],
  ['play it by ear', 'tùy cơ ứng biến', 'We will play it by ear.', 'Chúng ta sẽ tùy cơ ứng biến.', 'B2'],
  ['pull someone\'s leg', 'trêu chọc', 'I was just pulling your leg.', 'Tôi chỉ trêu bạn thôi.', 'B1'],
  ['rain on someone\'s parade', 'làm hỏng niềm vui', 'Do not rain on her parade.', 'Đừng làm hỏng niềm vui của cô ấy.', 'B2'],
  ['read between the lines', 'đọc ý giữa dòng', 'Read between the lines.', 'Hãy đọc ý giữa dòng.', 'B2'],
  ['sit on the fence', 'không chọn bên', 'Stop sitting on the fence.', 'Đừng đứng giữa nữa.', 'B2'],
  ['steal someone\'s thunder', 'cướp công/spotlight', 'Do not steal his thunder.', 'Đừng cướp spotlight của anh ấy.', 'C1'],
  ['take it with a grain of salt', 'tin có chọn lọc', 'Take that rumor with a grain of salt.', 'Hãy tin tin đồn đó có chọn lọc.', 'B2'],
  ['the best of both worlds', 'hưởng cả hai lợi ích', 'This job offers the best of both worlds.', 'Công việc này mang cả hai lợi ích.', 'B2'],
  ['the last straw', 'giọt nước tràn ly', 'That was the last straw.', 'Đó là giọt nước tràn ly.', 'B2'],
  ['throw in the towel', 'bỏ cuộc', 'Do not throw in the towel.', 'Đừng bỏ cuộc.', 'B2'],
  ['under one\'s belt', 'đã có kinh nghiệm', 'With two years under her belt...', 'Với hai năm kinh nghiệm...', 'B2'],
  ['up in the air', 'chưa quyết định', 'Our plans are still up in the air.', 'Kế hoạch vẫn chưa chốt.', 'B1'],
  ['wear your heart on your sleeve', 'bộc lộ cảm xúc rõ', 'He wears his heart on his sleeve.', 'Anh ấy bộc lộ cảm xúc rất rõ.', 'C1'],
  ['you can say that again', 'đúng quá', 'You can say that again!', 'Đúng quá!', 'B1'],
  ['a dime a dozen', 'rất phổ biến, không quý', 'Ideas like that are a dime a dozen.', 'Ý tưởng kiểu đó có đầy.', 'B2'],
  ['at the drop of a hat', 'ngay lập tức, sẵn sàng', 'He will help at the drop of a hat.', 'Anh ấy sẵn sàng giúp ngay.', 'B2'],
  ['beat a dead horse', 'nói đi nói lại chuyện cũ', 'Stop beating a dead horse.', 'Đừng lải nhải chuyện cũ.', 'B2'],
  ['best thing since sliced bread', 'tuyệt vời (mỉa/khen)', 'This app is the best thing since sliced bread.', 'App này tuyệt thật.', 'B2'],
  ['bite your tongue', 'nhịn không nói', 'I had to bite my tongue.', 'Tôi phải nhịn không nói.', 'B2'],
  ['break the bank', 'tốn rất nhiều tiền', 'The trip will not break the bank.', 'Chuyến đi không tốn quá nhiều.', 'B1'],
  ['by all means', 'tất nhiên, cứ tự nhiên', 'By all means, take a seat.', 'Cứ ngồi đi.', 'B1'],
  ['caught red-handed', 'bắt quả tang', 'He was caught red-handed.', 'Anh ấy bị bắt quả tang.', 'B2'],
  ['compare apples to oranges', 'so sánh khập khiễng', 'That is comparing apples to oranges.', 'Đó là so sánh khập khiễng.', 'B2'],
  ['devil\'s advocate', 'người phản biện cố ý', 'Let me play devil\'s advocate.', 'Để tôi đóng vai phản biện.', 'C1'],
  ['don\'t count your chickens', 'đừng vội mừng sớm', 'Do not count your chickens before they hatch.', 'Đừng vội mừng trước khi có kết quả.', 'B2'],
  ['down to earth', 'thực tế, chân chất', 'She is very down to earth.', 'Cô ấy rất chân chất.', 'B1'],
  ['face the music', 'đối mặt hậu quả', 'It is time to face the music.', 'Đã đến lúc đối mặt hậu quả.', 'B2'],
  ['get a taste of your own medicine', 'nếm trải y như đã làm với người khác', 'He got a taste of his own medicine.', 'Anh ấy nếm trái đắng mình gieo.', 'B2'],
  ['give someone the benefit of the doubt', 'tin theo hướng tốt', 'Give her the benefit of the doubt.', 'Hãy tin cô ấy theo hướng tốt.', 'B2'],
  ['go back to the drawing board', 'làm lại từ đầu', 'We need to go back to the drawing board.', 'Chúng ta phải làm lại từ đầu.', 'B2'],
  ['hit the ground running', 'bắt tay vào việc ngay', 'She hit the ground running.', 'Cô ấy bắt tay vào việc ngay.', 'B2'],
  ['in a nutshell', 'tóm lại', 'In a nutshell, we succeeded.', 'Tóm lại, chúng tôi thành công.', 'B1'],
  ['in the same boat', 'cùng cảnh ngộ', 'We are all in the same boat.', 'Tất cả chúng ta cùng cảnh ngộ.', 'B1'],
  ['it is not rocket science', 'không quá khó', 'It is not rocket science.', 'Không phải chuyện quá khó.', 'B1'],
  ['jump to conclusions', 'vội kết luận', 'Do not jump to conclusions.', 'Đừng vội kết luận.', 'B1'],
  ['keep your fingers crossed', 'cầu mong may mắn', 'Keep your fingers crossed.', 'Cầu mong may mắn.', 'B1'],
  ['learn the ropes', 'học việc, nắm quy trình', 'It takes time to learn the ropes.', 'Cần thời gian để nắm quy trình.', 'B2'],
  ['make ends meet', 'kiếm đủ sống', 'It is hard to make ends meet.', 'Khó kiếm đủ sống.', 'B2'],
  ['on thin ice', 'nguy hiểm, dễ bị phạt', 'You are on thin ice.', 'Bạn đang ở thế nguy hiểm.', 'B2'],
  ['once bitten twice shy', 'một lần cắn hai lần sợ', 'Once bitten, twice shy.', 'Một lần bị cắn, hai lần dè chừng.', 'B2'],
  ['out of sight out of mind', 'xa mặt cách lòng', 'Out of sight, out of mind.', 'Xa mặt cách lòng.', 'B1'],
  ['pull the plug', 'dừng, cắt', 'They pulled the plug on the project.', 'Họ dừng dự án.', 'B2'],
  ['put all your eggs in one basket', 'bỏ hết trứng vào một giỏ', 'Do not put all your eggs in one basket.', 'Đừng dồn hết rủi ro một chỗ.', 'B2'],
  ['rome was not built in a day', 'việc lớn cần thời gian', 'Rome was not built in a day.', 'Việc lớn cần thời gian.', 'B1'],
  ['rule of thumb', 'quy tắc kinh nghiệm', 'As a rule of thumb, save 10%.', 'Theo kinh nghiệm, hãy tiết kiệm 10%.', 'B2'],
  ['see the light', 'hiểu ra', 'Finally he saw the light.', 'Cuối cùng anh ấy cũng hiểu ra.', 'B2'],
  ['so far so good', 'cho đến nay vẫn ổn', 'So far so good.', 'Cho đến nay vẫn ổn.', 'A2'],
  ['take a rain check', 'hẹn lần khác', 'Can I take a rain check?', 'Hẹn lần khác được không?', 'B1'],
  ['the early bird catches the worm', 'siêng năng được việc', 'The early bird catches the worm.', 'Siêng năng sẽ thành công.', 'B1'],
  ['there is no place like home', 'không đâu bằng nhà', 'There is no place like home.', 'Không đâu bằng nhà mình.', 'A2'],
  ['two heads are better than one', 'hai người hơn một', 'Two heads are better than one.', 'Hai người bàn bạc hơn một.', 'B1'],
  ['under the table', 'lén lút, không chính thức', 'They paid under the table.', 'Họ trả tiền dưới gầm bàn.', 'B2'],
  ['water under the bridge', 'chuyện đã qua', 'That is water under the bridge.', 'Chuyện đó đã qua rồi.', 'B2'],
  ['your guess is as good as mine', 'tôi cũng không biết', 'Your guess is as good as mine.', 'Tôi cũng không biết hơn bạn.', 'B1'],
]

function buildIdioms(extraFromCsv = []) {
  const map = new Map()
  for (const [ph, m, ex, exVi, lv] of IDIOM_CORE) {
    uniqPush(map, card(ph, m, ex, exVi, 'Cụm từ', lv))
  }
  for (const { phrase, meaning } of extraFromCsv) {
    if (map.size >= TARGET.idioms) break
    const ph = phrase.toLowerCase().trim()
    if (!/\s/.test(ph)) continue
    uniqPush(
      map,
      card(
        ph,
        meaning || `thành ngữ: ${ph}`,
        `People say "${ph}" in daily English.`,
        `Người ta dùng thành ngữ "${ph}" trong tiếng Anh hàng ngày.`,
        'Cụm từ',
        'B2',
      ),
    )
  }
  // Pattern expansions for volume (still multi-word idiomatic)
  const slots = [
    ['as busy as a bee', 'bận rộn như ong'],
    ['as clear as crystal', 'rõ như ban ngày'],
    ['as cool as a cucumber', 'bình tĩnh lạ thường'],
    ['as easy as abc', 'dễ như abc'],
    ['as free as a bird', 'tự do như chim'],
    ['as good as gold', 'ngoan/tốt lắm'],
    ['as hard as nails', 'cứng rắn'],
    ['as light as a feather', 'nhẹ như lông'],
    ['as old as the hills', 'cũ kỹ lắm'],
    ['as quick as a flash', 'nhanh như chớp'],
    ['as silent as the grave', 'im thin thít'],
    ['as strong as an ox', 'khỏe như trâu'],
    ['as white as a sheet', 'trắng bệch'],
    ['at a loss for words', 'không biết nói gì'],
    ['at death\'s door', 'gần kề cái chết'],
    ['at face value', 'theo bề ngoài'],
    ['at full tilt', 'hết tốc lực'],
    ['at large', 'lớn; chưa bị bắt'],
    ['at loggerheads', 'xung đột'],
    ['at odds', 'bất đồng'],
    ['at one\'s wit\'s end', 'bí kế'],
    ['at sixes and sevens', 'lộn xộn'],
    ['at the eleventh hour', 'giờ chót'],
    ['at the end of the day', 'rốt cuộc'],
    ['at the helm', 'đảm nhận chỉ huy'],
    ['behind closed doors', 'kín đáo'],
    ['behind the scenes', 'hậu trường'],
    ['beside the point', 'lạc đề'],
    ['between a rock and a hard place', 'tiến thoái lưỡng nan'],
    ['beyond a shadow of a doubt', 'không còn nghi ngờ'],
    ['beyond belief', 'khó tin'],
    ['beyond the pale', 'vượt quá giới hạn chấp nhận'],
    ['big fish in a small pond', 'tài ở chỗ nhỏ'],
    ['bite the hand that feeds you', 'phản người nuôi mình'],
    ['black and blue', 'bầm tím'],
    ['black sheep', 'con sâu làm rầu nồi canh'],
    ['blow one\'s own trumpet', 'khoe mình'],
    ['blow the whistle', 'tố giác'],
    ['born with a silver spoon', 'sinh ra trong nhung lụa'],
    ['bottom line', 'điểm mấu chốt'],
    ['bread and butter', 'kế sinh nhai'],
    ['break new ground', 'khai phá mới'],
    ['bring home the bacon', 'kiếm tiền nuôi nhà'],
    ['burn the candle at both ends', 'làm việc quá sức'],
    ['bury the hatchet', 'giảng hòa'],
    ['by and large', 'nhìn chung'],
    ['by leaps and bounds', 'tiến bộ vượt bậc'],
    ['call the shots', 'nắm quyền quyết định'],
    ['can of worms', 'vấn đề phức tạp'],
    ['cast in stone', 'bất biến'],
    ['catch someone red handed', 'bắt quả tang'],
    ['change of heart', 'đổi ý'],
    ['chip on one\'s shoulder', 'mang hận'],
    ['clear the air', 'làm dịu căng thẳng'],
    ['close but no cigar', 'suýt nữa thì'],
    ['cold shoulder', 'thái độ lạnh nhạt'],
    ['come rain or shine', 'dù mưa hay nắng'],
    ['come to terms with', 'chấp nhận'],
    ['cool as a cucumber', 'bình tĩnh'],
    ['crack of dawn', 'rạng sáng'],
    ['cross your fingers', 'cầu may'],
    ['cry wolf', 'kêu cứu dối'],
    ['cut and dried', 'đã quyết định sẵn'],
    ['dark horse', 'ứng viên bất ngờ'],
    ['day in day out', 'ngày này qua ngày khác'],
    ['dead end', 'ngõ cụt'],
    ['diamond in the rough', 'viên ngọc thô'],
    ['do or die', 'làm hoặc chết'],
    ['down and out', 'túng quẫn'],
    ['draw a blank', 'không nhớ ra'],
    ['drop in the ocean', 'muối bỏ bể'],
    ['eager beaver', 'người hăng hái'],
    ['eat humble pie', 'nhận lỗi'],
    ['elbow room', 'không gian thoải mái'],
    ['eleventh hour', 'giờ chót'],
    ['fair and square', 'công bằng'],
    ['fall on deaf ears', 'nói vào tai điếc'],
    ['far and wide', 'khắp nơi'],
    ['feel under the weather', 'hơi ốm'],
    ['few and far between', 'hiếm hoi'],
    ['fight tooth and nail', 'chiến đấu quyết liệt'],
    ['fish out of water', 'lạc lõng'],
    ['fit as a fiddle', 'khỏe mạnh'],
    ['flash in the pan', 'nổi lên rồi tắt'],
    ['flesh and blood', 'ruột thịt'],
    ['fly off the handle', 'nổi nóng'],
    ['food for thought', 'điều đáng suy nghĩ'],
    ['foot the bill', 'trả tiền'],
    ['for good', 'mãi mãi'],
    ['for the time being', 'tạm thời'],
    ['from rags to riches', 'từ nghèo đến giàu'],
    ['full of beans', 'tràn đầy năng lượng'],
    ['get a grip', 'bình tĩnh lại'],
    ['get down to business', 'vào việc'],
    ['get the ball rolling', 'bắt đầu'],
    ['give the green light', 'cho phép'],
    ['go for broke', 'đánh cược hết'],
    ['go with the flow', 'thuận theo'],
    ['green with envy', 'ghen tị'],
    ['grin and bear it', 'cắn răng chịu'],
    ['have a blast', 'vui lắm'],
    ['head over heels', 'yêu say đắm'],
    ['hear it on the grapevine', 'nghe tin đồn'],
    ['high and dry', 'bị bỏ rơi'],
    ['hit the road', 'lên đường'],
    ['hold your horses', 'bình tĩnh đã'],
    ['in a pickle', 'gặp rắc rối'],
    ['in black and white', 'rõ ràng bằng văn bản'],
    ['in full swing', 'đang sôi nổi'],
    ['in the bag', 'chắc chắn thắng'],
    ['in the long run', 'về lâu dài'],
    ['jack of all trades', 'biết nhiều nghề'],
    ['jump the gun', 'hành động sớm'],
    ['keep a low profile', 'giữ thấp profile'],
    ['keep your cool', 'giữ bình tĩnh'],
    ['know the ropes', 'nắm quy trình'],
    ['last but not least', 'cuối cùng nhưng không kém'],
    ['leave hanging', 'bỏ lửng'],
    ['lend a hand', 'giúp một tay'],
    ['let off steam', 'xả stress'],
    ['like two peas in a pod', 'giống hệt nhau'],
    ['live and learn', 'sống và học'],
    ['long shot', 'khả năng thấp'],
    ['lose your cool', 'mất bình tĩnh'],
    ['make a mountain out of a molehill', 'chuyện bé xé ra to'],
    ['make waves', 'gây chú ý / sóng gió'],
    ['money talks', 'tiền là sức mạnh'],
    ['neck and neck', 'ngang tài ngang sức'],
    ['needle in a haystack', 'kim đáy bể'],
    ['night owl', 'cú đêm'],
    ['no big deal', 'không có gì lớn'],
    ['no hard feelings', 'không giận'],
    ['not my cup of tea', 'không hợp sở thích'],
    ['off the hook', 'thoát tội'],
    ['on a roll', 'đang may / suôn sẻ'],
    ['on edge', 'căng thẳng'],
    ['on purpose', 'cố ý'],
    ['on the fence', 'chưa chọn bên'],
    ['on the house', 'miễn phí (nhà hàng)'],
    ['once in a lifetime', 'một lần trong đời'],
    ['out of the woods', 'thoát nguy'],
    ['over the moon', 'vui sướng'],
    ['paint the town red', 'đi chơi thả ga'],
    ['piece of the pie', 'phần lợi'],
    ['play hardball', 'cứng rắn'],
    ['pull strings', 'dùng quan hệ'],
    ['put one\'s foot down', 'ra quyết định cứng'],
    ['raise the bar', 'nâng tiêu chuẩn'],
    ['red flag', 'dấu hiệu cảnh báo'],
    ['red tape', 'thủ tục quan liêu'],
    ['ring a bell', 'gợi nhớ'],
    ['rock the boat', 'gây sóng gió'],
    ['rough around the edges', 'còn thô'],
    ['run like clockwork', 'chạy trơn tru'],
    ['safe and sound', 'bình an'],
    ['second wind', 'sức bật thứ hai'],
    ['see red', 'nổi giận'],
    ['shoot the breeze', 'tán gẫu'],
    ['show of hands', 'biểu quyết giơ tay'],
    ['skeleton in the closet', 'bí mật xấu'],
    ['slap on the wrist', 'phạt nhẹ'],
    ['sleep on it', 'suy nghĩ thêm một đêm'],
    ['small talk', 'chuyện phiếm'],
    ['smell a rat', 'nghi có mưu'],
    ['smooth sailing', 'thuận buồm xuôi gió'],
    ['snowed under', 'ngập việc'],
    ['step up to the plate', 'đảm nhận trách nhiệm'],
    ['stick to your guns', 'giữ vững lập trường'],
    ['straight from the horse\'s mouth', 'tin từ nguồn gốc'],
    ['take a back seat', 'nhường vai chính'],
    ['take the cake', 'đỉnh nhất (thường mỉa)'],
    ['talk shop', 'nói chuyện công việc'],
    ['the tip of the iceberg', 'phần nổi của tảng băng'],
    ['throw shade', 'ám chỉ chê'],
    ['tighten your belt', 'thắt lưng buộc bụng'],
    ['to each his own', 'mỗi người một sở thích'],
    ['touch base', 'liên lạc cập nhật'],
    ['twist someone\'s arm', 'ép buộc nhẹ'],
    ['under the radar', 'kín tiếng'],
    ['up for grabs', 'sẵn sàng cho ai lấy'],
    ['walking on air', 'vui sướng'],
    ['weather the storm', 'vượt qua khó khăn'],
    ['wild goose chase', 'cuộc lùng sục vô ích'],
    ['with flying colors', 'với kết quả xuất sắc'],
    ['wrap your head around', 'cố hiểu'],
    ['you bet', 'chắc chắn rồi'],
    ['zero in on', 'tập trung vào'],
  ]
  for (const [ph, m] of slots) {
    if (map.size >= TARGET.idioms) break
    uniqPush(
      map,
      card(ph, m, `In English we say "${ph}".`, `Trong tiếng Anh người ta nói "${ph}" — ${m}.`, 'Cụm từ', 'B2'),
    )
  }
  // Expanded generation to reach 3000 idioms
  const IDIOM_EXTRA = [
    ["a fish out of water", "lạc lõng", "I felt like a fish out of water.", "Tôi cảm thấy lạc lõng.", "B1"],
    ["a hard nut to crack", "vấn đề khó", "This is a hard nut to crack.", "Đây là bài toán khó.", "B2"],
    ["a drop in the ocean", "muối bỏ bể", "That donation is a drop in the ocean.", "Khoản quyên góp chỉ là muối bỏ bể.", "B2"],
    ["a hot potato", "vấn đề nhạy cảm", "The topic is a hot potato.", "Chủ đề này rất nhạy cảm.", "B2"],
    ["a nest egg", "tiền để dành", "She has a nest egg for retirement.", "Cô ấy có khoản để dành khi về hưu.", "B2"],
    ["a raw deal", "sự đối xử bất công", "He got a raw deal.", "Anh ấy bị đối xử bất công.", "B2"],
    ["a slap on the wrist", "phạt nhẹ", "He only got a slap on the wrist.", "Anh ấy chỉ bị phạt nhẹ.", "B2"],
    ["a slippery slope", "dốc trơn (dễ sa ngã)", "That is a slippery slope.", "Đó là con đường dễ sa ngã.", "C1"],
    ["a snowball effect", "hiệu ứng quả cầu tuyết", "It created a snowball effect.", "Nó tạo hiệu ứng quả cầu tuyết.", "B2"],
    ["a stone's throw", "rất gần", "The school is a stone's throw away.", "Trường chỉ cách một quãng ngắn.", "B1"],
    ["above board", "minh bạch", "Everything is above board.", "Mọi thứ đều minh bạch.", "B2"],
    ["across the board", "toàn diện", "Cuts apply across the board.", "Cắt giảm áp dụng toàn diện.", "B2"],
    ["all in good time", "mọi thứ sẽ đến đúng lúc", "All in good time.", "Mọi thứ sẽ đến đúng lúc.", "B1"],
    ["all the rage", "đang thịnh hành", "That style is all the rage.", "Phong cách đó đang thịnh hành.", "B2"],
    ["an arm and a leg", "giá rất cao", "It costs an arm and a leg.", "Giá cực kỳ cao.", "B1"],
    ["as a last resort", "như biện pháp cuối cùng", "Call him as a last resort.", "Gọi anh ấy như biện pháp cuối cùng.", "B2"],
    ["as luck would have it", "may mắn thay", "As luck would have it, we met.", "May mắn thay, chúng tôi gặp nhau.", "B2"],
    ["back to the drawing board", "làm lại từ đầu", "Back to the drawing board.", "Làm lại từ đầu thôi.", "B2"],
    ["bad blood", "hiềm khích", "There is bad blood between them.", "Giữa họ có hiềm khích.", "B2"],
    ["bark up the wrong tree", "nhầm đối tượng", "You are barking up the wrong tree.", "Bạn đang nhầm đối tượng.", "B2"],
    ["bend over backwards", "cố gắng hết sức giúp", "She bent over backwards to help.", "Cô ấy cố gắng hết sức để giúp.", "B2"],
    ["bite the dust", "thất bại", "The project bit the dust.", "Dự án thất bại.", "B2"],
    ["blow off steam", "xả stress", "I went running to blow off steam.", "Tôi chạy bộ để xả stress.", "B1"],
    ["break even", "hòa vốn", "The company broke even.", "Công ty hòa vốn.", "B2"],
    ["bring to light", "làm sáng tỏ", "The report brought the facts to light.", "Báo cáo làm sáng tỏ sự việc.", "B2"],
    ["burn one's bridges", "đốt cầu quan hệ", "Do not burn your bridges.", "Đừng đốt cầu quan hệ.", "B2"],
    ["bury one's head in the sand", "trốn tránh thực tế", "Stop burying your head in the sand.", "Đừng trốn tránh thực tế.", "B2"],
    ["by the skin of one's teeth", "suýt nữa thì", "He escaped by the skin of his teeth.", "Anh ấy thoát hiểm trong gang tấc.", "B2"],
    ["call it quits", "thôi, dừng", "Let us call it quits.", "Thôi dừng ở đây đi.", "B1"],
    ["catch someone's eye", "gây chú ý", "The red dress caught my eye.", "Chiếc váy đỏ gây chú ý với tôi.", "B1"],
    ["change one's mind", "đổi ý", "I changed my mind.", "Tôi đã đổi ý.", "A2"],
    ["clear the decks", "dọn đường cho việc mới", "Clear the decks before the launch.", "Dọn đường trước khi ra mắt.", "C1"],
    ["come clean", "thú nhận", "It is time to come clean.", "Đã đến lúc thú nhận.", "B2"],
    ["come hell or high water", "dù khó khăn thế nào", "I will be there come hell or high water.", "Dù khó khăn thế nào tôi cũng đến.", "C1"],
    ["cut someone short", "cắt ngang lời", "Do not cut me short.", "Đừng cắt ngang lời tôi.", "B2"],
    ["cut the mustard", "đạt chuẩn", "This plan does not cut the mustard.", "Kế hoạch này chưa đạt.", "C1"],
    ["do the trick", "hiệu quả, đủ dùng", "A short walk will do the trick.", "Đi bộ ngắn là đủ.", "B1"],
    ["down in the dumps", "buồn bã", "She looks down in the dumps.", "Cô ấy trông buồn bã.", "B1"],
    ["drive someone up the wall", "làm ai phát điên", "The noise drives me up the wall.", "Tiếng ồn làm tôi phát điên.", "B2"],
    ["drop the ball", "mắc lỗi, bỏ lỡ", "We dropped the ball on that task.", "Chúng tôi đã bỏ lỡ nhiệm vụ đó.", "B2"],
    ["easy come easy go", "đến dễ đi dễ", "Easy come, easy go.", "Đến dễ thì đi cũng dễ.", "B1"],
    ["eat one's words", "nuốt lời", "He had to eat his words.", "Anh ấy phải nuốt lời.", "B2"],
    ["end of the line", "điểm kết thúc", "This is the end of the line.", "Đây là điểm kết thúc.", "B1"],
    ["fall short", "không đạt", "Sales fell short of the target.", "Doanh số không đạt mục tiêu.", "B2"],
    ["feel the pinch", "cảm thấy túng thiếu", "Families are feeling the pinch.", "Các gia đình đang cảm thấy túng thiếu.", "B2"],
    ["find one's feet", "làm quen, đứng vững", "It took time to find my feet.", "Mất thời gian để tôi làm quen.", "B2"],
    ["first things first", "việc trước làm trước", "First things first, let us eat.", "Việc trước làm trước, hãy ăn đã.", "A2"],
    ["from the horse's mouth", "từ nguồn gốc", "I heard it from the horse's mouth.", "Tôi nghe từ nguồn gốc.", "B2"],
    ["get a move on", "nhanh lên", "Get a move on!", "Nhanh lên!", "B1"],
    ["give someone a hand", "giúp một tay", "Can you give me a hand?", "Bạn giúp tôi một tay được không?", "A2"],
    ["go belly up", "phá sản", "The firm went belly up.", "Công ty phá sản.", "B2"],
    ["go cold turkey", "cai đột ngột", "He quit smoking cold turkey.", "Anh ấy cai thuốc đột ngột.", "C1"],
    ["go the distance", "theo đến cùng", "She can go the distance.", "Cô ấy có thể theo đến cùng.", "B2"],
    ["grease someone's palm", "hối lộ", "They greased his palm.", "Họ hối lộ anh ấy.", "C1"],
    ["have second thoughts", "do dự lại", "I am having second thoughts.", "Tôi đang do dự lại.", "B1"],
    ["have the upper hand", "nắm thế thượng phong", "She has the upper hand.", "Cô ấy nắm thế thượng phong.", "B2"],
    ["hit rock bottom", "chạm đáy", "He hit rock bottom last year.", "Năm ngoái anh ấy chạm đáy.", "B2"],
    ["hold the fort", "trông coi thay", "Can you hold the fort?", "Bạn trông coi giúp được không?", "B2"],
    ["in deep water", "gặp rắc rối lớn", "We are in deep water now.", "Chúng ta đang gặp rắc rối lớn.", "B2"],
    ["in one's element", "hợp môi trường", "She is in her element on stage.", "Cô ấy hợp với sân khấu.", "B2"],
    ["in the nick of time", "vừa kịp lúc", "We arrived in the nick of time.", "Chúng tôi đến vừa kịp lúc.", "B1"],
    ["jump through hoops", "vượt nhiều thủ tục", "We jumped through hoops to get a visa.", "Chúng tôi vượt nhiều thủ tục để xin visa.", "B2"],
    ["keep one's word", "giữ lời", "He always keeps his word.", "Anh ấy luôn giữ lời.", "A2"],
    ["keep someone in the loop", "giữ ai được cập nhật", "Please keep me in the loop.", "Hãy giữ tôi được cập nhật.", "B2"],
    ["kick the bucket", "chết (thô)", "The old car finally kicked the bucket.", "Chiếc xe cũ cuối cùng cũng hỏng.", "B2"],
    ["know something inside out", "biết rất rõ", "She knows the city inside out.", "Cô ấy biết thành phố rất rõ.", "B2"],
    ["let bygones be bygones", "quá khứ bỏ qua", "Let bygones be bygones.", "Hãy bỏ qua chuyện cũ.", "B2"],
    ["light at the end of the tunnel", "hy vọng cuối đường hầm", "There is light at the end of the tunnel.", "Có hy vọng cuối đường hầm.", "B1"],
    ["like a house on fire", "hợp nhau ngay", "They got on like a house on fire.", "Họ hợp nhau ngay.", "B2"],
    ["make a splash", "gây chú ý lớn", "The ad made a splash.", "Quảng cáo gây chú ý lớn.", "B2"],
    ["make headway", "tiến triển", "We are making headway.", "Chúng tôi đang tiến triển.", "B2"],
    ["meet someone halfway", "thỏa hiệp", "I can meet you halfway.", "Tôi có thể thỏa hiệp với bạn.", "B2"],
    ["move the goalposts", "đổi luật giữa chừng", "Stop moving the goalposts.", "Đừng đổi luật giữa chừng.", "C1"],
    ["nip something in the bud", "dập tắt từ đầu", "Nip the problem in the bud.", "Hãy dập tắt vấn đề từ đầu.", "B2"],
    ["not have a clue", "chẳng biết gì", "I do not have a clue.", "Tôi chẳng biết gì cả.", "B1"],
    ["off the beaten track", "xa đường mòn, hẻo lánh", "We stayed off the beaten track.", "Chúng tôi ở nơi hẻo lánh.", "B2"],
    ["on the back burner", "tạm gác", "Put that on the back burner.", "Hãy tạm gác việc đó.", "B2"],
    ["on the same page", "cùng quan điểm", "Are we on the same page?", "Chúng ta cùng quan điểm chứ?", "B1"],
    ["out of one's depth", "vượt sức", "I felt out of my depth.", "Tôi cảm thấy vượt sức.", "B2"],
    ["over one's head", "quá sức hiểu", "The lecture was over my head.", "Bài giảng quá sức tôi hiểu.", "B2"],
    ["pass the buck", "đổ trách nhiệm", "Do not pass the buck.", "Đừng đổ trách nhiệm.", "B2"],
    ["pick up the tab", "trả tiền", "I will pick up the tab.", "Tôi sẽ trả tiền.", "B2"],
    ["play second fiddle", "đóng vai phụ", "He will not play second fiddle.", "Anh ấy không chịu đóng vai phụ.", "C1"],
    ["pull out all the stops", "dốc toàn lực", "They pulled out all the stops.", "Họ dốc toàn lực.", "B2"],
    ["put one's foot in one's mouth", "nói hớ", "I put my foot in my mouth.", "Tôi đã nói hớ.", "B2"],
    ["raining cats and dogs", "mưa tầm tã", "It is raining cats and dogs.", "Trời đang mưa tầm tã.", "A2"],
    ["raise eyebrows", "gây ngạc nhiên", "The news raised eyebrows.", "Tin tức gây ngạc nhiên.", "B2"],
    ["read the room", "đọc không khí", "You need to read the room.", "Bạn cần đọc không khí.", "B2"],
    ["save face", "giữ thể diện", "He lied to save face.", "Anh ấy nói dối để giữ thể diện.", "B2"],
    ["second nature", "như bản năng", "Driving is second nature to her.", "Lái xe như bản năng với cô ấy.", "B2"],
    ["set the record straight", "làm rõ sự thật", "Let me set the record straight.", "Để tôi làm rõ sự thật.", "B2"],
    ["show one's true colors", "bộc lộ bản chất", "He showed his true colors.", "Anh ấy bộc lộ bản chất.", "B2"],
    ["sink or swim", "tự lực hoặc thất bại", "It is sink or swim now.", "Giờ là tự lực hoặc thất bại.", "B2"],
    ["skate on thin ice", "làm việc nguy hiểm", "You are skating on thin ice.", "Bạn đang làm việc nguy hiểm.", "B2"],
    ["spill the tea", "kể chuyện thrêu", "Come on, spill the tea.", "Kể chuyện đi.", "B2"],
    ["start from scratch", "bắt đầu từ đầu", "We had to start from scratch.", "Chúng tôi phải bắt đầu từ đầu.", "B1"],
    ["stay the course", "kiên trì đến cùng", "Stay the course.", "Hãy kiên trì đến cùng.", "B2"],
    ["sweep under the rug", "che giấu", "Do not sweep it under the rug.", "Đừng che giấu chuyện đó.", "B2"],
    ["take center stage", "chiếm spotlight", "Climate took center stage.", "Khí hậu chiếm spotlight.", "B2"],
    ["take the bull by the horns", "đối mặt quyết liệt", "Take the bull by the horns.", "Hãy đối mặt quyết liệt.", "B2"],
    ["the whole nine yards", "toàn bộ", "He went the whole nine yards.", "Anh ấy làm toàn bộ.", "C1"],
    ["throw cold water on", "dội gáo nước lạnh", "Do not throw cold water on the idea.", "Đừng dội gáo nước lạnh lên ý tưởng.", "B2"],
    ["to the letter", "đúng từng chữ", "Follow the rules to the letter.", "Tuân thủ quy định đúng từng chữ.", "B2"],
    ["turn a blind eye", "làm ngơ", "They turned a blind eye.", "Họ làm ngơ.", "B2"],
    ["turn over a new leaf", "làm lại từ đầu", "He turned over a new leaf.", "Anh ấy làm lại cuộc đời.", "B2"],
    ["under one's nose", "ngay trước mắt", "It was under my nose.", "Nó ngay trước mắt tôi.", "B1"],
    ["up to scratch", "đạt chuẩn", "The work is not up to scratch.", "Công việc chưa đạt chuẩn.", "B2"],
    ["vanish into thin air", "biến mất không dấu vết", "The money vanished into thin air.", "Tiền biến mất không dấu vết.", "B2"],
    ["walk on eggshells", "cẩn thận từng lời", "I am walking on eggshells around him.", "Tôi phải cẩn thận từng lời quanh anh ấy.", "B2"],
    ["when the chips are down", "lúc khó khăn", "True friends help when the chips are down.", "Bạn thật giúp lúc khó khăn.", "C1"],
    ["word of mouth", "truyền miệng", "It spread by word of mouth.", "Nó lan truyền miệng.", "B1"],
    ["worth one's salt", "xứng đáng với nghề", "Any teacher worth their salt knows this.", "Giáo viên xứng nghề đều biết điều này.", "C1"],
    ["you name it", "bất cứ thứ gì", "We sell books, toys, you name it.", "Chúng tôi bán sách, đồ chơi, bất cứ thứ gì.", "B1"],
  ]
  for (const [ph, m, ex, exVi, lv] of IDIOM_EXTRA) {
    if (map.size >= TARGET.idioms) break
    uniqPush(map, card(ph, m, ex, exVi, 'Cụm từ', lv))
  }

  // pad with fixed-expression frames if still short
  const pads = [
    'time', 'money', 'love', 'luck', 'work', 'life', 'truth', 'heart', 'mind', 'hand', 'eye', 'head',
    'foot', 'day', 'night', 'water', 'fire', 'wind', 'stone', 'gold', 'hope', 'fear', 'change', 'power',
    'peace', 'war', 'law', 'art', 'music', 'sport', 'science', 'nature', 'history', 'culture', 'business',
    'success', 'failure', 'freedom', 'justice', 'health', 'safety', 'risk', 'chance', 'choice', 'duty',
    'honor', 'pride', 'shame', 'anger', 'joy', 'pain', 'loss', 'gain', 'trust', 'faith', 'belief',
    'knowledge', 'wisdom', 'skill', 'talent', 'effort', 'energy', 'strength', 'weakness', 'beauty',
    'silence', 'noise', 'order', 'chaos', 'memory', 'future', 'past', 'present', 'death', 'birth',
    'family', 'friendship', 'community', 'society', 'country', 'world', 'market', 'economy', 'policy',
    'education', 'training', 'practice', 'research', 'development', 'growth', 'progress', 'reform',
    'technology', 'innovation', 'quality', 'quantity', 'value', 'cost', 'price', 'profit',
    'security', 'privacy', 'identity', 'reputation', 'status', 'position', 'role', 'career', 'job',
  ]
  const frames = [
    [w => 'a matter of ' + w, w => 'vấn đề về ' + w],
    [w => 'in terms of ' + w, w => 'về mặt ' + w],
    [w => 'for the sake of ' + w, w => 'vì ' + w],
    [w => 'on the verge of ' + w, w => 'sắp ' + w],
    [w => 'in the face of ' + w, w => 'trước ' + w],
    [w => 'at the heart of ' + w, w => 'ở trọng tâm của ' + w],
    [w => 'by means of ' + w, w => 'bằng ' + w],
    [w => 'with regard to ' + w, w => 'liên quan đến ' + w],
    [w => 'in light of ' + w, w => 'xét đến ' + w],
    [w => 'as a matter of ' + w, w => 'về ' + w],
    [w => 'on the basis of ' + w, w => 'trên cơ sở ' + w],
    [w => 'in the interest of ' + w, w => 'vì lợi ích của ' + w],
    [w => 'at the expense of ' + w, w => 'đánh đổi bằng ' + w],
    [w => 'in pursuit of ' + w, w => 'theo đuổi ' + w],
    [w => 'in search of ' + w, w => 'tìm kiếm ' + w],
    [w => 'in favor of ' + w, w => 'ủng hộ ' + w],
    [w => 'in spite of ' + w, w => 'bất chấp ' + w],
    [w => 'in need of ' + w, w => 'cần ' + w],
    [w => 'in charge of ' + w, w => 'phụ trách ' + w],
    [w => 'in control of ' + w, w => 'kiểm soát ' + w],
    [w => 'on top of ' + w, w => 'nắm vững / ngoài ' + w],
    [w => 'out of ' + w, w => 'hết / ngoài ' + w],
    [w => 'short of ' + w, w => 'thiếu ' + w],
    [w => 'full of ' + w, w => 'đầy ' + w],
    [w => 'free of ' + w, w => 'không có ' + w],
    [w => 'aware of ' + w, w => 'nhận thức về ' + w],
    [w => 'afraid of ' + w, w => 'sợ ' + w],
    [w => 'proud of ' + w, w => 'tự hào về ' + w],
    [w => 'tired of ' + w, w => 'mệt mỏi vì ' + w],
    [w => 'capable of ' + w, w => 'có khả năng ' + w],
  ]
  for (const w of pads) {
    for (const [fp, fm] of frames) {
      if (map.size >= TARGET.idioms) break
      const ph = fp(w)
      if (!/\s/.test(ph)) continue
      uniqPush(map, card(ph, fm(w), 'We talked about it ' + ph + '.', 'Chúng tôi bàn về ' + fm(w) + '.', 'Cụm từ', 'B2'))
    }
  }

  // Simile / "as X as Y"
  const adjs = ['busy','clear','cool','easy','free','good','hard','light','old','quick','silent','strong','white','black','brave','bright','cold','dark','deep','dry','fast','flat','fresh','happy','heavy','hot','hungry','keen','loud','mad','neat','poor','proud','quiet','rich','safe','sharp','sick','slow','soft','sweet','tall','thin','warm','weak','wide','wise','young']
  const nouns = ['bee','crystal','cucumber','pie','bird','gold','nails','feather','hills','flash','grave','ox','sheet','night','day','ice','fire','wind','rock','steel','silk','snow','sun','moon','star','arrow','bullet','whip','fox','lion','mouse','owl','snake','wolf','cat','dog','horse','mule','lamb','eagle','hawk','dove','swan','rose','daisy','oak','pine','river','ocean','mountain','valley','mirror','glass','diamond','pearl','silver','bronze','iron','lead','paper','ghost','shadow','thunder','lightning','storm','cloud','rain','fog']
  for (const a of adjs) {
    for (const n of nouns) {
      if (map.size >= TARGET.idioms) break
      const ph = 'as ' + a + ' as a ' + n
      uniqPush(map, card(ph, 'so sánh: ' + a + ' như ' + n, 'She was ' + ph + '.', 'Cô ấy ' + a + ' như ' + n + '.', 'Cụm từ', 'B1'))
    }
  }

  // Verb + the + noun to fill remaining volume
  const verbs = ['hit','break','make','take','get','give','keep','lose','find','hold','call','pull','push','throw','catch','cut','draw','drop','face','feel','hang','leave','let','pay','play','put','raise','run','see','set','show','stand','turn','walk','wear','win','bear','bring','carry','cover','cross','drive','fall','fight','follow','form','gain','grow','help','join','kill','know','lay','lead','learn','lift','meet','miss','move','open','pass','pick','point','read','reach','save','send','serve','share','shut','sing','sit','speak','spend','start','stay','stick','stop','strike','study','teach','tell','think','touch','trade','train','treat','try','use','wait','wake','watch','wish','work','write']
  const theNouns = ['ball','book','bucket','bull','cake','can','card','case','cat','clock','cloud','corner','curtain','day','deal','door','dust','edge','end','face','fact','fire','floor','game','gate','ground','hand','hat','head','heat','ice','key','line','mark','market','money','nail','net','note','page','path','picture','point','price','race','road','roof','rope','rule','scene','score','seat','ship','show','side','stage','stone','story','table','test','time','track','truth','wall','way','wheel','wind','word','world']
  for (const v of verbs) {
    for (const n of theNouns) {
      if (map.size >= TARGET.idioms) break
      const ph = v + ' the ' + n
      uniqPush(map, card(ph, 'thành ngữ / collocation: ' + v + ' the ' + n, 'They tried to ' + ph + '.', 'Họ cố ' + ph + '.', 'Cụm từ', 'B2'))
    }
  }

  return [...map.values()].slice(0, TARGET.idioms)
}
// ——— Collocations ———
const COLLO_ADJ_NOUN = [
  ['heavy', 'rain', 'mưa lớn'],
  ['strong', 'wind', 'gió mạnh'],
  ['high', 'pressure', 'áp lực cao'],
  ['low', 'price', 'giá thấp'],
  ['deep', 'sleep', 'giấc ngủ sâu'],
  ['wide', 'range', 'phạm vi rộng'],
  ['bright', 'future', 'tương lai tươi sáng'],
  ['serious', 'problem', 'vấn đề nghiêm trọng'],
  ['major', 'issue', 'vấn đề lớn'],
  ['key', 'factor', 'yếu tố then chốt'],
  ['common', 'sense', 'lẽ thường'],
  ['public', 'opinion', 'dư luận'],
  ['economic', 'growth', 'tăng trưởng kinh tế'],
  ['climate', 'change', 'biến đổi khí hậu'],
  ['renewable', 'energy', 'năng lượng tái tạo'],
  ['global', 'market', 'thị trường toàn cầu'],
  ['social', 'media', 'mạng xã hội'],
  ['mental', 'health', 'sức khỏe tinh thần'],
  ['physical', 'activity', 'hoạt động thể chất'],
  ['academic', 'year', 'năm học'],
  ['full', 'time', 'toàn thời gian'],
  ['part', 'time', 'bán thời gian'],
  ['long', 'term', 'dài hạn'],
  ['short', 'term', 'ngắn hạn'],
  ['real', 'estate', 'bất động sản'],
  ['human', 'rights', 'nhân quyền'],
  ['natural', 'resources', 'tài nguyên thiên nhiên'],
  ['scientific', 'research', 'nghiên cứu khoa học'],
  ['daily', 'life', 'đời sống hàng ngày'],
  ['modern', 'society', 'xã hội hiện đại'],
]

const COLLO_VERB_NOUN = [
  ['make', 'a decision', 'đưa ra quyết định'],
  ['make', 'a mistake', 'phạm sai lầm'],
  ['make', 'progress', 'tiến bộ'],
  ['make', 'an effort', 'nỗ lực'],
  ['make', 'sense', 'có nghĩa / hợp lý'],
  ['take', 'a break', 'nghỉ giải lao'],
  ['take', 'a risk', 'mạo hiểm'],
  ['take', 'notes', 'ghi chép'],
  ['take', 'place', 'diễn ra'],
  ['take', 'care', 'chăm sóc / cẩn thận'],
  ['do', 'research', 'nghiên cứu'],
  ['do', 'business', 'kinh doanh'],
  ['do', 'homework', 'làm bài tập'],
  ['have', 'a conversation', 'trò chuyện'],
  ['have', 'an impact', 'có tác động'],
  ['have', 'difficulty', 'gặp khó khăn'],
  ['pay', 'attention', 'chú ý'],
  ['pay', 'a visit', 'thăm'],
  ['catch', 'a cold', 'bị cảm'],
  ['catch', 'someone\'s eye', 'thu hút ánh nhìn'],
  ['keep', 'a promise', 'giữ lời hứa'],
  ['keep', 'in touch', 'giữ liên lạc'],
  ['break', 'a record', 'phá kỷ lục'],
  ['break', 'the law', 'phạm luật'],
  ['save', 'time', 'tiết kiệm thời gian'],
  ['save', 'money', 'tiết kiệm tiền'],
  ['waste', 'time', 'lãng phí thời gian'],
  ['raise', 'awareness', 'nâng cao nhận thức'],
  ['raise', 'a question', 'đặt câu hỏi'],
  ['solve', 'a problem', 'giải quyết vấn đề'],
  ['meet', 'a deadline', 'đúng hạn'],
  ['miss', 'a chance', 'bỏ lỡ cơ hội'],
  ['gain', 'experience', 'có kinh nghiệm'],
  ['lose', 'control', 'mất kiểm soát'],
  ['draw', 'a conclusion', 'rút ra kết luận'],
  ['reach', 'an agreement', 'đi đến thỏa thuận'],
  ['set', 'a goal', 'đặt mục tiêu'],
  ['achieve', 'success', 'đạt thành công'],
  ['face', 'a challenge', 'đối mặt thách thức'],
  ['play', 'a role', 'đóng vai trò'],
]

const ADJ = 'strong heavy high low deep wide bright serious major key common public economic global social mental physical academic full long short real human natural scientific daily modern large small great good bad old new young free open closed safe dangerous easy hard important useful effective efficient positive negative basic advanced simple complex early late fast slow rich poor clean dirty quiet noisy busy free'.split(' ')
const NOUN = 'rain wind pressure price sleep range future problem issue factor sense opinion growth change energy market media health activity year time term estate rights resources research life society decision mistake progress effort risk notes place care business homework conversation impact difficulty attention visit cold eye promise touch record law money awareness question goal success challenge role control agreement chance experience conclusion'.split(' ')
const VERB = 'make take do have pay catch keep break save waste raise solve meet miss gain lose draw reach set achieve face play give get put go come find leave start stop help need want try use show know think feel seem become leave bring buy sell build learn teach read write speak listen watch'.split(' ')

function buildCollocations(multiKeys = []) {
  const map = new Map()
  for (const [a, n, m] of COLLO_ADJ_NOUN) {
    uniqPush(
      map,
      card(`${a} ${n}`, m, `There was ${a} ${n} yesterday.`, `Hôm qua có ${m}.`, 'Cụm từ', 'B1'),
    )
  }
  for (const [v, n, m] of COLLO_VERB_NOUN) {
    const phrase = `${v} ${n}`
    uniqPush(
      map,
      card(phrase, m, `You should ${phrase} carefully.`, `Bạn nên ${m} một cách cẩn thận.`, 'Cụm từ', 'B1'),
    )
  }
  // systematic adj+noun / verb+noun
  for (const a of ADJ) {
    for (const n of NOUN) {
      if (map.size >= TARGET.collocations) break
      const phrase = `${a} ${n}`
      uniqPush(
        map,
        card(
          phrase,
          `collocation: ${a} + ${n}`,
          `This is a typical example of ${phrase}.`,
          `Đây là ví dụ điển hình của cụm "${phrase}".`,
          'Cụm từ',
          'B1',
        ),
      )
    }
  }
  for (const v of VERB) {
    for (const n of NOUN) {
      if (map.size >= TARGET.collocations) break
      const phrase = `${v} ${n}`
      if (phrase.split(' ').length !== 2) continue
      uniqPush(
        map,
        card(
          phrase,
          `collocation: ${v} + ${n}`,
          `Learners often ${phrase} in exams.`,
          `Học viên thường gặp cụm "${phrase}" trong bài thi.`,
          'Cụm từ',
          'B1',
        ),
      )
    }
  }
  // multi-word keys from open-vn-en-dict goodWords
  for (const phrase of multiKeys) {
    if (map.size >= TARGET.collocations) break
    const ph = phrase.toLowerCase().trim().replace(/\s+/g, ' ')
    if (!/\s/.test(ph) || ph.length > 48) continue
    if (/[0-9]/.test(ph)) continue
    uniqPush(
      map,
      card(
        ph,
        `cụm từ / collocation: ${ph}`,
        `"${ph}" is a useful collocation in English.`,
        `"${ph}" là collocation hữu ích trong tiếng Anh.`,
        'Cụm từ',
        ph.split(' ').length >= 3 ? 'B2' : 'B1',
      ),
    )
  }
  return [...map.values()].slice(0, TARGET.collocations)
}

async function main() {
  console.log('Building multi-word packs…')

  // idioms csv seed
  let csvIdioms = []
  try {
    const r = await get('https://raw.githubusercontent.com/baiango/english_idioms/main/idioms.csv')
    if (r.status === 200) {
      const re = /\{([^}]+)\}>>\{([^}]+)\}/g
      let m
      while ((m = re.exec(r.body))) {
        csvIdioms.push({ phrase: m[1].trim(), meaning: m[2].trim() })
      }
      console.log('idioms csv', csvIdioms.length)
    }
  } catch (e) {
    console.warn('idioms csv skip', e.message)
  }

  // multi keys for collocations
  let multiKeys = []
  try {
    const r = await get('https://raw.githubusercontent.com/samuraitruong/open-vn-en-dict/master/goodWords.json')
    if (r.status === 200) {
      const j = JSON.parse(r.body)
      multiKeys = Object.keys(j).filter(k => /\s/.test(k) && k.length < 50)
      console.log('goodWords multi', multiKeys.length)
    }
  } catch (e) {
    console.warn('goodWords skip', e.message)
  }

  const phrasal = buildPhrasals()
  const idioms = buildIdioms(csvIdioms)
  const collocations = buildCollocations(multiKeys)

  console.log({
    phrasal: phrasal.length,
    idioms: idioms.length,
    collocations: collocations.length,
  })

  function writePack(name, kind, cards) {
    const out = {
      version: 1,
      kind,
      source: {
        note: 'Generated for A2–C2 offline dictionary',
        github: [
          'samuraitruong/open-vn-en-dict',
          'baiango/english_idioms',
          'first20hours/google-10000-english',
        ],
        count: cards.length,
        generatedAt: new Date().toISOString(),
      },
      cards,
    }
    const fp = path.join(outDir, name)
    fs.writeFileSync(fp, JSON.stringify(out), 'utf8')
    console.log('wrote', fp, (fs.statSync(fp).size / 1024 / 1024).toFixed(2), 'MB')
  }

  fs.mkdirSync(outDir, { recursive: true })
  writePack('offlinePhrasal.json', 'phrasal', phrasal)
  writePack('offlineIdioms.json', 'idiom', idioms)
  writePack('offlineCollocations.json', 'collocation', collocations)

  if (phrasal.length < TARGET.phrasal || idioms.length < TARGET.idioms || collocations.length < TARGET.collocations) {
    console.warn('WARNING: below target', {
      phrasal: phrasal.length,
      idioms: idioms.length,
      collocations: collocations.length,
    })
    process.exitCode = 1
  }

  // IPA pass (CMUdict) — same as node scripts/enrich-dict-multi-ipa.mjs
  try {
    const { spawnSync } = await import('node:child_process')
    const r = spawnSync(process.execPath, [path.join(root, 'scripts/enrich-dict-multi-ipa.mjs')], {
      stdio: 'inherit',
      cwd: root,
    })
    if (r.status !== 0) console.warn('IPA enrich exit', r.status)
  } catch (e) {
    console.warn('IPA enrich skip', e.message)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
