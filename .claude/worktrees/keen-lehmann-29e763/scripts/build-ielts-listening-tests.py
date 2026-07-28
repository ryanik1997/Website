"""Generate exam.json for IELTS Listening Cam 9 + Cam 20 Test 1.

Cam 9 Test 2+ dùng bundle pipeline (meta.json + exam_partN.json):
  pnpm ielts:bundle "IELTS/Listening IELTS_Test2_Cam9"
  pnpm build:catalog
"""
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


def match(n, prompt, option_letters, answer, explanation, labeled=None, **extra):
    options = MC3(labeled) if labeled else LETTER_OPTS(option_letters)
    return {
        "number": n,
        "type": "matching",
        "prompt": prompt,
        "options": options,
        "answer": answer.upper(),
        "explanation": explanation,
        **extra,
    }


def mc(n, prompt, options, answer, explanation, **extra):
    return {
        "number": n,
        "type": "multiple-choice",
        "prompt": prompt,
        "options": MC3(options),
        "answer": answer.upper() if len(answer) == 1 else answer.lower(),
        "explanation": explanation,
        **extra,
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


def np_static(text):
    return {"type": "static", "text": text}


def np_section(text):
    return {"type": "section", "text": text}


def np_gap(number):
    return {"type": "gap", "number": number}


def tbl_static(text):
    return {"type": "static", "text": text}


def tbl_gap(number):
    return {"type": "gap", "number": number}


def tbl_break():
    return {"type": "break"}


CAM20_P1_TABLE = {
    "headers": [
        "Name of restaurants",
        "Location",
        "Reason for recommendation",
        "Other comments",
    ],
    "rows": [
        {
            "cells": [
                [tbl_static("The Junction")],
                [tbl_static("Greyston Street, near the station")],
                [
                    tbl_static("Good for people who are especially keen on "),
                    tbl_gap(1),
                ],
                [
                    tbl_static("Quite expensive"),
                    tbl_break(),
                    tbl_static("The "),
                    tbl_gap(2),
                    tbl_static(" is a good place for a drink"),
                ],
            ],
        },
        {
            "cells": [
                [tbl_static("Paloma")],
                [tbl_static("In Bow Street next to the cinema")],
                [
                    tbl_gap(3),
                    tbl_static(" food, good for sharing"),
                ],
                [
                    tbl_static("Staff are very friendly"),
                    tbl_break(),
                    tbl_static("Need to pay £50 deposit"),
                    tbl_break(),
                    tbl_static("A limited selection of "),
                    tbl_gap(4),
                    tbl_static(" food on the menu"),
                ],
            ],
        },
        {
            "cells": [
                [
                    tbl_static("The "),
                    tbl_gap(5),
                ],
                [
                    tbl_static("At the top of a "),
                    tbl_gap(6),
                ],
                [
                    tbl_static("A famous chef"),
                    tbl_break(),
                    tbl_static("All the "),
                    tbl_gap(7),
                    tbl_static(" are very good"),
                    tbl_break(),
                    tbl_static("Only uses "),
                    tbl_gap(8),
                    tbl_static(" ingredients"),
                ],
                [
                    tbl_static("Set lunch costs £"),
                    tbl_gap(9),
                    tbl_static(" per person"),
                    tbl_break(),
                    tbl_static("Portions probably of "),
                    tbl_gap(10),
                    tbl_static(" size"),
                ],
            ],
        },
    ],
}


CAM9_P1_NOTE = [
    np_static("Example: Work at: a restaurant"),
    np_gap(1),
    np_static("Number of hours per week: 12 hours"),
    np_static("Would need work permit"),
    np_gap(2),
    np_gap(3),
    np_gap(4),
    np_section("Extra benefits"),
    np_static("a free dinner"),
    np_gap(5),
    np_gap(6),
    np_section("Qualities required"),
    np_gap(7),
    np_gap(8),
    np_gap(9),
    np_static("Bring the names of two referees"),
    np_gap(10),
]

CAM9_P2_NOTE = [np_gap(n) for n in range(11, 17)]

CAM9_P4_NOTE = [
    np_static("Mass strandings: situations where groups of whales, dolphins, etc. swim onto the beach and die."),
    np_gap(31),
    np_static("Several other theories:"),
    np_section("Parasites"),
    np_gap(32),
    np_section("Toxins"),
    np_gap(33),
    np_static("e.g. Cape Cod (1988) — whales were killed by saxitoxin"),
    np_section("Accidental Strandings"),
    np_static("Animals may follow prey ashore, e.g. Thurston (1995)"),
    np_gap(34),
    np_section("Human Activity"),
    np_gap(35),
    np_static("The Bahamas (2000) military sonar was unusual because the whales"),
    np_gap(36),
    np_gap(37),
    np_section("Group Behaviour"),
    np_gap(38),
    np_gap(39),
    np_section("Further Reading"),
    np_gap(40),
]

CAM20_P1_NOTE = [
    np_section("The Junction"),
    np_static("Greyston Street, near the station"),
    np_static("Good for people who are especially keen on"),
    np_gap(1),
    np_static("Quite expensive"),
    np_gap(2),
    np_section("Paloma"),
    np_static("In Bow Street next to the cinema"),
    np_gap(3),
    np_static("Staff are very friendly"),
    np_static("Need to pay £50 deposit"),
    np_gap(4),
    np_section("The Audley"),
    np_gap(5),
    np_static("At the top of a"),
    np_gap(6),
    np_static("A famous chef"),
    np_gap(7),
    np_gap(8),
    np_static("Set lunch costs £"),
    np_gap(9),
    np_static("Portions probably of"),
    np_gap(10),
]

CAM20_P4_NOTE = [
    np_section("Historical background"),
    np_static("Nearly all major cities were built on a river."),
    np_static("Rivers were traditionally used by city dwellers for transport, fishing and recreation."),
    np_static("Industrial development and rising populations later led to:"),
    np_static("more sewage from houses being discharged into the river"),
    np_gap(31),
    np_gap(32),
    np_section("Recent improvements"),
    np_gap(33),
    np_gap(34),
    np_static("In Los Angeles, there are plans to:"),
    np_gap(35),
    np_gap(36),
    np_gap(37),
    np_section("Transport possibilities"),
    np_gap(38),
    np_static("Changes in shopping habits mean the number of deliveries that are made is increasing."),
    np_gap(39),
    np_gap(40),
]


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
                         gapLead="Work in the", gapTrail="branch"),
                    gap(3, "Nearest bus stop:", "library", "Bến xe cạnh thư viện.", 1,
                         gapLead="Nearest bus stop: next to"),
                    gap(4, "Pay per hour:", "4.45", "£4.45/giờ.", 1,
                         gapLead="Pay £", gapTrail="an hour"),
                    gap(5, "Extra pay on:", "national holidays", "Ngày lễ.", 2,
                         gapLead="extra pay when you work on"),
                    gap(6, "Transport home when:", "after 11", "Sau 11 giờ.", 3,
                         gapLead="transport home when you work"),
                    gap(7, "Quality required:", "clear voice", "Giọng rõ.", 2,
                         gapLead=""),
                    gap(8, "Ability to:", "think quickly", "Suy nghĩ nhanh.", 2,
                         gapLead="ability to"),
                    gap(9, "Interview date:", "22 october", "22 tháng 10.", 2,
                         gapLead="Interview arranged for: Thursday", gapTrail="at 6 pm"),
                    gap(10, "Ask for:", "manuja", "Hỏi Samira Manuja.", 1,
                         gapLead="Ask for:"),
                ],
                passageTitle="JOB INQUIRY",
                notePassageLayout="form",
                notePassage=CAM9_P1_NOTE,
            ),
            part(
                2, 11, 20,
                "Questions 11–16: Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer. "
                "Questions 17–18: Choose the correct letter, A, B or C. "
                "Questions 19–20: Choose TWO letters, A–E.",
                [
                    gap(11, "Type of store:", "branch", "Chi nhánh mới.", 1,
                         gapLead="• a new", gapTrail="of an international sports goods company",
                         sectionRange="Questions 11 – 16",
                         sectionInstruction="Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
                         sectionTitle="SPORTS WORLD"),
                    gap(12, "Location:", "west", "Phía tây Bradcaster.", 1,
                         gapLead="• located in the shopping centre to the", gapTrail="of Bradcaster"),
                    gap(13, "Floors 1–3:", "clothing", "Quần áo thể thao.", 1,
                         gapLead="• has sports", gapTrail="and equipment on floors 1–3"),
                    gap(14, "Delivery time:", "10", "Giao trong 10 ngày.", 1,
                         gapLead="• can get you any item within", gapTrail="days"),
                    gap(15, "Specialises in:", "running", "Thiết bị chạy bộ.", 1,
                         gapLead="• shop specialises in equipment for"),
                    gap(16, "Special section:", "bags", "Khu bán túi.", 1,
                         gapLead="• has a special section which just sells"),
                    mc(17, "A champion athlete will be in the shop", [
                        ("A", "on Saturday morning only"),
                        ("B", "all day Saturday"),
                        ("C", "for the whole weekend"),
                    ], "A", "Sáng thứ Bảy.",
                       sectionRange="Questions 17 – 18",
                       sectionInstruction="Choose the correct letter A, B or C."),
                    mc(18, "The first person to answer 20 quiz questions correctly will win", [
                        ("A", "gym membership"),
                        ("B", "a video"),
                        ("C", "a calendar"),
                    ], "A", "Thẻ phòng gym."),
                    match(19, choose_two_prompt, list("ABCDE"), "A/E", "Đặt chỗ (A) hoặc giá ưu đãi (E).", fitness_opts,
                          sectionRange="Questions 19 – 20",
                          sectionInstruction="Choose TWO letters, A–E."),
                    match(20, choose_two_prompt, list("ABCDE"), "A/E", "Cặp đáp án 19–20: A và E.", fitness_opts),
                ],
                passageTitle="SPORTS WORLD",
                notePassage=CAM9_P2_NOTE,
            ),
            part(
                3, 21, 30,
                "Choose the correct letter, A, B or C.",
                [
                    mc(21, "One reason why Spiros felt happy about his marketing presentation was that", [
                        ("A", "he was not nervous"),
                        ("B", "his style was good"),
                        ("C", "the presentation was the best in his group"),
                    ], "B", "Phong cách tốt.",
                       sectionRange="Questions 21 – 30",
                       sectionInstruction="Choose the correct letter A, B or C."),
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
                         gapLead="e.g. some parasites can affect marine animals'", gapTrail=", which they depend on for navigation"),
                    gap(33, "Toxins from:", "plants animals", "Độc tố từ thực vật/động vật.", 2,
                         gapLead="Poisons from", gapTrail="or ……….. are commonly consumed by whales"),
                    gap(34, "Accidental strandings:", "feeding", "Không phải lúc kiếm ăn.", 1,
                         gapLead="Unlikely because the majority of animals were not", gapTrail="when they stranded"),
                    gap(35, "Noise from military tests:", "noise", "Tiếng ồn thử nghiệm quân sự.", 1,
                         gapTrail="from military tests are linked to some recent strandings"),
                    gap(36, "Whales were all:", "healthy", "Khỏe mạnh.", 1,
                         gapLead="• were all"),
                    gap(37, "Were not in a:", "group", "Không ở nhóm.", 1,
                         gapLead="• were not in a"),
                    gap(38, "Most … species:", "social", "Loài mang tính xã hội.", 1,
                         gapLead="• More strandings in the most", gapTrail="species of whales"),
                    gap(39, "Only the … was ill:", "leader", "Chỉ con đầu đàn bệnh.", 1,
                         gapLead="• 1990s dolphin stranding — only the", gapTrail="was ill"),
                    gap(40, "Further reading topic:", "network", "Mạng lưới cứu hộ.", 1,
                         gapLead="Marine Mammals Ashore (Geraci) — gives information about strandings"),
                ],
                passageTitle="Mass Strandings of Whales and Dolphins",
                notePassage=CAM9_P4_NOTE,
            ),
        ],
    }


def choose_two(n1, n2, prompt, options, answer, explanation, **section):
    """Hai câu Choose TWO cùng prompt và options A–E có nhãn đầy đủ."""
    return [
        match(n1, prompt, list("ABCDE"), answer, explanation, options, **section),
        match(n2, prompt, list("ABCDE"), answer, f"{explanation} (cặp {n1}–{n2})", options),
    ]


def build_cam20():
    def mc_abc(n, prompt, a, b, c, ans, expl, **extra):
        return mc(n, prompt, [("A", a), ("B", b), ("C", c)], ans, expl, **extra)

    kilns_opts = [
        ("A", "What their function is."),
        ("B", "When they were invented."),
        ("C", "Ways of keeping them safe."),
        ("D", "Where to put one in your home."),
        ("E", "What some people use instead of one."),
    ]
    tools_opts = [
        ("A", "Some are hard to hold."),
        ("B", "Some are worth buying."),
        ("C", "Some are essential items."),
        ("D", "Some have memorable names."),
        ("E", "Some are available for use by participants."),
    ]
    loneliness_causes_opts = [
        ("A", "Social media"),
        ("B", "Smaller nuclear families"),
        ("C", "Urban design"),
        ("D", "Longer lifespans"),
        ("E", "A mobile workforce"),
    ]
    health_risks_opts = [
        ("A", "A weakened immune system"),
        ("B", "Dementia"),
        ("C", "Cancer"),
        ("D", "Obesity"),
        ("E", "Cardiovascular disease"),
    ]
    evolution_opts = [
        ("A", "It has little practical relevance."),
        ("B", "It needs further investigation."),
        ("C", "It is misleading."),
        ("D", "It should be more widely accepted."),
        ("E", "It is difficult to understand."),
    ]

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
                    gap(1, "Keen on:", "fish", "Món cá.", 1),
                    gap(2, "Good place for a drink:", "roof", "Sân thượng/roof.", 1,
                         gapLead="The", gapTrail="is a good place for a drink"),
                    gap(3, "Type of food:", "spanish", "Ẩm thực Tây Ban Nha.", 1,
                         gapTrail="food, good for sharing"),
                    gap(4, "Limited selection:", "vegetarian", "Món chay.", 1,
                         gapLead="A limited selection of", gapTrail="food on the menu"),
                    gap(5, "Restaurant name:", "audley", "The Audley.", 1,
                         gapLead="The"),
                    gap(6, "Location:", "hotel", "Khách sạn.", 1,
                         gapTrail=""),
                    gap(7, "Reviews:", "reviews", "Đánh giá tốt.", 1,
                         gapLead="All the", gapTrail="are very good"),
                    gap(8, "Ingredients:", "local", "Nguyên liệu địa phương.", 1,
                         gapLead="Only uses", gapTrail="ingredients"),
                    gap(9, "Set lunch cost:", "30", "£30.", 1,
                         gapTrail="per person"),
                    gap(10, "Portion size:", "average", "Khẩu phần trung bình.", 1,
                         gapTrail="size"),
                ],
                passageTitle="Restaurant recommendations",
                notePassageLayout="table",
                noteTable=CAM20_P1_TABLE,
                notePassage=CAM20_P1_NOTE,
            ),
            part(
                2, 11, 20,
                "Questions 11–16: Choose the correct letter, A, B or C. "
                "Questions 17–18 and 19–20: Choose TWO letters, A–E.",
                [
                    mc_abc(11, "Heather says pottery differs from other art forms because", "it lasts longer in the ground", "it is practised by more people", "it can be repaired more easily", "A", "Gốm bền trong đất.",
                           sectionRange="Questions 11 – 16",
                           sectionInstruction="Choose the correct letter A, B or C."),
                    mc_abc(12, "Archaeologists identify ancient pottery from", "the clay it was made with", "the marks that are on it", "the basic shape of it", "B", "Vết/mark trên đồ gốm."),
                    mc_abc(13, "Some people join Heather's class because they want to", "create something that looks old", "find something they are good at", "make something that will outlive them", "C", "Tạo vật bền với thời gian."),
                    mc_abc(14, "What does Heather value most about being a potter?", "Its calming effect", "Its messy nature", "Its physical benefits", "A", "Tính thư giãn."),
                    mc_abc(15, "Most visitors to Edelman Pottery", "bring friends to join courses", "have never made a pot before", "try to learn techniques too quickly", "B", "Chưa từng làm gốm."),
                    mc_abc(16, "Heather reminds visitors they should", "put on their aprons", "change their clothes", "take off their jewellery", "C", "Tháo trang sức."),
                    *choose_two(
                        17, 18,
                        "Which TWO things does Heather explain about kilns?",
                        kilns_opts, "A/E", "Chức năng lò (A) và thay thế (E).",
                        sectionRange="Questions 17 – 18",
                        sectionInstruction="Choose TWO letters, A–E.",
                    ),
                    *choose_two(
                        19, 20,
                        "Which TWO points does Heather make about a potter's tools?",
                        tools_opts, "C/E", "Thiết yếu (C) và dùng chung (E).",
                        sectionRange="Questions 19 – 20",
                        sectionInstruction="Choose TWO letters, A–E.",
                    ),
                ],
                passageTitle="Edelman Pottery — visitor talk",
            ),
            part(
                3, 21, 30,
                "Questions 21–26: Choose TWO letters, A–E. Questions 27–30: Choose A, B or C.",
                [
                    *choose_two(
                        21, 22,
                        "Which TWO things do the students both believe are responsible for the increase in loneliness?",
                        loneliness_causes_opts, "C/E",
                        "Thiết kế đô thị (C) / lực lượng di động (E).",
                        sectionRange="Questions 21 – 22",
                        sectionInstruction="Choose TWO letters, A–E.",
                    ),
                    *choose_two(
                        23, 24,
                        "Which TWO health risks associated with loneliness do the students agree are based on solid evidence?",
                        health_risks_opts, "A/C",
                        "Miễn dịch (A) / ung thư (C).",
                        sectionRange="Questions 23 – 24",
                        sectionInstruction="Choose TWO letters, A–E.",
                    ),
                    *choose_two(
                        25, 26,
                        "Which TWO opinions do both the students express about the evolutionary theory of loneliness?",
                        evolution_opts, "A/B",
                        "Ít thực tiễn (A) / cần nghiên cứu (B).",
                        sectionRange="Questions 25 – 26",
                        sectionInstruction="Choose TWO letters, A–E.",
                    ),
                    mc_abc(27, "When comparing loneliness to depression, the students", "doubt a medical cure for loneliness", "say the link is overstated", "feel loneliness is not taken seriously", "A", "Nghi ngờ có thuốc chữa cô đơn.",
                           sectionRange="Questions 27 – 30",
                           sectionInstruction="Choose the correct letter A, B or C."),
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
                    gap(31, "Pollution source:", "factories", "Nhà máy.", 1,
                         gapLead="pollution from", gapTrail="on the river bank"),
                    gap(32, "Thames declared biologically:", "dead", "Sông 'chết'.", 1,
                         gapLead="In 1957, the River Thames in London was declared biologically"),
                    gap(33, "Seen in the Thames:", "whale", "Cá voi.", 1,
                         gapLead="Seals and even a", gapTrail="have been seen in the River Thames."),
                    gap(34, "Warehouses converted to:", "apartments", "Căn hộ.", 1,
                         gapLead="Riverside warehouses are converted to restaurants and"),
                    gap(35, "Los Angeles riverside:", "park", "Công viên.", 1,
                         gapLead="build a riverside"),
                    gap(36, "Display projects:", "art", "Dự án nghệ thuật.", 1,
                         gapLead="display", gapTrail="projects"),
                    gap(37, "Paris summer feature:", "beaches", "Bãi biển nhân tạo.", 1,
                         gapLead="In Paris,", gapTrail="are created on the sides of the river every summer."),
                    gap(38, "Passengers travel by:", "ferry", "Phà.", 1,
                         gapLead="Over 2 billion passengers already travel by", gapTrail="in cities around the world."),
                    gap(39, "Electric transport:", "bikes", "Xe đạp điện.", 1,
                         gapLead="goods could be transported by large freight barges and electric"),
                    gap(40, "Future transport:", "drone", "Drone.", 1,
                         gapLead=", or in the future, by"),
                ],
                passageTitle="Reclaiming urban rivers",
                notePassage=CAM20_P4_NOTE,
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
    import importlib.util
    import sys

    sys.path.insert(0, str(ROOT / "scripts"))
    base_path = ROOT / "scripts" / "build-ielts-cam11-12-listening.py"
    spec = importlib.util.spec_from_file_location("ielts_base", base_path)
    base = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(base)

    cam9 = build_cam9()
    meta = {
        "version": 1,
        "cambridge": 9,
        "test": 1,
        "title": cam9["title"],
        "bandHint": cam9["bandHint"],
        "examType": cam9["examType"],
        "examMode": cam9["examMode"],
        "durationMinutes": cam9["durationMinutes"],
        "audioFile": "listening.mp3",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json"},
            {"partNumber": 2, "template": "p2-a10", "file": "exam_part2.json"},
            {"partNumber": 3, "template": "p3-c3", "file": "exam_part3.json"},
            {"partNumber": 4, "template": "p4-d1", "file": "exam_part4.json"},
        ],
    }
    parts = {index + 1: cam9["parts"][index] for index in range(4)}
    base.write_test("Listening IELTS_Test1_Cam9", meta, parts)
    audio_src = ROOT / "Tainguyen" / "IELTS" / "Listening IELTS_Test1_Cam9" / "AudioTest1_Cam9.mp3"
    if audio_src.exists():
        shutil.copy2(audio_src, audio_src.parent / "listening.mp3")


if __name__ == "__main__":
    main()