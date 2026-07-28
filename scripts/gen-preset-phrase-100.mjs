/**
 * Generate 100 multi-word phrases per preset deck (all groups).
 * Output: apps/web/src/features/vocab/seedData/preset-phrases.json
 * Merges with singles in presetVocabCards.ts
 *
 * Run: node scripts/gen-preset-phrase-100.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const POS = {
  pv: 'Cụm động từ',
  ph: 'Cụm từ',
  n: 'Danh từ',
  a: 'Tính từ',
}

function parsePack(text) {
  const out = []
  const seen = new Set()
  for (const line of text.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const [w, m, p = 'ph'] = t.split('|')
    if (!w || !m) continue
    const phrase = w.trim().replace(/\s+/g, ' ')
    // must be multi-word (space or hyphen compound treated as phrase if space)
    if (!/\s/.test(phrase)) continue
    const key = phrase.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ w: phrase, m: m.trim(), p: POS[p] || POS.ph })
  }
  return out
}

function hash(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

function rotate(arr, n) {
  if (!arr.length) return []
  const k = n % arr.length
  return arr.slice(k).concat(arr.slice(0, k))
}

function exampleFor(phrase, pos) {
  if (pos === 'Cụm động từ') return `You should ${phrase} when the situation requires it.`
  return `Learners often use "${phrase}" in this context.`
}

const PACKS = {
  general: parsePack(`
carry out|thực hiện|pv
look into|điều tra|pv
find out|tìm ra|pv
point out|chỉ ra|pv
figure out|hiểu ra|pv
work out|giải quyết|pv
deal with|xử lý|pv
focus on|tập trung vào|pv
depend on|phụ thuộc vào|pv
rely on|dựa vào|pv
base on|dựa trên|pv
lead to|dẫn đến|pv
result in|dẫn đến|pv
consist of|bao gồm|pv
account for|chiếm / giải thích|pv
refer to|đề cập đến|pv
relate to|liên quan đến|pv
contribute to|đóng góp vào|pv
respond to|phản hồi|pv
adapt to|thích nghi với|pv
belong to|thuộc về|pv
apply for|nộp đơn xin|pv
apply to|áp dụng cho|pv
prepare for|chuẩn bị cho|pv
search for|tìm kiếm|pv
look for|tìm|pv
wait for|chờ|pv
ask for|yêu cầu|pv
pay for|trả tiền cho|pv
care about|quan tâm|pv
think about|nghĩ về|pv
talk about|nói về|pv
worry about|lo lắng về|pv
learn about|học về|pv
know about|biết về|pv
come from|đến từ|pv
suffer from|chịu đựng|pv
recover from|hồi phục sau|pv
protect from|bảo vệ khỏi|pv
prevent from|ngăn chặn|pv
keep from|ngăn không cho|pv
differ from|khác với|pv
benefit from|hưởng lợi từ|pv
learn from|học từ|pv
hear from|nghe tin từ|pv
escape from|thoát khỏi|pv
separate from|tách khỏi|pv
far from|xa với|ph
free from|không có|ph
away from|xa khỏi|ph
in terms of|về mặt|ph
in spite of|bất chấp|ph
instead of|thay vì|ph
because of|vì|ph
due to|do|ph
owing to|do|ph
according to|theo|ph
in addition to|ngoài ra|ph
as well as|cũng như|ph
along with|cùng với|ph
together with|cùng với|ph
apart from|ngoài|ph
except for|ngoại trừ|ph
rather than|hơn là|ph
other than|ngoài|ph
as a result|kết quả là|ph
for example|ví dụ|ph
for instance|ví dụ|ph
in fact|thực ra|ph
in general|nói chung|ph
in particular|đặc biệt|ph
on the other hand|mặt khác|ph
in contrast|ngược lại|ph
in conclusion|tóm lại|ph
to sum up|tóm lại|ph
as a whole|nhìn chung|ph
on average|trung bình|ph
at least|ít nhất|ph
at most|nhiều nhất|ph
at all|chút nào|ph
in order to|để|ph
so as to|để|ph
so that|để mà|ph
such as|như là|ph
as long as|miễn là|ph
as soon as|ngay khi|ph
even if|ngay cả khi|ph
even though|mặc dù|ph
as if|như thể|ph
as though|như thể|ph
no longer|không còn|ph
not only|không chỉ|ph
but also|mà còn|ph
either or|hoặc...hoặc|ph
neither nor|không...cũng không|ph
whether or not|liệu có|ph
more and more|ngày càng|ph
less and less|ngày càng ít|ph
one another|lẫn nhau|ph
each other|lẫn nhau|ph
a number of|một số|ph
a variety of|nhiều loại|ph
a range of|một loạt|ph
a series of|một loạt|ph
a set of|một bộ|ph
a piece of|một mảnh|ph
a lot of|nhiều|ph
plenty of|nhiều|ph
kind of|kiểu|ph
sort of|kiểu|ph
type of|loại|ph
part of|phần của|ph
end of|cuối|ph
start of|đầu|ph
middle of|giữa|ph
side of|phía|ph
point of view|quan điểm|ph
sense of|cảm giác về|ph
level of|mức độ|ph
rate of|tỷ lệ|ph
lack of|thiếu|ph
amount of|lượng|ph
number of|số lượng|ph
majority of|đa số|ph
minority of|thiểu số|ph
in the long run|về lâu dài|ph
in the short term|trong ngắn hạn|ph
at the same time|đồng thời|ph
from time to time|thỉnh thoảng|ph
once in a while|thỉnh thoảng|ph
all the time|luôn luôn|ph
most of the time|hầu hết thời gian|ph
for the time being|tạm thời|ph
in the meantime|trong lúc đó|ph
sooner or later|sớm muộn|ph
now and then|thỉnh thoảng|ph
day by day|ngày qua ngày|ph
step by step|từng bước|ph
one by one|từng cái một|ph
little by little|dần dần|ph
hand in hand|song hành|ph
side by side|cạnh nhau|ph
face to face|trực tiếp|ph
in the end|cuối cùng|ph
at the end|ở cuối|ph
by the end|vào cuối|ph
from the start|từ đầu|ph
in the beginning|ban đầu|ph
at first|lúc đầu|ph
at last|cuối cùng|ph
above all|trên hết|ph
after all|rốt cuộc|ph
all in all|nhìn chung|ph
by and large|nhìn chung|ph
more or less|hơn kém|ph
so far|cho đến nay|ph
as yet|cho đến nay|ph
up to now|cho đến nay|ph
from now on|từ giờ trở đi|ph
in advance|trước|ph
on purpose|cố ý|ph
by chance|tình cờ|ph
by accident|vô tình|ph
in public|nơi công cộng|ph
in private|riêng tư|ph
in common|chung|ph
in charge|phụ trách|ph
in control|kiểm soát|ph
under control|được kiểm soát|ph
out of control|mất kiểm soát|ph
out of order|hỏng|ph
out of date|lỗi thời|ph
up to date|cập nhật|ph
on time|đúng giờ|ph
in time|kịp giờ|ph
at once|ngay lập tức|ph
right away|ngay|ph
as usual|như thường lệ|ph
as expected|như mong đợi|ph
no doubt|không nghi ngờ|ph
of course|tất nhiên|ph
in any case|dù sao|ph
in that case|trong trường hợp đó|ph
at any rate|dù sao đi nữa|ph
`),

  phrasal: parsePack(`
get up|thức dậy|pv
wake up|tỉnh dậy|pv
go out|đi ra ngoài|pv
come back|quay lại|pv
come in|đi vào|pv
come on|nào / đến đi|pv
go on|tiếp tục|pv
go away|đi khỏi|pv
go back|quay lại|pv
turn on|bật|pv
turn off|tắt|pv
turn up|xuất hiện / vặn to|pv
turn down|từ chối / vặn nhỏ|pv
put on|mặc vào|pv
take off|cởi ra / cất cánh|pv
take on|đảm nhận|pv
take over|tiếp quản|pv
take up|bắt đầu (sở thích)|pv
give up|từ bỏ|pv
give in|nhượng bộ|pv
give out|phát ra|pv
give away|cho đi|pv
look after|chăm sóc|pv
look up|tra cứu|pv
look down on|coi thường|pv
look forward to|mong đợi|pv
look up to|ngưỡng mộ|pv
run into|tình cờ gặp|pv
run out of|hết|pv
run away|bỏ chạy|pv
break down|hỏng / sụp đổ|pv
break up|chia tay|pv
break out|bùng phát|pv
break into|đột nhập|pv
break through|đột phá|pv
set up|thiết lập|pv
set off|khởi hành|pv
set out|bắt đầu hành trình|pv
bring up|nuôi dạy / nêu ra|pv
bring about|gây ra|pv
bring in|đưa vào|pv
call off|hủy|pv
call on|kêu gọi|pv
call for|đòi hỏi|pv
check in|làm thủ tục|pv
check out|trả phòng / kiểm tra|pv
check up on|kiểm tra|pv
fill in|điền vào|pv
fill out|điền (mẫu)|pv
fill up|đổ đầy|pv
get on|lên (xe)|pv
get off|xuống (xe)|pv
get in|vào|pv
get out|ra ngoài|pv
get over|vượt qua|pv
get along|hòa thuận|pv
get by|xoay xở|pv
get through|vượt qua / liên lạc được|pv
hold on|giữ máy|pv
hold up|làm chậm|pv
keep on|tiếp tục|pv
keep up|theo kịp|pv
keep off|tránh|pv
make up|bịa / trang điểm / hòa giải|pv
make out|hiểu được|pv
make up for|bù đắp|pv
pass out|ngất|pv
pass away|qua đời|pv
pick up|nhặt / đón|pv
put off|hoãn|pv
put out|dập tắt|pv
put up with|chịu đựng|pv
put away|cất đi|pv
put together|lắp ráp|pv
show up|xuất hiện|pv
show off|khoe|pv
shut down|tắt máy|pv
shut up|im lặng|pv
sit down|ngồi xuống|pv
stand up|đứng dậy|pv
stand for|viết tắt / đại diện|pv
stand out|nổi bật|pv
take after|giống|pv
take apart|tháo rời|pv
take back|lấy lại / rút lại|pv
throw away|vứt bỏ|pv
try on|thử (quần áo)|pv
try out|thử nghiệm|pv
turn around|quay lại|pv
turn into|biến thành|pv
work on|làm việc với|pv
work out|tập thể dục / tính ra|pv
write down|ghi lại|pv
write up|viết báo cáo|pv
come across|tình cờ gặp|pv
come up with|nghĩ ra|pv
come down with|mắc (bệnh)|pv
cut down on|cắt giảm|pv
cut off|cắt đứt|pv
cut out|cắt bỏ|pv
drop out|bỏ học|pv
drop by|ghé qua|pv
end up|kết thúc bằng|pv
fall apart|tan vỡ|pv
fall behind|tụt lại|pv
fall for|mê / mắc lừa|pv
go through|trải qua|pv
go over|xem lại|pv
hand in|nộp|pv
hand out|phát|pv
hang out|đi chơi|pv
hang up|cúp máy|pv
keep away|tránh xa|pv
let down|làm thất vọng|pv
let in|cho vào|pv
live on|sống nhờ|pv
move on|tiếp tục|pv
move in|chuyển vào|pv
move out|chuyển ra|pv
pay back|trả lại|pv
pay off|trả hết / đem lại kết quả|pv
pull out|rút ra|pv
pull over|dừng xe|pv
put back|đặt lại|pv
put down|đặt xuống|pv
run over|cán qua|pv
see off|tiễn|pv
settle down|ổn định|pv
slow down|chậm lại|pv
speed up|tăng tốc|pv
speak up|nói to hơn|pv
split up|chia tay|pv
stay up|thức khuya|pv
stick to|bám sát|pv
switch off|tắt|pv
switch on|bật|pv
take down|ghi chép|pv
talk over|thảo luận|pv
think over|suy nghĩ kỹ|pv
try again|thử lại|pv
use up|dùng hết|pv
wake up to|nhận ra|pv
watch out|cẩn thận|pv
wear out|mòn|pv
wipe out|xóa sổ|pv
`),

  academic: parsePack(`
carry out research|tiến hành nghiên cứu|ph
conduct a study|tiến hành nghiên cứu|ph
collect data|thu thập dữ liệu|ph
analyze data|phân tích dữ liệu|ph
draw a conclusion|rút ra kết luận|ph
raise a question|đặt ra câu hỏi|ph
address an issue|giải quyết vấn đề|ph
provide evidence|cung cấp bằng chứng|ph
support an argument|ủng hộ lập luận|ph
challenge a claim|thách thức tuyên bố|ph
cite a source|trích dẫn nguồn|ph
review the literature|tổng quan tài liệu|ph
test a hypothesis|kiểm định giả thuyết|ph
control group|nhóm đối chứng|ph
sample size|cỡ mẫu|ph
peer reviewed|được phản biện|ph
statistically significant|có ý nghĩa thống kê|ph
research method|phương pháp nghiên cứu|ph
qualitative study|nghiên cứu định tính|ph
quantitative study|nghiên cứu định lượng|ph
case study|nghiên cứu điển hình|ph
field study|nghiên cứu thực địa|ph
lab experiment|thí nghiệm phòng lab|ph
independent variable|biến độc lập|ph
dependent variable|biến phụ thuộc|ph
standard deviation|độ lệch chuẩn|ph
correlation coefficient|hệ số tương quan|ph
literature review|tổng quan nghiên cứu|ph
thesis statement|luận đề|ph
topic sentence|câu chủ đề|ph
academic writing|viết học thuật|ph
critical thinking|tư duy phản biện|ph
logical fallacy|ngụy biện logic|ph
counter argument|phản biện|ph
supporting detail|chi tiết hỗ trợ|ph
main idea|ý chính|ph
key concept|khái niệm then chốt|ph
theoretical framework|khung lý thuyết|ph
empirical evidence|bằng chứng thực nghiệm|ph
research findings|phát hiện nghiên cứu|ph
further research|nghiên cứu thêm|ph
in this paper|trong bài này|ph
as shown in|như thể hiện trong|ph
it is argued that|người ta lập luận rằng|ph
it is clear that|rõ ràng là|ph
it is likely that|có khả năng là|ph
to a large extent|ở mức độ lớn|ph
to some extent|ở mức độ nào đó|ph
in this respect|về mặt này|ph
with regard to|về|ph
with respect to|về|ph
in relation to|liên quan đến|ph
in comparison with|so với|ph
in contrast to|trái với|ph
on the basis of|trên cơ sở|ph
in light of|xét đến|ph
in view of|xét đến|ph
for the purpose of|nhằm mục đích|ph
with the aim of|với mục tiêu|ph
in an attempt to|trong nỗ lực|ph
as a means of|như một phương tiện|ph
by means of|bằng cách|ph
in the context of|trong bối cảnh|ph
at the heart of|ở trọng tâm|ph
at the core of|ở cốt lõi|ph
a wide range of|một loạt rộng|ph
a growing body of|ngày càng nhiều|ph
a large proportion of|một tỷ lệ lớn|ph
a significant number of|một số đáng kể|ph
the vast majority of|đại đa số|ph
a small minority of|một thiểu số nhỏ|ph
prior research|nghiên cứu trước|ph
recent studies|nghiên cứu gần đây|ph
previous findings|phát hiện trước|ph
current knowledge|kiến thức hiện tại|ph
future directions|hướng tương lai|ph
research gap|khoảng trống nghiên cứu|ph
research question|câu hỏi nghiên cứu|ph
research design|thiết kế nghiên cứu|ph
data collection|thu thập dữ liệu|ph
data analysis|phân tích dữ liệu|ph
limitations of|hạn chế của|ph
implications for|hàm ý cho|ph
practical applications|ứng dụng thực tế|ph
theoretical implications|hàm ý lý thuyết|ph
policy implications|hàm ý chính sách|ph
further investigation|điều tra thêm|ph
more research is needed|cần nghiên cứu thêm|ph
it remains unclear|vẫn chưa rõ|ph
it is worth noting|đáng lưu ý|ph
it should be noted|cần lưu ý|ph
of particular interest|đặc biệt quan tâm|ph
of great importance|rất quan trọng|ph
of limited value|giá trị hạn chế|ph
beyond the scope|ngoài phạm vi|ph
within the framework|trong khuôn khổ|ph
under investigation|đang được nghiên cứu|ph
subject to change|có thể thay đổi|ph
open to debate|còn tranh luận|ph
widely accepted|được chấp nhận rộng|ph
generally agreed|thường được đồng ý|ph
commonly used|thường dùng|ph
highly effective|rất hiệu quả|ph
relatively low|tương đối thấp|ph
significantly higher|cao hơn đáng kể|ph
slightly lower|thấp hơn một chút|ph
roughly equal|xấp xỉ bằng|ph
broadly similar|tương tự rộng|ph
strikingly different|khác biệt rõ|ph
closely related|liên quan chặt|ph
directly linked|liên kết trực tiếp|ph
strongly associated|liên hệ mạnh|ph
positively correlated|tương quan dương|ph
negatively correlated|tương quan âm|ph
random sample|mẫu ngẫu nhiên|ph
control condition|điều kiện đối chứng|ph
experimental group|nhóm thực nghiệm|ph
placebo effect|hiệu ứng giả dược|ph
double blind|mù đôi|ph
longitudinal study|nghiên cứu dọc|ph
cross sectional|cắt ngang|ph
meta analysis|phân tích tổng hợp|ph
systematic review|tổng quan hệ thống|ph
content analysis|phân tích nội dung|ph
discourse analysis|phân tích diễn ngôn|ph
grounded theory|lý thuyết nền|ph
action research|nghiên cứu hành động|ph
mixed methods|phương pháp hỗn hợp|ph
`),

  business: parsePack(`
make a profit|kiếm lời|ph
make a loss|thua lỗ|ph
break even|hòa vốn|pv
go bankrupt|phá sản|pv
raise capital|huy động vốn|ph
take a loan|vay tiền|ph
pay interest|trả lãi|ph
set a budget|lập ngân sách|ph
cut costs|cắt giảm chi phí|ph
increase revenue|tăng doanh thu|ph
boost sales|thúc đẩy doanh số|ph
launch a product|ra mắt sản phẩm|ph
enter a market|thâm nhập thị trường|ph
gain market share|giành thị phần|ph
close a deal|chốt giao dịch|ph
sign a contract|ký hợp đồng|ph
meet a deadline|đúng hạn|ph
miss a deadline|trễ hạn|ph
schedule a meeting|lên lịch họp|ph
hold a meeting|tổ chức họp|ph
take minutes|ghi biên bản|ph
follow up on|theo dõi tiếp|pv
get back to|phản hồi lại|pv
look forward to|mong đợi|pv
put off a meeting|hoãn họp|ph
call off a deal|hủy giao dịch|ph
draw up a plan|soạn kế hoạch|ph
roll out an update|triển khai cập nhật|ph
work overtime|làm thêm giờ|pv
apply for a job|nộp đơn xin việc|ph
get promoted|được thăng chức|pv
hand in a resignation|nộp đơn từ chức|ph
run a business|điều hành doanh nghiệp|ph
start a company|thành lập công ty|ph
hire staff|tuyển nhân viên|ph
fire an employee|sa thải nhân viên|ph
train employees|đào tạo nhân viên|ph
performance review|đánh giá hiệu suất|ph
benefit package|gói phúc lợi|ph
job opening|vị trí tuyển dụng|ph
job interview|phỏng vấn xin việc|ph
cover letter|thư xin việc|ph
salary package|gói lương|ph
annual leave|nghỉ phép năm|ph
sick leave|nghỉ ốm|ph
remote work|làm việc từ xa|ph
work from home|làm việc tại nhà|ph
office hours|giờ làm việc|ph
business trip|chuyến công tác|ph
expense report|báo cáo chi phí|ph
travel allowance|phụ cấp đi lại|ph
wire transfer|chuyển khoản|ph
interest rate|lãi suất|ph
exchange rate|tỷ giá|ph
cash flow|dòng tiền|ph
balance sheet|bảng cân đối|ph
profit margin|biên lợi nhuận|ph
market research|nghiên cứu thị trường|ph
target audience|đối tượng mục tiêu|ph
brand awareness|nhận biết thương hiệu|ph
customer service|dịch vụ khách hàng|ph
customer feedback|phản hồi khách hàng|ph
supply chain|chuỗi cung ứng|ph
raw material|nguyên liệu thô|ph
lead time|thời gian hoàn thành|ph
out of stock|hết hàng|ph
in stock|còn hàng|ph
place an order|đặt hàng|ph
fill an order|hoàn thành đơn|ph
ship the goods|gửi hàng|ph
track a shipment|theo dõi lô hàng|ph
quality control|kiểm soát chất lượng|ph
terms and conditions|điều khoản|ph
breach of contract|vi phạm hợp đồng|ph
binding agreement|thỏa thuận ràng buộc|ph
intellectual property|sở hữu trí tuệ|ph
trade secret|bí mật thương mại|ph
joint venture|liên doanh|ph
mergers and acquisitions|mua bán sáp nhập|ph
public relations|quan hệ công chúng|ph
press release|thông cáo báo chí|ph
social media campaign|chiến dịch mạng xã hội|ph
launch a campaign|phát động chiến dịch|ph
return on investment|lợi tức đầu tư|ph
cost benefit analysis|phân tích chi phí lợi ích|ph
key performance indicator|chỉ số hiệu suất chính|ph
competitive advantage|lợi thế cạnh tranh|ph
core business|kinh doanh cốt lõi|ph
business model|mô hình kinh doanh|ph
value proposition|đề xuất giá trị|ph
go public|niêm yết|pv
take over a company|tiếp quản công ty|ph
spin off|tách công ty|pv
phase out|loại bỏ dần|pv
scale up|mở rộng quy mô|pv
cut back on|cắt giảm|pv
lay off workers|sa thải lao động|ph
hire freelancers|thuê freelancer|ph
outsource services|thuê ngoài dịch vụ|ph
negotiate terms|đàm phán điều khoản|ph
reach an agreement|đi đến thỏa thuận|ph
settle a dispute|giải quyết tranh chấp|ph
file a lawsuit|nộp đơn kiện|ph
comply with regulations|tuân thủ quy định|ph
pay taxes|nộp thuế|ph
claim expenses|yêu cầu hoàn chi phí|ph
submit a report|nộp báo cáo|ph
review the proposal|xem xét đề xuất|ph
approve the budget|phê duyệt ngân sách|ph
reject an offer|từ chối đề nghị|ph
accept an offer|chấp nhận đề nghị|ph
make an offer|đưa ra đề nghị|ph
counter offer|đề nghị đối ứng|ph
due diligence|thẩm định|ph
risk assessment|đánh giá rủi ro|ph
crisis management|quản lý khủng hoảng|ph
change management|quản lý thay đổi|ph
project management|quản lý dự án|ph
team building|xây dựng đội nhóm|ph
time management|quản lý thời gian|ph
decision making|ra quyết định|ph
problem solving|giải quyết vấn đề|ph
networking event|sự kiện kết nối|ph
trade fair|hội chợ thương mại|ph
business partner|đối tác kinh doanh|ph
long term contract|hợp đồng dài hạn|ph
short term goal|mục tiêu ngắn hạn|ph
annual report|báo cáo thường niên|ph
quarterly results|kết quả quý|ph
fiscal year|năm tài chính|ph
operating costs|chi phí vận hành|ph
fixed costs|chi phí cố định|ph
variable costs|chi phí biến đổi|ph
break even point|điểm hòa vốn|ph
economies of scale|lợi thế quy mô|ph
market leader|dẫn đầu thị trường|ph
niche market|thị trường ngách|ph
emerging market|thị trường mới nổi|ph
global market|thị trường toàn cầu|ph
domestic market|thị trường nội địa|ph
`),

  environment: parsePack(`
climate change|biến đổi khí hậu|ph
global warming|nóng lên toàn cầu|ph
carbon footprint|dấu chân carbon|ph
greenhouse gas|khí nhà kính|ph
renewable energy|năng lượng tái tạo|ph
fossil fuel|nhiên liệu hóa thạch|ph
solar power|năng lượng mặt trời|ph
wind power|năng lượng gió|ph
natural resources|tài nguyên thiên nhiên|ph
endangered species|loài nguy cấp|ph
wildlife conservation|bảo tồn động vật hoang dã|ph
deforestation rate|tỷ lệ phá rừng|ph
air pollution|ô nhiễm không khí|ph
water pollution|ô nhiễm nước|ph
soil erosion|xói mòn đất|ph
plastic waste|rác thải nhựa|ph
toxic waste|chất thải độc hại|ph
waste disposal|xử lý rác|ph
recycling program|chương trình tái chế|ph
energy efficiency|hiệu quả năng lượng|ph
carbon emissions|phát thải carbon|ph
sea level|mực nước biển|ph
extreme weather|thời tiết cực đoan|ph
natural disaster|thiên tai|ph
environmental protection|bảo vệ môi trường|ph
sustainable development|phát triển bền vững|ph
eco friendly|thân thiện môi trường|a
green energy|năng lượng xanh|ph
clean energy|năng lượng sạch|ph
ozone layer|tầng ozone|ph
acid rain|mưa axit|ph
oil spill|tràn dầu|ph
habitat loss|mất môi trường sống|ph
species extinction|tuyệt chủng loài|ph
nature reserve|khu bảo tồn thiên nhiên|ph
national park|vườn quốc gia|ph
marine life|sinh vật biển|ph
coral reef|rạn san hô|ph
rain forest|rừng mưa|ph
tropical forest|rừng nhiệt đới|ph
climate crisis|khủng hoảng khí hậu|ph
climate action|hành động khí hậu|ph
net zero|phát thải ròng bằng không|ph
carbon neutral|trung hòa carbon|a
carbon tax|thuế carbon|ph
emission target|mục tiêu phát thải|ph
energy consumption|tiêu thụ năng lượng|ph
water scarcity|khan hiếm nước|ph
food security|an ninh lương thực|ph
organic farming|nông nghiệp hữu cơ|ph
sustainable farming|nông nghiệp bền vững|ph
pesticide use|sử dụng thuốc trừ sâu|ph
chemical fertilizer|phân hóa học|ph
soil quality|chất lượng đất|ph
air quality|chất lượng không khí|ph
public transport|giao thông công cộng|ph
electric vehicle|xe điện|ph
cycling infrastructure|hạ tầng xe đạp|ph
reduce waste|giảm rác|ph
reuse materials|tái sử dụng vật liệu|ph
recycle plastic|tái chế nhựa|ph
cut down on|cắt giảm|pv
run out of|cạn kiệt|pv
use up resources|dùng hết tài nguyên|ph
protect the environment|bảo vệ môi trường|ph
raise awareness|nâng cao nhận thức|ph
take action|hành động|ph
go green|sống xanh|pv
live sustainably|sống bền vững|ph
save energy|tiết kiệm năng lượng|ph
save water|tiết kiệm nước|ph
plant trees|trồng cây|ph
clean up beaches|dọn bãi biển|ph
ban single use plastic|cấm nhựa dùng một lần|ph
phase out coal|loại bỏ than|ph
switch to renewables|chuyển sang tái tạo|ph
invest in green tech|đầu tư công nghệ xanh|ph
environmental impact|tác động môi trường|ph
environmental policy|chính sách môi trường|ph
climate policy|chính sách khí hậu|ph
international agreement|thỏa thuận quốc tế|ph
climate summit|hội nghị khí hậu|ph
carbon market|thị trường carbon|ph
emission trading|mua bán phát thải|ph
green building|công trình xanh|ph
urban greenery|cây xanh đô thị|ph
green space|không gian xanh|ph
heat island|đảo nhiệt|ph
flash flood|lũ quét|ph
prolonged drought|hạn hán kéo dài|ph
severe storm|bão mạnh|ph
rising temperatures|nhiệt độ tăng|ph
melting glaciers|băng tan|ph
biodiversity loss|mất đa dạng sinh học|ph
ecosystem services|dịch vụ hệ sinh thái|ph
wildlife habitat|môi trường sống hoang dã|ph
migration patterns|mô hình di cư|ph
invasive species|loài xâm lấn|ph
conservation effort|nỗ lực bảo tồn|ph
wildlife corridor|hành lang sinh thái|ph
protected area|khu vực bảo vệ|ph
environmental activist|nhà hoạt động môi trường|ph
grassroots campaign|chiến dịch cơ sở|ph
public awareness|nhận thức cộng đồng|ph
consumer behavior|hành vi người tiêu dùng|ph
circular economy|kinh tế tuần hoàn|ph
zero waste|không rác thải|ph
compost waste|ủ rác hữu cơ|ph
biodegradable packaging|bao bì phân hủy sinh học|ph
single use|dùng một lần|a
long lasting|lâu bền|a
energy saving|tiết kiệm năng lượng|a
water efficient|tiết kiệm nước|a
low carbon|carbon thấp|a
high emission|phát thải cao|a
environmentally conscious|có ý thức môi trường|a
climate resilient|chống chịu khí hậu|a
`),

  daily: parsePack(`
get up early|thức dậy sớm|ph
go to bed|đi ngủ|ph
have breakfast|ăn sáng|ph
have lunch|ăn trưa|ph
have dinner|ăn tối|ph
make the bed|dọn giường|ph
do the dishes|rửa bát|ph
do the laundry|giặt đồ|ph
tidy up the room|dọn phòng|ph
take a shower|tắm|ph
brush your teeth|đánh răng|ph
get dressed|mặc quần áo|ph
leave home|rời nhà|ph
go to work|đi làm|ph
go to school|đi học|ph
come home|về nhà|ph
hang out with friends|đi chơi với bạn|ph
watch a movie|xem phim|ph
listen to music|nghe nhạc|ph
play sports|chơi thể thao|ph
go shopping|đi mua sắm|ph
do grocery shopping|mua đồ tạp hóa|ph
pay the bill|trả hóa đơn|ph
catch a bus|bắt xe buýt|ph
miss the train|lỡ tàu|ph
take a taxi|đi taxi|ph
ride a bike|đi xe đạp|ph
drive a car|lái xe|ph
walk to work|đi bộ đi làm|ph
be stuck in traffic|kẹt xe|ph
check the weather|xem thời tiết|ph
put on a coat|mặc áo khoác|ph
take off your shoes|cởi giày|ph
try on clothes|thử quần áo|ph
look for a bargain|tìm món hời|ph
ask for a discount|xin giảm giá|ph
pay by card|trả bằng thẻ|ph
pay in cash|trả tiền mặt|ph
book a table|đặt bàn|ph
order food|gọi món|ph
leave a tip|để tiền tip|ph
make a reservation|đặt chỗ|ph
check in at the hotel|nhận phòng khách sạn|ph
check out of the hotel|trả phòng|ph
pack a suitcase|xếp vali|ph
catch a flight|bắt chuyến bay|ph
go on holiday|đi nghỉ|ph
take a photo|chụp ảnh|ph
send a message|gửi tin nhắn|ph
make a phone call|gọi điện|ph
pick up the phone|nhấc máy|ph
hang up the phone|cúp máy|ph
charge the battery|sạc pin|ph
turn on the light|bật đèn|ph
turn off the TV|tắt TV|ph
open a window|mở cửa sổ|ph
close the door|đóng cửa|ph
lock the door|khóa cửa|ph
lose the keys|mất chìa khóa|ph
find the keys|tìm thấy chìa khóa|ph
run errands|đi làm việc vặt|ph
queue up|xếp hàng|ph
wait in line|chờ xếp hàng|ph
be in a hurry|vội|ph
take a break|nghỉ giải lao|ph
have a rest|nghỉ ngơi|ph
feel tired|cảm thấy mệt|ph
feel better|cảm thấy tốt hơn|ph
catch a cold|bị cảm|ph
see a doctor|khám bác sĩ|ph
take medicine|uống thuốc|ph
get well soon|mau khỏe|ph
keep fit|giữ dáng|ph
work out at the gym|tập gym|ph
go for a walk|đi dạo|ph
go for a run|đi chạy|ph
play video games|chơi game|ph
read a book|đọc sách|ph
write an email|viết email|ph
post on social media|đăng mạng xã hội|ph
scroll through the feed|lướt feed|ph
meet up with|gặp gỡ|pv
catch up with|nói chuyện cập nhật|pv
get along with|hòa thuận với|pv
look after children|trông trẻ|ph
pick up kids|đón con|ph
drop off kids|đưa con|ph
do homework|làm bài tập|ph
study for a test|học cho kỳ thi|ph
pass an exam|thi đậu|ph
fail an exam|thi trượt|ph
take a course|học khóa|ph
learn a language|học ngôn ngữ|ph
practice speaking|luyện nói|ph
make friends|kết bạn|ph
stay in touch|giữ liên lạc|ph
lose touch|mất liên lạc|ph
fall in love|yêu|ph
get married|kết hôn|ph
have a baby|sinh con|ph
celebrate a birthday|mừng sinh nhật|ph
throw a party|tổ chức tiệc|ph
invite guests|mời khách|ph
have fun|vui vẻ|ph
enjoy yourself|tận hưởng|ph
feel at home|cảm thấy như ở nhà|ph
feel lonely|cảm thấy cô đơn|ph
feel stressed|cảm thấy căng thẳng|ph
calm down|bình tĩnh|pv
cheer up|vui lên|pv
take it easy|thư giãn|ph
get some sleep|ngủ một chút|ph
set an alarm|đặt báo thức|ph
oversleep|ngủ quên|v
be late for work|đi làm muộn|ph
be on time|đúng giờ|ph
rush hour|giờ cao điểm|ph
public holiday|ngày lễ|ph
day off|ngày nghỉ|ph
weekend plan|kế hoạch cuối tuần|ph
family dinner|bữa tối gia đình|ph
home cooked meal|bữa ăn tự nấu|ph
takeaway food|đồ ăn mang về|ph
fast food|đồ ăn nhanh|ph
healthy diet|chế độ ăn lành mạnh|ph
junk food|đồ ăn vặt|ph
drink water|uống nước|ph
have a coffee|uống cà phê|ph
meet for coffee|gặp uống cà phê|ph
go to the cinema|đi rạp phim|ph
go to a concert|đi hòa nhạc|ph
go hiking|đi bộ đường dài|pv
go swimming|đi bơi|pv
go camping|đi cắm trại|pv
visit a museum|tham quan bảo tàng|ph
go sightseeing|đi tham quan|pv
buy souvenirs|mua quà lưu niệm|ph
ask for directions|hỏi đường|ph
get lost|lạc đường|pv
find the way|tìm đường|ph
`),

  education: parsePack(`
hand in homework|nộp bài tập|ph
sit an exam|thi|ph
take notes|ghi chép|ph
pay attention|chú ý|ph
ask a question|đặt câu hỏi|ph
answer a question|trả lời câu hỏi|ph
give a presentation|thuyết trình|ph
do research|làm nghiên cứu|ph
write an essay|viết bài luận|ph
read a passage|đọc đoạn văn|ph
look up a word|tra từ|ph
learn by heart|học thuộc|ph
practice regularly|luyện đều đặn|ph
make progress|tiến bộ|ph
fall behind|tụt lại|pv
catch up|bắt kịp|pv
drop out of school|bỏ học|ph
enroll in a course|đăng ký khóa học|ph
register for classes|đăng ký môn|ph
attend a lecture|dự bài giảng|ph
miss a class|vắng lớp|ph
revise for a test|ôn thi|ph
prepare for an exam|chuẩn bị thi|ph
get good grades|đạt điểm tốt|ph
fail a subject|trượt môn|ph
pass with distinction|đậu loại giỏi|ph
apply for a scholarship|xin học bổng|ph
tuition fee|học phí|ph
student loan|khoản vay sinh viên|ph
student ID|thẻ sinh viên|ph
office hours|giờ gặp giảng viên|ph
group project|dự án nhóm|ph
study group|nhóm học|ph
peer pressure|áp lực bạn bè|ph
critical thinking|tư duy phản biện|ph
problem solving|giải quyết vấn đề|ph
time management|quản lý thời gian|ph
learning style|phong cách học|ph
mother tongue|tiếng mẹ đẻ|ph
second language|ngôn ngữ thứ hai|ph
language barrier|rào cản ngôn ngữ|ph
fluency in English|độ trôi chảy tiếng Anh|ph
native speaker|người bản ngữ|ph
language exchange|trao đổi ngôn ngữ|ph
online course|khóa học trực tuyến|ph
distance learning|học từ xa|ph
blended learning|học kết hợp|ph
lifelong learning|học suốt đời|ph
academic year|năm học|ph
school term|học kỳ|ph
summer school|trường hè|ph
field trip|chuyến đi thực tế|ph
open book exam|thi được mở sách|ph
multiple choice|trắc nghiệm|ph
oral exam|thi vấn đáp|ph
written exam|thi viết|ph
final exam|thi cuối kỳ|ph
midterm exam|thi giữa kỳ|ph
pass mark|điểm đậu|ph
grade point average|điểm trung bình|ph
honor roll|danh sách xuất sắc|ph
report card|phiếu điểm|ph
parent teacher meeting|họp phụ huynh|ph
school uniform|đồng phục|ph
class schedule|thời khóa biểu|ph
course syllabus|đề cương môn|ph
reading list|danh mục đọc|ph
reference book|sách tham khảo|ph
lecture notes|ghi chú bài giảng|ph
handout materials|tài liệu phát|ph
whiteboard|bảng trắng|ph
smart board|bảng tương tác|ph
virtual classroom|lớp ảo|ph
live session|buổi học trực tiếp|ph
recorded lecture|bài giảng ghi hình|ph
discussion forum|diễn đàn thảo luận|ph
peer review|phản biện đồng cấp|ph
self study|tự học|ph
guided practice|luyện có hướng dẫn|ph
free practice|luyện tự do|ph
mock test|bài thi thử|ph
practice test|bài luyện|ph
answer key|đáp án|ph
marking scheme|thang điểm|ph
band score|điểm band|ph
speaking partner|bạn luyện nói|ph
listening practice|luyện nghe|ph
reading comprehension|đọc hiểu|ph
writing task|bài viết|ph
speaking prompt|đề nói|ph
essay outline|dàn ý bài luận|ph
topic sentence|câu chủ đề|ph
supporting example|ví dụ minh họa|ph
concluding sentence|câu kết|ph
word count|số từ|ph
time limit|giới hạn thời gian|ph
exam conditions|điều kiện thi|ph
cheat sheet|phiếu gian lận|ph
academic integrity|liêm chính học thuật|ph
code of conduct|quy tắc ứng xử|ph
attendance record|điểm danh|ph
late submission|nộp muộn|ph
extension request|xin gia hạn|ph
make up test|thi bù|ph
extra credit|điểm cộng|ph
honors program|chương trình danh dự|ph
exchange program|chương trình trao đổi|ph
study abroad|du học|ph
campus life|đời sống campus|ph
student union|hội sinh viên|ph
career fair|ngày hội việc làm|ph
internship program|chương trình thực tập|ph
alumni network|mạng cựu sinh viên|ph
graduation ceremony|lễ tốt nghiệp|ph
degree certificate|bằng cấp|ph
transcript request|xin bảng điểm|ph
admission requirements|điều kiện tuyển sinh|ph
entrance exam|thi đầu vào|ph
placement test|bài kiểm tra xếp lớp|ph
foundation course|khóa nền tảng|ph
bridging course|khóa chuyển tiếp|ph
remedial class|lớp phụ đạo|ph
advanced class|lớp nâng cao|ph
mixed ability|lớp hỗn hợp trình độ|ph
differentiated instruction|dạy phân hóa|ph
formative assessment|đánh giá quá trình|ph
summative assessment|đánh giá tổng kết|ph
learning outcome|chuẩn đầu ra|ph
course objective|mục tiêu khóa học|ph
`),

  tech: parsePack(`
log in|đăng nhập|pv
log out|đăng xuất|pv
sign up|đăng ký|pv
sign in|đăng nhập|pv
sign out|đăng xuất|pv
set up an account|tạo tài khoản|ph
reset password|đặt lại mật khẩu|ph
change password|đổi mật khẩu|ph
two factor authentication|xác thực hai lớp|ph
cloud storage|lưu trữ đám mây|ph
hard drive|ổ cứng|ph
flash drive|USB|ph
operating system|hệ điều hành|ph
mobile app|ứng dụng di động|ph
web browser|trình duyệt web|ph
search engine|công cụ tìm kiếm|ph
social network|mạng xã hội|ph
video call|gọi video|ph
voice message|tin nhắn thoại|ph
text message|tin nhắn|ph
email attachment|tệp đính kèm|ph
file format|định dạng tệp|ph
zip file|file nén|ph
open source|mã nguồn mở|ph
user interface|giao diện người dùng|ph
user experience|trải nghiệm người dùng|ph
artificial intelligence|trí tuệ nhân tạo|ph
machine learning|học máy|ph
deep learning|học sâu|ph
neural network|mạng nơ-ron|ph
big data|dữ liệu lớn|ph
data breach|rò rỉ dữ liệu|ph
cyber security|an ninh mạng|ph
cyber attack|tấn công mạng|ph
phishing email|email lừa đảo|ph
malware infection|nhiễm malware|ph
software update|cập nhật phần mềm|ph
system crash|sập hệ thống|ph
blue screen|màn hình xanh|ph
error message|thông báo lỗi|ph
bug fix|sửa lỗi|ph
feature request|yêu cầu tính năng|ph
beta version|bản beta|ph
release notes|ghi chú phát hành|ph
download speed|tốc độ tải|ph
upload speed|tốc độ tải lên|ph
wifi network|mạng wifi|ph
mobile data|dữ liệu di động|ph
data plan|gói data|ph
out of battery|hết pin|ph
low battery|pin yếu|ph
charge your phone|sạc điện thoại|ph
plug in|cắm điện|pv
unplug the charger|rút sạc|ph
turn on bluetooth|bật bluetooth|ph
turn off notifications|tắt thông báo|ph
enable location|bật định vị|ph
disable cookies|tắt cookie|ph
clear cache|xóa bộ nhớ đệm|ph
free up space|giải phóng dung lượng|ph
back up data|sao lưu dữ liệu|ph
restore backup|khôi phục sao lưu|ph
sync devices|đồng bộ thiết bị|ph
pair devices|ghép thiết bị|ph
remote access|truy cập từ xa|ph
virtual meeting|họp ảo|ph
screen share|chia sẻ màn hình|ph
mute microphone|tắt mic|ph
unmute microphone|bật mic|ph
start recording|bắt đầu ghi|ph
stop recording|dừng ghi|ph
live stream|phát trực tiếp|ph
on demand|theo yêu cầu|ph
streaming service|dịch vụ streaming|ph
smart home|nhà thông minh|ph
voice assistant|trợ lý giọng nói|ph
touch screen|màn hình cảm ứng|ph
wireless charger|sạc không dây|ph
power bank|sạc dự phòng|ph
high resolution|độ phân giải cao|ph
full screen|toàn màn hình|ph
dark mode|chế độ tối|ph
light mode|chế độ sáng|ph
privacy settings|cài đặt riêng tư|ph
data privacy|quyền riêng tư dữ liệu|ph
terms of service|điều khoản dịch vụ|ph
privacy policy|chính sách riêng tư|ph
accept cookies|chấp nhận cookie|ph
reject cookies|từ chối cookie|ph
pop up ad|quảng cáo bật lên|ph
ad blocker|chặn quảng cáo|ph
browser extension|tiện ích trình duyệt|ph
plugin update|cập nhật plugin|ph
code review|review mã|ph
pull request|yêu cầu merge|ph
merge conflict|xung đột merge|ph
deploy to production|triển khai production|ph
roll back|rollback|pv
server downtime|thời gian sập server|ph
load balancing|cân bằng tải|ph
api endpoint|điểm cuối API|ph
status code|mã trạng thái|ph
error handling|xử lý lỗi|ph
unit test|kiểm thử đơn vị|ph
integration test|kiểm thử tích hợp|ph
continuous integration|tích hợp liên tục|ph
version control|kiểm soát phiên bản|ph
source code|mã nguồn|ph
compiled code|mã biên dịch|ph
runtime error|lỗi runtime|ph
syntax error|lỗi cú pháp|ph
logic error|lỗi logic|ph
null pointer|con trỏ null|ph
memory leak|rò rỉ bộ nhớ|ph
stack overflow|tràn stack|ph
infinite loop|vòng lặp vô hạn|ph
edge case|trường hợp biên|ph
use case|use case|ph
user story|câu chuyện người dùng|ph
product backlog|backlog sản phẩm|ph
sprint planning|lập kế hoạch sprint|ph
agile method|phương pháp agile|ph
scrum meeting|họp scrum|ph
stand up meeting|họp đứng|ph
tech stack|stack công nghệ|ph
front end|frontend|ph
back end|backend|ph
full stack|fullstack|ph
cloud computing|điện toán đám mây|ph
edge computing|điện toán biên|ph
internet of things|internet vạn vật|ph
virtual reality|thực tế ảo|ph
augmented reality|thực tế tăng cường|ph
blockchain technology|công nghệ blockchain|ph
smart contract|hợp đồng thông minh|ph
digital wallet|ví số|ph
cryptocurrency market|thị trường crypto|ph
data analytics|phân tích dữ liệu|ph
business intelligence|thông tin kinh doanh|ph
predictive model|mô hình dự đoán|ph
training data|dữ liệu huấn luyện|ph
test data|dữ liệu kiểm thử|ph
overfitting problem|vấn đề overfitting|ph
underfitting problem|vấn đề underfitting|ph
model accuracy|độ chính xác mô hình|ph
false positive|dương tính giả|ph
false negative|âm tính giả|ph
`),

  society: parsePack(`
social inequality|bất bình đẳng xã hội|ph
cultural diversity|đa dạng văn hóa|ph
human rights|nhân quyền|ph
civil rights|dân quyền|ph
freedom of speech|tự do ngôn luận|ph
rule of law|thượng tôn pháp luật|ph
public opinion|dư luận|ph
social media|mạng xã hội|ph
fake news|tin giả|ph
hate speech|phát ngôn thù địch|ph
peer pressure|áp lực bạn bè|ph
generation gap|khoảng cách thế hệ|ph
nuclear family|gia đình hạt nhân|ph
extended family|đại gia đình|ph
single parent|cha/mẹ đơn thân|ph
gender equality|bình đẳng giới|ph
gender gap|khoảng cách giới|ph
equal pay|lương ngang bằng|ph
glass ceiling|trần kính|ph
minimum wage|lương tối thiểu|ph
living wage|lương đủ sống|ph
social welfare|phúc lợi xã hội|ph
public health|y tế công cộng|ph
mental health|sức khỏe tinh thần|ph
health care system|hệ thống y tế|ph
life expectancy|tuổi thọ|ph
birth rate|tỷ lệ sinh|ph
death rate|tỷ lệ tử vong|ph
population growth|tăng dân số|ph
aging population|dân số già|ph
youth unemployment|thất nghiệp thanh niên|ph
job market|thị trường việc làm|ph
skilled worker|lao động có kỹ năng|ph
unskilled labor|lao động phổ thông|ph
brain drain|chảy máu chất xám|ph
labor migration|di cư lao động|ph
refugee crisis|khủng hoảng tị nạn|ph
asylum seeker|người xin tị nạn|ph
border control|kiểm soát biên giới|ph
national identity|bản sắc quốc gia|ph
cultural heritage|di sản văn hóa|ph
traditional values|giá trị truyền thống|ph
modern lifestyle|lối sống hiện đại|ph
standard of living|mức sống|ph
quality of life|chất lượng cuộc sống|ph
cost of living|chi phí sinh hoạt|ph
housing crisis|khủng hoảng nhà ở|ph
affordable housing|nhà ở giá rẻ|ph
homeless people|người vô gia cư|ph
social housing|nhà ở xã hội|ph
urban development|phát triển đô thị|ph
urban sprawl|đô thị lan rộng|ph
rural area|vùng nông thôn|ph
city center|trung tâm thành phố|ph
public space|không gian công cộng|ph
community center|trung tâm cộng đồng|ph
volunteer work|công việc tình nguyện|ph
charitable donation|quyên góp từ thiện|ph
non profit organization|tổ chức phi lợi nhuận|ph
civil society|xã hội dân sự|ph
political party|đảng chính trị|ph
general election|tổng tuyển cử|ph
voter turnout|tỷ lệ cử tri đi bầu|ph
opinion poll|thăm dò dư luận|ph
press freedom|tự do báo chí|ph
media coverage|đưa tin truyền thông|ph
news outlet|cơ quan báo chí|ph
investigative journalism|báo chí điều tra|ph
public debate|tranh luận công khai|ph
social movement|phong trào xã hội|ph
peaceful protest|biểu tình hòa bình|ph
mass demonstration|biểu tình đông người|ph
law enforcement|thực thi pháp luật|ph
criminal justice|tư pháp hình sự|ph
death penalty|án tử hình|ph
prison sentence|án tù|ph
community service|lao động công ích|ph
victim of confidence|phiếu tín nhiệm|ph
political stability|ổn định chính trị|ph
corruption scandal|bê bối tham nhũng|ph
transparent government|chính phủ minh bạch|ph
public accountability|trách nhiệm công|ph
civic duty|nghĩa vụ công dân|ph
national service|nghĩa vụ quốc gia|ph
social cohesion|gắn kết xã hội|ph
social inclusion|hòa nhập xã hội|ph
social exclusion|loại trừ xã hội|ph
ethnic minority|dân tộc thiểu số|ph
indigenous people|người bản địa|ph
cultural exchange|trao đổi văn hóa|ph
intercultural communication|giao tiếp liên văn hóa|ph
language policy|chính sách ngôn ngữ|ph
official language|ngôn ngữ chính thức|ph
mother tongue education|giáo dục tiếng mẹ đẻ|ph
digital divide|khoảng cách số|ph
access to education|tiếp cận giáo dục|ph
access to healthcare|tiếp cận y tế|ph
basic services|dịch vụ cơ bản|ph
public infrastructure|cơ sở hạ tầng công|ph
road safety|an toàn giao thông|ph
traffic congestion|ùn tắc giao thông|ph
public transport system|hệ thống giao thông công cộng|ph
crime rate|tỷ lệ tội phạm|ph
violent crime|tội phạm bạo lực|ph
petty crime|tội phạm vặt|ph
cyber crime|tội phạm mạng|ph
organized crime|tội phạm có tổ chức|ph
gun control|kiểm soát súng|ph
drug abuse|lạm dụng ma túy|ph
alcohol abuse|lạm dụng rượu|ph
rehabilitation program|chương trình phục hồi|ph
social support|hỗ trợ xã hội|ph
safety net|lưới an sinh|ph
income inequality|bất bình đẳng thu nhập|ph
wealth gap|khoảng cách giàu nghèo|ph
middle class|tầng lớp trung lưu|ph
working class|tầng lớp lao động|ph
upper class|tầng lớp thượng lưu|ph
social mobility|di động xã hội|ph
equal opportunity|cơ hội bình đẳng|ph
affirmative action|hành động khẳng định|ph
anti discrimination law|luật chống phân biệt|ph
hate crime|tội ác thù hận|ph
domestic violence|bạo lực gia đình|ph
child protection|bảo vệ trẻ em|ph
elderly care|chăm sóc người già|ph
disability rights|quyền người khuyết tật|ph
inclusive society|xã hội hòa nhập|ph
`),

  health: parsePack(`
immune system|hệ miễn dịch|ph
chronic disease|bệnh mãn tính|ph
mental health|sức khỏe tinh thần|ph
physical health|sức khỏe thể chất|ph
balanced diet|chế độ ăn cân bằng|ph
junk food|đồ ăn vặt|ph
fast food|đồ ăn nhanh|ph
food allergy|dị ứng thực phẩm|ph
blood pressure|huyết áp|ph
heart disease|bệnh tim|ph
heart attack|cơn đau tim|ph
brain damage|tổn thương não|ph
side effect|tác dụng phụ|ph
pain killer|thuốc giảm đau|ph
medical treatment|điều trị y khoa|ph
medical history|tiền sử bệnh|ph
family doctor|bác sĩ gia đình|ph
emergency room|phòng cấp cứu|ph
intensive care|chăm sóc đặc biệt|ph
health insurance|bảo hiểm y tế|ph
public healthcare|y tế công|ph
private clinic|phòng khám tư|ph
prescription drug|thuốc kê đơn|ph
over the counter|không cần kê đơn|ph
first aid kit|bộ sơ cứu|ph
vaccination program|chương trình tiêm chủng|ph
booster dose|mũi nhắc|ph
virus outbreak|bùng phát virus|ph
spread of disease|lây lan bệnh|ph
wear a mask|đeo khẩu trang|ph
wash your hands|rửa tay|ph
social distancing|giãn cách xã hội|ph
self isolation|tự cách ly|ph
quarantine period|thời gian cách ly|ph
test positive|dương tính|ph
test negative|âm tính|ph
recover from illness|hồi phục bệnh|ph
get better|khỏi|pv
feel unwell|cảm thấy không khỏe|ph
have a fever|bị sốt|ph
sore throat|đau họng|ph
runny nose|sổ mũi|ph
high temperature|sốt cao|ph
severe pain|đau dữ dội|ph
mild symptoms|triệu chứng nhẹ|ph
seek medical help|tìm sự trợ giúp y tế|ph
see a specialist|khám chuyên khoa|ph
get a checkup|khám sức khỏe|ph
blood test|xét nghiệm máu|ph
x ray|chụp X-quang|ph
mri scan|chụp MRI|ph
surgery room|phòng mổ|ph
post operative care|chăm sóc sau mổ|ph
physical therapy|vật lý trị liệu|ph
occupational therapy|hoạt động trị liệu|ph
mental illness|bệnh tâm thần|ph
anxiety disorder|rối loạn lo âu|ph
panic attack|cơn hoảng loạn|ph
stress management|quản lý stress|ph
sleep disorder|rối loạn giấc ngủ|ph
lack of sleep|thiếu ngủ|ph
healthy lifestyle|lối sống lành mạnh|ph
regular exercise|tập thể dục đều|ph
lose weight|giảm cân|ph
gain weight|tăng cân|ph
stay in shape|giữ form|pv
cut down on sugar|cắt giảm đường|ph
cut out junk food|bỏ junk food|pv
drink plenty of water|uống nhiều nước|ph
quit smoking|bỏ thuốc|ph
give up alcohol|bỏ rượu|ph
drug addiction|nghiện ma túy|ph
rehabilitation center|trung tâm cai nghiện|ph
life expectancy|tuổi thọ|ph
infant mortality|tử vong trẻ sơ sinh|ph
maternal health|sức khỏe bà mẹ|ph
child nutrition|dinh dưỡng trẻ em|ph
malnutrition|suy dinh dưỡng|ph
obesity rate|tỷ lệ béo phì|ph
diabetes risk|nguy cơ tiểu đường|ph
cancer treatment|điều trị ung thư|ph
chemotherapy session|buổi hóa trị|ph
radiation therapy|xạ trị|ph
organ transplant|ghép tạng|ph
blood donation|hiến máu|ph
stem cell|tế bào gốc|ph
gene therapy|liệu pháp gen|ph
clinical trial|thử nghiệm lâm sàng|ph
medical breakthrough|đột phá y học|ph
public health crisis|khủng hoảng y tế công|ph
health care reform|cải cách y tế|ph
primary care|chăm sóc ban đầu|ph
secondary care|chăm sóc tuyến hai|ph
preventive care|chăm sóc phòng ngừa|ph
health screening|sàng lọc sức khỏe|ph
annual checkup|khám hàng năm|ph
dental care|chăm sóc răng|ph
eye exam|khám mắt|ph
hearing test|kiểm tra thính lực|ph
skin condition|tình trạng da|ph
allergic reaction|phản ứng dị ứng|ph
food poisoning|ngộ độc thực phẩm|ph
stomach ache|đau bụng|ph
head ache|đau đầu|ph
back pain|đau lưng|ph
joint pain|đau khớp|ph
muscle strain|căng cơ|ph
sports injury|chấn thương thể thao|ph
broken bone|gãy xương|ph
sprain ankle|bong gân|ph
recover fully|hồi phục hoàn toàn|ph
follow medical advice|theo lời khuyên y khoa|ph
take as directed|uống theo chỉ định|ph
complete the course|uống hết liệu trình|ph
antibiotic resistance|kháng kháng sinh|ph
hospital stay|nằm viện|ph
discharge from hospital|ra viện|ph
home care|chăm sóc tại nhà|ph
palliative care|chăm sóc giảm nhẹ|ph
end of life care|chăm sóc cuối đời|ph
`),
}

function ensurePackSize(pack, min = 100) {
  if (pack.length >= min) return pack
  const g = PACKS.general
  const seen = new Set(pack.map(x => x.w.toLowerCase()))
  const merged = pack.slice()
  for (const item of g) {
    if (seen.has(item.w.toLowerCase())) continue
    merged.push(item)
    seen.add(item.w.toLowerCase())
    if (merged.length >= min) break
  }
  // pad with phrasal
  for (const item of PACKS.phrasal || []) {
    if (merged.length >= min) break
    if (seen.has(item.w.toLowerCase())) continue
    merged.push(item)
    seen.add(item.w.toLowerCase())
  }
  return merged
}

for (const k of Object.keys(PACKS)) {
  PACKS[k] = ensurePackSize(PACKS[k], 110)
  console.log('pack', k, PACKS[k].length)
}

function packsForDeck(groupId, deckName) {
  const n = deckName.toLowerCase()
  const picks = []
  const add = (...ids) => {
    for (const id of ids) if (PACKS[id] && !picks.includes(id)) picks.push(id)
  }

  if (groupId === 'toeic') add('business', 'general', 'phrasal')
  if (groupId === 'oxford') add('daily', 'phrasal', 'general')
  if (groupId === 'academic' || groupId === 'sat') add('academic', 'general', 'phrasal')
  if (groupId === 'toefl') add('education', 'academic', 'phrasal')
  if (groupId === 'ielts') add('society', 'environment', 'academic', 'general')

  if (/môi trường|sinh thái|khí hậu|năng lượng|tài nguyên|cực đoan|nông nghiệp/.test(n)) add('environment')
  if (/công nghệ|máy tính|cntt|số|internet|đổi mới|ai/.test(n)) add('tech')
  if (/sức khỏe|y tế|phòng bệnh|y sinh|dinh dưỡng|ẩm thực/.test(n)) add('health')
  if (/giáo dục|học|trường|campus|bài giảng|ghi chú|đào tạo|lớp|tuyển|học vụ|đọc|viết|nói|nghe|ngữ pháp|lập luận|từ vựng/.test(n)) add('education', 'academic')
  if (/kinh tế|kinh doanh|thương mại|tài chính|ngân|marketing|bán|hợp đồng|logistics|văn phòng|họp|nhân sự|xuất|nhập|bảo hiểm|kế toán|dự án|email|bán lẻ|pr|quảng cáo|việc làm|sự nghiệp/.test(n)) add('business')
  if (/xã hội|văn hóa|cộng đồng|giới|thế hệ|gia đình|bạn|thanh|cao tuổi|bình đẳng|toàn cầu|pháp|luật|tội|truyền thông/.test(n)) add('society')
  if (/đời sống|hằng ngày|mua sắm|thời trang|nhà cửa|thú cưng|lễ hội|thời tiết|du lịch|di chuyển|giao thông|khách sạn|nhà hàng|đồ ăn|sở thích|cảm xúc|thể thao/.test(n)) add('daily', 'phrasal')
  if (/khoa học|vật lý|hóa|sinh|toán|thống kê|nghiên cứu|phương pháp|thí nghiệm|thiên văn|địa/.test(n)) add('academic', 'science' in PACKS ? 'science' : 'academic')
  if (/không gian|vũ trụ/.test(n)) add('academic')
  if (/tâm lý|hành vi/.test(n)) add('health', 'society')

  add('phrasal', 'general')
  return picks
}

function pick100(groupId, deckName) {
  const packIds = packsForDeck(groupId, deckName)
  const pool = []
  const seen = new Set()
  for (const id of packIds) {
    for (const item of PACKS[id] || []) {
      const k = item.w.toLowerCase()
      if (seen.has(k)) continue
      if (!/\s/.test(item.w)) continue
      seen.add(k)
      pool.push(item)
    }
  }
  for (const item of [...PACKS.general, ...PACKS.phrasal]) {
    if (pool.length >= 250) break
    const k = item.w.toLowerCase()
    if (seen.has(k)) continue
    seen.add(k)
    pool.push(item)
  }

  const rotated = rotate(pool, hash(`phrase::${groupId}::${deckName}`))
  const picked = rotated.slice(0, 100)
  if (picked.length < 100) {
    console.warn('short', groupId, deckName, picked.length, 'pool', pool.length)
  }
  return picked.slice(0, 100)
}

const deckNamesPath = path.join(root, 'scripts/_deck-names.json')
const groups = JSON.parse(fs.readFileSync(deckNamesPath, 'utf8'))

const seed = { ielts: [], oxford: [], toeic: [], academic: [], sat: [], toefl: [] }
const report = {}

for (const [groupId, decks] of Object.entries(groups)) {
  report[groupId] = {}
  for (const deckName of decks) {
    const words = pick100(groupId, deckName)
    report[groupId][deckName] = words.length
    for (const item of words) {
      seed[groupId].push({
        deckName,
        phrase: item.w,
        meaning: item.m,
        example: exampleFor(item.w, item.p),
        pos: item.p,
      })
    }
  }
}

let multi = 0
let single = 0
let total = 0
for (const cards of Object.values(seed)) {
  for (const c of cards) {
    total++
    if (/\s/.test(c.phrase)) multi++
    else single++
  }
}
console.log({ total, multi, single })

const short = []
for (const [g, m] of Object.entries(report)) {
  for (const [d, n] of Object.entries(m)) if (n < 100) short.push(`${g}/${d}:${n}`)
}
if (short.length) console.warn('SHORT', short.slice(0, 20), 'count', short.length)

const outDir = path.join(root, 'apps/web/src/features/vocab/seedData')
fs.mkdirSync(outDir, { recursive: true })
const jsonPath = path.join(outDir, 'preset-phrases.json')
fs.writeFileSync(jsonPath, JSON.stringify(seed), 'utf8')
console.log('wrote', jsonPath, (fs.statSync(jsonPath).size / 1024 / 1024).toFixed(2), 'MB')

// Merge singles + phrases into presetVocabCards.ts
const singlesPath = path.join(outDir, 'preset-singles.json')
const singles = JSON.parse(fs.readFileSync(singlesPath, 'utf8'))

const merged = {}
for (const g of Object.keys(seed)) {
  merged[g] = [...(singles[g] || []), ...(seed[g] || [])]
  console.log(g, 'singles', (singles[g] || []).length, 'phrases', seed[g].length, 'total', merged[g].length)
}

const ts = `/** Auto-generated preset seed: 100 singles + 100 phrases per deck.
 * Regenerate:
 *   node scripts/gen-preset-single-100.mjs
 *   node scripts/gen-preset-phrase-100.mjs
 */
import type { PresetGroupId } from '../vocabConstants'
import singles from './preset-singles.json'
import phrases from './preset-phrases.json'

export type PresetSeedCard = {
  deckName: string
  phrase: string
  meaning: string
  example?: string
  pos?: string
  ipaUS?: string
  ipaUK?: string
}

/** Bump when seed content expands. */
export const PRESET_VOCAB_CARDS_VERSION = 3

function mergeGroup(a: PresetSeedCard[] = [], b: PresetSeedCard[] = []): PresetSeedCard[] {
  return [...a, ...b]
}

export const PRESET_VOCAB_SEED: Record<PresetGroupId, PresetSeedCard[]> = {
  ielts: mergeGroup(singles.ielts as PresetSeedCard[], phrases.ielts as PresetSeedCard[]),
  oxford: mergeGroup(singles.oxford as PresetSeedCard[], phrases.oxford as PresetSeedCard[]),
  toeic: mergeGroup(singles.toeic as PresetSeedCard[], phrases.toeic as PresetSeedCard[]),
  academic: mergeGroup(singles.academic as PresetSeedCard[], phrases.academic as PresetSeedCard[]),
  sat: mergeGroup(singles.sat as PresetSeedCard[], phrases.sat as PresetSeedCard[]),
  toefl: mergeGroup(singles.toefl as PresetSeedCard[], phrases.toefl as PresetSeedCard[]),
}
`
fs.writeFileSync(path.join(outDir, 'presetVocabCards.ts'), ts, 'utf8')
console.log('wrote presetVocabCards.ts v3')
