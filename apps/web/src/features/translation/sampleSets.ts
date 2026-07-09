import type { TranslationSet } from '@ryan/db'
import { defaultSentence } from './types'

type SamplePack = Pick<TranslationSet, 'title' | 'category' | 'genre' | 'cefr' | 'sentences'>

const IELTS_TASK2: SamplePack = {
  title: 'IELTS Task 2 — Giáo dục',
  category: 'collocation',
  genre: 'topic_education',
  cefr: 'B2',
  sentences: [
    defaultSentence({
      vi: 'Nhiều người cho rằng công nghệ đã làm thay đổi cách con người giao tiếp.',
      en: 'Many people believe that technology has transformed the way people communicate.',
      hint: 'transform, communicate',
      difficulty: 'medium',
    }),
    defaultSentence({
      vi: 'Một số người lập luận rằng giáo dục trực tuyến sẽ thay thế trường học truyền thống.',
      en: 'Some people argue that online education will replace traditional schools.',
      hint: 'argue, replace, traditional',
      difficulty: 'medium',
    }),
    defaultSentence({
      vi: 'Tôi hoàn toàn đồng ý rằng việc bảo vệ môi trường là trách nhiệm của mọi công dân.',
      en: 'I completely agree that protecting the environment is every citizen\'s responsibility.',
      hint: 'agree, protect, responsibility',
      difficulty: 'easy',
    }),
    defaultSentence({
      vi: 'Mặt khác, có những người cho rằng kinh tế phát triển quan trọng hơn bảo vệ thiên nhiên.',
      en: 'On the other hand, some believe that economic growth is more important than protecting nature.',
      hint: 'on the other hand, economic growth',
      difficulty: 'hard',
    }),
    defaultSentence({
      vi: 'Ví dụ, nhiều thành phố lớn đang đầu tư vào giao thông công cộng để giảm ô nhiễm không khí.',
      en: 'For example, many large cities are investing in public transport to reduce air pollution.',
      hint: 'for example, public transport, pollution',
      difficulty: 'medium',
    }),
    defaultSentence({
      vi: 'Theo quan điểm của tôi, chính phủ nên khuyến khích người dân sử dụng năng lượng tái tạo.',
      en: 'In my opinion, governments should encourage people to use renewable energy.',
      hint: 'in my opinion, encourage, renewable',
      difficulty: 'medium',
    }),
    defaultSentence({
      vi: 'Một lợi ích rõ ràng của việc học ngoại ngữ là mở rộng cơ hội nghề nghiệp.',
      en: 'A clear benefit of learning a foreign language is expanding career opportunities.',
      hint: 'benefit, foreign language, career',
      difficulty: 'easy',
    }),
    defaultSentence({
      vi: 'Tuy nhiên, không phải ai cũng có đủ thời gian và tài chính để theo học.',
      en: 'However, not everyone has enough time and money to pursue their studies.',
      hint: 'however, pursue, studies',
      difficulty: 'medium',
    }),
    defaultSentence({
      vi: 'Kết luận, tôi tin rằng cân bằng giữa công việc và cuộc sống là điều cần thiết.',
      en: 'In conclusion, I believe that work-life balance is essential.',
      hint: 'in conclusion, work-life balance, essential',
      difficulty: 'easy',
    }),
    defaultSentence({
      vi: 'Nếu không có các biện pháp hiệu quả, vấn đề này sẽ ngày càng trở nên nghiêm trọng.',
      en: 'Without effective measures, this problem will become increasingly serious.',
      hint: 'effective measures, increasingly, serious',
      difficulty: 'hard',
    }),
  ],
}

const IELTS_TASK1: SamplePack = {
  title: 'Band 6.5 — Môi trường',
  category: 'paragraph_65',
  genre: 'topic_environment',
  cefr: 'B1',
  sentences: [
    defaultSentence({
      vi: 'Biểu đồ cho thấy sự tăng đáng kể trong giai đoạn từ 2010 đến 2020.',
      en: 'The chart shows a significant increase from 2010 to 2020.',
      hint: 'chart, significant increase',
      difficulty: 'easy',
    }),
    defaultSentence({
      vi: 'Tổng quan, lượng khách du lịch tăng gấp đôi trong mười năm.',
      en: 'Overall, the number of tourists doubled over the decade.',
      hint: 'overall, doubled, decade',
      difficulty: 'medium',
    }),
    defaultSentence({
      vi: 'Năm 2015, doanh số bán hàng đạt mức cao nhất trong toàn bộ giai đoạn.',
      en: 'In 2015, sales reached the highest level throughout the period.',
      hint: 'reached, highest level, period',
      difficulty: 'medium',
    }),
    defaultSentence({
      vi: 'Trong khi đó, tỷ lệ thất nghiệp giảm dần từ 8% xuống còn 4%.',
      en: 'Meanwhile, the unemployment rate gradually fell from 8% to 4%.',
      hint: 'meanwhile, unemployment rate, gradually',
      difficulty: 'hard',
    }),
    defaultSentence({
      vi: 'Số lượng sinh viên đăng ký khóa học trực tuyến tăng mạnh vào năm 2018.',
      en: 'The number of students enrolling in online courses rose sharply in 2018.',
      hint: 'enrolling, rose sharply',
      difficulty: 'medium',
    }),
    defaultSentence({
      vi: 'Xu hướng này cho thấy nhu cầu về năng lượng tái tạo ngày càng tăng.',
      en: 'This trend indicates a growing demand for renewable energy.',
      hint: 'trend, indicates, growing demand',
      difficulty: 'medium',
    }),
    defaultSentence({
      vi: 'Ở cuối giai đoạn, cả hai nhóm đều ghi nhận mức tăng tương đương nhau.',
      en: 'At the end of the period, both groups recorded a similar increase.',
      hint: 'at the end, recorded, similar',
      difficulty: 'hard',
    }),
    defaultSentence({
      vi: 'Biểu đồ so sánh mức tiêu thụ điện giữa các khu vực đô thị và nông thôn.',
      en: 'The chart compares electricity consumption between urban and rural areas.',
      hint: 'compares, consumption, urban, rural',
      difficulty: 'easy',
    }),
  ],
}

const DAILY: SamplePack = {
  title: 'Collocation — Du lịch',
  category: 'collocation',
  genre: 'topic_travel',
  cefr: 'A2',
  sentences: [
    defaultSentence({
      vi: 'Bạn có rảnh tối nay không? Mình muốn mời bạn đi ăn.',
      en: 'Are you free tonight? I\'d like to invite you out for dinner.',
      hint: 'free tonight, invite, dinner',
      difficulty: 'easy',
    }),
    defaultSentence({
      vi: 'Xin lỗi, tôi đến muộn vì tắc đường quá nặng.',
      en: 'Sorry, I\'m late because the traffic was terrible.',
      hint: 'sorry, late, traffic',
      difficulty: 'easy',
    }),
    defaultSentence({
      vi: 'Bạn có thể giúp tôi chỉ đường đến ga tàu gần nhất không?',
      en: 'Could you help me find the way to the nearest train station?',
      hint: 'help, nearest, train station',
      difficulty: 'medium',
    }),
    defaultSentence({
      vi: 'Tôi đang tìm một quán cà phê yên tĩnh để làm việc.',
      en: 'I\'m looking for a quiet café to get some work done.',
      hint: 'looking for, quiet café, work',
      difficulty: 'medium',
    }),
    defaultSentence({
      vi: 'Hôm nay trời nóng quá, mình đi uống trà sữa nhé.',
      en: 'It\'s so hot today — let\'s go get some bubble tea.',
      hint: 'hot today, bubble tea',
      difficulty: 'easy',
    }),
    defaultSentence({
      vi: 'Tôi không hiểu câu hỏi này lắm, bạn giải thích lại được không?',
      en: 'I don\'t quite understand this question — could you explain it again?',
      hint: 'don\'t understand, explain again',
      difficulty: 'medium',
    }),
    defaultSentence({
      vi: 'Cuối tuần này mình dự định ở nhà và xem phim thôi.',
      en: 'This weekend I plan to stay home and just watch movies.',
      hint: 'weekend, stay home, watch movies',
      difficulty: 'easy',
    }),
    defaultSentence({
      vi: 'Bạn nhớ mang theo áo khoác vì buổi tối sẽ lạnh.',
      en: 'Remember to bring a jacket because it will get cold tonight.',
      hint: 'remember, jacket, cold tonight',
      difficulty: 'medium',
    }),
    defaultSentence({
      vi: 'Tôi rất vui vì được gặp lại bạn sau bao lâu.',
      en: 'I\'m really happy to see you again after so long.',
      hint: 'happy, see you again',
      difficulty: 'easy',
    }),
    defaultSentence({
      vi: 'Nếu bạn cần giúp đỡ, cứ nhắn tin cho tôi bất cứ lúc nào.',
      en: 'If you need any help, just message me anytime.',
      hint: 'need help, message, anytime',
      difficulty: 'easy',
    }),
  ],
}

export function getSampleTranslationSets(): SamplePack[] {
  return [IELTS_TASK2, IELTS_TASK1, DAILY]
}