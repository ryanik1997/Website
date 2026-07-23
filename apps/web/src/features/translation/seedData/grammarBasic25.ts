/**
 * 8 chủ đề grammar_basic × 25 câu VI→EN (seed cố định).
 * id ổn định: tr-grammar-{genre} / tr-grammar-{genre}-sNN
 */
import type { TranslationGenre, TranslationSet } from '@ryan/db'

type Row = [vi: string, en: string, hint?: string, difficulty?: 'easy' | 'medium' | 'hard']

const TITLES: Record<
  | 'present_simple'
  | 'present_continuous'
  | 'present_perfect'
  | 'present_perfect_continuous'
  | 'uncountable_nouns'
  | 'singular_plural'
  | 'passive_voice'
  | 'comparison_struct',
  string
> = {
  present_simple: 'Hiện tại đơn (Present Simple) — 25 câu',
  present_continuous: 'Hiện tại tiếp diễn (Present Continuous) — 25 câu',
  present_perfect: 'Hiện tại hoàn thành (Present Perfect) — 25 câu',
  present_perfect_continuous: 'Hiện tại hoàn thành tiếp diễn — 25 câu',
  uncountable_nouns: 'Danh từ không đếm được — 25 câu',
  singular_plural: 'Số ít / Số nhiều — 25 câu',
  passive_voice: 'Câu bị động (Passive Voice) — 25 câu',
  comparison_struct: 'Cấu trúc so sánh — 25 câu',
}

const DATA: Record<keyof typeof TITLES, Row[]> = {
  present_simple: [
    ['Tôi học tiếng Anh mỗi ngày.', 'I study English every day.', 'study, every day', 'easy'],
    ['Cô ấy dạy toán ở trường tiểu học.', 'She teaches maths at a primary school.', 'teaches, primary school', 'easy'],
    ['Họ không thích ăn đồ ăn cay.', 'They do not like eating spicy food.', 'do not like, spicy', 'easy'],
    ['Anh ấy thường đi làm bằng xe buýt.', 'He usually goes to work by bus.', 'usually, by bus', 'easy'],
    ['Chúng tôi sống ở Hà Nội.', 'We live in Hanoi.', 'live, Hanoi', 'easy'],
    ['Mặt trời mọc ở phía đông.', 'The sun rises in the east.', 'rises, east', 'easy'],
    ['Bạn có uống cà phê vào buổi sáng không?', 'Do you drink coffee in the morning?', 'Do you drink', 'medium'],
    ['Cô ấy không nói được tiếng Pháp.', 'She does not speak French.', 'does not speak', 'easy'],
    ['Tàu khởi hành lúc 7 giờ tối.', 'The train leaves at 7 p.m.', 'leaves, at 7 p.m.', 'medium'],
    ['Anh ấy làm việc cho một công ty công nghệ.', 'He works for a technology company.', 'works for', 'easy'],
    ['Tôi luôn kiểm tra email trước khi ngủ.', 'I always check my email before going to bed.', 'always, check', 'medium'],
    ['Trẻ em cần ngủ đủ giấc.', 'Children need enough sleep.', 'need, enough sleep', 'easy'],
    ['Cô ấy thích đọc sách vào cuối tuần.', 'She likes reading books at the weekend.', 'likes reading', 'easy'],
    ['Họ chơi bóng đá mỗi Chủ nhật.', 'They play football every Sunday.', 'play football', 'easy'],
    ['Nước sôi ở 100 độ C.', 'Water boils at 100 degrees Celsius.', 'boils, 100 degrees', 'medium'],
    ['Bạn có tin vào may mắn không?', 'Do you believe in luck?', 'believe in', 'medium'],
    ['Anh ấy hiếm khi đến muộn.', 'He rarely arrives late.', 'rarely, arrives', 'medium'],
    ['Chúng tôi học IELTS hai lần một tuần.', 'We study IELTS twice a week.', 'twice a week', 'medium'],
    ['Cô ấy kiếm sống bằng nghề viết lách.', 'She earns a living as a writer.', 'earns a living', 'hard'],
    ['Chính phủ đầu tư nhiều vào giáo dục.', 'The government invests heavily in education.', 'invests heavily', 'hard'],
    ['Tôi nghĩ rằng thói quen tốt rất quan trọng.', 'I think that good habits are very important.', 'I think that', 'medium'],
    ['Anh ấy không bao giờ bỏ bữa sáng.', 'He never skips breakfast.', 'never skips', 'medium'],
    ['Cửa hàng mở cửa lúc 9 giờ sáng.', 'The shop opens at 9 a.m.', 'opens, at 9 a.m.', 'easy'],
    ['Họ tin rằng chăm chỉ sẽ dẫn đến thành công.', 'They believe that hard work leads to success.', 'believe that, leads to', 'hard'],
    ['Em bé khóc khi đói.', 'The baby cries when he is hungry.', 'cries, hungry', 'easy'],
  ],

  present_continuous: [
    ['Tôi đang học tiếng Anh bây giờ.', 'I am studying English right now.', 'am studying, right now', 'easy'],
    ['Cô ấy đang dạy toán ở trường tiểu học.', 'She is teaching maths at a primary school.', 'is teaching', 'easy'],
    ['Trời đang mưa rất to.', 'It is raining heavily.', 'is raining', 'easy'],
    ['Họ đang thảo luận về dự án mới trong phòng họp.', 'They are discussing the new project in the meeting room.', 'are discussing', 'medium'],
    ['Chính phủ đang xây dựng một hệ thống tàu điện mới.', 'The government is building a new metro system.', 'is building', 'medium'],
    ['Anh ấy không đang nghe nhạc.', 'He is not listening to music.', 'is not listening', 'easy'],
    ['Bạn đang làm gì vậy?', 'What are you doing?', 'What are you doing', 'easy'],
    ['Chúng tôi đang chuẩn bị cho kỳ thi IELTS.', 'We are preparing for the IELTS exam.', 'are preparing', 'medium'],
    ['Cô ấy đang nấu bữa tối trong bếp.', 'She is cooking dinner in the kitchen.', 'is cooking', 'easy'],
    ['Trẻ em đang chơi ở công viên.', 'The children are playing in the park.', 'are playing', 'easy'],
    ['Tôi đang đọc một cuốn sách thú vị.', 'I am reading an interesting book.', 'am reading', 'easy'],
    ['Họ đang chờ xe buýt ở trạm.', 'They are waiting for the bus at the stop.', 'are waiting for', 'medium'],
    ['Anh ấy đang tập thể dục tại phòng gym.', 'He is working out at the gym.', 'is working out', 'medium'],
    ['Công ty đang tuyển thêm nhân viên.', 'The company is hiring more staff.', 'is hiring', 'medium'],
    ['Cô ấy đang học lái xe.', 'She is learning to drive.', 'is learning', 'easy'],
    ['Chúng tôi đang chuyển nhà tuần này.', 'We are moving house this week.', 'are moving', 'medium'],
    ['Mọi người đang nói về biến đổi khí hậu.', 'People are talking about climate change.', 'are talking about', 'medium'],
    ['Tôi không đang xem TV lúc này.', 'I am not watching TV at the moment.', 'am not watching', 'easy'],
    ['Anh ấy đang viết email cho sếp.', 'He is writing an email to his boss.', 'is writing', 'easy'],
    ['Họ đang lên kế hoạch cho kỳ nghỉ hè.', 'They are planning their summer holiday.', 'are planning', 'medium'],
    ['Cô ấy đang mặc một chiếc váy đỏ.', 'She is wearing a red dress.', 'is wearing', 'easy'],
    ['Máy bay đang hạ cánh.', 'The plane is landing.', 'is landing', 'easy'],
    ['Tôi đang nghĩ về tương lai của mình.', 'I am thinking about my future.', 'am thinking about', 'medium'],
    ['Các nhà khoa học đang nghiên cứu vaccine mới.', 'Scientists are researching a new vaccine.', 'are researching', 'hard'],
    ['Bạn đang cải thiện kỹ năng viết mỗi ngày.', 'You are improving your writing skills every day.', 'are improving', 'medium'],
  ],

  present_perfect: [
    ['Tôi đã đọc cuốn sách đó rồi.', 'I have already read that book.', 'have already read', 'easy'],
    ['Cô ấy đã sống ở London được ba năm.', 'She has lived in London for three years.', 'has lived, for', 'medium'],
    ['Họ đã từng đến Nhật Bản.', 'They have been to Japan.', 'have been to', 'easy'],
    ['Anh ấy chưa bao giờ thử sushi.', 'He has never tried sushi.', 'has never tried', 'easy'],
    ['Bạn đã hoàn thành bài tập chưa?', 'Have you finished your homework yet?', 'Have you finished, yet', 'medium'],
    ['Chúng tôi vừa mới ăn trưa.', 'We have just had lunch.', 'have just had', 'easy'],
    ['Cô ấy đã mất chìa khóa.', 'She has lost her keys.', 'has lost', 'easy'],
    ['Tôi đã biết anh ấy từ khi còn nhỏ.', 'I have known him since I was a child.', 'have known, since', 'medium'],
    ['Họ đã xây xong cây cầu mới.', 'They have built a new bridge.', 'have built', 'medium'],
    ['Anh ấy đã cải thiện tiếng Anh rất nhiều.', 'He has improved his English a lot.', 'has improved', 'medium'],
    ['Bạn đã xem bộ phim đó chưa?', 'Have you seen that film?', 'Have you seen', 'easy'],
    ['Cô ấy đã quyết định chuyển việc.', 'She has decided to change jobs.', 'has decided', 'medium'],
    ['Tôi chưa bao giờ bay máy bay.', 'I have never flown on a plane.', 'have never flown', 'medium'],
    ['Họ đã ăn hết bánh.', 'They have eaten all the cake.', 'have eaten', 'easy'],
    ['Chính phủ đã ban hành luật mới.', 'The government has introduced a new law.', 'has introduced', 'hard'],
    ['Anh ấy đã viết năm cuốn sách.', 'He has written five books.', 'has written', 'medium'],
    ['Chúng tôi đã gặp nhau hai lần trong năm nay.', 'We have met twice this year.', 'have met, this year', 'medium'],
    ['Cô ấy vừa gọi cho tôi.', 'She has just called me.', 'has just called', 'easy'],
    ['Bạn đã từng học piano chưa?', 'Have you ever learned the piano?', 'Have you ever', 'medium'],
    ['Tôi đã quên mang ví.', 'I have forgotten to bring my wallet.', 'have forgotten', 'medium'],
    ['Họ đã giảm chi phí đáng kể.', 'They have reduced costs significantly.', 'have reduced', 'hard'],
    ['Anh ấy đã trở thành bác sĩ.', 'He has become a doctor.', 'has become', 'easy'],
    ['Cô ấy đã làm việc ở đây từ năm 2020.', 'She has worked here since 2020.', 'has worked, since', 'medium'],
    ['Chúng tôi chưa nhận được phản hồi.', 'We have not received a reply yet.', 'have not received, yet', 'medium'],
    ['Tôi đã học được nhiều điều từ trải nghiệm này.', 'I have learned a lot from this experience.', 'have learned, from', 'hard'],
  ],

  present_perfect_continuous: [
    ['Tôi đã học tiếng Anh được hai năm.', 'I have been studying English for two years.', 'have been studying, for', 'medium'],
    ['Cô ấy đã chờ xe buýt từ 8 giờ sáng.', 'She has been waiting for the bus since 8 a.m.', 'has been waiting, since', 'medium'],
    ['Họ đã làm việc cả ngày.', 'They have been working all day.', 'have been working', 'easy'],
    ['Anh ấy đã chạy bộ suốt buổi sáng.', 'He has been running all morning.', 'has been running', 'easy'],
    ['Bạn đã sống ở đây bao lâu rồi?', 'How long have you been living here?', 'How long have you been', 'medium'],
    ['Trời đã mưa từ tối qua.', 'It has been raining since last night.', 'has been raining', 'medium'],
    ['Chúng tôi đã thảo luận vấn đề này cả tuần.', 'We have been discussing this issue all week.', 'have been discussing', 'hard'],
    ['Cô ấy đã dạy ở trường này từ năm 2018.', 'She has been teaching at this school since 2018.', 'has been teaching', 'medium'],
    ['Tôi đã đọc cuốn tiểu thuyết đó cả buổi chiều.', 'I have been reading that novel all afternoon.', 'have been reading', 'medium'],
    ['Họ đã xây dựng tòa nhà này trong hai năm.', 'They have been constructing this building for two years.', 'have been constructing', 'hard'],
    ['Anh ấy đã tập piano từ khi còn nhỏ.', 'He has been practising the piano since he was a child.', 'has been practising', 'hard'],
    ['Cô ấy đã tìm việc trong vài tháng.', 'She has been looking for a job for a few months.', 'has been looking for', 'medium'],
    ['Chúng tôi đã chờ tin tốt.', 'We have been waiting for good news.', 'have been waiting for', 'easy'],
    ['Tôi đã cảm thấy mệt mỏi gần đây.', 'I have been feeling tired recently.', 'have been feeling', 'medium'],
    ['Họ đã cải thiện chất lượng dịch vụ.', 'They have been improving the quality of their service.', 'have been improving', 'hard'],
    ['Anh ấy đã viết luận văn suốt mùa hè.', 'He has been writing his thesis all summer.', 'has been writing', 'medium'],
    ['Bạn đã học lái xe bao lâu rồi?', 'How long have you been learning to drive?', 'How long have you been learning', 'medium'],
    ['Cô ấy đã làm việc từ xa trong thời gian dài.', 'She has been working remotely for a long time.', 'has been working remotely', 'hard'],
    ['Tôi đã nghĩ về quyết định này rất nhiều.', 'I have been thinking about this decision a lot.', 'have been thinking about', 'medium'],
    ['Họ đã chuẩn bị cho kỳ thi trong nhiều tuần.', 'They have been preparing for the exam for many weeks.', 'have been preparing', 'medium'],
    ['Trẻ em đã chơi ngoài sân cả buổi.', 'The children have been playing outside all morning.', 'have been playing', 'easy'],
    ['Anh ấy đã cố gắng bỏ thuốc lá.', 'He has been trying to quit smoking.', 'has been trying to', 'medium'],
    ['Chúng tôi đã hợp tác với họ từ năm ngoái.', 'We have been cooperating with them since last year.', 'have been cooperating', 'hard'],
    ['Cô ấy đã tập yoga mỗi sáng.', 'She has been doing yoga every morning.', 'has been doing yoga', 'easy'],
    ['Tôi đã theo dõi tin tức cả ngày.', 'I have been following the news all day.', 'have been following', 'medium'],
  ],

  uncountable_nouns: [
    ['Tôi cần một số thông tin về khóa học.', 'I need some information about the course.', 'some information', 'easy'],
    ['Cô ấy cho tôi lời khuyên hữu ích.', 'She gave me useful advice.', 'advice', 'easy'],
    ['Có quá nhiều đồ đạc trong phòng.', 'There is too much furniture in the room.', 'too much furniture', 'medium'],
    ['Anh ấy không có nhiều tiền.', 'He does not have much money.', 'much money', 'easy'],
    ['Chúng tôi cần thêm nước.', 'We need more water.', 'more water', 'easy'],
    ['Kiến thức là sức mạnh.', 'Knowledge is power.', 'Knowledge is', 'easy'],
    ['Cô ấy mua một ít gạo.', 'She bought some rice.', 'some rice', 'easy'],
    ['Có rất ít thời gian còn lại.', 'There is very little time left.', 'little time', 'medium'],
    ['Anh ấy thích nghe nhạc cổ điển.', 'He likes listening to classical music.', 'music', 'easy'],
    ['Họ cung cấp thiết bị hiện đại.', 'They provide modern equipment.', 'equipment', 'medium'],
    ['Tôi cần một chút giúp đỡ.', 'I need a little help.', 'a little help', 'easy'],
    ['Cô ấy có nhiều kinh nghiệm trong lĩnh vực này.', 'She has a lot of experience in this field.', 'a lot of experience', 'medium'],
    ['Không khí ở thành phố bị ô nhiễm.', 'The air in the city is polluted.', 'air, polluted', 'medium'],
    ['Anh ấy đổ đầy xăng vào xe.', 'He filled the car with petrol.', 'petrol', 'medium'],
    ['Chúng tôi nhận được tin xấu hôm qua.', 'We received bad news yesterday.', 'news', 'easy'],
    ['Cô ấy thích làm bánh bằng bột mì.', 'She likes baking with flour.', 'flour', 'easy'],
    ['Có quá nhiều tiếng ồn ngoài đường.', 'There is too much noise outside.', 'too much noise', 'easy'],
    ['Anh ấy nghiên cứu về tiến bộ khoa học.', 'He researches scientific progress.', 'progress', 'hard'],
    ['Tôi thích uống sữa vào buổi sáng.', 'I like drinking milk in the morning.', 'milk', 'easy'],
    ['Họ thiếu bằng chứng rõ ràng.', 'They lack clear evidence.', 'evidence', 'hard'],
    ['Cô ấy mua một ít đường và muối.', 'She bought some sugar and salt.', 'sugar, salt', 'easy'],
    ['Chúng tôi cần thêm không gian để làm việc.', 'We need more space to work.', 'space', 'medium'],
    ['Anh ấy không mang nhiều hành lý.', 'He is not carrying much luggage.', 'much luggage', 'medium'],
    ['Kiên nhẫn là một đức tính quan trọng.', 'Patience is an important quality.', 'Patience', 'medium'],
    ['Cô ấy chia sẻ nghiên cứu của mình với nhóm.', 'She shared her research with the team.', 'research', 'hard'],
  ],

  singular_plural: [
    ['Có một quyển sách trên bàn.', 'There is a book on the table.', 'There is a book', 'easy'],
    ['Có nhiều quyển sách trên kệ.', 'There are many books on the shelf.', 'There are many books', 'easy'],
    ['Đứa trẻ đang ngủ.', 'The child is sleeping.', 'The child is', 'easy'],
    ['Những đứa trẻ đang chơi ngoài sân.', 'The children are playing outside.', 'The children are', 'easy'],
    ['Người đàn ông đó là bác sĩ.', 'That man is a doctor.', 'That man is', 'easy'],
    ['Những người đàn ông đang làm việc.', 'The men are working.', 'The men are', 'easy'],
    ['Cô gái có một con mèo.', 'The girl has a cat.', 'has a cat', 'easy'],
    ['Những cô gái đang hát.', 'The girls are singing.', 'The girls are', 'easy'],
    ['Cái hộp này nặng.', 'This box is heavy.', 'This box is', 'easy'],
    ['Những cái hộp kia nhẹ.', 'Those boxes are light.', 'Those boxes are', 'easy'],
    ['Một con dao sắc nằm trong bếp.', 'A sharp knife is in the kitchen.', 'A sharp knife', 'medium'],
    ['Hai con dao đang được rửa.', 'Two knives are being washed.', 'Two knives', 'medium'],
    ['Cuộc đời con người rất ngắn ngủi.', 'Human life is very short.', 'life is', 'medium'],
    ['Những cuộc đời khác nhau mang lại trải nghiệm khác nhau.', 'Different lives bring different experiences.', 'lives bring', 'hard'],
    ['Con cá bơi trong hồ.', 'The fish is swimming in the pond.', 'The fish is', 'easy'],
    ['Nhiều con cá bơi cùng nhau.', 'Many fish are swimming together.', 'Many fish are', 'medium'],
    ['Chiếc lá rơi xuống đất.', 'The leaf is falling to the ground.', 'The leaf is', 'easy'],
    ['Những chiếc lá đổi màu vào mùa thu.', 'The leaves change colour in autumn.', 'The leaves change', 'medium'],
    ['Một chiếc chân ghế bị gãy.', 'One leg of the chair is broken.', 'One leg is', 'medium'],
    ['Cả hai chân ghế đều vững.', 'Both legs of the chair are sturdy.', 'Both legs are', 'medium'],
    ['Thành phố này có một bảo tàng.', 'This city has a museum.', 'has a museum', 'easy'],
    ['Những thành phố lớn có nhiều bảo tàng.', 'Big cities have many museums.', 'cities have', 'easy'],
    ['Người phụ nữ đang đọc báo.', 'The woman is reading a newspaper.', 'The woman is', 'easy'],
    ['Những người phụ nữ đang thảo luận.', 'The women are having a discussion.', 'The women are', 'medium'],
    ['Mỗi học sinh đều có một máy tính xách tay.', 'Each student has a laptop.', 'Each student has', 'medium'],
  ],

  passive_voice: [
    ['Cửa sổ được lau mỗi tuần.', 'The windows are cleaned every week.', 'are cleaned', 'easy'],
    ['Bức thư đã được gửi hôm qua.', 'The letter was sent yesterday.', 'was sent', 'easy'],
    ['Ngôi nhà đang được xây.', 'The house is being built.', 'is being built', 'medium'],
    ['Vấn đề sẽ được thảo luận vào ngày mai.', 'The problem will be discussed tomorrow.', 'will be discussed', 'medium'],
    ['Bài thi được chấm bởi giáo viên.', 'The exams are marked by the teacher.', 'are marked by', 'easy'],
    ['Cây cầu đã được hoàn thành năm ngoái.', 'The bridge was completed last year.', 'was completed', 'medium'],
    ['Tiếng Anh được nói trên khắp thế giới.', 'English is spoken all over the world.', 'is spoken', 'easy'],
    ['Quyết định đã được đưa ra.', 'The decision has been made.', 'has been made', 'medium'],
    ['Phòng này phải được giữ sạch sẽ.', 'This room must be kept clean.', 'must be kept', 'medium'],
    ['Thức ăn đang được chuẩn bị.', 'The food is being prepared.', 'is being prepared', 'easy'],
    ['Bài báo được viết bằng tiếng Anh.', 'The article was written in English.', 'was written', 'easy'],
    ['Nhiều việc làm đã được tạo ra.', 'Many jobs have been created.', 'have been created', 'medium'],
    ['Luật mới sẽ được áp dụng sớm.', 'The new law will be applied soon.', 'will be applied', 'medium'],
    ['Anh ấy được mời đến buổi tiệc.', 'He was invited to the party.', 'was invited', 'easy'],
    ['Dữ liệu đang được phân tích.', 'The data is being analysed.', 'is being analysed', 'hard'],
    ['Những lỗi này có thể được sửa.', 'These mistakes can be corrected.', 'can be corrected', 'medium'],
    ['Bức tranh được vẽ bởi một nghệ sĩ nổi tiếng.', 'The painting was painted by a famous artist.', 'was painted by', 'medium'],
    ['Thông báo đã được đăng trên trang web.', 'The announcement has been posted on the website.', 'has been posted', 'medium'],
    ['Rác nên được tái chế.', 'Rubbish should be recycled.', 'should be recycled', 'easy'],
    ['Cuộc họp bị hoãn đến tuần sau.', 'The meeting was postponed until next week.', 'was postponed', 'hard'],
    ['Sách này được xuất bản năm 2020.', 'This book was published in 2020.', 'was published', 'easy'],
    ['Điện thoại của tôi đang được sửa.', 'My phone is being repaired.', 'is being repaired', 'easy'],
    ['Kết quả sẽ được công bố vào thứ Sáu.', 'The results will be announced on Friday.', 'will be announced', 'medium'],
    ['Vấn đề này đã được nghiên cứu kỹ lưỡng.', 'This issue has been thoroughly researched.', 'has been thoroughly researched', 'hard'],
    ['Thành phố được biết đến với ẩm thực đường phố.', 'The city is known for its street food.', 'is known for', 'medium'],
  ],

  comparison_struct: [
    ['Hà Nội lớn hơn Đà Nẵng.', 'Hanoi is larger than Da Nang.', 'larger than', 'easy'],
    ['Cô ấy cao nhất trong lớp.', 'She is the tallest in the class.', 'the tallest', 'easy'],
    ['Cuốn sách này thú vị hơn cuốn kia.', 'This book is more interesting than that one.', 'more interesting than', 'easy'],
    ['Đây là bộ phim hay nhất tôi từng xem.', 'This is the best film I have ever seen.', 'the best', 'medium'],
    ['Anh ấy chạy nhanh như tôi.', 'He runs as fast as I do.', 'as fast as', 'medium'],
    ['Hôm nay không lạnh bằng hôm qua.', 'Today is not as cold as yesterday.', 'not as cold as', 'medium'],
    ['Xe hơi đắt hơn xe máy.', 'Cars are more expensive than motorbikes.', 'more expensive than', 'easy'],
    ['Cô ấy nói tiếng Anh giỏi hơn anh ấy.', 'She speaks English better than he does.', 'better than', 'medium'],
    ['Đây là cách dễ nhất để giải quyết vấn đề.', 'This is the easiest way to solve the problem.', 'the easiest way', 'medium'],
    ['Thành phố ngày càng trở nên đông đúc hơn.', 'The city is becoming more and more crowded.', 'more and more', 'hard'],
    ['Càng học nhiều, bạn càng tự tin hơn.', 'The more you study, the more confident you become.', 'The more… the more', 'hard'],
    ['Mùa hè nóng hơn mùa xuân.', 'Summer is hotter than spring.', 'hotter than', 'easy'],
    ['Đó là tòa nhà cao nhất trong thành phố.', 'That is the tallest building in the city.', 'the tallest building', 'easy'],
    ['Bài kiểm tra này khó hơn tôi nghĩ.', 'This test is harder than I thought.', 'harder than', 'easy'],
    ['Cô ấy ít nói hơn anh trai.', 'She talks less than her brother.', 'less than', 'medium'],
    ['Đây là một trong những công viên đẹp nhất.', 'This is one of the most beautiful parks.', 'one of the most', 'medium'],
    ['Máy tính xách tay nhẹ hơn máy tính để bàn.', 'A laptop is lighter than a desktop computer.', 'lighter than', 'easy'],
    ['Anh ấy làm việc chăm chỉ như mọi người khác.', 'He works as hard as everyone else.', 'as hard as', 'medium'],
    ['Giá nhà ngày càng đắt đỏ hơn.', 'Housing prices are getting more and more expensive.', 'more and more expensive', 'hard'],
    ['Đó là quyết định tồi tệ nhất của tôi.', 'That was the worst decision of mine.', 'the worst', 'medium'],
    ['Càng ít đường, càng tốt cho sức khỏe.', 'The less sugar you eat, the better it is for your health.', 'The less… the better', 'hard'],
    ['Bài viết này ngắn hơn bài kia.', 'This essay is shorter than that one.', 'shorter than', 'easy'],
    ['Cô ấy là người thông minh nhất nhóm.', 'She is the most intelligent person in the group.', 'the most intelligent', 'medium'],
    ['Du lịch bằng tàu chậm hơn máy bay nhưng rẻ hơn.', 'Travelling by train is slower than flying but cheaper.', 'slower than, cheaper', 'hard'],
    ['Hôm nay tôi cảm thấy tốt hơn hôm qua.', 'I feel better today than yesterday.', 'better today than', 'easy'],
  ],
}

function defaultSrs(now: number) {
  return { ease: 2.5, interval: 0, dueAt: now, reps: 0 }
}

export function buildGrammarBasic25Sets(createdAt = Date.now()): TranslationSet[] {
  const sets: TranslationSet[] = []

  for (const genre of Object.keys(DATA) as Array<keyof typeof DATA>) {
    const rows = DATA[genre]
    if (rows.length !== 25) {
      throw new Error(`grammarBasic25: ${genre} has ${rows.length} sentences, expected 25`)
    }
    const setId = `tr-grammar-${genre}`
    sets.push({
      id: setId,
      title: TITLES[genre],
      category: 'grammar_basic',
      genre: genre as TranslationGenre,
      cefr: 'A2',
      createdAt,
      sentences: rows.map((row, i) => {
        const [vi, en, hint, difficulty] = row
        const n = String(i + 1).padStart(2, '0')
        return {
          id: `${setId}-s${n}`,
          vi,
          en,
          hint,
          difficulty: difficulty ?? 'medium',
          srsState: defaultSrs(createdAt),
        }
      }),
    })
  }

  return sets
}

export const GRAMMAR_BASIC_GENRE_IDS = Object.keys(DATA) as TranslationGenre[]
