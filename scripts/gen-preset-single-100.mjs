/**
 * Generate 100 single-word cards per preset deck (all groups).
 * Output: apps/web/src/features/vocab/seedData/preset-singles.json
 *          apps/web/src/features/vocab/seedData/presetVocabCards.ts (merged export)
 *
 * Run: node scripts/gen-preset-single-100.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const POS = { n: 'Danh từ', v: 'Động từ', a: 'Tính từ', adv: 'Trạng từ' }

function parsePack(text) {
  const out = []
  const seen = new Set()
  for (const line of text.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const [w, m, p = 'n'] = t.split('|')
    if (!w || !m) continue
    const word = w.trim()
    if (/\s/.test(word)) continue
    const key = word.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ w: word, m: m.trim(), p: POS[p] || POS.n })
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

function exampleFor(word, pos) {
  if (pos === 'Động từ') return `Learners should ${word} this concept carefully.`
  if (pos === 'Tính từ') return `It is a ${word} topic in modern English study.`
  if (pos === 'Trạng từ') return `She answered the question ${word}.`
  return `The term "${word}" is useful in this topic.`
}

/** Thematic packs — only single tokens (no spaces). */
const PACKS = {
  general: parsePack(`
ability|khả năng|n
accept|chấp nhận|v
achieve|đạt được|v
active|tích cực|a
actual|thực tế|a
adapt|thích nghi|v
adult|người lớn|n
affect|ảnh hưởng|v
agree|đồng ý|v
allow|cho phép|v
almost|hầu như|adv
amount|số lượng|n
analyze|phân tích|v
appear|xuất hiện|v
apply|áp dụng|v
approach|cách tiếp cận|n
area|khu vực|n
argue|tranh luận|v
article|bài báo|n
aspect|khía cạnh|n
assume|giả định|v
attend|tham dự|v
available|có sẵn|a
average|trung bình|a
avoid|tránh|v
aware|nhận thức|a
basic|cơ bản|a
benefit|lợi ích|n
brief|ngắn gọn|a
capable|có khả năng|a
cause|nguyên nhân|n
central|trung tâm|a
challenge|thách thức|n
change|thay đổi|n
choose|chọn|v
claim|tuyên bố|v
clear|rõ ràng|a
common|phổ biến|a
compare|so sánh|v
complete|hoàn thành|v
complex|phức tạp|a
concept|khái niệm|n
concern|mối quan tâm|n
condition|điều kiện|n
consider|xem xét|v
contain|chứa|v
context|bối cảnh|n
continue|tiếp tục|v
create|tạo ra|v
current|hiện tại|a
data|dữ liệu|n
decide|quyết định|v
define|định nghĩa|v
demand|nhu cầu|n
describe|mô tả|v
design|thiết kế|n
detail|chi tiết|n
develop|phát triển|v
difference|sự khác biệt|n
direct|trực tiếp|a
discuss|thảo luận|v
effect|tác động|n
effort|nỗ lực|n
element|yếu tố|n
enable|cho phép|v
encourage|khuyến khích|v
energy|năng lượng|n
ensure|đảm bảo|v
environment|môi trường|n
equal|bằng nhau|a
essential|thiết yếu|a
establish|thiết lập|v
evidence|bằng chứng|n
example|ví dụ|n
exist|tồn tại|v
expect|mong đợi|v
experience|kinh nghiệm|n
explain|giải thích|v
express|diễn đạt|v
factor|yếu tố|n
feature|đặc điểm|n
final|cuối cùng|a
focus|tập trung|v
follow|theo|v
form|hình thức|n
function|chức năng|n
general|chung|a
goal|mục tiêu|n
growth|tăng trưởng|n
identify|xác định|v
impact|tác động|n
improve|cải thiện|v
include|bao gồm|v
increase|tăng|v
indicate|chỉ ra|v
individual|cá nhân|n
influence|ảnh hưởng|n
information|thông tin|n
issue|vấn đề|n
knowledge|kiến thức|n
level|mức độ|n
likely|có khả năng|a
limit|giới hạn|n
major|chính|a
method|phương pháp|n
model|mô hình|n
modern|hiện đại|a
nature|bản chất|n
necessary|cần thiết|a
occur|xảy ra|v
option|lựa chọn|n
period|giai đoạn|n
policy|chính sách|n
possible|có thể|a
potential|tiềm năng|n
practice|thực hành|n
present|trình bày|v
process|quá trình|n
produce|sản xuất|v
product|sản phẩm|n
program|chương trình|n
project|dự án|n
provide|cung cấp|v
purpose|mục đích|n
quality|chất lượng|n
range|phạm vi|n
reason|lý do|n
reduce|giảm|v
reflect|phản ánh|v
relate|liên quan|v
require|yêu cầu|v
research|nghiên cứu|n
result|kết quả|n
role|vai trò|n
section|phần|n
significant|đáng kể|a
similar|tương tự|a
simple|đơn giản|a
social|xã hội|a
source|nguồn|n
specific|cụ thể|a
structure|cấu trúc|n
study|nghiên cứu|n
subject|chủ đề|n
success|thành công|n
support|hỗ trợ|v
system|hệ thống|n
theory|lý thuyết|n
type|loại|n
value|giá trị|n
variety|đa dạng|n
view|quan điểm|n
standard|tiêu chuẩn|n
strategy|chiến lược|n
solution|giải pháp|n
problem|vấn đề|n
response|phản hồi|n
pattern|mẫu|n
trend|xu hướng|n
rate|tỷ lệ|n
scale|quy mô|n
scope|phạm vi|n
basis|cơ sở|n
core|cốt lõi|n
key|chìa khóa|a
main|chính|a
primary|chính|a
secondary|thứ cấp|a
overall|tổng thể|a
relative|tương đối|a
absolute|tuyệt đối|a
positive|tích cực|a
negative|tiêu cực|a
neutral|trung lập|a
obvious|rõ ràng|a
certain|chắc chắn|a
uncertain|không chắc|a
accurate|chính xác|a
precise|chính xác|a
approximate|xấp xỉ|a
frequent|thường xuyên|a
rare|hiếm|a
unique|độc đáo|a
typical|điển hình|a
formal|trang trọng|a
informal|thân mật|a
official|chính thức|a
legal|hợp pháp|a
illegal|bất hợp pháp|a
valid|hợp lệ|a
effective|hiệu quả|a
efficient|hiệu suất cao|a
practical|thực tế|a
theoretical|lý thuyết|a
abstract|trừu tượng|a
concrete|cụ thể|a
visible|nhìn thấy|a
hidden|ẩn|a
public|công cộng|a
private|riêng tư|a
global|toàn cầu|a
local|địa phương|a
national|quốc gia|a
international|quốc tế|a
urban|đô thị|a
rural|nông thôn|a
digital|kỹ thuật số|a
physical|vật lý|a
mental|tinh thần|a
cultural|văn hóa|a
economic|kinh tế|a
political|chính trị|a
historical|lịch sử|a
scientific|khoa học|a
technical|kỹ thuật|a
academic|học thuật|a
professional|chuyên nghiệp|a
personal|cá nhân|a
`),

  tech: parsePack(`
algorithm|thuật toán|n
software|phần mềm|n
hardware|phần cứng|n
network|mạng|n
server|máy chủ|n
client|máy khách|n
database|cơ sở dữ liệu|n
cloud|đám mây|n
device|thiết bị|n
screen|màn hình|n
keyboard|bàn phím|n
password|mật khẩu|n
encrypt|mã hóa|v
decrypt|giải mã|v
hacker|tin tặc|n
malware|phần mềm độc hại|n
virus|vi-rút|n
firewall|tường lửa|n
browser|trình duyệt|n
website|trang web|n
application|ứng dụng|n
update|cập nhật|v
upgrade|nâng cấp|v
download|tải xuống|v
upload|tải lên|v
install|cài đặt|v
backup|sao lưu|n
storage|lưu trữ|n
memory|bộ nhớ|n
processor|bộ xử lý|n
chip|chip|n
robot|robot|n
automation|tự động hóa|n
sensor|cảm biến|n
signal|tín hiệu|n
bandwidth|băng thông|n
latency|độ trễ|n
protocol|giao thức|n
interface|giao diện|n
platform|nền tảng|n
framework|khung|n
library|thư viện|n
code|mã|n
debug|gỡ lỗi|v
compile|biên dịch|v
deploy|triển khai|v
host|lưu trữ|v
domain|tên miền|n
traffic|lưu lượng|n
user|người dùng|n
account|tài khoản|n
profile|hồ sơ|n
login|đăng nhập|n
logout|đăng xuất|n
notification|thông báo|n
message|tin nhắn|n
email|thư điện tử|n
chat|trò chuyện|n
video|video|n
audio|âm thanh|n
stream|phát trực tuyến|v
pixel|điểm ảnh|n
resolution|độ phân giải|n
format|định dạng|n
file|tệp|n
folder|thư mục|n
drive|ổ đĩa|n
cable|cáp|n
wireless|không dây|a
bluetooth|bluetooth|n
satellite|vệ tinh|n
drone|máy bay không người lái|n
virtual|ảo|a
augmented|tăng cường|a
simulation|mô phỏng|n
machine|máy|n
learning|học|n
neural|nơ-ron|a
dataset|bộ dữ liệu|n
training|huấn luyện|n
inference|suy luận|n
model|mô hình|n
accuracy|độ chính xác|n
bias|thiên lệch|n
ethics|đạo đức|n
privacy|quyền riêng tư|n
security|an ninh|n
threat|mối đe dọa|n
breach|rò rỉ|n
patch|bản vá|n
bug|lỗi|n
feature|tính năng|n
release|bản phát hành|n
version|phiên bản|n
beta|thử nghiệm|n
startup|khởi nghiệp|n
innovation|đổi mới|n
gadget|thiết bị nhỏ|n
smartphone|điện thoại thông minh|n
tablet|máy tính bảng|n
laptop|máy tính xách tay|n
desktop|máy tính để bàn|n
wearable|đeo được|a
chipset|bộ chip|n
firmware|firmware|n
driver|trình điều khiển|n
plugin|tiện ích|n
extension|tiện ích mở rộng|n
cache|bộ nhớ đệm|n
cookie|cookie|n
token|mã token|n
blockchain|chuỗi khối|n
cryptocurrency|tiền mã hóa|n
bitcoin|bitcoin|n
wallet|ví|n
mining|đào|n
node|nút|n
queue|hàng đợi|n
stack|ngăn xếp|n
array|mảng|n
object|đối tượng|n
function|hàm|n
variable|biến|n
constant|hằng|n
loop|vòng lặp|n
condition|điều kiện|n
boolean|logic|n
integer|số nguyên|n
string|chuỗi|n
boolean|boolean|n
syntax|cú pháp|n
runtime|thời gian chạy|n
compiler|trình biên dịch|n
interpreter|trình thông dịch|n
repository|kho mã|n
commit|cam kết|n
branch|nhánh|n
merge|hợp nhất|v
pipeline|đường ống|n
container|container|n
cluster|cụm|n
scalability|khả năng mở rộng|n
reliability|độ tin cậy|n
availability|tính sẵn sàng|n
throughput|thông lượng|n
`),

  health: parsePack(`
health|sức khỏe|n
disease|bệnh|n
illness|căn bệnh|n
symptom|triệu chứng|n
diagnosis|chẩn đoán|n
treatment|điều trị|n
medicine|thuốc|n
vaccine|vắc-xin|n
virus|vi-rút|n
bacteria|vi khuẩn|n
infection|nhiễm trùng|n
immune|miễn dịch|a
patient|bệnh nhân|n
doctor|bác sĩ|n
nurse|y tá|n
hospital|bệnh viện|n
clinic|phòng khám|n
surgery|phẫu thuật|n
therapy|liệu pháp|n
recovery|hồi phục|n
pain|đau|n
fever|sốt|n
cough|ho|n
allergy|dị ứng|n
asthma|hen suyễn|n
diabetes|tiểu đường|n
cancer|ung thư|n
heart|tim|n
blood|máu|n
pressure|huyết áp|n
pulse|mạch|n
lung|phổi|n
brain|não|n
bone|xương|n
muscle|cơ|n
nerve|dây thần kinh|n
skin|da|n
diet|chế độ ăn|n
nutrition|dinh dưỡng|n
vitamin|vitamin|n
protein|protein|n
calorie|calo|n
obesity|béo phì|n
fitness|thể lực|n
exercise|tập luyện|n
workout|buổi tập|n
yoga|yoga|n
sleep|giấc ngủ|n
stress|căng thẳng|n
anxiety|lo âu|n
depression|trầm cảm|n
mental|tinh thần|a
physical|thể chất|a
chronic|mãn tính|a
acute|cấp tính|a
severe|nghiêm trọng|a
mild|nhẹ|a
contagious|lây nhiễm|a
epidemic|dịch|n
pandemic|đại dịch|n
outbreak|bùng phát|n
hygiene|vệ sinh|n
sanitation|vệ sinh môi trường|n
prevention|phòng ngừa|n
screening|sàng lọc|n
checkup|khám sức khỏe|n
prescription|đơn thuốc|n
dose|liều|n
sideeffect|tác dụng phụ|n
antibiotic|kháng sinh|n
painkiller|thuốc giảm đau|n
bandage|băng|n
injury|chấn thương|n
wound|vết thương|n
fracture|gãy xương|n
ambulance|xe cấp cứu|n
emergency|cấp cứu|n
firstaid|sơ cứu|n
rehab|phục hồi chức năng|n
disability|khuyết tật|n
wellness|sức khỏe tổng thể|n
lifestyle|lối sống|n
habit|thói quen|n
addiction|nghiện|n
smoking|hút thuốc|n
alcohol|rượu|n
drug|ma túy|n
overdose|quá liều|n
sober|tỉnh táo|a
healthy|khỏe mạnh|a
unhealthy|không lành mạnh|a
balanced|cân bằng|a
organic|hữu cơ|a
processed|chế biến|a
sugar|đường|n
salt|muối|n
fat|chất béo|n
fiber|chất xơ|n
hydration|bù nước|n
dehydration|mất nước|n
fatigue|mệt mỏi|n
insomnia|mất ngủ|n
migraine|đau nửa đầu|n
arthritis|viêm khớp|n
stroke|đột quỵ|n
transplant|ghép|n
donor|người hiến|n
organ|cơ quan|n
cell|tế bào|n
gene|gen|n
DNA|ADN|n
chromosome|nhiễm sắc thể|n
hormone|hormone|n
enzyme|enzyme|n
antibody|kháng thể|n
pathogen|mầm bệnh|n
quarantine|cách ly|n
isolation|cô lập|n
immunity|miễn dịch|n
booster|mũi nhắc|n
clinic|phòng khám|n
ward|khoa|n
pharmacy|nhà thuốc|n
pharmacist|dược sĩ|n
surgeon|bác sĩ phẫu thuật|n
pediatric|nhi khoa|a
geriatric|lão khoa|a
dental|nha khoa|a
vision|thị lực|n
hearing|thính lực|n
mobility|khả năng vận động|n
stamina|sức bền|n
strength|sức mạnh|n
flexibility|độ dẻo|n
posture|tư thế|n
`),

  business: parsePack(`
business|kinh doanh|n
company|công ty|n
corporation|tập đoàn|n
enterprise|doanh nghiệp|n
firm|hãng|n
market|thị trường|n
customer|khách hàng|n
client|khách hàng|n
consumer|người tiêu dùng|n
profit|lợi nhuận|n
revenue|doanh thu|n
cost|chi phí|n
price|giá|n
budget|ngân sách|n
finance|tài chính|n
investment|đầu tư|n
investor|nhà đầu tư|n
share|cổ phiếu|n
stock|chứng khoán|n
bond|trái phiếu|n
loan|khoản vay|n
debt|nợ|n
credit|tín dụng|n
bank|ngân hàng|n
interest|lãi suất|n
tax|thuế|n
invoice|hóa đơn|n
payment|thanh toán|n
salary|lương|n
wage|tiền công|n
bonus|thưởng|n
contract|hợp đồng|n
agreement|thỏa thuận|n
deal|giao dịch|n
negotiation|đàm phán|n
meeting|cuộc họp|n
agenda|chương trình nghị sự|n
deadline|hạn chót|n
schedule|lịch trình|n
manager|quản lý|n
employee|nhân viên|n
employer|người sử dụng lao động|n
staff|nhân sự|n
team|đội|n
colleague|đồng nghiệp|n
partner|đối tác|n
supplier|nhà cung cấp|n
vendor|nhà cung cấp|n
retail|bán lẻ|n
wholesale|bán sỉ|n
brand|thương hiệu|n
advertising|quảng cáo|n
marketing|tiếp thị|n
campaign|chiến dịch|n
sales|doanh số|n
promotion|khuyến mãi|n
discount|giảm giá|n
offer|đề nghị|n
product|sản phẩm|n
service|dịch vụ|n
quality|chất lượng|n
quantity|số lượng|n
inventory|tồn kho|n
warehouse|kho|n
logistics|hậu cần|n
shipping|vận chuyển|n
delivery|giao hàng|n
export|xuất khẩu|n
import|nhập khẩu|n
trade|thương mại|n
commerce|thương mại|n
competition|cạnh tranh|n
competitor|đối thủ|n
strategy|chiến lược|n
goal|mục tiêu|n
target|mục tiêu|n
performance|hiệu suất|n
productivity|năng suất|n
efficiency|hiệu quả|n
growth|tăng trưởng|n
expansion|mở rộng|n
merger|sáp nhập|n
acquisition|thâu tóm|n
startup|khởi nghiệp|n
entrepreneur|doanh nhân|n
innovation|đổi mới|n
risk|rủi ro|n
insurance|bảo hiểm|n
asset|tài sản|n
liability|nợ phải trả|n
equity|vốn chủ sở hữu|n
capital|vốn|n
cashflow|dòng tiền|n
balance|số dư|n
audit|kiểm toán|n
report|báo cáo|n
forecast|dự báo|n
analysis|phân tích|n
trend|xu hướng|n
shareholder|cổ đông|n
stakeholder|bên liên quan|n
board|hội đồng|n
director|giám đốc|n
executive|điều hành|n
leadership|lãnh đạo|n
decision|quyết định|n
authority|thẩm quyền|n
responsibility|trách nhiệm|n
compliance|tuân thủ|n
regulation|quy định|n
license|giấy phép|n
patent|bằng sáng chế|n
copyright|bản quyền|n
trademark|nhãn hiệu|n
franchise|nhượng quyền|n
outlet|cửa hàng|n
branch|chi nhánh|n
headquarters|trụ sở|n
office|văn phòng|n
remote|từ xa|a
freelance|tự do|a
outsource|thuê ngoài|v
recruit|tuyển dụng|v
hire|thuê|v
fire|sa thải|v
resign|từ chức|v
retire|nghỉ hưu|v
promote|thăng chức|v
train|đào tạo|v
skill|kỹ năng|n
resume|sơ yếu lý lịch|n
interview|phỏng vấn|n
candidate|ứng viên|n
vacancy|vị trí trống|n
workload|khối lượng công việc|n
overtime|làm thêm giờ|n
shift|ca làm|n
workplace|nơi làm việc|n
culture|văn hóa|n
morale|tinh thần|n
motivation|động lực|n
feedback|phản hồi|n
appraisal|đánh giá|n
kpi|chỉ số KPI|n
benchmark|chuẩn đối sánh|n
margin|biên|n
turnover|doanh thu|n
bankruptcy|phá sản|n
recession|suy thoái|n
inflation|lạm phát|n
currency|tiền tệ|n
exchange|tỷ giá|n
`),

  education: parsePack(`
education|giáo dục|n
school|trường|n
university|đại học|n
college|cao đẳng|n
campus|khuôn viên|n
classroom|lớp học|n
teacher|giáo viên|n
professor|giáo sư|n
student|học sinh|n
pupil|học trò|n
classmate|bạn cùng lớp|n
lesson|bài học|n
lecture|bài giảng|n
course|khóa học|n
subject|môn học|n
curriculum|chương trình học|n
syllabus|đề cương|n
textbook|sách giáo khoa|n
homework|bài tập về nhà|n
assignment|bài tập|n
essay|bài luận|n
exam|kỳ thi|n
test|bài kiểm tra|n
quiz|câu đố|n
grade|điểm|n
score|điểm số|n
pass|đậu|v
fail|trượt|v
graduate|tốt nghiệp|v
degree|bằng cấp|n
diploma|chứng chỉ|n
certificate|chứng nhận|n
scholarship|học bổng|n
tuition|học phí|n
semester|học kỳ|n
term|học kỳ|n
schedule|thời khóa biểu|n
timetable|lịch học|n
library|thư viện|n
lab|phòng thí nghiệm|n
research|nghiên cứu|n
thesis|luận văn|n
dissertation|luận án|n
abstract|tóm tắt|n
citation|trích dẫn|n
reference|tài liệu tham khảo|n
plagiarism|đạo văn|n
deadline|hạn nộp|n
revision|ôn tập|n
review|ôn|v
memorize|ghi nhớ|v
understand|hiểu|v
practice|luyện tập|v
skill|kỹ năng|n
literacy|biết chữ|n
numeracy|tính toán|n
bilingual|song ngữ|a
fluency|độ trôi chảy|n
vocabulary|từ vựng|n
grammar|ngữ pháp|n
pronunciation|phát âm|n
listening|nghe|n
speaking|nói|n
reading|đọc|n
writing|viết|n
comprehension|đọc hiểu|n
critical|phản biện|a
analysis|phân tích|n
argument|lập luận|n
evidence|bằng chứng|n
conclusion|kết luận|n
introduction|mở bài|n
paragraph|đoạn văn|n
sentence|câu|n
word|từ|n
phrase|cụm từ|n
idiom|thành ngữ|n
mentor|cố vấn|n
tutor|gia sư|n
coach|huấn luyện viên|n
peer|bạn đồng trang lứa|n
group|nhóm|n
project|dự án|n
presentation|thuyết trình|n
seminar|hội thảo|n
workshop|workshop|n
conference|hội nghị|n
online|trực tuyến|a
offline|ngoại tuyến|a
distance|từ xa|a
blended|kết hợp|a
assessment|đánh giá|n
feedback|phản hồi|n
rubric|bảng tiêu chí|n
portfolio|hồ sơ năng lực|n
attendance|điểm danh|n
absence|vắng mặt|n
discipline|kỷ luật|n
behavior|hành vi|n
motivation|động lực|n
confidence|tự tin|n
anxiety|lo âu|n
pressure|áp lực|n
achievement|thành tích|n
failure|thất bại|n
progress|tiến bộ|n
improvement|cải thiện|n
goal|mục tiêu|n
habit|thói quen|n
focus|tập trung|n
distraction|sự xao nhãng|n
note|ghi chú|n
outline|dàn ý|n
draft|bản nháp|n
edit|sửa|v
proofread|đọc soát|v
submit|nộp|v
enroll|đăng ký|v
register|đăng ký|v
major|chuyên ngành|n
minor|phụ|n
faculty|khoa|n
department|bộ môn|n
dean|trưởng khoa|n
admission|tuyển sinh|n
application|hồ sơ|n
transcript|bảng điểm|n
alumni|cựu sinh viên|n
dormitory|ký túc xá|n
cafeteria|căng tin|n
club|câu lạc bộ|n
activity|hoạt động|n
extracurricular|ngoại khóa|a
internship|thực tập|n
exchange|trao đổi|n
abroad|nước ngoài|adv
`),

  science: parsePack(`
science|khoa học|n
scientist|nhà khoa học|n
experiment|thí nghiệm|n
hypothesis|giả thuyết|n
theory|lý thuyết|n
law|định luật|n
observation|quan sát|n
measurement|phép đo|n
variable|biến|n
control|đối chứng|n
sample|mẫu|n
result|kết quả|n
conclusion|kết luận|n
evidence|bằng chứng|n
data|dữ liệu|n
analysis|phân tích|n
lab|phòng thí nghiệm|n
equipment|thiết bị|n
microscope|kính hiển vi|n
telescope|kính thiên văn|n
atom|nguyên tử|n
molecule|phân tử|n
particle|hạt|n
electron|electron|n
proton|proton|n
neutron|neutron|n
nucleus|hạt nhân|n
element|nguyên tố|n
compound|hợp chất|n
reaction|phản ứng|n
catalyst|xúc tác|n
solution|dung dịch|n
acid|axit|n
base|bazơ|n
gas|khí|n
liquid|lỏng|n
solid|rắn|n
plasma|plasma|n
energy|năng lượng|n
force|lực|n
mass|khối lượng|n
weight|trọng lượng|n
gravity|trọng lực|n
velocity|vận tốc|n
acceleration|gia tốc|n
friction|ma sát|n
pressure|áp suất|n
temperature|nhiệt độ|n
heat|nhiệt|n
light|ánh sáng|n
sound|âm thanh|n
wave|sóng|n
frequency|tần số|n
amplitude|biên độ|n
spectrum|phổ|n
radiation|bức xạ|n
magnet|nam châm|n
electricity|điện|n
voltage|điện áp|n
current|dòng điện|n
circuit|mạch|n
resistance|điện trở|n
power|công suất|n
battery|pin|n
cell|tế bào|n
tissue|mô|n
organ|cơ quan|n
organism|sinh vật|n
species|loài|n
evolution|tiến hóa|n
mutation|đột biến|n
gene|gen|n
DNA|ADN|n
protein|protein|n
enzyme|enzyme|n
photosynthesis|quang hợp|n
respiration|hô hấp|n
digestion|tiêu hóa|n
circulation|tuần hoàn|n
ecosystem|hệ sinh thái|n
habitat|môi trường sống|n
foodchain|chuỗi thức ăn|n
predator|thú săn mồi|n
prey|con mồi|n
bacteria|vi khuẩn|n
fungus|nấm|n
virus|vi-rút|n
fossil|hóa thạch|n
mineral|khoáng chất|n
rock|đá|n
soil|đất|n
earthquake|động đất|n
volcano|núi lửa|n
erosion|xói mòn|n
sediment|trầm tích|n
climate|khí hậu|n
weather|thời tiết|n
atmosphere|khí quyển|n
orbit|quỹ đạo|n
planet|hành tinh|n
star|sao|n
galaxy|thiên hà|n
universe|vũ trụ|n
space|không gian|n
astronaut|phi hành gia|n
satellite|vệ tinh|n
comet|sao chổi|n
asteroid|tiểu hành tinh|n
gravity|hấp dẫn|n
relativity|tương đối|n
quantum|lượng tử|a
physics|vật lý|n
chemistry|hóa học|n
biology|sinh học|n
geology|địa chất|n
astronomy|thiên văn|n
mathematics|toán học|n
statistics|thống kê|n
probability|xác suất|n
equation|phương trình|n
formula|công thức|n
graph|đồ thị|n
chart|biểu đồ|n
table|bảng|n
unit|đơn vị|n
scale|thang|n
ratio|tỷ số|n
percentage|phần trăm|n
average|trung bình|n
median|trung vị|n
range|khoảng|n
deviation|độ lệch|n
correlation|tương quan|n
causation|nhân quả|n
valid|hợp lệ|a
reliable|tin cậy|a
accurate|chính xác|a
precise|chính xác|a
empirical|thực nghiệm|a
theoretical|lý thuyết|a
`),

  society: parsePack(`
society|xã hội|n
community|cộng đồng|n
culture|văn hóa|n
tradition|truyền thống|n
custom|phong tục|n
identity|bản sắc|n
diversity|đa dạng|n
equality|bình đẳng|n
inequality|bất bình đẳng|n
discrimination|phân biệt|n
prejudice|định kiến|n
stereotype|khuôn mẫu|n
racism|phân biệt chủng tộc|n
sexism|phân biệt giới|n
gender|giới|n
class|tầng lớp|n
poverty|nghèo đói|n
wealth|sự giàu có|n
privilege|đặc quyền|n
rights|quyền|n
freedom|tự do|n
justice|công lý|n
law|luật|n
crime|tội phạm|n
punishment|hình phạt|n
prison|nhà tù|n
police|cảnh sát|n
court|tòa án|n
judge|thẩm phán|n
lawyer|luật sư|n
victim|bỏ phiếu|n
election|bầu cử|n
government|chính phủ|n
citizen|công dân|n
immigrant|người nhập cư|n
migration|di cư|n
refugee|người tị nạn|n
border|biên giới|n
nation|quốc gia|n
globalization|toàn cầu hóa|n
urbanization|đô thị hóa|n
population|dân số|n
generation|thế hệ|n
family|gia đình|n
marriage|hôn nhân|n
divorce|ly hôn|n
childhood|thời thơ ấu|n
youth|thanh niên|n
elderly|người cao tuổi|n
neighbor|hàng xóm|n
friendship|tình bạn|n
relationship|mối quan hệ|n
communication|giao tiếp|n
media|truyền thông|n
newspaper|báo|n
television|truyền hình|n
internet|internet|n
socialmedia|mạng xã hội|n
influencer|người ảnh hưởng|n
advertisement|quảng cáo|n
propaganda|tuyên truyền|n
censorship|kiểm duyệt|n
privacy|riêng tư|n
public|công chúng|n
opinion|ý kiến|n
belief|niềm tin|n
religion|tôn giáo|n
ritual|nghi lễ|n
festival|lễ hội|n
ceremony|lễ|n
heritage|di sản|n
language|ngôn ngữ|n
dialect|phương ngữ|n
accent|giọng|n
literacy|biết chữ|n
education|giáo dục|n
volunteer|tình nguyện|n
charity|từ thiện|n
donation|quyên góp|n
welfare|phúc lợi|n
healthcare|y tế|n
housing|nhà ở|n
homelessness|vô gia cư|n
unemployment|thất nghiệp|n
employment|việc làm|n
protest|biểu tình|n
demonstration|cuộc biểu tình|n
activism|hoạt động xã hội|n
reform|cải cách|n
policy|chính sách|n
regulation|quy định|n
democracy|dân chủ|n
dictatorship|độc tài|n
corruption|tham nhũng|n
transparency|minh bạch|n
accountability|trách nhiệm giải trình|n
participation|sự tham gia|n
inclusion|hòa nhập|n
exclusion|loại trừ|n
integration|hội nhập|n
assimilation|đồng hóa|n
tolerance|khoan dung|n
respect|tôn trọng|n
empathy|đồng cảm|n
solidarity|đoàn kết|n
conflict|xung đột|n
peace|hòa bình|n
violence|bạo lực|n
safety|an toàn|n
security|an ninh|n
threat|mối đe dọa|n
risk|rủi ro|n
trust|lòng tin|n
cooperation|hợp tác|n
competition|cạnh tranh|n
status|địa vị|n
prestige|uy tín|n
norm|chuẩn mực|n
value|giá trị|n
ethic|đạo đức|n
moral|đạo đức|a
fair|công bằng|a
unfair|bất công|a
equal|bình đẳng|a
diverse|đa dạng|a
inclusive|hòa nhập|a
`),

  environment: parsePack(`
climate|khí hậu|n
pollution|ô nhiễm|n
ecosystem|hệ sinh thái|n
habitat|môi trường sống|n
species|loài|n
wildlife|động vật hoang dã|n
forest|rừng|n
ocean|đại dương|n
river|sông|n
soil|đất|n
waste|rác thải|n
recycle|tái chế|v
emission|khí thải|n
carbon|carbon|n
ozone|ozon|n
drought|hạn hán|n
flood|lũ lụt|n
storm|bão|n
temperature|nhiệt độ|n
weather|thời tiết|n
resource|tài nguyên|n
conservation|bảo tồn|n
biodiversity|đa dạng sinh học|n
deforestation|phá rừng|n
sustainable|bền vững|a
renewable|tái tạo được|a
fossil|hóa thạch|n
plastic|nhựa|n
toxic|độc hại|a
contaminate|làm ô nhiễm|v
sewage|nước thải|n
smog|sương khói|n
landfill|bãi rác|n
greenhouse|nhà kính|n
glacier|sông băng|n
desert|sa mạc|n
wetland|đất ngập nước|n
coral|san hô|n
extinct|tuyệt chủng|a
endangered|nguy cấp|a
organic|hữu cơ|a
pesticide|thuốc trừ sâu|n
fertilizer|phân bón|n
erosion|xói mòn|n
atmosphere|khí quyển|n
oxygen|oxy|n
nitrogen|nitơ|n
methane|metan|n
rainfall|lượng mưa|n
humidity|độ ẩm|n
vegetation|thảm thực vật|n
canopy|tán cây|n
mangrove|rừng ngập mặn|n
reef|rạn|n
tundra|đồng lãnh nguyên|n
pollutant|chất gây ô nhiễm|n
restore|khôi phục|v
preserve|bảo tồn|v
protect|bảo vệ|v
harvest|thu hoạch|v
cultivate|canh tác|v
irrigation|tưới tiêu|n
groundwater|nước ngầm|n
freshwater|nước ngọt|n
salinity|độ mặn|n
overfishing|đánh bắt quá mức|n
poaching|săn trộm|n
logging|khai thác gỗ|n
mining|khai thác mỏ|n
turbine|tua bin|n
solar|mặt trời|a
hydroelectric|thủy điện|a
geothermal|địa nhiệt|a
biofuel|nhiên liệu sinh học|n
efficiency|hiệu suất|n
consumption|tiêu thụ|n
scarcity|khan hiếm|n
fragile|mong manh|a
resilient|kiên cường|a
vulnerable|dễ tổn thương|a
mitigate|giảm nhẹ|v
adapt|thích ứng|v
offset|bù đắp|v
capture|bắt giữ|v
monitor|giám sát|v
regulate|điều tiết|v
ecology|sinh thái học|n
biosphere|sinh quyển|n
microplastic|vi nhựa|n
photosynthesis|quang hợp|n
algae|tảo|n
plankton|sinh vật phù du|n
predator|thú săn mồi|n
prey|con mồi|n
migration|di cư|n
breeding|sinh sản|n
population|quần thể|n
balance|cân bằng|n
cycle|chu trình|n
nutrient|dinh dưỡng|n
degrade|suy thoái|v
pollute|gây ô nhiễm|v
emit|thải ra|v
absorb|hấp thụ|v
filter|lọc|v
purify|tinh lọc|v
clean|sạch|a
dirty|bẩn|a
green|xanh|a
scarce|khan hiếm|a
plentiful|dồi dào|a
compost|phân compost|n
footprint|dấu chân carbon|n
acid|axit|n
rain|mưa|n
flooding|ngập lụt|n
wildfire|cháy rừng|n
heatwave|đợt nắng nóng|n
cyclone|bão xoáy|n
tsunami|sóng thần|n
landslide|sạt lở|n
contamination|ô nhiễm|n
seawater|nước biển|n
coastline|đường bờ biển|n
deforestation|phá rừng|n
reforestation|trồng lại rừng|n
afforestation|trồng rừng mới|n
biodiversity|đa dạng sinh học|n
habitat|sinh cảnh|n
sanctuary|khu bảo tồn|n
reserve|khu dự trữ|n
ranger|kiểm lâm|n
activist|nhà hoạt động|n
campaign|chiến dịch|n
treaty|hiệp ước|n
protocol|nghị định thư|n
summit|hội nghị|n
stewardship|quản lý bền vững|n
`),

  daily: parsePack(`
morning|buổi sáng|n
afternoon|buổi chiều|n
evening|buổi tối|n
night|đêm|n
breakfast|bữa sáng|n
lunch|bữa trưa|n
dinner|bữa tối|n
meal|bữa ăn|n
kitchen|nhà bếp|n
bedroom|phòng ngủ|n
bathroom|phòng tắm|n
livingroom|phòng khách|n
house|nhà|n
apartment|căn hộ|n
furniture|đồ nội thất|n
chair|ghế|n
table|bàn|n
bed|giường|n
sofa|ghế sofa|n
lamp|đèn|n
window|cửa sổ|n
door|cửa|n
key|chìa khóa|n
clock|đồng hồ|n
mirror|gương|n
clothes|quần áo|n
shirt|áo sơ mi|n
pants|quần|n
dress|váy|n
shoes|giày|n
jacket|áo khoác|n
hat|mũ|n
bag|túi|n
wallet|ví|n
money|tiền|n
shop|cửa hàng|n
market|chợ|n
supermarket|siêu thị|n
price|giá|n
cheap|rẻ|a
expensive|đắt|a
receipt|hóa đơn|n
cash|tiền mặt|n
card|thẻ|n
bus|xe buýt|n
train|tàu|n
taxi|taxi|n
car|xe hơi|n
bike|xe đạp|n
ticket|vé|n
station|nhà ga|n
airport|sân bay|n
road|đường|n
traffic|giao thông|n
map|bản đồ|n
weather|thời tiết|n
sunny|nắng|a
rainy|mưa|a
cloudy|nhiều mây|a
windy|gió|a
hot|nóng|a
cold|lạnh|a
warm|ấm|a
cool|mát|a
family|gia đình|n
parent|cha mẹ|n
mother|mẹ|n
father|bố|n
sister|chị em gái|n
brother|anh em trai|n
friend|bạn|n
neighbor|hàng xóm|n
hobby|sở thích|n
sport|thể thao|n
music|âm nhạc|n
movie|phim|n
book|sách|n
game|trò chơi|n
phone|điện thoại|n
computer|máy tính|n
internet|internet|n
message|tin nhắn|n
call|cuộc gọi|n
photo|ảnh|n
camera|máy ảnh|n
food|thức ăn|n
water|nước|n
bread|bánh mì|n
rice|cơm|n
meat|thịt|n
fish|cá|n
vegetable|rau|n
fruit|trái cây|n
milk|sữa|n
coffee|cà phê|n
tea|trà|n
sugar|đường|n
salt|muối|n
restaurant|nhà hàng|n
menu|thực đơn|n
order|gọi món|v
bill|hóa đơn|n
tip|tiền tip|n
hotel|khách sạn|n
room|phòng|n
guest|khách|n
reservation|đặt chỗ|n
passport|hộ chiếu|n
luggage|hành lý|n
holiday|kỳ nghỉ|n
trip|chuyến đi|n
beach|bãi biển|n
mountain|núi|n
park|công viên|n
museum|bảo tàng|n
ticket|vé|n
guide|hướng dẫn viên|n
map|bản đồ|n
photo|ảnh|n
souvenir|quà lưu niệm|n
happy|vui|a
sad|buồn|a
angry|tức|a
tired|mệt|a
busy|bận|a
free|rảnh|a
early|sớm|a
late|muộn|a
ready|sẵn sàng|a
clean|sạch|a
dirty|bẩn|a
quiet|yên tĩnh|a
noisy|ồn ào|a
safe|an toàn|a
dangerous|nguy hiểm|a
easy|dễ|a
difficult|khó|a
important|quan trọng|a
interesting|thú vị|a
boring|nhàm chán|a
beautiful|đẹp|a
ugly|xấu|a
big|to|a
small|nhỏ|a
new|mới|a
old|cũ|a
young|trẻ|a
fast|nhanh|a
slow|chậm|a
`),
}

// Expand packs if short by blending with general
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
  return merged
}

for (const k of Object.keys(PACKS)) {
  PACKS[k] = ensurePackSize(PACKS[k], 120)
}

/** Map deck name keywords → pack keys (ordered preference) */
function packsForDeck(groupId, deckName) {
  const n = deckName.toLowerCase()
  const picks = []

  const add = (...ids) => {
    for (const id of ids) if (PACKS[id] && !picks.includes(id)) picks.push(id)
  }

  // Group defaults
  if (groupId === 'toeic') add('business', 'general')
  if (groupId === 'oxford') add('daily', 'general')
  if (groupId === 'academic' || groupId === 'sat' || groupId === 'toefl') add('science', 'education', 'general')
  if (groupId === 'ielts') add('society', 'general')

  // Topic keywords
  if (/môi trường|sinh thái|khí hậu|năng lượng|tài nguyên|cực đoan/.test(n)) add('environment', 'science')
  if (/công nghệ|máy tính|cntt|số|internet|đổi mới|ai|automation/.test(n)) add('tech', 'science')
  if (/sức khỏe|y tế|phòng bệnh|y sinh|dinh dưỡng|ẩm thực/.test(n)) add('health', 'daily')
  if (/giáo dục|học|trường|campus|bài giảng|ghi chú|đào tạo|lớp|tuyển sinh|học vụ/.test(n)) add('education', 'general')
  if (/kinh tế|kinh doanh|thương mại|tài chính|ngân hàng|marketing|bán|hợp đồng|logistics|văn phòng|họp|nhân sự|lương|xuất|nhập|bảo hiểm|kế toán|dự án|chuỗi|email|đặt hàng|bán lẻ|cửa hàng|pr|quảng cáo/.test(n)) add('business', 'general')
  if (/xã hội|văn hóa|cộng đồng|giới|thế hệ|gia đình|bạn|thanh|cao tuổi|bình đẳng|toàn cầu/.test(n)) add('society', 'daily')
  if (/khoa học|vật lý|hóa|sinh|toán|thống kê|dữ liệu|nghiên cứu|phương pháp|thí nghiệm|thiên văn|địa chất/.test(n)) add('science', 'education')
  if (/đời sống|hằng ngày|mua sắm|thời trang|nhà cửa|đồ đạc|thú cưng|lễ hội|thời tiết|du lịch|di chuyển|giao thông|khách sạn|nhà hàng|đồ ăn|sở thích|cảm xúc/.test(n)) add('daily', 'society')
  if (/pháp|luật|tội|hợp đồng|tuân thủ|an toàn|khẩn cấp/.test(n)) add('society', 'business')
  if (/lịch sử|di sản|văn minh|khảo cổ|nghệ thuật|văn học|âm nhạc|triết|chính trị/.test(n)) add('society', 'education')
  if (/đô thị|kiến trúc|nhà|văn phòng|bất động/.test(n)) add('daily', 'business')
  if (/thể thao|vận động|fitness/.test(n)) add('health', 'daily')
  if (/truyền thông|media|quảng cáo|ảnh hưởng/.test(n)) add('society', 'business')
  if (/nông nghiệp|thực phẩm|lương thực/.test(n)) add('environment', 'health')
  if (/viết|đọc|nói|nghe|ngữ pháp|lập luận|từ vựng|essay|passage|speaking|writing|listening/.test(n)) add('education', 'general')
  if (/toán|đại số|hình học|xác suất|số liệu/.test(n)) add('science', 'education')
  if (/tâm lý|hành vi|cảm xúc|tính cách/.test(n)) add('health', 'society')
  if (/ngôn ngữ|giao tiếp|ngữ/.test(n)) add('education', 'society')
  if (/không gian|vũ trụ|khoa học/.test(n)) add('science', 'tech')
  if (/việc làm|công việc|sự nghiệp|nhân sự|tuyển/.test(n)) add('business', 'education')

  add('general')
  return picks.length ? picks : ['general']
}

function pick100(groupId, deckName) {
  const packIds = packsForDeck(groupId, deckName)
  const pool = []
  const seen = new Set()
  for (const id of packIds) {
    for (const item of PACKS[id] || []) {
      const k = item.w.toLowerCase()
      if (seen.has(k)) continue
      seen.add(k)
      pool.push(item)
    }
  }
  // pad from general if needed
  for (const item of PACKS.general) {
    if (pool.length >= 200) break
    const k = item.w.toLowerCase()
    if (seen.has(k)) continue
    seen.add(k)
    pool.push(item)
  }

  const rotated = rotate(pool, hash(`${groupId}::${deckName}`))
  const picked = rotated.slice(0, 100)
  if (picked.length < 100) {
    // last resort: duplicate with numeric suffix is NOT allowed for real vocab
    // pad more from rotated general
    const more = rotate(PACKS.general, hash(deckName + 'pad'))
    for (const item of more) {
      if (picked.length >= 100) break
      if (picked.some(p => p.w.toLowerCase() === item.w.toLowerCase())) continue
      picked.push(item)
    }
  }
  return picked.slice(0, 100)
}

// Load deck names
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

// Validate singles only + counts
let bad = 0
let total = 0
for (const [g, cards] of Object.entries(seed)) {
  for (const c of cards) {
    total++
    if (/\s/.test(c.phrase)) bad++
  }
  const byDeck = {}
  for (const c of cards) byDeck[c.deckName] = (byDeck[c.deckName] || 0) + 1
  const short = Object.entries(byDeck).filter(([, n]) => n < 100)
  if (short.length) console.warn(g, 'short decks', short.slice(0, 5))
}

console.log('total cards', total, 'multiword', bad)
console.log(JSON.stringify(report, null, 2).slice(0, 800))

const outDir = path.join(root, 'apps/web/src/features/vocab/seedData')
fs.mkdirSync(outDir, { recursive: true })
const jsonPath = path.join(outDir, 'preset-singles.json')
fs.writeFileSync(jsonPath, JSON.stringify(seed), 'utf8')
console.log('wrote', jsonPath, (fs.statSync(jsonPath).size / 1024 / 1024).toFixed(2), 'MB')

// Generate TS wrapper that merges legacy multi-word seed optional
const ts = `/** Auto-generated single-word preset seed — 100 singles per deck. Run: node scripts/gen-preset-single-100.mjs */
import type { PresetGroupId } from '../vocabConstants'
import singles from './preset-singles.json'

export type PresetSeedCard = {
  deckName: string
  phrase: string
  meaning: string
  example?: string
  pos?: string
  ipaUS?: string
  ipaUK?: string
}

/** Bump when single-word seed expands. */
export const PRESET_VOCAB_CARDS_VERSION = 2

export const PRESET_VOCAB_SEED: Record<PresetGroupId, PresetSeedCard[]> = singles as Record<
  PresetGroupId,
  PresetSeedCard[]
>
`
fs.writeFileSync(path.join(outDir, 'presetVocabCards.ts'), ts, 'utf8')
console.log('wrote presetVocabCards.ts')
