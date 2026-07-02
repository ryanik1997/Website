"""Generate exam.json for IELTS Listening Cam 9 + Cam 20 Test 1."""
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

MC3 = lambda labels: [{"id": k, "label": v} for k, v in labels]
LETTER_OPTS = lambda letters: [{"id": c, "label": c} for c in letters]


def gap(n, prompt, answer, explanation, word_limit=3, **extra):
    return {
        "number": n,
        "type": "gap-fill",
        "prompt": prompt,
        "options": [],
        "answer": answer.lower(),
        "explanation": explanation,
        "wordLimit": word_limit,
        **extra,
    }


def mc(n, prompt, options, answer, explanation):
    return {
        "number": n,
        "type": "multiple-choice",
        "prompt": prompt,
        "options": MC3(options),
        "answer": answer.upper() if len(answer) == 1 else answer.lower(),
        "explanation": explanation,
    }


def match(n, prompt, option_letters, answer, explanation, labeled=None):
    options = MC3(labeled) if labeled else LETTER_OPTS(option_letters)
    return {
        "number": n,
        "type": "matching",
        "prompt": prompt,
        "options": options,
        "answer": answer.upper(),
        "explanation": explanation,
    }


def part(num, start, end, instruction, questions, **extra):
    return {
        "partNumber": num,
        "rangeLabel": f"Questions {start}–{end}",
        "instruction": instruction,
        "audioFile": "listening.mp3",
        **extra,
        "questions": questions,
    }


def build_cam9():
    fitness_opts = [
        ("A", "You need to reserve a place."),
        ("B", "It is free to account holders."),
        ("C", "You get advice on how to improve your health."),
        ("D", "It takes place in a special clinic."),
        ("E", "It is cheaper this month."),
    ]
    choose_two_prompt = (
        "Which TWO pieces of information does the speaker give about the fitness test?"
    )

    return {
        "version": 1,
        "title": "IELTS Listening — Cambridge 9 Test 1",
        "durationMinutes": 30,
        "bandHint": "IELTS · Cambridge 9 · 4 parts · 40 câu",
        "examType": "ielts",
        "examMode": "practice",
        "parts": [
            part(
                1, 1, 10,
                "Complete the notes below. Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.",
                [
                    gap(1, "Type of work:", "answering phone", "Trả lời điện thoại.", 3,
                         gapLead="Type of work:"),
                    gap(2, "Branch:", "hillsdunne road", "Chi nhánh Hillsdunne Road.", 3,
                         noteBefore="Number of hours per week: 12 hours\nWould need work permit",
                         gapLead="Work in the", gapTrail="branch"),
                    gap(3, "Nearest bus stop:", "library", "Bến xe cạnh thư viện.", 1,
                         gapLead="Nearest bus stop: next to"),
                    gap(4, "Pay per hour:", "4.45", "£4.45/giờ.", 1,
                         gapLead="Pay £", gapTrail="an hour"),
                    gap(5, "Extra pay on:", "national holidays", "Ngày lễ.", 2,
                         noteBefore="Extra benefits:\na free dinner",
                         gapLead="extra pay when you work on"),
                    gap(6, "Transport home when:", "after 11", "Sau 11 giờ.", 3,
                         gapLead="transport home when you work"),
                    gap(7, "Quality required:", "clear voice", "Giọng rõ.", 2,
                         gapLead="Qualities required:"),
                    gap(8, "Ability to:", "think quickly", "Suy nghĩ nhanh.", 2,
                         gapLead="ability to"),
                    gap(9, "Interview date:", "22 october", "22 tháng 10.", 2,
                         gapLead="Interview arranged for: Thursday", gapTrail="at 6 pm"),
                    gap(10, "Ask for:", "manuja", "Hỏi Samira Manuja.", 1,
                         noteBefore="Bring the names of two referees",
                         gapLead="Ask for:"),
                ],
                passageTitle="JOB INQUIRY",
                audioIntro="Example: Work at: a restaurant",
            ),
            part(
                2, 11, 20,
                "Questions 11–16: Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer. "
                "Questions 17–18: Choose the correct letter, A, B or C. "
                "Questions 19–20: Choose TWO letters, A–E.",
                [
                    gap(11, "Type of store:", "branch", "Chi nhánh mới.", 1,
                         gapLead="a new", gapTrail="of an international sports goods company"),
                    gap(12, "Location:", "west", "Phía tây Bradcaster.", 1,
                         gapLead="located in the shopping centre to the", gapTrail="of Bradcaster"),
                    gap(13, "Floors 1–3:", "clothing", "Quần áo thể thao.", 1,
                         gapLead="has sports", gapTrail="and equipment on floors 1–3"),
                    gap(14, "Delivery time:", "10", "Giao trong 10 ngày.", 1,
                         gapLead="can get you any item within", gapTrail="days"),
                    gap(15, "Specialises in:", "running", "Thiết bị chạy bộ.", 1,
                         gapLead="shop specialises in equipment for"),
                    gap(16, "Special section:", "bags", "Khu bán túi.", 1,
                         gapLead="has a special section which just sells"),
                    mc(17, "A champion athlete will be in the shop", [
                        ("A", "on Saturday morning only"),
                        ("B", "all day Saturday"),
                        ("C", "for the whole weekend"),
                    ], "A", "Sáng thứ Bảy."),
                    mc(18, "The first person to answer 20 quiz questions correctly will win", [
                        ("A", "gym membership"),
                        ("B", "a video"),
                        ("C", "a calendar"),
                    ], "A", "Thẻ phòng gym."),
                    match(19, choose_two_prompt, list("ABCDE"), "A/E", "Đặt chỗ (A) hoặc giá ưu đãi (E).", fitness_opts),
                    match(20, choose_two_prompt, list("ABCDE"), "A/E", "Cặp đáp án 19–20: A và E.", fitness_opts),
                ],
                passageTitle="SPORTS WORLD",
            ),
            part(
                3, 21, 30,
                "Choose the correct letter, A, B or C.",
                [
                    mc(21, "One reason why Spiros felt happy about his marketing presentation was that", [
                        ("A", "he was not nervous"),
                        ("B", "his style was good"),
                        ("C", "the presentation was the best in his group"),
                    ], "B", "Phong cách tốt."),
                    mc(22, "What surprised Hiroko about the other students' presentations?", [
                        ("A", "Their presentations were not interesting"),
                        ("B", "They found their presentations stressful"),
                        ("C", "They didn't look at the audience enough"),
                    ], "C", "Ít nhìn khán giả."),
                    mc(23, "After she gave her presentation, Hiroko felt", [
                        ("A", "delighted"),
                        ("B", "dissatisfied"),
                        ("C", "embarrassed"),
                    ], "B", "Không hài lòng."),
                    mc(24, "How does Spiros feel about his performance in tutorials?", [
                        ("A", "not very happy"),
                        ("B", "really pleased"),
                        ("C", "fairly confident"),
                    ], "A", "Không vui lắm."),
                    mc(25, "Why can the other students participate so easily in discussions?", [
                        ("A", "They are polite to each other"),
                        ("B", "They agree to take turns in speaking"),
                        ("C", "They know each other well"),
                    ], "C", "Quen nhau."),
                    mc(26, "Why is Hiroko feeling more positive about tutorials now?", [
                        ("A", "She finds the other students' opinions more interesting"),
                        ("B", "She is making more of a contribution"),
                        ("C", "The tutor includes her in the discussion"),
                    ], "B", "Đóng góp nhiều hơn."),
                    mc(27, "To help her understand lectures, Hiroko", [
                        ("A", "consulted reference materials"),
                        ("B", "had extra tutorials with her lecturers"),
                        ("C", "borrowed lecture notes from other students"),
                    ], "A", "Tra tài liệu tham khảo."),
                    mc(28, "What does Spiros think of his reading skills?", [
                        ("A", "He reads faster than he used to"),
                        ("B", "It still takes him a long time to read"),
                        ("C", "He tends to struggle with new vocabulary"),
                    ], "B", "Vẫn đọc chậm."),
                    mc(29, "What is Hiroko's subject area?", [
                        ("A", "environmental studies"),
                        ("B", "health education"),
                        ("C", "engineering"),
                    ], "C", "Kỹ thuật."),
                    mc(30, "Hiroko thinks that in the reading class the students should", [
                        ("A", "learn more vocabulary"),
                        ("B", "read more in their own subject areas"),
                        ("C", "develop better reading strategies"),
                    ], "B", "Đọc thêm trong chuyên ngành."),
                ],
            ),
            part(
                4, 31, 40,
                "Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.",
                [
                    gap(31, "Areas where … can change quickly:", "tide", "Thủy triều.", 1,
                         gapLead="Common in areas where the", gapTrail="can change quickly"),
                    gap(32, "Parasites affect:", "hearing", "Thính giác.", 1,
                         noteBefore="Several other theories:",
                         context="Parasites",
                         gapLead="e.g. some parasites can affect marine animals'", gapTrail=", which they depend on for navigation"),
                    gap(33, "Toxins from:", "plants animals", "Độc tố từ thực vật/động vật.", 2,
                         context="Toxins",
                         gapLead="Poisons from", gapTrail="or ……….. are commonly consumed by whales"),
                    gap(34, "Accidental strandings:", "feeding", "Không phải lúc kiếm ăn.", 1,
                         context="Accidental Strandings",
                         gapLead="Unlikely because the majority of animals were not", gapTrail="when they stranded"),
                    gap(35, "Noise from military tests:", "noise", "Tiếng ồn thử nghiệm quân sự.", 1,
                         context="Human Activity",
                         gapLead="•", gapTrail="from military tests are linked to some recent strandings"),
                    gap(36, "Whales were all:", "healthy", "Khỏe mạnh.", 1,
                         gapLead="The Bahamas (2000) — whales were all"),
                    gap(37, "Were not in a:", "group", "Không ở nhóm.", 1,
                         gapLead="were not in a"),
                    gap(38, "Most … species:", "social", "Loài mang tính xã hội.", 1,
                         context="Group Behaviour",
                         gapLead="More strandings in the most", gapTrail="species of whales"),
                    gap(39, "Only the … was ill:", "leader", "Chỉ con đầu đàn bệnh.", 1,
                         gapLead="1994 dolphin stranding — only the", gapTrail="was ill"),
                    gap(40, "Further reading topic:", "network", "Mạng lưới cứu hộ.", 1,
                         context="Further Reading",
                         gapLead="Marine Mammals Ashore (Connors) — gives information about stranding"),
                ],
                passageTitle="Mass Strandings of Whales and Dolphins",
                audioIntro="Mass strandings: situations where groups of whales, dolphins, etc. swim onto the beach and die.",
            ),
        ],
    }


def build_cam20():
    mc_abc = lambda n, prompt, a, b, c, ans, expl: mc(
        n, prompt, [("A", a), ("B", b), ("C", c)], ans, expl
    )
    match_ae = lambda n, prompt, ans, expl: match(n, prompt, list("ABCDE"), ans, expl)

    return {
        "version": 1,
        "title": "IELTS Listening — Cambridge 20 Test 1",
        "durationMinutes": 30,
        "bandHint": "IELTS · Cambridge 20 · 4 parts · 40 câu",
        "examType": "ielts",
        "examMode": "practice",
        "parts": [
            part(
                1, 1, 10,
                "Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer.",
                [
                    gap(1, "The Junction — good for people keen on:", "fish", "Món cá.", 1),
                    gap(2, "The … is a good place for a drink (The Junction):", "roof", "Sân thượng/roof.", 1),
                    gap(3, "Paloma — type of food:", "spanish", "Ẩm thực Tây Ban Nha.", 1),
                    gap(4, "Paloma — limited section on the menu:", "vegetarian", "Món chay.", 1),
                    gap(5, "Name of restaurant at top of a hotel:", "audley", "The Audley.", 1),
                    gap(6, "The Audley — located at the top of a:", "hotel", "Khách sạn.", 1),
                    gap(7, "The Audley — all the … are very good:", "reviews", "Đánh giá tốt.", 1),
                    gap(8, "The Audley — only uses … ingredients:", "local", "Nguyên liệu địa phương.", 1),
                    gap(9, "Set lunch cost per person:", "30", "£30.", 1),
                    gap(10, "Proportions probably … size:", "average", "Khẩu phần trung bình.", 1),
                ],
                passageTitle="Restaurant recommendations",
            ),
            part(
                2, 11, 20,
                "Questions 11–16: Choose the correct letter, A, B or C. "
                "Questions 17–18 and 19–20: Choose TWO letters, A–E.",
                [
                    mc_abc(11, "Heather says pottery differs from other art forms because", "it lasts longer in the ground", "it is practised by more people", "it can be repaired more easily", "A", "Gốm bền trong đất."),
                    mc_abc(12, "Archaeologists identify ancient pottery from", "the clay it was made with", "the marks that are on it", "the basic shape of it", "B", "Vết/mark trên đồ gốm."),
                    mc_abc(13, "Some people join Heather's class because they want to", "create something that looks old", "find something they are good at", "make something that will outlive them", "C", "Tạo vật bền với thời gian."),
                    mc_abc(14, "What does Heather value most about being a potter?", "Its calming effect", "Its messy nature", "Its physical benefits", "A", "Tính thư giãn."),
                    mc_abc(15, "Most visitors to Edelman Pottery", "bring friends to join courses", "have never made a pot before", "try to learn techniques too quickly", "B", "Chưa từng làm gốm."),
                    mc_abc(16, "Heather reminds visitors they should", "put on their aprons", "change their clothes", "take off their jewellery", "C", "Tháo trang sức."),
                    match_ae(17, "Which TWO things does Heather explain about kilns? (17)", "A/E", "Chức năng lò (A) hoặc thay thế (E)."),
                    match_ae(18, "Which TWO things does Heather explain about kilns? (18)", "A/E", "Cặp đáp án 17–18: A và E."),
                    match_ae(19, "Which TWO points does Heather make about a potter's tools? (19)", "C/E", "Dụng cụ thiết yếu (C) hoặc dùng chung (E)."),
                    match_ae(20, "Which TWO points does Heather make about a potter's tools? (20)", "C/E", "Cặp đáp án 19–20: C và E."),
                ],
                passageTitle="Edelman Pottery — visitor talk",
            ),
            part(
                3, 21, 30,
                "Questions 21–26: Choose TWO letters, A–E. Questions 27–30: Choose A, B or C.",
                [
                    match_ae(21, "TWO causes of increased loneliness (21)", "C/E", "Thiết kế đô thị (C) / lực lượng di động (E)."),
                    match_ae(22, "TWO causes of increased loneliness (22)", "C/E", "Cặp 21–22: C và E."),
                    match_ae(23, "TWO health risks with solid evidence (23)", "A/C", "Miễn dịch (A) / ung thư (C)."),
                    match_ae(24, "TWO health risks with solid evidence (24)", "A/C", "Cặp 23–24: A và C."),
                    match_ae(25, "TWO opinions on evolutionary theory (25)", "A/B", "Ít thực tiễn (A) / cần nghiên cứu (B)."),
                    match_ae(26, "TWO opinions on evolutionary theory (26)", "A/B", "Cặp 25–26: A và B."),
                    mc_abc(27, "When comparing loneliness to depression, the students", "doubt a medical cure for loneliness", "say the link is overstated", "feel loneliness is not taken seriously", "A", "Nghi ngờ có thuốc chữa cô đơn."),
                    mc_abc(28, "Why start the presentation with their own experience?", "to explain how difficult loneliness can be", "to highlight a situation students recognise", "to emphasise loneliness is more common for men", "B", "Tình huống quen thuộc."),
                    mc_abc(29, "Talking to strangers helps because it", "creates a sense of belonging", "builds self-confidence", "makes people feel more positive", "A", "Cảm giác thuộc về."),
                    mc_abc(30, "They find it hard to understand why solitude is considered", "similar to loneliness", "necessary for mental health", "an enjoyable experience", "C", "Trải nghiệm thú vị."),
                ],
                passageTitle="Loneliness and mental health — student presentation",
            ),
            part(
                4, 31, 40,
                "Complete the notes below. Write ONE WORD ONLY for each answer.",
                [
                    gap(31, "Pollution from … on the river bank:", "factories", "Nhà máy.", 1),
                    gap(32, "River Thames declared biologically …", "dead", "Sông 'chết'.", 1),
                    gap(33, "A … has been seen in the Thames:", "whale", "Cá voi.", 1),
                    gap(34, "Warehouses converted to restaurants and …", "apartments", "Căn hộ.", 1),
                    gap(35, "Los Angeles — build a riverside …", "park", "Công viên.", 1),
                    gap(36, "Display … projects:", "art", "Dự án nghệ thuật.", 1),
                    gap(37, "In Paris, … created on river sides each summer:", "beaches", "Bãi biển nhân tạo.", 1),
                    gap(38, "Over 2 billion passengers travel by …", "ferry", "Phà.", 1),
                    gap(39, "Goods by barges and electric …", "bikes", "Xe đạp điện.", 1),
                    gap(40, "In the future, goods by …", "drone", "Drone.", 1),
                ],
                passageTitle="Reclaiming urban rivers",
            ),
        ],
    }


def write_bundle(folder_name: str, audio_name: str, exam: dict):
    out_dir = ROOT / "Tainguyen" / "IELTS" / folder_name
    out_dir.mkdir(parents=True, exist_ok=True)
    audio_src = out_dir / audio_name
    if audio_src.exists():
        shutil.copy2(audio_src, out_dir / "listening.mp3")
    (out_dir / "exam.json").write_text(
        json.dumps(exam, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    q = sum(len(p["questions"]) for p in exam["parts"])
    print(f"Wrote {out_dir / 'exam.json'} — {q} questions")


def main():
    write_bundle("Listening IELTS_Test1_Cam9", "AudioTest1_Cam9.mp3", build_cam9())
    write_bundle("Listening IELTS_Test1_Cam20", "AudioTest1_Cam20.mp3", build_cam20())


if __name__ == "__main__":
    main()