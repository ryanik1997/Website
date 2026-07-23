/**
 * Dịch đoạn Band 8.0 — 10 chủ đề × 25 câu VI→EN (câu essay nâng cao).
 * id: tr-p80-{genre} / tr-p80-{genre}-sNN
 */
import type { TranslationGenre, TranslationSet } from '@ryan/db'

type Row = [vi: string, en: string, hint?: string, difficulty?: 'easy' | 'medium' | 'hard']

type TopicGenre =
  | 'topic_education'
  | 'topic_environment'
  | 'topic_technology'
  | 'topic_health'
  | 'topic_work'
  | 'topic_travel'
  | 'topic_food'
  | 'topic_hobbies'
  | 'topic_family'
  | 'topic_social_media'

const TITLES: Record<TopicGenre, string> = {
  topic_education: 'Band 8.0 — Education — 25 sentences',
  topic_environment: 'Band 8.0 — Environment — 25 sentences',
  topic_technology: 'Band 8.0 — Technology — 25 sentences',
  topic_health: 'Band 8.0 — Health — 25 sentences',
  topic_work: 'Band 8.0 — Work — 25 sentences',
  topic_travel: 'Band 8.0 — Travel — 25 sentences',
  topic_food: 'Band 8.0 — Food — 25 sentences',
  topic_hobbies: 'Band 8.0 — Hobbies — 25 sentences',
  topic_family: 'Band 8.0 — Family — 25 sentences',
  topic_social_media: 'Band 8.0 — Social Media — 25 sentences',
}

const DATA: Record<TopicGenre, Row[]> = {
  topic_education: [
    ['Giáo dục chất lượng cao là động lực then chốt cho sự phát triển kinh tế bền vững.', 'High-quality education is a key driver of sustainable economic development.', 'key driver of sustainable', 'hard'],
    ['Việc chỉ chú trọng điểm số có thể kìm hãm sự sáng tạo của học sinh.', 'An excessive focus on exam scores can stifle students’ creativity.', 'stifle students’ creativity', 'hard'],
    ['Học tập suốt đời không còn là lựa chọn mà đã trở thành yêu cầu của thị trường lao động.', 'Lifelong learning is no longer optional but a labour-market necessity.', 'labour-market necessity', 'hard'],
    ['Giáo dục đại học cần gắn chặt hơn với kỹ năng thực tiễn.', 'Higher education needs to be more closely aligned with practical skills.', 'closely aligned with', 'hard'],
    ['Bất bình đẳng trong tiếp cận giáo dục làm sâu sắc hơn khoảng cách xã hội.', 'Unequal access to education deepens social divides.', 'deepens social divides', 'hard'],
    ['Công nghệ số có thể cá nhân hóa lộ trình học của từng học sinh.', 'Digital technology can personalise each learner’s educational pathway.', 'personalise, educational pathway', 'hard'],
    ['Giáo viên vẫn là yếu tố không thể thay thế dù công cụ số ngày càng tinh vi.', 'Teachers remain irreplaceable even as digital tools become more sophisticated.', 'remain irreplaceable', 'hard'],
    ['Áp lực thi cử quá mức có thể gây hại cho sức khỏe tâm thần thanh thiếu niên.', 'Excessive examination pressure can damage adolescents’ mental health.', 'adolescents’ mental health', 'hard'],
    ['Học phí đại học tăng cao khiến nhiều sinh viên gánh nợ dài hạn.', 'Rising university tuition fees leave many students with long-term debt.', 'long-term debt', 'hard'],
    ['Tư duy phản biện nên được ưu tiên hơn việc ghi nhớ máy móc.', 'Critical thinking should be prioritised over mechanical memorisation.', 'prioritised over mechanical memorisation', 'hard'],
    ['Giáo dục sớm có ảnh hưởng lâu dài đến thành tựu sau này của trẻ.', 'Early childhood education has a lasting impact on children’s later achievement.', 'lasting impact on', 'hard'],
    ['Một số người lập luận rằng bằng cấp đang bị lạm phát giá trị.', 'Some argue that academic qualifications are suffering from grade inflation.', 'grade inflation', 'hard'],
    ['Hợp tác quốc tế trong nghiên cứu thúc đẩy đổi mới tri thức.', 'International research collaboration accelerates knowledge innovation.', 'accelerates knowledge innovation', 'hard'],
    ['Kỹ năng số cần được đưa vào chương trình phổ thông một cách hệ thống.', 'Digital literacy should be systematically embedded in the school curriculum.', 'systematically embedded', 'hard'],
    ['Học bổng dựa trên nhu cầu giúp giảm bất công trong giáo dục đại học.', 'Needs-based scholarships help reduce inequity in higher education.', 'Needs-based scholarships', 'hard'],
    ['Đánh giá năng lực toàn diện phản ánh khả năng thực tế tốt hơn một bài thi duy nhất.', 'Holistic assessment reflects real ability more accurately than a single exam.', 'Holistic assessment', 'hard'],
    ['Tự chủ đại học phải đi kèm trách nhiệm giải trình với xã hội.', 'University autonomy must be accompanied by social accountability.', 'social accountability', 'hard'],
    ['Khoảng cách thành thị–nông thôn về chất lượng trường lớp vẫn còn rõ rệt.', 'The urban–rural gap in school quality remains pronounced.', 'urban–rural gap', 'hard'],
    ['Giáo dục nghề nghiệp xứng đáng được coi trọng ngang bằng lộ trình học thuật.', 'Vocational education deserves equal status with academic pathways.', 'equal status with', 'hard'],
    ['Phụ huynh quá can thiệp có thể làm suy yếu khả năng tự lập của con.', 'Over-involved parenting can undermine children’s independence.', 'undermine children’s independence', 'hard'],
    ['Nghiên cứu học thuật cần được tài trợ ổn định để tránh chạy theo xu hướng ngắn hạn.', 'Academic research needs stable funding to avoid short-term trend chasing.', 'stable funding', 'hard'],
    ['Lớp học đa văn hóa đòi hỏi phương pháp sư phạm linh hoạt hơn.', 'Multicultural classrooms demand more flexible pedagogical approaches.', 'pedagogical approaches', 'hard'],
    ['Học trực tuyến mở rộng tiếp cận nhưng không thể thay thế hoàn toàn môi trường học đường.', 'Online learning widens access but cannot fully replace the campus environment.', 'cannot fully replace', 'hard'],
    ['Chính sách giáo dục hiệu quả dựa trên bằng chứng chứ không chỉ trên khẩu hiệu.', 'Effective education policy is evidence-based rather than slogan-driven.', 'evidence-based', 'hard'],
    ['Tóm lại, cải cách giáo dục phải đặt người học và công bằng xã hội làm trung tâm.', 'In conclusion, education reform must place learners and social equity at its core.', 'social equity at its core', 'hard'],
  ],

  topic_environment: [
    ['Biến đổi khí hậu không còn là rủi ro xa vời mà đã trở thành thực tế hiện hữu.', 'Climate change is no longer a distant risk but a present reality.', 'present reality', 'hard'],
    ['Phát thải carbon cần được cắt giảm quyết liệt trong thập kỷ tới.', 'Carbon emissions must be cut decisively over the coming decade.', 'cut decisively', 'hard'],
    ['Tăng trưởng xanh chứng minh rằng kinh tế và môi trường không nhất thiết đối lập.', 'Green growth shows that the economy and the environment need not be in opposition.', 'need not be in opposition', 'hard'],
    ['Mất đa dạng sinh học làm suy yếu khả năng phục hồi của hệ sinh thái.', 'Biodiversity loss weakens the resilience of ecosystems.', 'resilience of ecosystems', 'hard'],
    ['Rác thải nhựa đại dương là minh chứng cho thất bại trong quản lý tiêu dùng.', 'Ocean plastic pollution illustrates a failure of consumption management.', 'illustrates a failure', 'hard'],
    ['Chính sách định giá carbon có thể thúc đẩy doanh nghiệp chuyển đổi sạch hơn.', 'Carbon pricing can push firms towards cleaner transitions.', 'Carbon pricing', 'hard'],
    ['Năng lượng tái tạo ngày càng cạnh tranh về chi phí so với nhiên liệu hóa thạch.', 'Renewable energy is increasingly cost-competitive with fossil fuels.', 'cost-competitive', 'hard'],
    ['Hành vi tiêu dùng cá nhân quan trọng, nhưng thay đổi hệ thống còn quan trọng hơn.', 'Individual consumer behaviour matters, yet systemic change matters more.', 'systemic change', 'hard'],
    ['Đô thị hóa thiếu quy hoạch làm trầm trọng ô nhiễm và ngập úng.', 'Poorly planned urbanisation intensifies pollution and flooding.', 'intensifies pollution', 'hard'],
    ['Công lý khí hậu đòi hỏi các nước giàu gánh trách nhiệm lớn hơn.', 'Climate justice requires wealthier nations to shoulder greater responsibility.', 'shoulder greater responsibility', 'hard'],
    ['Nông nghiệp bền vững vừa bảo vệ đất vừa đảm bảo an ninh lương thực.', 'Sustainable agriculture both protects soil and safeguards food security.', 'safeguards food security', 'hard'],
    ['Phá rừng nhiệt đới có hệ quả toàn cầu chứ không chỉ cục bộ.', 'Tropical deforestation has global rather than merely local consequences.', 'global rather than merely local', 'hard'],
    ['Giao thông điện hóa là trụ cột của chiến lược giảm phát thải đô thị.', 'Transport electrification is a pillar of urban emissions strategies.', 'pillar of urban emissions', 'hard'],
    ['Thiếu ý chí chính trị thường cản trở các mục tiêu khí hậu đầy tham vọng.', 'A lack of political will often obstructs ambitious climate targets.', 'political will', 'hard'],
    ['Giáo dục môi trường nuôi dưỡng trách nhiệm liên thế hệ.', 'Environmental education cultivates intergenerational responsibility.', 'intergenerational responsibility', 'hard'],
    ['Kinh tế tuần hoàn giảm phụ thuộc vào khai thác tài nguyên nguyên sinh.', 'A circular economy reduces dependence on virgin resource extraction.', 'circular economy', 'hard'],
    ['Hạn hán và sóng nhiệt đang đe dọa sinh kế nông thôn.', 'Droughts and heatwaves are threatening rural livelihoods.', 'rural livelihoods', 'hard'],
    ['Đầu tư vào hạ tầng xanh mang lại lợi ích dài hạn vượt chi phí ban đầu.', 'Investment in green infrastructure yields long-term benefits that outweigh upfront costs.', 'outweigh upfront costs', 'hard'],
    ['Minh bạch dữ liệu phát thải là điều kiện để giám sát cam kết khí hậu.', 'Transparent emissions data is a precondition for monitoring climate commitments.', 'precondition for monitoring', 'hard'],
    ['Phục hồi hệ sinh thái ven biển giúp giảm rủi ro thiên tai.', 'Restoring coastal ecosystems helps mitigate disaster risk.', 'mitigate disaster risk', 'hard'],
    ['Tiêu dùng quá mức ở các nước giàu làm tăng dấu chân sinh thái toàn cầu.', 'Overconsumption in affluent countries inflates the global ecological footprint.', 'ecological footprint', 'hard'],
    ['Đổi mới công nghệ sạch cần đi kèm chính sách hỗ trợ công bằng.', 'Clean-technology innovation must be paired with equitable policy support.', 'equitable policy support', 'hard'],
    ['Hợp tác quốc tế vẫn là điều kiện tiên quyết để giải quyết vấn đề khí hậu.', 'International cooperation remains a prerequisite for addressing climate issues.', 'prerequisite for addressing', 'hard'],
    ['Trì hoãn hành động khí hậu sẽ làm tăng chi phí thích ứng trong tương lai.', 'Delaying climate action will raise future adaptation costs.', 'adaptation costs', 'hard'],
    ['Tóm lại, bảo vệ hành tinh đòi hỏi quyết tâm chính trị và thay đổi hành vi đồng thời.', 'In conclusion, protecting the planet demands both political resolve and behavioural change.', 'political resolve and behavioural change', 'hard'],
  ],

  topic_technology: [
    ['Công nghệ số đang tái định hình gần như mọi lĩnh vực của đời sống đương đại.', 'Digital technology is reshaping virtually every domain of contemporary life.', 'reshaping virtually every domain', 'hard'],
    ['Trí tuệ nhân tạo mang lại hiệu quả nhưng cũng đặt ra câu hỏi đạo đức sâu sắc.', 'Artificial intelligence delivers efficiency yet raises profound ethical questions.', 'profound ethical questions', 'hard'],
    ['Quyền riêng tư dữ liệu đã trở thành quyền cơ bản trong kỷ nguyên số.', 'Data privacy has become a fundamental right in the digital age.', 'fundamental right', 'hard'],
    ['Tự động hóa có thể gia tăng năng suất đồng thời làm lệch cấu trúc việc làm.', 'Automation can raise productivity while distorting employment structures.', 'distorting employment structures', 'hard'],
    ['Khoảng cách số làm trầm trọng bất bình đẳng cơ hội giữa các nhóm xã hội.', 'The digital divide deepens opportunity gaps between social groups.', 'digital divide', 'hard'],
    ['Đổi mới công nghệ cần được điều tiết để tránh lạm dụng quyền lực thị trường.', 'Technological innovation needs regulation to prevent abuse of market power.', 'abuse of market power', 'hard'],
    ['Làm việc từ xa nhờ nền tảng số đã trở thành chuẩn mực mới sau đại dịch.', 'Remote work via digital platforms has become a new post-pandemic norm.', 'post-pandemic norm', 'hard'],
    ['Thuật toán gợi ý có thể củng cố thành kiến hiện có thay vì trung lập.', 'Recommendation algorithms may reinforce existing biases rather than remain neutral.', 'reinforce existing biases', 'hard'],
    ['An ninh mạng là điều kiện tiên quyết cho niềm tin số của công chúng.', 'Cybersecurity is a prerequisite for public digital trust.', 'public digital trust', 'hard'],
    ['Công nghệ y tế số mở rộng tiếp cận nhưng đòi hỏi bảo vệ dữ liệu bệnh nhân.', 'Digital health technology expands access but requires robust patient-data protection.', 'patient-data protection', 'hard'],
    ['Mạng xã hội vừa kết nối toàn cầu vừa khuếch đại tin sai lệch.', 'Social platforms both connect the world and amplify misinformation.', 'amplify misinformation', 'hard'],
    ['Sáng tạo nội dung do AI đặt ra thách thức cho khái niệm bản quyền truyền thống.', 'AI-generated content challenges traditional notions of copyright.', 'traditional notions of copyright', 'hard'],
    ['Hạ tầng số công bằng là nền tảng cho tăng trưởng bao trùm.', 'Equitable digital infrastructure underpins inclusive growth.', 'underpins inclusive growth', 'hard'],
    ['Con người vẫn cần kỹ năng mềm mà máy móc khó thay thế hoàn toàn.', 'Humans still need soft skills that machines cannot fully replace.', 'cannot fully replace', 'medium'],
    ['Theo dõi kỹ thuật số nơi làm việc có thể xói mòn lòng tin nhân viên.', 'Workplace digital surveillance can erode employee trust.', 'erode employee trust', 'hard'],
    ['Thanh toán không tiền mặt tăng tốc nhưng loại trừ nhóm chưa tiếp cận ngân hàng.', 'Cashless payments accelerate commerce yet exclude the unbanked.', 'exclude the unbanked', 'hard'],
    ['Công nghệ sinh học mang hy vọng chữa bệnh nhưng đòi hỏi giám sát đạo đức chặt chẽ.', 'Biotechnology offers hope of cures but demands rigorous ethical oversight.', 'ethical oversight', 'hard'],
    ['Học máy chỉ tốt bằng dữ liệu mà nó được huấn luyện.', 'Machine learning is only as good as the data on which it is trained.', 'only as good as the data', 'hard'],
    ['Phụ thuộc quá mức vào công nghệ làm suy yếu khả năng tư duy độc lập.', 'Over-reliance on technology can weaken independent thinking.', 'Over-reliance on technology', 'hard'],
    ['Chính phủ cần khung pháp lý linh hoạt trước tốc độ đổi mới chóng mặt.', 'Governments need agile legal frameworks for breakneck innovation.', 'agile legal frameworks', 'hard'],
    ['Kết nối vạn vật nâng cao tiện nghi nhưng mở rộng bề mặt tấn công mạng.', 'The Internet of Things raises convenience while expanding cyber-attack surfaces.', 'expanding cyber-attack surfaces', 'hard'],
    ['Giáo dục kỹ thuật số phải đi đôi với giáo dục đạo đức số.', 'Digital education must go hand in hand with digital ethics education.', 'hand in hand with', 'hard'],
    ['Đổi mới mở có thể tăng tốc tiến bộ nếu được quản trị minh bạch.', 'Open innovation can accelerate progress if governed transparently.', 'governed transparently', 'hard'],
    ['Công nghệ nên phục vụ phẩm giá con người chứ không đảo ngược quan hệ ấy.', 'Technology should serve human dignity rather than reverse that relationship.', 'human dignity', 'hard'],
    ['Tóm lại, tiến bộ kỹ thuật chỉ có ý nghĩa khi gắn với trách nhiệm xã hội.', 'In conclusion, technical progress is meaningful only when paired with social responsibility.', 'paired with social responsibility', 'hard'],
  ],

  topic_health: [
    ['Sức khỏe cộng đồng là nền tảng của năng suất và ổn định xã hội.', 'Public health is the foundation of productivity and social stability.', 'foundation of productivity', 'hard'],
    ['Phòng bệnh chủ động rẻ và hiệu quả hơn chữa bệnh thụ động.', 'Proactive prevention is cheaper and more effective than reactive treatment.', 'Proactive prevention', 'hard'],
    ['Sức khỏe tâm thần xứng đáng được ưu tiên ngang sức khỏe thể chất.', 'Mental health deserves parity with physical health in policy priorities.', 'deserves parity with', 'hard'],
    ['Lối sống ít vận động đang đẩy mạnh gánh nặng bệnh không lây nhiễm.', 'Sedentary lifestyles are driving the burden of non-communicable diseases.', 'non-communicable diseases', 'hard'],
    ['Bất bình đẳng y tế phản ánh bất bình đẳng kinh tế sâu xa hơn.', 'Health inequality mirrors deeper economic inequality.', 'mirrors deeper economic inequality', 'hard'],
    ['Dinh dưỡng nghèo nàn thời thơ ấu để lại hậu quả lâu dài.', 'Poor childhood nutrition leaves lasting consequences.', 'lasting consequences', 'hard'],
    ['Hệ thống y tế công cần được tài trợ đủ để không phụ thuộc quá mức vào tư nhân.', 'Public health systems need adequate funding to avoid over-reliance on private care.', 'over-reliance on private care', 'hard'],
    ['Stress nghề nghiệp đang trở thành nguy cơ sức khỏe thầm lặng.', 'Occupational stress is becoming a silent health risk.', 'silent health risk', 'hard'],
    ['Vắc-xin vẫn là một trong những can thiệp y tế hiệu quả nhất lịch sử.', 'Vaccines remain among the most effective medical interventions in history.', 'most effective medical interventions', 'hard'],
    ['Quảng cáo thực phẩm không lành mạnh nhắm vào trẻ em cần được siết chặt.', 'Unhealthy-food marketing aimed at children should be tightened.', 'marketing aimed at children', 'hard'],
    ['Giấc ngủ đủ giờ là trụ cột bị đánh giá thấp của sức khỏe toàn diện.', 'Adequate sleep is an underrated pillar of holistic health.', 'underrated pillar', 'hard'],
    ['Y học từ xa mở rộng tiếp cận nhưng không thay thế hoàn toàn khám trực tiếp.', 'Telemedicine expands access but does not fully replace in-person care.', 'does not fully replace', 'hard'],
    ['Ô nhiễm không khí góp phần đáng kể vào bệnh hô hấp đô thị.', 'Air pollution contributes substantially to urban respiratory illness.', 'contributes substantially to', 'hard'],
    ['Lão hóa dân số đòi hỏi mô hình chăm sóc dài hạn bền vững.', 'Population ageing demands sustainable long-term care models.', 'long-term care models', 'hard'],
    ['Thói quen hút thuốc và lạm dụng rượu vẫn là gánh nặng y tế có thể phòng tránh.', 'Smoking and alcohol abuse remain preventable healthcare burdens.', 'preventable healthcare burdens', 'hard'],
    ['Sức khỏe số giúp theo dõi cá nhân hóa nhưng dễ tạo lo âu dữ liệu.', 'Digital health enables personalised tracking yet can generate data anxiety.', 'data anxiety', 'hard'],
    ['An ninh lương thực gắn chặt với kết quả dinh dưỡng quốc gia.', 'Food security is tightly linked to national nutrition outcomes.', 'tightly linked to', 'hard'],
    ['Đầu tư vào y tế cơ sở mang lại lợi ích lan tỏa cho toàn hệ thống.', 'Investment in primary care yields spillover benefits across the system.', 'spillover benefits', 'hard'],
    ['Đại dịch đã phơi bày điểm yếu trong chuỗi cung ứng y tế toàn cầu.', 'The pandemic exposed weaknesses in global medical supply chains.', 'exposed weaknesses', 'hard'],
    ['Vận động vừa phải đều đặn hiệu quả hơn các chế độ tập cực đoan ngắn hạn.', 'Moderate regular exercise is more effective than short-term extreme regimes.', 'Moderate regular exercise', 'medium'],
    ['Sức khỏe cộng đồng đòi hỏi phối hợp liên ngành chứ không chỉ bệnh viện.', 'Public health requires cross-sector coordination, not hospitals alone.', 'cross-sector coordination', 'hard'],
    ['Thiếu ngủ mạn tính làm suy giảm nhận thức và miễn dịch.', 'Chronic sleep deprivation impairs cognition and immunity.', 'impairs cognition and immunity', 'hard'],
    ['Chính sách thuế đồ uống có đường có thể định hướng hành vi tiêu dùng.', 'Sugary-drink taxes can reshape consumer behaviour.', 'reshape consumer behaviour', 'hard'],
    ['Chăm sóc sức khỏe toàn dân là mục tiêu đạo đức lẫn kinh tế.', 'Universal healthcare is both an ethical and an economic objective.', 'ethical and an economic', 'hard'],
    ['Tóm lại, sức khỏe tốt là vốn con người quan trọng nhất của một quốc gia.', 'In conclusion, good health is a nation’s most important human capital.', 'human capital', 'hard'],
  ],

  topic_work: [
    ['Thị trường lao động hiện đại đòi hỏi khả năng thích ứng liên tục.', 'The modern labour market demands continuous adaptability.', 'continuous adaptability', 'hard'],
    ['Cân bằng công việc–đời sống không còn là đặc quyền mà là yêu cầu bền vững.', 'Work–life balance is no longer a privilege but a sustainability requirement.', 'sustainability requirement', 'hard'],
    ['Làm việc từ xa tái định nghĩa ranh giới giữa nhà và văn phòng.', 'Remote work redefines the boundary between home and office.', 'redefines the boundary', 'hard'],
    ['Kỹ năng mềm ngày càng quyết định khả năng thăng tiến nghề nghiệp.', 'Soft skills increasingly determine career advancement.', 'determine career advancement', 'hard'],
    ['Bất ổn việc làm khiến nhiều lao động trẻ trì hoãn các quyết định dài hạn.', 'Job insecurity leads many young workers to postpone long-term decisions.', 'Job insecurity', 'hard'],
    ['Tự động hóa buộc người lao động phải học lại kỹ năng liên tục.', 'Automation forces workers into continuous reskilling.', 'continuous reskilling', 'hard'],
    ['Văn hóa tổ chức độc hại làm xói mòn năng suất lâu dài.', 'A toxic organisational culture erodes long-term productivity.', 'erodes long-term productivity', 'hard'],
    ['Lương xứng đáng vẫn là nền tảng của động lực lao động công bằng.', 'Fair pay remains the foundation of equitable work motivation.', 'equitable work motivation', 'hard'],
    ['Kinh tế gig mang lại linh hoạt nhưng thường thiếu bảo trợ xã hội.', 'The gig economy offers flexibility yet often lacks social protection.', 'lacks social protection', 'hard'],
    ['Đa dạng và hòa nhập tại nơi làm việc nâng cao chất lượng quyết định.', 'Workplace diversity and inclusion improve decision quality.', 'decision quality', 'hard'],
    ['Làm việc quá sức được tôn vinh có thể che giấu sự kém hiệu quả hệ thống.', 'Glorifying overwork can mask systemic inefficiency.', 'mask systemic inefficiency', 'hard'],
    ['Đào tạo nội bộ là khoản đầu tư chiến lược chứ không chỉ chi phí.', 'Internal training is a strategic investment rather than a mere cost.', 'strategic investment', 'hard'],
    ['Lãnh đạo bằng sự đồng cảm tạo ra lòng trung thành bền vững hơn mệnh lệnh.', 'Empathetic leadership builds more durable loyalty than command-and-control.', 'Empathetic leadership', 'hard'],
    ['Khoảng cách kỹ năng cản trở tăng trưởng ngay cả khi có việc làm trống.', 'Skills gaps hinder growth even when vacancies exist.', 'Skills gaps hinder growth', 'hard'],
    ['Hợp đồng ngắn hạn chuyển rủi ro từ doanh nghiệp sang người lao động.', 'Short-term contracts shift risk from firms onto workers.', 'shift risk from firms', 'hard'],
    ['Năng suất thực chất khác với việc chỉ hiện diện lâu tại bàn làm việc.', 'Genuine productivity differs from mere presenteeism.', 'mere presenteeism', 'hard'],
    ['Đàm phán lương minh bạch góp phần giảm bất bình đẳng giới tại nơi làm việc.', 'Transparent pay negotiation helps reduce workplace gender inequality.', 'Transparent pay negotiation', 'hard'],
    ['Khởi nghiệp đổi mới cần hệ sinh thái hỗ trợ chứ không chỉ tinh thần cá nhân.', 'Innovative start-ups need a supportive ecosystem, not just individual grit.', 'supportive ecosystem', 'hard'],
    ['Burnout nghề nghiệp đang trở thành chi phí ẩn của nền kinh tế tri thức.', 'Occupational burnout is becoming a hidden cost of the knowledge economy.', 'hidden cost', 'hard'],
    ['Chính sách việc làm xanh có thể kết hợp mục tiêu khí hậu và việc làm tốt.', 'Green employment policy can combine climate goals with decent work.', 'decent work', 'hard'],
    ['Phản hồi mang tính xây dựng thúc đẩy cải thiện liên tục.', 'Constructive feedback drives continuous improvement.', 'continuous improvement', 'medium'],
    ['Di chuyển nghề nghiệp xuyên biên giới làm phức tạp quản trị nhân tài toàn cầu.', 'Cross-border career mobility complicates global talent governance.', 'talent governance', 'hard'],
    ['Đạo đức nghề nghiệp không thể bị hy sinh vì chỉ tiêu ngắn hạn.', 'Professional ethics must not be sacrificed for short-term targets.', 'must not be sacrificed', 'hard'],
    ['Tự chủ trong công việc thường làm tăng gắn kết và sáng tạo.', 'Job autonomy often raises engagement and creativity.', 'Job autonomy', 'hard'],
    ['Tóm lại, tương lai việc làm phụ thuộc vào học tập liên tục và thiết kế chính sách nhân văn.', 'In conclusion, the future of work depends on continuous learning and humane policy design.', 'humane policy design', 'hard'],
  ],

  topic_travel: [
    ['Du lịch quốc tế mở rộng hiểu biết liên văn hóa nhưng cũng tạo áp lực sinh thái.', 'International travel broadens intercultural understanding yet creates ecological pressure.', 'intercultural understanding', 'hard'],
    ['Du lịch quá tải đang bào mòn trải nghiệm tại nhiều điểm đến nổi tiếng.', 'Overtourism is eroding the visitor experience at many famous destinations.', 'Overtourism is eroding', 'hard'],
    ['Du lịch bền vững đòi hỏi giới hạn sức chứa của hệ sinh thái địa phương.', 'Sustainable tourism requires respecting local ecosystems’ carrying capacity.', 'carrying capacity', 'hard'],
    ['Hàng không giá rẻ dân chủ hóa di chuyển nhưng làm tăng phát thải.', 'Budget aviation democratises mobility while increasing emissions.', 'democratises mobility', 'hard'],
    ['Trải nghiệm chân thực ngày càng được ưa chuộng hơn tour đại trà.', 'Authentic experiences are increasingly preferred to mass package tours.', 'mass package tours', 'hard'],
    ['Du lịch y tế phản ánh chênh lệch chất lượng và chi phí y tế toàn cầu.', 'Medical tourism reflects global gaps in healthcare quality and cost.', 'global gaps in healthcare', 'hard'],
    ['Công nghệ đặt phòng đã chuyển quyền lực sang người tiêu dùng.', 'Booking technology has shifted power towards consumers.', 'shifted power towards', 'hard'],
    ['Bảo tồn di sản và phát triển du lịch cần được cân bằng cẩn trọng.', 'Heritage conservation and tourism development need careful balancing.', 'careful balancing', 'hard'],
    ['Du lịch nội địa có thể ổn định ngành khi bất ổn địa chính trị gia tăng.', 'Domestic tourism can stabilise the sector amid rising geopolitical uncertainty.', 'geopolitical uncertainty', 'hard'],
    ['An ninh biên giới siết chặt làm thay đổi hành vi chọn điểm đến.', 'Tighter border security is reshaping destination choices.', 'reshaping destination choices', 'hard'],
    ['Homestay và kinh tế chia sẻ làm mờ ranh giới giữa cư dân và khách du lịch.', 'Homestays and the sharing economy blur lines between residents and visitors.', 'blur lines between', 'hard'],
    ['Marketing điểm đến có trách nhiệm tránh phóng đại hình ảnh không bền vững.', 'Responsible destination marketing avoids unsustainable image inflation.', 'image inflation', 'hard'],
    ['Biến đổi khí hậu đang làm dịch chuyển mùa vụ du lịch truyền thống.', 'Climate change is shifting traditional tourism seasons.', 'shifting traditional tourism seasons', 'hard'],
    ['Du lịch chậm khuyến khích trải nghiệm sâu hơn thay vì check-in vội vàng.', 'Slow travel encourages deeper experiences rather than rushed check-ins.', 'Slow travel', 'hard'],
    ['Rò rỉ doanh thu du lịch làm giảm lợi ích thực cho cộng đồng địa phương.', 'Tourism revenue leakage reduces real benefits for local communities.', 'revenue leakage', 'hard'],
    ['Hạ tầng quá tải làm suy giảm chất lượng sống của cư dân bản địa.', 'Overloaded infrastructure degrades residents’ quality of life.', 'degrades residents’ quality of life', 'hard'],
    ['Thị thực thuận lợi thúc đẩy luồng khách nhưng đòi hỏi quản trị dòng người.', 'Facilitated visas boost visitor flows but require crowd management.', 'crowd management', 'hard'],
    ['Du lịch giáo dục gắn học tập với trải nghiệm thực địa.', 'Educational travel links learning with field experience.', 'field experience', 'medium'],
    ['Phục hồi sau đại dịch buộc ngành du lịch phải đa dạng hóa rủi ro.', 'Post-pandemic recovery forced tourism to diversify risk.', 'diversify risk', 'hard'],
    ['Trải nghiệm ẩm thực địa phương trở thành động lực du lịch chính.', 'Local culinary experiences have become a primary travel motive.', 'primary travel motive', 'medium'],
    ['Du lịch không gian sắp đặt ra câu hỏi về bất bình đẳng tiếp cận.', 'Space tourism raises questions about unequal access.', 'unequal access', 'hard'],
    ['Đo lường tác động carbon của chuyến đi giúp người dùng chọn có trách nhiệm hơn.', 'Measuring trip carbon impact helps travellers choose more responsibly.', 'carbon impact', 'hard'],
    ['Hướng dẫn viên địa phương là cầu nối văn hóa quan trọng.', 'Local guides are vital cultural intermediaries.', 'cultural intermediaries', 'hard'],
    ['Quy hoạch du lịch dài hạn quan trọng hơn các chiến dịch quảng bá ngắn hạn.', 'Long-term tourism planning matters more than short-term promotion campaigns.', 'Long-term tourism planning', 'hard'],
    ['Tóm lại, du lịch có trách nhiệm cân bằng trải nghiệm, lợi ích địa phương và giới hạn sinh thái.', 'In conclusion, responsible travel balances experience, local benefit and ecological limits.', 'ecological limits', 'hard'],
  ],

  topic_food: [
    ['Hệ thống lương thực toàn cầu vừa nuôi sống vừa làm suy kiệt hành tinh.', 'The global food system both feeds and depletes the planet.', 'feeds and depletes', 'hard'],
    ['An ninh lương thực gắn liền với ổn định chính trị và công bằng xã hội.', 'Food security is intertwined with political stability and social equity.', 'intertwined with', 'hard'],
    ['Lãng phí thực phẩm là nghịch lý đạo đức khi nạn đói vẫn tồn tại.', 'Food waste is an ethical paradox while hunger persists.', 'ethical paradox', 'hard'],
    ['Chế độ ăn dựa thực vật giảm dấu chân môi trường của tiêu dùng.', 'Plant-based diets reduce the environmental footprint of consumption.', 'environmental footprint', 'hard'],
    ['Công nghiệp thực phẩm siêu chế biến đang định hình thói quen không lành mạnh.', 'Ultra-processed food industries are shaping unhealthy habits.', 'Ultra-processed food', 'hard'],
    ['Nông nghiệp tái sinh nhằm phục hồi đất thay vì chỉ tối đa hóa sản lượng ngắn hạn.', 'Regenerative agriculture aims to restore soil rather than merely maximise short-term yield.', 'Regenerative agriculture', 'hard'],
    ['Chuỗi cung ứng thực phẩm toàn cầu dễ tổn thương trước cú sốc khí hậu.', 'Global food supply chains are vulnerable to climate shocks.', 'vulnerable to climate shocks', 'hard'],
    ['Nhãn dinh dưỡng minh bạch giúp người tiêu dùng lựa chọn có thông tin hơn.', 'Transparent nutrition labels help consumers make better-informed choices.', 'better-informed choices', 'hard'],
    ['Ẩm thực địa phương là vốn văn hóa cũng như nguồn sinh kế.', 'Local cuisine is cultural capital as well as a livelihood source.', 'cultural capital', 'hard'],
    ['An toàn thực phẩm đòi hỏi giám sát từ trang trại đến bàn ăn.', 'Food safety requires oversight from farm to table.', 'from farm to table', 'medium'],
    ['Thuế đồ uống có đường là công cụ chính sách đã được chứng minh ở nhiều nước.', 'Sugary-drink taxes are a policy tool already proven in many countries.', 'policy tool already proven', 'hard'],
    ['Nông dân quy mô nhỏ cần hỗ trợ để cạnh tranh với nông nghiệp công nghiệp.', 'Smallholder farmers need support to compete with industrial agriculture.', 'Smallholder farmers', 'hard'],
    ['Thói quen ăn uống bị chi phối mạnh bởi quảng cáo và môi trường thực phẩm.', 'Eating habits are heavily shaped by advertising and the food environment.', 'food environment', 'hard'],
    ['Đói ẩn và thừa cân có thể cùng tồn tại trong một quốc gia.', 'Hidden hunger and obesity can coexist within the same country.', 'Hidden hunger and obesity', 'hard'],
    ['Công nghệ nông nghiệp chính xác nâng cao hiệu suất dùng nước và phân bón.', 'Precision agriculture improves the efficiency of water and fertiliser use.', 'Precision agriculture', 'hard'],
    ['Văn hóa ăn nhanh làm xói mòn nghi thức bữa ăn gia đình.', 'Fast-food culture erodes family meal rituals.', 'erodes family meal rituals', 'hard'],
    ['Chứng nhận hữu cơ xây dựng niềm tin nhưng không phải lúc nào cũng đảm bảo bền vững toàn diện.', 'Organic certification builds trust but does not always guarantee full sustainability.', 'does not always guarantee', 'hard'],
    ['Đa dạng hóa nguồn protein là chiến lược thích ứng khí hậu quan trọng.', 'Diversifying protein sources is a key climate-adaptation strategy.', 'climate-adaptation strategy', 'hard'],
    ['Giá lương thực biến động làm tổn thương hộ nghèo đô thị trước tiên.', 'Food-price volatility hits urban poor households first.', 'Food-price volatility', 'hard'],
    ['Nấu ăn tại nhà tăng quyền kiểm soát dinh dưỡng và chi phí.', 'Home cooking increases control over nutrition and cost.', 'control over nutrition', 'medium'],
    ['Thương mại thực phẩm quốc tế cần tiêu chuẩn lao động và môi trường công bằng hơn.', 'International food trade needs fairer labour and environmental standards.', 'fairer labour and environmental standards', 'hard'],
    ['Dinh dưỡng học đường định hình thói quen ăn suốt đời.', 'School nutrition shapes lifelong eating habits.', 'lifelong eating habits', 'hard'],
    ['Đổi mới thực phẩm lab-grown đặt ra câu hỏi về chấp nhận văn hóa.', 'Lab-grown food innovation raises questions of cultural acceptance.', 'cultural acceptance', 'hard'],
    ['Tiêu dùng theo mùa vừa tươi ngon vừa giảm chi phí logistics.', 'Seasonal consumption is fresher and reduces logistics costs.', 'reduces logistics costs', 'medium'],
    ['Tóm lại, hệ thống thực phẩm công bằng và bền vững là ưu tiên chiến lược toàn cầu.', 'In conclusion, a fair and sustainable food system is a global strategic priority.', 'global strategic priority', 'hard'],
  ],

  topic_hobbies: [
    ['Sở thích chất lượng cao nuôi dưỡng sức khỏe tinh thần trong xã hội áp lực cao.', 'High-quality hobbies nourish mental well-being in high-pressure societies.', 'nourish mental well-being', 'hard'],
    ['Thời gian rảnh có cấu trúc giúp chống lại kiệt sức nghề nghiệp.', 'Structured leisure time helps counter occupational burnout.', 'counter occupational burnout', 'hard'],
    ['Sở thích sáng tạo phát triển tư duy linh hoạt vượt ngoài công việc chính.', 'Creative hobbies cultivate flexible thinking beyond one’s main job.', 'flexible thinking', 'hard'],
    ['Giải trí số tiện lợi nhưng dễ biến thời gian rảnh thành tiêu thụ thụ động.', 'Digital entertainment is convenient yet easily turns leisure into passive consumption.', 'passive consumption', 'hard'],
    ['Hoạt động ngoài trời kết nối con người với nhịp điệu tự nhiên.', 'Outdoor activities reconnect people with natural rhythms.', 'natural rhythms', 'hard'],
    ['Sở thích tập thể xây dựng vốn xã hội yếu nhưng quan trọng.', 'Group hobbies build weak yet valuable social capital.', 'social capital', 'hard'],
    ['Ranh giới giữa sở thích và công việc phụ mờ trong nền kinh tế sáng tạo.', 'The line between hobby and side hustle blurs in the creator economy.', 'creator economy', 'hard'],
    ['Học nhạc cụ rèn luyện kỷ luật và khả năng trì hoãn khoái cảm.', 'Learning an instrument trains discipline and delayed gratification.', 'delayed gratification', 'hard'],
    ['Đọc sâu đang bị đe dọa bởi thói quen lướt nội dung ngắn.', 'Deep reading is threatened by short-form scrolling habits.', 'Deep reading is threatened', 'hard'],
    ['Thể thao nghiệp dư thúc đẩy sức khỏe cộng đồng với chi phí thấp.', 'Amateur sport promotes public health at relatively low cost.', 'relatively low cost', 'medium'],
    ['Sưu tầm có thể trở thành đầu tư văn hóa chứ không chỉ tiêu khiển.', 'Collecting can become a cultural investment rather than mere pastime.', 'cultural investment', 'hard'],
    ['Sở thích đắt đỏ làm gia tăng bất bình đẳng trong trải nghiệm giải trí.', 'Expensive hobbies widen inequality in leisure experience.', 'widen inequality', 'hard'],
    ['Làm vườn đô thị vừa là thú vui vừa là hành động sinh thái nhỏ.', 'Urban gardening is both a pastime and a small ecological act.', 'ecological act', 'hard'],
    ['Tình nguyện như sở thích tạo ý nghĩa vượt ngoài lợi ích cá nhân.', 'Volunteering as a hobby creates meaning beyond private benefit.', 'beyond private benefit', 'hard'],
    ['Chơi game cạnh tranh rèn chiến lược nhưng dễ gây nghiện nếu thiếu kiểm soát.', 'Competitive gaming trains strategy yet can become addictive without limits.', 'without limits', 'hard'],
    ['Nghệ thuật nghiệp dư dân chủ hóa sáng tạo ngoài vòng chuyên nghiệp.', 'Amateur arts democratise creativity beyond professional circles.', 'democratise creativity', 'hard'],
    ['Thời gian rảnh có chất lượng quan trọng hơn số giờ rảnh thuần túy.', 'Leisure quality matters more than raw free hours.', 'Leisure quality', 'hard'],
    ['Sở thích gia đình củng cố gắn kết liên thế hệ.', 'Shared family hobbies strengthen intergenerational bonds.', 'intergenerational bonds', 'hard'],
    ['Du lịch như sở thích cần cân nhắc dấu chân carbon cá nhân.', 'Travel as a hobby should account for personal carbon footprints.', 'carbon footprints', 'hard'],
    ['Thiền và các thực hành chánh niệm đang trở thành sở thích sức khỏe tinh thần.', 'Meditation and mindfulness practices are becoming mental-health hobbies.', 'mindfulness practices', 'hard'],
    ['Câu lạc bộ cộng đồng chống lại sự cô lập đô thị.', 'Community clubs counter urban isolation.', 'counter urban isolation', 'hard'],
    ['Sáng tạo thủ công chống lại văn hóa tiêu dùng dùng một lần.', 'Handmade crafts resist single-use consumer culture.', 'resist single-use consumer culture', 'hard'],
    ['Cân bằng giữa sở thích và nghĩa vụ tránh biến giải trí thành áp lực mới.', 'Balancing hobbies and duties prevents leisure from becoming new pressure.', 'becoming new pressure', 'hard'],
    ['Sở thích lành mạnh là khoản đầu tư vào vốn con người dài hạn.', 'Healthy hobbies are an investment in long-term human capital.', 'long-term human capital', 'hard'],
    ['Tóm lại, thời gian rảnh có ý nghĩa làm giàu đời sống chứ không chỉ lấp đầy lịch trình.', 'In conclusion, meaningful leisure enriches life rather than merely filling schedules.', 'merely filling schedules', 'hard'],
  ],

  topic_family: [
    ['Gia đình vẫn là đơn vị xã hội cơ bản bất chấp biến đổi hiện đại.', 'The family remains a basic social unit despite modern transformations.', 'basic social unit', 'hard'],
    ['Cấu trúc hộ gia đình đang đa dạng hóa vượt mô hình hạt nhân truyền thống.', 'Household structures are diversifying beyond the traditional nuclear model.', 'diversifying beyond', 'hard'],
    ['Cân bằng vai trò giới trong gia đình là điều kiện của công bằng xã hội rộng hơn.', 'Gender-balanced family roles are a condition of broader social equity.', 'Gender-balanced family roles', 'hard'],
    ['Áp lực kinh tế làm căng thẳng quan hệ vợ chồng và cha mẹ–con cái.', 'Economic pressure strains marital and parent–child relationships.', 'strains marital', 'hard'],
    ['Chăm sóc người già đang trở thành thách thức nhân khẩu học lớn.', 'Elderly care is becoming a major demographic challenge.', 'demographic challenge', 'hard'],
    ['Công nghệ vừa kết nối gia đình xa cách vừa làm phân tán bữa ăn chung.', 'Technology both connects distant families and fragments shared meals.', 'fragments shared meals', 'hard'],
    ['Nuôi dạy dựa trên gắn kết an toàn thúc đẩy phát triển cảm xúc lành mạnh.', 'Attachment-based parenting fosters healthy emotional development.', 'Attachment-based parenting', 'hard'],
    ['Can thiệp quá mức của cha mẹ làm suy yếu năng lực tự quyết của thanh niên.', 'Overparenting undermines young adults’ decision-making capacity.', 'Overparenting undermines', 'hard'],
    ['Ly hôn không còn bị kỳ thị như trước nhưng vẫn để lại hệ quả phức tạp.', 'Divorce is less stigmatised than before yet still leaves complex consequences.', 'less stigmatised', 'hard'],
    ['Gia đình đa thế hệ có thể là mạng lưới an sinh không chính thức quan trọng.', 'Multi-generational families can be a vital informal safety net.', 'informal safety net', 'hard'],
    ['Di cư lao động buộc nhiều gia đình sống trong trạng thái xa cách kéo dài.', 'Labour migration forces many families into prolonged separation.', 'prolonged separation', 'hard'],
    ['Bạo lực gia đình là vấn đề công cộng chứ không chỉ chuyện riêng tư.', 'Domestic violence is a public issue, not merely a private matter.', 'not merely a private matter', 'hard'],
    ['Thời gian chất lượng quan trọng hơn thời gian hiện diện thụ động.', 'Quality time matters more than passive physical presence.', 'Quality time matters more', 'medium'],
    ['Giá trị gia đình biến thiên theo văn hóa nhưng nhu cầu gắn kết là phổ quát.', 'Family values vary by culture, yet the need for belonging is universal.', 'need for belonging', 'hard'],
    ['Chính sách nghỉ thai sản và chăm con định hình công bằng giới tại nơi làm việc.', 'Parental-leave policy shapes gender equity at work.', 'Parental-leave policy', 'hard'],
    ['Trẻ em trong hộ nghèo đối mặt khoảng cách cơ hội từ rất sớm.', 'Children in poor households face opportunity gaps from a very early age.', 'opportunity gaps', 'hard'],
    ['Nhận nuôi và các hình thức gia đình phi truyền thống xứng đáng được công nhận pháp lý đầy đủ.', 'Adoption and non-traditional families deserve full legal recognition.', 'full legal recognition', 'hard'],
    ['Xung đột thế hệ thường phản ánh tốc độ thay đổi xã hội chứ không chỉ cá tính.', 'Generational conflict often reflects the pace of social change rather than mere personality.', 'pace of social change', 'hard'],
    ['Chia sẻ việc nhà công bằng là chỉ báo của quan hệ đối tác lành mạnh.', 'Fair housework sharing is an indicator of a healthy partnership.', 'indicator of a healthy partnership', 'hard'],
    ['Gia đình là nơi đầu tiên hình thành vốn ngôn ngữ và thói quen học tập.', 'The family is where language capital and learning habits first form.', 'language capital', 'hard'],
    ['Áp lực thành tích học đường lan từ nhà trường vào bàn ăn gia đình.', 'Academic achievement pressure spreads from schools into family dinner tables.', 'spreads from schools into', 'hard'],
    ['Mạng lưới họ hàng yếu đi ở đô thị lớn làm tăng cô lập.', 'Weaker kinship networks in large cities heighten isolation.', 'heighten isolation', 'hard'],
    ['Chính sách nhà ở ảnh hưởng trực tiếp đến khả năng lập gia đình của người trẻ.', 'Housing policy directly affects young people’s ability to form families.', 'ability to form families', 'hard'],
    ['Hỗ trợ tâm lý gia đình giúp ngăn khủng hoảng leo thang thành tan vỡ.', 'Family counselling helps prevent crises from escalating into breakdown.', 'escalating into breakdown', 'hard'],
    ['Tóm lại, gia đình khỏe mạnh là hạ tầng xã hội thầm lặng nhưng then chốt.', 'In conclusion, healthy families are quiet yet pivotal social infrastructure.', 'pivotal social infrastructure', 'hard'],
  ],

  topic_social_media: [
    ['Mạng xã hội đã tái cấu trúc không gian công cộng kỹ thuật số.', 'Social media has restructured the digital public sphere.', 'digital public sphere', 'hard'],
    ['Mô hình chú ý của nền tảng ưu tiên tương tác hơn sự thật.', 'Platform attention models prioritise engagement over truth.', 'prioritise engagement over truth', 'hard'],
    ['Phòng vang thuật toán làm hẹp đa dạng quan điểm.', 'Algorithmic echo chambers narrow viewpoint diversity.', 'echo chambers', 'hard'],
    ['So sánh xã hội trên feed làm xói mòn lòng tự trọng, đặc biệt ở thanh thiếu niên.', 'Social comparison on feeds erodes self-esteem, especially among adolescents.', 'erodes self-esteem', 'hard'],
    ['Thông tin sai lệch lan nhanh hơn sự chỉnh sửa về sau.', 'Misinformation spreads faster than subsequent corrections.', 'spreads faster than', 'hard'],
    ['Nền kinh tế người sáng tạo vừa mở cơ hội vừa tạo bất ổn thu nhập.', 'The creator economy both opens opportunities and produces income insecurity.', 'income insecurity', 'hard'],
    ['Quyền riêng tư đã trở thành hàng hóa bị trao đổi trong quảng cáo nhắm mục tiêu.', 'Privacy has become a commodity traded in targeted advertising.', 'commodity traded', 'hard'],
    ['Bắt nạt mạng khuếch đại tổn thương vì tính lan tỏa và lưu trữ vĩnh viễn.', 'Cyberbullying amplifies harm through virality and permanence.', 'virality and permanence', 'hard'],
    ['Hoạt động công dân số có thể thúc đẩy trách nhiệm giải trình chính trị.', 'Digital civic activism can enhance political accountability.', 'political accountability', 'hard'],
    ['Nghiện cuộn nội dung ngắn làm phân mảnh khả năng chú ý sâu.', 'Addiction to short-form scrolling fragments deep attention.', 'fragments deep attention', 'hard'],
    ['Kiểm duyệt nội dung đặt ra căng thẳng giữa an toàn và tự do ngôn luận.', 'Content moderation creates tension between safety and free speech.', 'tension between safety', 'hard'],
    ['Thương hiệu cá nhân trực tuyến đang định hình triển vọng nghề nghiệp.', 'Online personal branding is reshaping career prospects.', 'reshaping career prospects', 'hard'],
    ['Dữ liệu hành vi người dùng là tài sản chiến lược của các nền tảng lớn.', 'User behavioural data is a strategic asset for major platforms.', 'strategic asset', 'hard'],
    ['Tin tức qua mạng xã hội làm mờ ranh giới giữa báo chí và ý kiến.', 'News via social media blurs the line between journalism and opinion.', 'blurs the line between', 'hard'],
    ['Thiết kế gây nghiện là lựa chọn sản phẩm chứ không phải hệ quả tất yếu.', 'Addictive design is a product choice rather than an inevitable outcome.', 'product choice rather than', 'hard'],
    ['Giáo dục năng lực số giúp người dùng kháng cự thao túng tốt hơn.', 'Digital literacy education helps users resist manipulation more effectively.', 'resist manipulation', 'hard'],
    ['Phong trào tẩy chay mạng xã hội phản ánh mệt mỏi kỹ thuật số ngày càng tăng.', 'Social-media detox movements reflect rising digital fatigue.', 'digital fatigue', 'hard'],
    ['Tính năng lan truyền có thể vũ khí hóa lời nói thành bạo lực cộng đồng.', 'Virality features can weaponise speech into communal harm.', 'weaponise speech', 'hard'],
    ['Trẻ em cần không gian số an toàn được thiết kế theo mặc định.', 'Children need online spaces that are safe by design.', 'safe by design', 'hard'],
    ['Minh bạch thuật toán là bước tiến tới trách nhiệm giải trình của nền tảng.', 'Algorithmic transparency is a step towards platform accountability.', 'platform accountability', 'hard'],
    ['Tương tác hời hợt không thay thế được quan hệ ngoài đời thực.', 'Shallow online interaction does not replace offline relationships.', 'does not replace offline', 'medium'],
    ['Quy định nhà nước phải theo kịp mô hình kinh doanh dựa trên dữ liệu.', 'State regulation must keep pace with data-driven business models.', 'data-driven business models', 'hard'],
    ['Mạng xã hội trong khủng hoảng vừa cảnh báo sớm vừa khuếch đại hoảng loạn.', 'Social media in crises both early-warns and amplifies panic.', 'amplifies panic', 'hard'],
    ['Sức khỏe tinh thần số cần được coi là vấn đề y tế công cộng.', 'Digital mental health should be treated as a public-health issue.', 'public-health issue', 'hard'],
    ['Tóm lại, mạng xã hội là hạ tầng quyền lực cần được quản trị dân chủ.', 'In conclusion, social media is a power infrastructure that needs democratic governance.', 'democratic governance', 'hard'],
  ],
}

function defaultSrs(now: number) {
  return { ease: 2.5, interval: 0, dueAt: now, reps: 0 }
}

export function buildParagraph80_25Sets(createdAt = Date.now()): TranslationSet[] {
  const sets: TranslationSet[] = []

  for (const genre of Object.keys(DATA) as TopicGenre[]) {
    const rows = DATA[genre]
    if (rows.length !== 25) {
      throw new Error(`paragraph80_25: ${genre} has ${rows.length} sentences, expected 25`)
    }
    const setId = `tr-p80-${genre}`
    sets.push({
      id: setId,
      title: TITLES[genre],
      category: 'paragraph_80',
      genre: genre as TranslationGenre,
      cefr: 'B2',
      createdAt,
      sentences: rows.map((row, i) => {
        const [vi, en, hint, difficulty] = row
        const n = String(i + 1).padStart(2, '0')
        return {
          id: `${setId}-s${n}`,
          vi,
          en,
          hint,
          difficulty: difficulty ?? 'hard',
          srsState: defaultSrs(createdAt),
        }
      }),
    })
  }

  return sets
}

export const PARAGRAPH_80_GENRE_IDS = Object.keys(DATA) as TranslationGenre[]
