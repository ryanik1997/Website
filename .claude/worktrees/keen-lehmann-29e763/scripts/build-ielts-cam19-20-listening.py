"""Rebuild Cam19 T1–T4 + Cam20 T1–T4 Listening JSON from ielts-cam19-20-dump.txt.

Run:
  python scripts/build-ielts-cam19-20-listening.py
  pnpm ielts:validate "IELTS/Listening IELTS_Test1_Cam19"
  pnpm ielts:pack "IELTS/Listening IELTS_Test1_Cam19"
"""
from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

_base_path = ROOT / "scripts" / "build-ielts-cam11-12-listening.py"
_spec = importlib.util.spec_from_file_location("ielts_base", _base_path)
_base = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_base)

IELTS = _base.IELTS
choose_two = _base.choose_two
extract_map_image = _base.extract_map_image
gap = _base.gap
map_label = _base.map_label
match = _base.match
mc = _base.mc
np_gap = _base.np_gap
np_section = _base.np_section
np_static = _base.np_static
part = _base.part
tbl_gap = _base.tbl_gap
tbl_static = _base.tbl_static
tbl_break = _base.tbl_break
write_test = _base.write_test


def flow_match(n, labeled, letters, answer, gap_lead, gap_trail="", **extra):
    return match(
        n, gap_lead, letters, answer,
        labeled=labeled,
        flowChart=True,
        gapLead=gap_lead,
        gapTrail=gap_trail,
        **extra,
    )


def mc_abc(n, prompt, a, b, c, ans, expl, **extra):
    return mc(n, prompt, [("A", a), ("B", b), ("C", c)], ans, expl, **extra)


# ── Cam20 T1 table constants (migrated from build-ielts-listening-tests.py) ──

CAM20_T1_P1_TABLE = {
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
                [tbl_gap(3), tbl_static(" food, good for sharing")],
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
                [tbl_static("The "), tbl_gap(5)],
                [tbl_static("At the top of a "), tbl_gap(6)],
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

CAM20_T1_P1_NOTE = [
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

CAM20_T1_P4_NOTE = [
    np_section("Historical background"),
    np_static("• Nearly all major cities were built on a river."),
    np_static("• Rivers were traditionally used by city dwellers for transport, fishing and recreation."),
    np_static("• Industrial development and rising populations later led to:"),
    np_static("– more sewage from houses being discharged into the river"),
    np_static("– pollution from "), np_gap(31), np_static(" on the river bank"),
    np_static("• In 1957, the River Thames in London was declared biologically "), np_gap(32),
    np_section("Recent improvements"),
    np_static("• Seals and even a "), np_gap(33), np_static(" have been seen in the River Thames."),
    np_static("• Riverside warehouses are converted to restaurants and "), np_gap(34),
    np_static("• In Los Angeles, there are plans to:"),
    np_static("– build a riverside "), np_gap(35),
    np_static("– display "), np_gap(36), np_static(" projects"),
    np_static("• In Paris, "), np_gap(37), np_static(" are created on the sides of the river every summer."),
    np_section("Transport possibilities"),
    np_static("• Over 2 billion passengers already travel by "), np_gap(38), np_static(" in cities around the world."),
    np_static("• Changes in shopping habits mean the number of deliveries that are made is increasing."),
    np_static("• Instead of road transport, goods could be transported by large freight barges and electric "), np_gap(39),
    np_static(", or in the future, by "), np_gap(40),
]

# ── Cam19 Test 1 ─────────────────────────────────────────────────────────────

def cam19_t1_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Area (hectares):", "69", "69 hecta.", word_limit=2,
                sectionTitle="Hinchingbrooke Country Park"),
            gap(2, "Wetland feature:", "stream", "Suối.", word_limit=2),
            gap(3, "Science — children look at … about plants:", "data", "Dữ liệu.", word_limit=2),
            gap(4, "Geography — use a … and compass:", "map", "Bản đồ.", word_limit=2),
            gap(5, "Leisure and tourism — park's …:", "visitors", "Du khách.", word_limit=2),
            gap(6, "Music — children make … with natural materials:", "sounds", "Âm thanh.", word_limit=2),
            gap(7, "Benefit — feeling of …:", "freedom", "Tự do.", word_limit=2),
            gap(8, "Children learn new …:", "skills", "Kỹ năng.", word_limit=2),
            gap(9, "Cost per child £ …:", "4.95", "£4.95.", word_limit=2),
            gap(10, "Adults such as … free:", "leaders", "Người dẫn đoàn.", word_limit=2),
        ],
        notePassageLayout="form",
        passageTitle="Hinchingbrooke Country Park",
        notePassage=[
            np_section("The park"),
            np_static("Area: "), np_gap(1), np_static(" hectares"),
            np_static("Habitats: wetland, grassland and woodland"),
            np_static("Wetland: lakes, ponds and a "), np_gap(2),
            np_static("Wildlife includes birds, insects and animals"),
            np_section("Subjects studied in educational visits include"),
            np_static("Science: Children look at "), np_gap(3), np_static(" about plants, etc."),
            np_static("Geography: includes learning to use a "), np_gap(4), np_static(" and compass"),
            np_static("History: changes in land use"),
            np_static("Leisure and tourism: mostly concentrates on the park's "), np_gap(5),
            np_static("Music: Children make "), np_gap(6),
            np_static(" with natural materials, and experiment with rhythm and speed."),
            np_section("Benefits of outdoor educational visits"),
            np_static("They give children a feeling of "), np_gap(7),
            np_static(" that they may not have elsewhere."),
            np_static("Children learn new "), np_gap(8), np_static(" and gain self-confidence."),
            np_section("Practical issues"),
            np_static("Cost per child: £"), np_gap(9),
            np_static("Adults, such as "), np_gap(10), np_static(", free"),
        ],
    )


def cam19_t1_p2():
    letters = list("ABCDEFGH")
    return part(
        2, 11, 20,
        "Questions 11–15: Choose A, B or C. Questions 16–20: Label the map A–H.",
        [
            mc(11, "During the visit to Malatte, in France, members especially enjoyed", [
                ("A", "going to a theme park."),
                ("B", "experiencing a river trip."),
                ("C", "visiting a cheese factory."),
            ], "B", "Chuyến đi sông (B).",
               sectionRange="Questions 11 – 15",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Stanthorpe Twinning Association"),
            mc(12, "What will happen in Stanthorpe to mark the 25th anniversary of the Twinning Association?", [
                ("A", "A tree will be planted."),
                ("B", "A garden seat will be bought."),
                ("C", "A footbridge will be built."),
            ], "A", "Trồng cây (A)."),
            mc(13, "Which event raised most funds this year?", [
                ("A", "the film show"),
                ("B", "the pancake evening"),
                ("C", "the cookery demonstration"),
            ], "B", "Buổi pancake (B)."),
            mc(14, "For the first evening with the French visitors host families are advised to", [
                ("A", "take them for a walk round the town."),
                ("B", "go to a local restaurant."),
                ("C", "have a meal at home."),
            ], "B", "Đi nhà hàng địa phương (B)."),
            mc(15, "On Saturday evening there will be the chance to", [
                ("A", "listen to a concert."),
                ("B", "watch a match."),
                ("C", "take part in a competition."),
            ], "A", "Nghe hòa nhạc (A)."),
            map_label(16, "Farm shop", letters, "G",
                      sectionRange="Questions 16 – 20",
                      sectionInstruction="Label the map below. Write the correct letter, A–H, next to Questions 16–20.",
                      sectionTitle="Farley House"),
            map_label(17, "Disabled entry", letters, "C"),
            map_label(18, "Adventure playground", letters, "B"),
            map_label(19, "Kitchen gardens", letters, "D"),
            map_label(20, "The Temple of the Four Winds", letters, "A"),
        ],
        imageFile="map.jpg",
    )


def cam19_t1_p3():
    trend_opts = [
        ("A", "This is only relevant to young people."),
        ("B", "This may have disappointing results."),
        ("C", "This already seems to be widespread."),
        ("D", "Retailers should do more to encourage this."),
        ("E", "More financial support is needed for this."),
        ("F", "Most people know little about this."),
        ("G", "There should be stricter regulations about this."),
        ("H", "This could be dangerous."),
    ]
    letters = list("ABCDEFGH")
    return part(
        3, 21, 30,
        "Questions 21–22 and 23–24: Choose TWO A–E. Questions 25–30: Matching A–H.",
        [
            *choose_two(21, 22,
                        "Which TWO things did Colin find most satisfying about his bread reuse project?",
                        [("A", "receiving support from local restaurants"),
                         ("B", "finding a good way to prevent waste"),
                         ("C", "overcoming problems in a basic process"),
                         ("D", "experimenting with designs and colours"),
                         ("E", "learning how to apply 3-D printing")],
                        "B/D", "Ngăn lãng phí (B) và thử màu sắc (D).",
                        sectionRange="Questions 21 and 22",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(23, 24,
                        "Which TWO ways do the students agree that touch-sensitive sensors for food labels could be developed in future?",
                        [("A", "for use on medical products"),
                         ("B", "to show that food is no longer fit to eat"),
                         ("C", "for use with drinks as well as foods"),
                         ("D", "to provide applications for blind people"),
                         ("E", "to indicate the weight of certain foods")],
                        "A/E", "Sản phẩm y tế (A) và cân nặng (E).",
                        sectionRange="Questions 23 and 24",
                        sectionInstruction="Choose TWO letters, A–E."),
            match(25, "Use of local products", letters, "D", labeled=trend_opts,
                  sectionRange="Questions 25 – 30",
                  sectionInstruction="What is the students' opinion about each of the following food trends? Choose SIX answers from the box and write the correct letter, A–H, next to Questions 25–30.",
                  sectionTitle="Food trends"),
            match(26, "Reduction in unnecessary packaging", letters, "G", labeled=trend_opts),
            match(27, "Gluten-free and lactose-free food", letters, "C", labeled=trend_opts),
            match(28, "Use of branded products related to celebrity chefs", letters, "B", labeled=trend_opts),
            match(29, "Development of 'ghost kitchens' for takeaway food", letters, "F", labeled=trend_opts),
            match(30, "Use of mushrooms for common health concerns", letters, "H", labeled=trend_opts),
        ],
    )


def cam19_t1_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "stones beneath the bog were once …:", "walls", "Tường.", word_limit=1,
                sectionTitle="Ceide Fields"),
            gap(32, "His … became an archaeologist:", "son", "Con trai.", word_limit=1),
            gap(33, "dig for …:", "fuel", "Nhiên liệu.", word_limit=1),
            gap(34, "lack of …:", "oxygen", "Oxy.", word_limit=1),
            gap(35, "Houses were … in shape:", "rectangular", "Hình chữ nhật.", word_limit=1),
            gap(36, "pots used to make …:", "lamps", "Đèn.", word_limit=1),
            gap(37, "support a big …:", "family", "Gia đình.", word_limit=1),
            gap(38, "during …:", "winter", "Mùa đông.", word_limit=1),
            gap(39, "decline in … quality:", "soil", "Đất.", word_limit=1),
            gap(40, "increase in …:", "rain", "Mưa.", word_limit=1),
        ],
        notePassageLayout="lecture",
        passageTitle="Ceide Fields",
        notePassage=[
            np_static("• an important Neolithic archaeological site in the northwest of Ireland"),
            np_section("Discovery"),
            np_static("• In the 1930s, a local teacher realised that stones beneath the bog surface were once "), np_gap(31),
            np_static("• His "), np_gap(32), np_static(" became an archaeologist and undertook an investigation of the site:"),
            np_static("– a traditional method used by local people to dig for"), np_gap(33),
            np_static(" was used to identify where stones were located"),
            np_static("– carbon dating later proved the site was Neolithic."),
            np_static("• Items are well preserved in the bog because of a lack of"), np_gap(34),
            np_section("Neolithic farmers"),
            np_static("• Houses were "), np_gap(35), np_static(" in shape and had a hole in the roof."),
            np_static("• Neolithic innovations include:"),
            np_static("– cooking indoors"),
            np_static("– pots used for storage and to make"), np_gap(36),
            np_static("• Each field at Ceide was large enough to support a big"), np_gap(37),
            np_static("• The fields were probably used to restrict the grazing of animals – no evidence of structures to house them during"), np_gap(38),
            np_section("Reasons for the decline in farming"),
            np_static("• a decline in "), np_gap(39), np_static(" quality"),
            np_static("• an increase in "), np_gap(40),
        ],
    )


# ── Cam19 Test 2 ─────────────────────────────────────────────────────────────

def cam19_t2_p1():
    return part(
        1, 1, 10,
        "Questions 1–6: Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer. "
        "Questions 7–10: Complete the table below. Write ONE WORD ONLY for each answer.",
        [
            gap(1, "Coordinator Gary …:", "mathieson", "Mathieson.", word_limit=2,
                sectionRange="Questions 1 – 6",
                sectionInstruction="Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.",
                sectionTitle="Guitar Group"),
            gap(2, "Level:", "beginners", "Người mới.", word_limit=2),
            gap(3, "Place — the …:", "college", "Trường cao đẳng.", word_limit=2),
            gap(4, "… Street:", "new", "New Street.", word_limit=2),
            gap(5, "Thursday morning at …:", "11", "11 giờ.", word_limit=2),
            gap(6, "'The perfect …':", "instrument", "Nhạc cụ.", word_limit=2),
            gap(7, "tuning using an app or by …:", "ear", "Tai.", word_limit=1,
                sectionRange="Questions 7 – 10",
                sectionInstruction="Complete the table below. Write ONE WORD ONLY for each answer."),
            gap(8, "teacher is …:", "clapping", "Vỗ tay.", word_limit=1),
            gap(9, "listening to a … of a song:", "recording", "Bản ghi.", word_limit=1),
            gap(10, "playing together, then …:", "alone", "Một mình.", word_limit=1),
        ],
        noteTables=[
            {
                "gapNumbers": list(range(1, 7)),
                "instruction": "Questions 1 – 6\nComplete the form below. Write ONE WORD AND/OR A NUMBER for each answer.",
                "title": "Guitar Group",
                "headers": ["Field", "Details"],
                "rows": [
                    {"cells": [[tbl_static("Coordinator")], [tbl_static("Gary "), tbl_gap(1)]]},
                    {"cells": [[tbl_static("Level")], [tbl_gap(2)]]},
                    {"cells": [[tbl_static("Place")], [tbl_static("the "), tbl_gap(3)]]},
                    {"cells": [[tbl_static("Address")], [tbl_gap(4), tbl_static(" Street"), tbl_break(),
                                                          tbl_static("First floor, Room T347")]]},
                    {"cells": [[tbl_static("Time")], [tbl_static("Thursday morning at "), tbl_gap(5)]]},
                    {"cells": [[tbl_static("Recommended website")],
                               [tbl_static("'The perfect "), tbl_gap(6), tbl_static("'")]]},
                ],
            },
            {
                "gapNumbers": [7, 8, 9, 10],
                "instruction": "Questions 7 – 10\nComplete the table below. Write ONE WORD ONLY for each answer.",
                "title": "A typical 45-minute guitar lesson",
                "headers": ["Time", "Activity", "Notes"],
                "rows": [
                    {"cells": [
                        [tbl_static("5 minutes")], [tbl_static("tuning guitars")],
                        [tbl_static("using an app or by "), tbl_gap(7)],
                    ]},
                    {"cells": [
                        [tbl_static("10 minutes")], [tbl_static("strumming chords using our thumbs")],
                        [tbl_static("keeping time while the teacher is "), tbl_gap(8)],
                    ]},
                    {"cells": [
                        [tbl_static("15 minutes")], [tbl_static("playing songs")],
                        [tbl_static("often listening to a "), tbl_gap(9), tbl_static(" of a song")],
                    ]},
                    {"cells": [
                        [tbl_static("10 minutes")],
                        [tbl_static("playing single notes and simple tunes")],
                        [tbl_static("playing together, then "), tbl_gap(10)],
                    ]},
                    {"cells": [
                        [tbl_static("5 minutes")],
                        [tbl_static("noting things to practise at home")],
                        [tbl_static("")],
                    ]},
                ],
            },
        ],
    )


def cam19_t2_p2():
    return part(
        2, 11, 20,
        "Questions 11–16: Choose A, B or C. Questions 17–18 and 19–20: Choose TWO A–E.",
        [
            mc(11, "What made David leave London and move to Northsea?", [
                ("A", "He was eager to develop a hobby."),
                ("B", "He wanted to work shorter hours."),
                ("C", "He found his job in website design unsatisfying."),
            ], "A", "Muốn phát triển sở thích (A).",
               sectionRange="Questions 11 – 16",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Working as a lifeboat volunteer"),
            mc(12, "The Lifeboat Institution in Northsea was built with money provided by", [
                ("A", "a local organisation."),
                ("B", "a local resident."),
                ("C", "the local council."),
            ], "B", "Cư dân địa phương (B)."),
            mc(13, "In his health assessment, the doctor was concerned about the fact that David", [
                ("A", "might be colour blind."),
                ("B", "was rather short-sighted."),
                ("C", "had undergone eye surgery."),
            ], "A", "Mù màu (A)."),
            mc(14, "After arriving at the lifeboat station, they aim to launch the boat within", [
                ("A", "five minutes."),
                ("B", "six to eight minutes."),
                ("C", "eight and a half minutes."),
            ], "B", "6–8 phút (B)."),
            mc(15, "As a 'helmsman', David has the responsibility of deciding", [
                ("A", "who will be the members of his crew."),
                ("B", "what equipment it will be necessary to take."),
                ("C", "if the lifeboat should be launched."),
            ], "C", "Có nên triển khai không (C)."),
            mc(16, "As well as going out on the lifeboat, David", [
                ("A", "gives talks on safety at sea."),
                ("B", "helps with fundraising."),
                ("C", "recruits new volunteers."),
            ], "A", "Nói về an toàn biển (A)."),
            *choose_two(17, 18,
                        "Which TWO things does David say about the lifeboat volunteer training?",
                        [("A", "The residential course developed his leadership skills."),
                         ("B", "The training in use of ropes and knots was quite brief."),
                         ("C", "The training exercises have built up his mental strength."),
                         ("D", "The casualty care activities were particularly challenging for him."),
                         ("E", "The wave tank activities provided practice in survival techniques.")],
                        "C/E", "Sức mạnh tinh thần (C) và kỹ năng sinh tồn (E).",
                        sectionRange="Questions 17 and 18",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(19, 20,
                        "Which TWO things does David find most motivating about the work he does?",
                        [("A", "working as part of a team"),
                         ("B", "experiences when working in winter"),
                         ("C", "being thanked by those he has helped"),
                         ("D", "the fact that it keeps him fit"),
                         ("E", "the chance to develop new equipment")],
                        "A/B", "Làm việc nhóm (A) và mùa đông (B).",
                        sectionRange="Questions 19 and 20",
                        sectionInstruction="Choose TWO letters, A–E."),
        ],
    )


def cam19_t2_p3():
    reason_opts = [
        ("A", "one shoe was missing"),
        ("B", "the colour of one shoe had faded"),
        ("C", "one shoe had a hole in it"),
        ("D", "the shoes were brand new"),
        ("E", "the shoes were too dirty"),
        ("F", "the stitching on the shoes was broken"),
    ]
    letters = list("ABCDEF")
    return part(
        3, 21, 30,
        "Questions 21–24: Choose A, B or C. Questions 25–28: Matching A–F. Questions 29–30: Choose A, B or C.",
        [
            mc(21, "At first, Don thought the topic of recycling footwear might be too", [
                ("A", "limited in scope."),
                ("B", "hard to research."),
                ("C", "boring for listeners."),
            ], "A", "Phạm vi hẹp (A).",
               sectionRange="Questions 21 – 24",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(22, "When discussing trainers, Bella and Don disagree about", [
                ("A", "how popular they are among young people."),
                ("B", "how suitable they are for school."),
                ("C", "how quickly they wear out."),
            ], "B", "Phù hợp đi học (B)."),
            mc(23, "Bella says that she sometimes recycles shoes because", [
                ("A", "they no longer fit."),
                ("B", "she no longer likes them."),
                ("C", "they are no longer in fashion."),
            ], "A", "Không còn vừa (A)."),
            mc(24, "What did the article say that confused Don?", [
                ("A", "Public consumption of footwear has risen."),
                ("B", "Less footwear is recycled now than in the past."),
                ("C", "People dispose of more footwear than they used to."),
            ], "B", "Ít tái chế hơn (B)."),
            match(25, "the high-heeled shoes", letters, "E", labeled=reason_opts,
                  sectionRange="Questions 25 – 28",
                  sectionInstruction="What reasons did the recycling manager give for rejecting footwear? Choose FOUR answers from the box and write the correct letter, A–F, next to Questions 25–28.",
                  sectionTitle="Footwear"),
            match(26, "the ankle boots", letters, "B", labeled=reason_opts),
            match(27, "the baby shoes", letters, "A", labeled=reason_opts),
            match(28, "the trainers", letters, "F", labeled=reason_opts),
            mc(29, "Why did the project to make 'new' shoes out of old shoes fail?", [
                ("A", "People believed the 'new' pairs of shoes were unhygienic."),
                ("B", "There were not enough good parts to use in the old shoes."),
                ("C", "The shoes in the 'new' pairs were not completely alike."),
            ], "C", "Giày không giống nhau (C).",
               sectionRange="Questions 29 – 30",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(30, "Bella and Don agree that they can present their topic", [
                ("A", "from a new angle."),
                ("B", "with relevant images."),
                ("C", "in a straightforward way."),
            ], "A", "Góc nhìn mới (A)."),
        ],
    )


def cam19_t2_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "due to how they …:", "move", "Di chuyển.", word_limit=1, sectionTitle="Tardigrades"),
            gap(32, "a … round body:", "short", "Ngắn/tròn.", word_limit=1),
            gap(33, "claws or … for gripping:", "discs", "Đĩa.", word_limit=1),
            gap(34, "liquid carries both … and blood:", "oxygen", "Oxy.", word_limit=1),
            gap(35, "mouth shaped like a …:", "tube", "Ống.", word_limit=1),
            gap(36, "very low or high …:", "temperatures", "Nhiệt độ.", word_limit=1),
            gap(37, "A type of … ensures DNA is not damaged:", "protein", "Protein.", word_limit=1),
            gap(38, "stay alive in …:", "space", "Không gian.", word_limit=1),
            gap(39, "liquids found in moss or …:", "seaweed", "Rong biển.", word_limit=1),
            gap(40, "not considered …:", "endangered", "Nguy cấp.", word_limit=1),
        ],
        notePassageLayout="lecture",
        passageTitle="Tardigrades",
        notePassage=[
            np_static("• more than 1,000 species, 0.05–1.2 millimetres long"),
            np_static("• also known as water 'bears' (due to how they "), np_gap(31),
            np_static(") and 'moss piglets'"),
            np_section("Physical appearance"),
            np_static("• a "), np_gap(32), np_static(" round body and four pairs of legs"),
            np_static("• claws or "), np_gap(33), np_static(" for gripping"),
            np_static("• absence of respiratory organs"),
            np_static("• body filled with a liquid that carries both "), np_gap(34), np_static(" and blood"),
            np_static("• mouth shaped like a "), np_gap(35), np_static(" with teeth called stylets"),
            np_section("Habitat"),
            np_static("• often found at the bottom of a lake or on plants"),
            np_static("• very resilient and can exist in very low or high "), np_gap(36),
            np_section("Cryptobiosis"),
            np_static("• In dry conditions, they roll into a ball called a 'tun'."),
            np_static("• They stay alive with a much lower metabolism than usual."),
            np_static("• A type of "), np_gap(37), np_static(" ensures their DNA is not damaged."),
            np_static("• Research is underway to find out how many days they can stay alive in "), np_gap(38),
            np_section("Feeding"),
            np_static("• consume liquids, e.g., those found in moss or "), np_gap(39),
            np_static("• may eat other tardigrades"),
            np_section("Conservation status"),
            np_static("• They are not considered to be "), np_gap(40),
        ],
    )


# ── Cam19 Test 3 ─────────────────────────────────────────────────────────────

def cam19_t3_p1():
    return part(
        1, 1, 10,
        "Questions 1–6: Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer. "
        "Questions 7–10: Complete the table below. Write ONE WORD ONLY for each answer.",
        [
            gap(1, "Kite Place — near the …:", "harbour", "Bến cảng.", word_limit=2,
                sectionRange="Questions 1 – 6",
                sectionInstruction="Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
                sectionTitle="Local food shops"),
            gap(2, "cross the … and turn right:", "bridge", "Cầu.", word_limit=2),
            gap(3, "best to go before … pm:", "3.30", "3:30 chiều.", word_limit=2),
            gap(4, "Organic shop called …:", "rose", "Rose.", word_limit=2),
            gap(5, "look for the large … outside:", "sign", "Biển hiệu.", word_limit=2),
            gap(6, "take a … minibus, number 289:", "purple", "Màu tím.", word_limit=2),
            gap(7, "a handful of … (seaweed):", "samphire", "Rong samphire.", word_limit=1,
                sectionRange="Questions 7 – 10",
                sectionInstruction="Complete the table below. Write ONE WORD ONLY for each answer."),
            gap(8, "beans and a …:", "melon", "Dưa.", word_limit=1),
            gap(9, "spices and … for dessert:", "coconut", "Dừa.", word_limit=1),
            gap(10, "a … tart:", "strawberry", "Dâu.", word_limit=1),
        ],
        notePassageLayout="form",
        notePassageSections=[
            {
                "gapNumbers": list(range(1, 7)),
                "instruction": "Questions 1 – 6\nComplete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
                "title": "Local food shops",
                "blocks": [
                    np_section("Where to go"),
                    np_static("• Kite Place – near the "), np_gap(1),
                    np_section("Fish market"),
                    np_static("• cross the "), np_gap(2), np_static(" and turn right"),
                    np_static("• best to go before "), np_gap(3), np_static(" pm, earlier than closing time"),
                    np_section("Organic shop"),
                    np_static("• called '"), np_gap(4), np_static("',"),
                    np_static("• below a restaurant in the large, grey building"),
                    np_static("• look for the large "), np_gap(5), np_static(" outside"),
                    np_section("Supermarket"),
                    np_static("• take a "), np_gap(6), np_static(" minibus, number 289"),
                ],
            },
        ],
        noteTables=[
            {
                "gapNumbers": [7, 8, 9, 10],
                "instruction": "Questions 7 – 10\nComplete the table below. Write ONE WORD ONLY for each answer.",
                "headers": ["Shopping", "To buy", "Other ideas"],
                "rows": [
                    {"cells": [
                        [tbl_static("Fish market")], [tbl_static("a dozen prawns")],
                        [tbl_static("a handful of "), tbl_gap(7), tbl_static(" (type of seaweed)")],
                    ]},
                    {"cells": [
                        [tbl_static("Organic shop")],
                        [tbl_static("beans and a "), tbl_gap(8)],
                        [tbl_static("spices and "), tbl_gap(9), tbl_static(" for dessert")],
                    ]},
                    {"cells": [
                        [tbl_static("Bakery")], [tbl_static("a brown loaf")],
                        [tbl_static("a "), tbl_gap(10), tbl_static(" tart")],
                    ]},
                ],
            },
        ],
    )


def cam19_t3_p2():
    info_opts = [
        ("A", "involves painting and drawing"),
        ("B", "will be led by a prize-winning author"),
        ("C", "is aimed at children with a disability"),
        ("D", "involves a drama activity"),
        ("E", "focuses on new relationships"),
        ("F", "is aimed at a specific age group"),
        ("G", "explores an unhappy feeling"),
        ("H", "raises awareness of a particular culture"),
    ]
    letters = list("ABCDEFGH")
    return part(
        2, 11, 20,
        "Questions 11–16: Matching A–H. Questions 17–18 and 19–20: Choose TWO A–E.",
        [
            match(11, "Superheroes", letters, "C", labeled=info_opts,
                  sectionRange="Questions 11 – 16",
                  sectionInstruction="What information is given about each of the following festival workshops? Choose SIX answers from the box and write the correct letter, A–H, next to Questions 11–16.",
                  sectionTitle="Festival workshops"),
            match(12, "Just do it", letters, "D", labeled=info_opts),
            match(13, "Count on me", letters, "F", labeled=info_opts),
            match(14, "Speak up", letters, "G", labeled=info_opts),
            match(15, "Jump for joy", letters, "B", labeled=info_opts),
            match(16, "Sticks and stones", letters, "H", labeled=info_opts),
            *choose_two(17, 18,
                        "Which TWO reasons does the speaker give for recommending Alive and Kicking?",
                        [("A", "It will appeal to both boys and girls."),
                         ("B", "The author is well known."),
                         ("C", "It has colourful illustrations."),
                         ("D", "It is funny."),
                         ("E", "It deals with an important topic.")],
                        "D/E", "Hài hước (D) và chủ đề quan trọng (E).",
                        sectionRange="Questions 17 and 18",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(19, 20,
                        "Which TWO pieces of advice does the speaker give to parents about reading?",
                        [("A", "Encourage children to write down new vocabulary."),
                         ("B", "Allow children to listen to audio books."),
                         ("C", "Get recommendations from librarians."),
                         ("D", "Give children a choice about what they read."),
                         ("E", "Only read aloud to children until they can read independently.")],
                        "B/C", "Sách nói (B) và thủ thư (C).",
                        sectionRange="Questions 19 and 20",
                        sectionInstruction="Choose TWO letters, A–E."),
        ],
    )


def cam19_t3_p3():
    flow_opts = [
        ("A", "size"), ("B", "escape"), ("C", "age"), ("D", "water"),
        ("E", "cereal"), ("F", "calculations"), ("G", "changes"), ("H", "colour"),
    ]
    letters = list("ABCDEFGH")
    labeled = [(k, v) for k, v in flow_opts]
    return part(
        3, 21, 30,
        "Questions 21–25: Choose A, B or C. Questions 26–30: Complete the flow-chart A–H.",
        [
            mc(21, "How does Clare feel about the students in her Year 12 science class?", [
                ("A", "worried that they are not making progress"),
                ("B", "challenged by their poor behaviour in class"),
                ("C", "frustrated at their lack of interest in the subject"),
            ], "C", "Thiếu hứng thú (C).",
               sectionRange="Questions 21 – 25",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Science experiment for Year 12 students"),
            mc(22, "How does Jake react to Clare's suggestion about an experiment based on children's diet?", [
                ("A", "He is concerned that the results might not be meaningful."),
                ("B", "He feels some of the data might be difficult to obtain."),
                ("C", "He suspects that the conclusions might be upsetting."),
            ], "B", "Khó thu thập dữ liệu (B)."),
            mc(23, "What problem do they agree may be involved in an experiment involving animals?", [
                ("A", "Any results may not apply to humans."),
                ("B", "It may be complicated to get permission."),
                ("C", "Students may not be happy about animal experiments."),
            ], "A", "Không áp dụng cho người (A)."),
            mc(24, "What question do they decide the experiment should address?", [
                ("A", "Are mice capable of controlling their food intake?"),
                ("B", "Does an increase in sugar lead to health problems?"),
                ("C", "How much do supplements of different kinds affect health?"),
            ], "A", "Kiểm soát ăn uống (A)."),
            mc(25, "Clare might also consider doing another experiment involving", [
                ("A", "other types of food supplement."),
                ("B", "different genetic strains of mice."),
                ("C", "varying amounts of exercise."),
            ], "C", "Lượng vận động (C)."),
            flow_match(26, labeled, letters, "C",
                       "Choose mice which are all the same", ".",
                       sectionRange="Questions 26 – 30",
                       sectionInstruction="Complete the flowchart below. Choose FIVE answers from the box and write the correct letter, A–H, next to Questions 26–30."),
            flow_match(27, labeled, letters, "A",
                       "Divide the mice into two groups, each with a different", "."),
            flow_match(28, labeled, letters, "E",
                       "Feed group B the same, but also sugar contained in", "."),
            flow_match(29, labeled, letters, "B",
                       "Place them in a weighing chamber to prevent", "."),
            flow_match(30, labeled, letters, "F",
                       "Do all necessary", "."),
        ],
    )


def cam19_t3_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "fibres from some … during washing:", "clothing", "Quần áo.", word_limit=1,
                sectionTitle="Microplastics"),
            gap(32, "injuries to the … of wildlife:", "mouths", "Miệng.", word_limit=1),
            gap(33, "in bottled and tap water, … and seafood:", "salt", "Muối.", word_limit=1),
            gap(34, "banned in skin cleaning products and …:", "toothpaste", "Kem đánh răng.", word_limit=1),
            gap(35, "enter the soil through the air, rain and …:", "fertilisers", "Phân bón.", word_limit=1),
            gap(36, "earthworms add … to the soil:", "nutrients", "Dinh dưỡng.", word_limit=1),
            gap(37, "affect the … of plants:", "growth", "Sinh trưởng.", word_limit=1),
            gap(38, "… loss in earthworms:", "weight", "Cân nặng.", word_limit=1),
            gap(39, "rise in the level of … in the soil:", "acid", "Axit.", word_limit=1),
            gap(40, "damage ecosystems and …:", "society", "Xã hội.", word_limit=1),
        ],
        notePassage=[
            np_section("Microplastics"),
            np_section("Where microplastics come from"),
            np_static("fibres from some "), np_gap(31), np_static(" during washing"),
            np_static("the breakdown of large pieces of plastic"),
            np_static("waste from industry"),
            np_static("the action of vehicle tyres on roads"),
            np_section("Effects of microplastics"),
            np_static("They cause injuries to the "), np_gap(32), np_static(" of wildlife and affect their digestive systems."),
            np_static("They enter the food chain, e.g., in bottled and tap water, "), np_gap(33),
            np_static(" and seafood."),
            np_static("They may not affect human health, but they are already banned in skin cleaning products and "), np_gap(34),
            np_static(" in some countries."),
            np_static("Microplastics enter the soil through the air, rain and "), np_gap(35),
            np_section("Microplastics in the soil — a study by Anglia Ruskin University"),
            np_static("Earthworms are important because they add "), np_gap(36), np_static(" to the soil."),
            np_static("The study aimed to find whether microplastics in earthworms affect the "), np_gap(37),
            np_static(" of plants."),
            np_static("The study found that microplastics caused:"),
            np_static("– "), np_gap(38), np_static(" loss in earthworms"),
            np_static("– fewer seeds to germinate"),
            np_static("– a rise in the level of "), np_gap(39), np_static(" in the soil."),
            np_static("The study concluded:"),
            np_static("– soil should be seen as an important natural process."),
            np_static("– changes to soil damage both ecosystems and "), np_gap(40),
        ],
    )


# ── Cam19 Test 4 ─────────────────────────────────────────────────────────────

def cam19_t4_p1():
    return part(
        1, 1, 10,
        "Questions 1–6: Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer. "
        "Questions 7–10: Complete the table below. Write ONE WORD ONLY for each answer.",
        [
            gap(1, "Name of supervisor:", "kaeden", "Kaeden.", word_limit=2,
                sectionRange="Questions 1 – 6",
                sectionInstruction="Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
                sectionTitle="First day at work"),
            gap(2, "Where to leave coat and bag: use …:", "locker", "Tủ khóa.", word_limit=2),
            gap(3, "give … number:", "passport", "Hộ chiếu.", word_limit=2),
            gap(4, "collect …:", "uniform", "Đồng phục.", word_limit=2),
            gap(5, "HR office on … floor:", "third", "Tầng 3.", word_limit=2),
            gap(6, "Supervisor's mobile number:", "0412665903", "Số điện thoại.", word_limit=2),
            gap(7, "Bakery — use … labels:", "yellow", "Màu vàng.", word_limit=1,
                sectionRange="Questions 7 – 10",
                sectionInstruction="Complete the table below. Write ONE WORD ONLY for each answer."),
            gap(8, "Re-stock with … boxes if needed:", "plastic", "Nhựa.", word_limit=1),
            gap(9, "Collect … for the fish from the cold-room:", "ice", "Đá.", word_limit=1),
            gap(10, "Must wear special …:", "gloves", "Găng tay.", word_limit=1),
        ],
        notePassageLayout="form",
        passageTitle="First day at work",
        notePassageSections=[
            {
                "gapNumbers": list(range(1, 7)),
                "instruction": "Questions 1 – 6\nComplete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
                "title": "First day at work",
                "blocks": [
                    np_static("• Name of supervisor: "), np_gap(1),
                    np_static("• Where to leave coat and bag: use "), np_gap(2),
                    np_static("• See Tiffany in HR: to give "), np_gap(3),
                    np_static(" number to collect "), np_gap(4),
                    np_static("• Location of HR office: on "), np_gap(5), np_static(" floor"),
                    np_static("• Supervisor's mobile number: "), np_gap(6),
                ],
            },
        ],
        noteTables=[
            {
                "gapNumbers": [7, 8, 9, 10],
                "instruction": "Questions 7 – 10\nComplete the table below. Write ONE WORD ONLY for each answer.",
                "headers": ["Responsibility", "Task 1", "Task 2", "Notes"],
                "rows": [
                    {"cells": [
                        [tbl_static("Bakery section")],
                        [tbl_static("Check sell-by dates")],
                        [tbl_static("Change price labels")],
                        [tbl_static("Use "), tbl_gap(7), tbl_static(" labels")],
                    ]},
                    {"cells": [
                        [tbl_static("Sushi takeaway counter")],
                        [tbl_static("Re-stock with "), tbl_gap(8), tbl_static(" boxes if needed")],
                        [tbl_static("Wipe preparation area and clean the sink"),
                         tbl_break(), tbl_static("Do not clean any knives")],
                        [tbl_static("Do not clean any knives")],
                    ]},
                    {"cells": [
                        [tbl_static("Meat and fish counters")],
                        [tbl_static("Clean the serving area, including the weighing scales")],
                        [tbl_static("Collect "), tbl_gap(9), tbl_static(" for the fish from the cold-room")],
                        [tbl_static("Must wear special "), tbl_gap(10)],
                    ]},
                ],
            },
        ],
    )


def cam19_t4_p2():
    reason_opts = [
        ("A", "a lack of confidence"),
        ("B", "a dislike of running"),
        ("C", "a lack of time"),
    ]
    return part(
        2, 11, 20,
        "Questions 11–12 and 13–14: Choose TWO A–E. Questions 15–18: Matching A–C. Questions 19–20: Choose A, B or C.",
        [
            *choose_two(11, 12,
                        "Which TWO problems with some training programmes for new runners does Liz mention?",
                        [("A", "There is a risk of serious injury."),
                         ("B", "They are unsuitable for certain age groups."),
                         ("C", "They are unsuitable for people with health issues."),
                         ("D", "It is difficult to stay motivated."),
                         ("E", "There is a lack of individual support.")],
                        "C/E", "Vấn đề sức khỏe (C) và thiếu hỗ trợ (E).",
                        sectionRange="Questions 11 and 12",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(13, 14,
                        "Which TWO tips does Liz recommend for new runners?",
                        [("A", "doing two runs a week"),
                         ("B", "running in the evening"),
                         ("C", "going on runs with a friend"),
                         ("D", "listening to music during runs"),
                         ("E", "running very slowly")],
                        "A/D", "Chạy 2 lần/tuần (A) và chạy chậm (D).",
                        sectionRange="Questions 13 and 14",
                        sectionInstruction="Choose TWO letters, A–E."),
            match(15, "Ceri", list("ABC"), "A", labeled=reason_opts,
                  sectionRange="Questions 15 – 18",
                  sectionInstruction="What reason prevented each of the following members of the Compton Park Runners Club from joining until recently? Write the correct letter, A, B or C, next to Questions 15–18.",
                  sectionTitle="Club members"),
            match(16, "James", list("ABC"), "B", labeled=reason_opts),
            match(17, "Leo", list("ABC"), "C", labeled=reason_opts),
            match(18, "Mark", list("ABC"), "A", labeled=reason_opts),
            mc(19, "What does Liz say about running her first marathon?", [
                ("A", "It had always been her ambition."),
                ("B", "Her husband persuaded her to do it."),
                ("C", "She nearly gave up before the end."),
            ], "C", "Suýt bỏ cuộc (C).",
               sectionRange="Questions 19 – 20",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(20, "Liz says new runners should sign up for a race", [
                ("A", "every six months."),
                ("B", "within a few weeks of taking up running."),
                ("C", "after completing several practice runs."),
            ], "B", "Vài tuần sau khi bắt đầu (B)."),
        ],
    )


def cam19_t4_p3():
    location_opts = [
        ("A", "near the entrance"),
        ("B", "in the attic"),
        ("C", "at the back of the shop"),
        ("D", "on a high shelf"),
        ("E", "near the stairs"),
        ("F", "in a specially designed space"),
        ("G", "within the cafe"),
    ]
    letters = list("ABCDEFG")
    return part(
        3, 21, 30,
        "Questions 21–25: Choose A, B or C. Questions 26–30: Matching A–G.",
        [
            mc(21, "Kieran thinks the packing advice given by Jane's grandfather is", [
                ("A", "common sense."),
                ("B", "hard to follow."),
                ("C", "over-protective."),
            ], "A", "Lẽ thường (A).",
               sectionRange="Questions 21 – 25",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(22, "How does Jane feel about the books her grandfather has given her?", [
                ("A", "They are not worth keeping."),
                ("B", "They should go to a collector."),
                ("C", "They have sentimental value for her."),
            ], "C", "Giá trị tình cảm (C)."),
            mc(23, "Jane and Kieran agree that hardback books should be", [
                ("A", "put out on display."),
                ("B", "given as gifts to visitors."),
                ("C", "more attractively designed."),
            ], "A", "Trưng bày (A)."),
            mc(24, "While talking about taking a book from a shelf, Jane", [
                ("A", "describes the mistakes other people make doing it."),
                ("B", "reflects on a significant childhood experience."),
                ("C", "explains why some books are easier to remove than others."),
            ], "B", "Kỷ niệm thời thơ ấu (B)."),
            mc(25, "What do Jane and Kieran suggest about new books?", [
                ("A", "Their parents liked buying them as presents."),
                ("B", "They would like to buy more of them."),
                ("C", "Not everyone can afford them."),
            ], "C", "Không phải ai cũng mua được (C)."),
            match(26, "rare books", letters, "D", labeled=location_opts,
                  sectionRange="Questions 26 – 30",
                  sectionInstruction="Where does Jane's grandfather keep each of the following types of books in his shop? Choose FIVE answers from the box and write the correct letter, A–G, next to Questions 26–30.",
                  sectionTitle="Types of books"),
            match(27, "children's books", letters, "F", labeled=location_opts),
            match(28, "unwanted books", letters, "A", labeled=location_opts),
            match(29, "requested books", letters, "C", labeled=location_opts),
            match(30, "course books", letters, "G", labeled=location_opts),
        ],
    )


def cam19_t4_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "possible … with native species:", "competition", "Cạnh tranh.", word_limit=1,
                sectionTitle="Tree planting"),
            gap(32, "sustainable sources of …:", "food", "Thực phẩm.", word_limit=1),
            gap(33, "increase resistance to …:", "disease", "Bệnh.", word_limit=1),
            gap(34, "land used for …:", "agriculture", "Nông nghiệp.", word_limit=1),
            gap(35, "information from accurate …:", "maps", "Bản đồ.", word_limit=1),
            gap(36, "endangered by keeping …:", "cattle", "Gia súc.", word_limit=1),
            gap(37, "increasing the … of recovery:", "speed", "Tốc độ.", word_limit=1),
            gap(38, "e.g., … were soon attracted:", "monkeys", "Khỉ.", word_limit=1),
            gap(39, "make a living from …:", "fishing", "Đánh cá.", word_limit=1),
            gap(40, "higher risk of …:", "flooding", "Lũ lụt.", word_limit=1),
        ],
        notePassageLayout="lecture",
        passageTitle="Tree planting",
        notePassage=[
            np_section("Reforestation projects should:"),
            np_static("• include a range of tree species"),
            np_static("• not include invasive species because of possible "), np_gap(31),
            np_static(" with native species"),
            np_static("• aim to capture carbon, protect the environment and provide sustainable sources of "), np_gap(32),
            np_static(" for local people"),
            np_static("• use tree seeds with a high genetic diversity to increase resistance to "), np_gap(33),
            np_static(" and climate change"),
            np_static("• plant trees on previously forested land which is in a bad condition, not select land which is being used for "), np_gap(34),
            np_section("Large-scale reforestation projects"),
            np_static("• Base planning decisions on information from accurate "), np_gap(35),
            np_static("• Drones are useful for identifying areas in Brazil which are endangered by keeping "), np_gap(36),
            np_static(" and illegal logging."),
            np_section("Lampang Province, Northern Thailand"),
            np_static("• A forest was restored in an area damaged by mining."),
            np_static("• A variety of native fig trees were planted, which are important for"),
            np_static("– supporting many wildlife species"),
            np_static("– increasing the "), np_gap(37),
            np_static(" of recovery by attracting animals and birds, e.g., "), np_gap(38),
            np_static(" were soon attracted to the area."),
            np_section("Involving local communities"),
            np_static("• Destruction of mangrove forests in Madagascar made it difficult for people to make a living from "), np_gap(39),
            np_static("• The mangrove reforestation project:"),
            np_static("– provided employment for local people"),
            np_static("– restored a healthy ecosystem"),
            np_static("– protects against the higher risk of "), np_gap(40),
        ],
    )


# ── Cam20 Test 1 (migrated from build-ielts-listening-tests.py) ──────────────

def cam20_t1_p1():
    return part(
        1, 1, 10,
        "Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Keen on:", "fish", "Món cá.", word_limit=1),
            gap(2, "Good place for a drink:", "roof", "Sân thượng.", word_limit=1,
                 gapLead="The", gapTrail="is a good place for a drink"),
            gap(3, "Type of food:", "spanish", "Ẩm thực Tây Ban Nha.", word_limit=1,
                 gapTrail="food, good for sharing"),
            gap(4, "Limited selection:", "vegetarian", "Món chay.", word_limit=1,
                 gapLead="A limited selection of", gapTrail="food on the menu"),
            gap(5, "Restaurant name:", "audley", "The Audley.", word_limit=1, gapLead="The"),
            gap(6, "Location:", "hotel", "Khách sạn.", word_limit=1),
            gap(7, "Reviews:", "reviews", "Đánh giá tốt.", word_limit=1,
                 gapLead="All the", gapTrail="are very good"),
            gap(8, "Ingredients:", "local", "Nguyên liệu địa phương.", word_limit=1,
                 gapLead="Only uses", gapTrail="ingredients"),
            gap(9, "Set lunch cost:", "30", "£30.", word_limit=1, gapTrail="per person"),
            gap(10, "Portion size:", "average", "Khẩu phần trung bình.", word_limit=1,
                 gapTrail="size"),
        ],
        passageTitle="Restaurant recommendations",
        notePassageLayout="table",
        noteTable=CAM20_T1_P1_TABLE,
    )


def cam20_t1_p2():
    kilns_opts = [
        ("A", "what their function is"),
        ("B", "when they were invented"),
        ("C", "ways of keeping them safe"),
        ("D", "where to put one in your home"),
        ("E", "what some people use instead of one"),
    ]
    tools_opts = [
        ("A", "Some are hard to hold."),
        ("B", "Some are worth buying."),
        ("C", "Some are essential items."),
        ("D", "Some have memorable names."),
        ("E", "Some are available for use by participants."),
    ]
    return part(
        2, 11, 20,
        "Questions 11–16: Choose A, B or C. Questions 17–18 and 19–20: Choose TWO A–E.",
        [
            mc_abc(11, "Heather says pottery differs from other art forms because", "it lasts longer in the ground", "it is practised by more people", "it can be repaired more easily", "A", "Gốm bền trong đất.",
                   sectionRange="Questions 11 – 16",
                   sectionInstruction="Choose the correct letter, A, B or C."),
            mc_abc(12, "Archaeologists identify ancient pottery from", "the clay it was made with", "the marks that are on it", "the basic shape of it", "B", "Vết trên đồ gốm (B)."),
            mc_abc(13, "Some people join Heather's class because they want to", "create something that looks old", "find something they are good at", "make something that will outlive them", "C", "Tạo vật bền với thời gian (C)."),
            mc_abc(14, "What does Heather value most about being a potter?", "Its calming effect", "Its messy nature", "Its physical benefits", "A", "Tính thư giãn (A)."),
            mc_abc(15, "Most visitors to Edelman Pottery", "bring friends to join courses", "have never made a pot before", "try to learn techniques too quickly", "B", "Chưa từng làm gốm (B)."),
            mc_abc(16, "Heather reminds visitors they should", "put on their aprons", "change their clothes", "take off their jewellery", "C", "Tháo trang sức (C)."),
            *choose_two(17, 18, "Which TWO things does Heather explain about kilns?",
                        kilns_opts, "A/E", "Chức năng lò (A) và thay thế (E).",
                        sectionRange="Questions 17 – 18",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(19, 20, "Which TWO points does Heather make about a potter's tools?",
                        tools_opts, "C/E", "Thiết yếu (C) và dùng chung (E).",
                        sectionRange="Questions 19 – 20",
                        sectionInstruction="Choose TWO letters, A–E."),
        ],
        passageTitle="Edelman Pottery — visitor talk",
    )


def cam20_t1_p3():
    loneliness_causes_opts = [
        ("A", "social media"), ("B", "smaller nuclear families"), ("C", "urban design"),
        ("D", "longer lifespans"), ("E", "a mobile workforce"),
    ]
    health_risks_opts = [
        ("A", "a weakened immune system"), ("B", "dementia"), ("C", "cancer"),
        ("D", "obesity"), ("E", "cardiovascular disease"),
    ]
    evolution_opts = [
        ("A", "It has little practical relevance."),
        ("B", "It needs further investigation."),
        ("C", "It is misleading."),
        ("D", "It should be more widely accepted."),
        ("E", "It is difficult to understand."),
    ]
    return part(
        3, 21, 30,
        "Questions 21–26: Choose TWO A–E. Questions 27–30: Choose A, B or C.",
        [
            *choose_two(21, 22,
                        "Which TWO things do the students both believe are responsible for the increase in loneliness?",
                        loneliness_causes_opts, "C/E", "Thiết kế đô thị (C) / lực lượng di động (E).",
                        sectionRange="Questions 21 – 22",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(23, 24,
                        "Which TWO health risks associated with loneliness do the students agree are based on solid evidence?",
                        health_risks_opts, "A/C", "Miễn dịch (A) / ung thư (C).",
                        sectionRange="Questions 23 – 24",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(25, 26,
                        "Which TWO opinions do both the students express about the evolutionary theory of loneliness?",
                        evolution_opts, "A/B", "Ít thực tiễn (A) / cần nghiên cứu (B).",
                        sectionRange="Questions 25 – 26",
                        sectionInstruction="Choose TWO letters, A–E."),
            mc_abc(27, "When comparing loneliness to depression, the students", "doubt a medical cure for loneliness", "say the link is overstated", "feel loneliness is not taken seriously", "A", "Nghi ngờ có thuốc chữa cô đơn (A).",
                   sectionRange="Questions 27 – 30",
                   sectionInstruction="Choose the correct letter, A, B or C."),
            mc_abc(28, "Why start the presentation with their own experience?", "to explain how difficult loneliness can be", "to highlight a situation students recognise", "to emphasise loneliness is more common for men", "B", "Tình huống quen thuộc (B)."),
            mc_abc(29, "Talking to strangers helps because it", "creates a sense of belonging", "builds self-confidence", "makes people feel more positive", "A", "Cảm giác thuộc về (A)."),
            mc_abc(30, "They find it hard to understand why solitude is considered", "similar to loneliness", "necessary for mental health", "an enjoyable experience", "C", "Trải nghiệm thú vị (C)."),
        ],
        passageTitle="Loneliness and mental health — student presentation",
    )


def cam20_t1_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "Pollution source:", "factories", "Nhà máy.", word_limit=1),
            gap(32, "Thames declared biologically:", "dead", "Sông 'chết'.", word_limit=1),
            gap(33, "Seen in the Thames:", "whale", "Cá voi.", word_limit=1),
            gap(34, "Warehouses converted to:", "apartments", "Căn hộ.", word_limit=1),
            gap(35, "Los Angeles riverside:", "park", "Công viên.", word_limit=1),
            gap(36, "Display projects:", "art", "Dự án nghệ thuật.", word_limit=1),
            gap(37, "Paris summer feature:", "beaches", "Bãi biển nhân tạo.", word_limit=1),
            gap(38, "Passengers travel by … in cities around the world:", "ferry", "Phà.", word_limit=1),
            gap(39, "Electric transport:", "bikes", "Xe đạp điện.", word_limit=1),
            gap(40, "Future transport:", "drone", "Drone.", word_limit=1),
        ],
        notePassageLayout="lecture",
        passageTitle="Reclaiming urban rivers",
        notePassage=CAM20_T1_P4_NOTE,
    )


# ── Cam20 Test 2 ─────────────────────────────────────────────────────────────

def cam20_t2_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(1, "time for other responsibilities — a …:", "break", "Giờ nghỉ.", word_limit=1),
            gap(2, "how much … the caring involves:", "time", "Thời gian.", word_limit=1),
            gap(3, "helping her have a …:", "shower", "Tắm.", word_limit=1),
            gap(4, "dealing with …:", "money", "Tiền bạc.", word_limit=1),
            gap(5, "loss of …:", "memory", "Trí nhớ.", word_limit=1),
            gap(6, "… her:", "lifting", "Nâng/nâng đỡ.", word_limit=1),
            gap(7, "preventing a …:", "fall", "Ngã.", word_limit=1),
            gap(8, "cost of a …:", "taxi", "Taxi.", word_limit=1),
            gap(9, "fuel and …:", "insurance", "Bảo hiểm.", word_limit=1),
            gap(10, "help to reduce …:", "stress", "Căng thẳng.", word_limit=1),
        ],
        notePassageLayout="form",
        notePassage=[
            np_static("Local councils can arrange practical support to help those caring for elderly people at home."),
            np_static("This can give the carer:"),
            np_static("• time for other responsibilities"),
            np_static("• a "), np_gap(1),
            np_section("Assessment of mother's needs"),
            np_static("This may include discussion of:"),
            np_static("• how much "), np_gap(2), np_static(" the caring involves"),
            np_static("• what types of tasks are involved, e.g."),
            np_static("– help with dressing"),
            np_static("– helping her have a "), np_gap(3),
            np_static("– shopping"),
            np_static("– helping with meals"),
            np_static("– dealing with "), np_gap(4),
            np_static("• any aspects of caring that are especially difficult, e.g."),
            np_static("– loss of "), np_gap(5),
            np_static("– "), np_gap(6), np_static(" her"),
            np_static("– preventing a "), np_gap(7),
            np_section("Types of support that may be offered to carers"),
            np_static("• transport costs, e.g. cost of a "), np_gap(8),
            np_static("• car-related costs, e.g. fuel and "), np_gap(9),
            np_static("• help with housework"),
            np_static("• help to reduce "), np_gap(10),
        ],
    )


def cam20_t2_p2():
    role_opts = [
        ("A", "providing entertainment"),
        ("B", "providing publicity about a council service"),
        ("C", "contacting local businesses"),
        ("D", "giving advice to visitors"),
        ("E", "collecting feedback on events"),
        ("F", "selling tickets"),
        ("G", "introducing guest speakers at an event"),
        ("H", "encouraging cooperation between local organisations"),
        ("I", "helping people find their seats"),
    ]
    letters = list("ABCDEFGHI")
    return part(
        2, 11, 20,
        "Questions 11–16: Matching A–I. Questions 17–20: Choose A, B or C.",
        [
            match(11, "walking around the town centre", letters, "D", labeled=role_opts,
                  sectionRange="Questions 11 – 16",
                  sectionInstruction="What is the role of the volunteers in each of the following activities? Choose SIX answers from the box and write the correct letter, A–I, next to Questions 11–16.",
                  sectionTitle="Activities"),
            match(12, "helping at concerts", letters, "I", labeled=role_opts),
            match(13, "getting involved with community groups", letters, "H", labeled=role_opts),
            match(14, "helping with a magazine", letters, "E", labeled=role_opts),
            match(15, "participating at lunches for retired people", letters, "A", labeled=role_opts),
            match(16, "helping with the website", letters, "B", labeled=role_opts),
            mc_abc(17, "Which event requires the largest number of volunteers?", "the music festival", "the science festival", "the book festival", "B", "Lễ hội khoa học (B).",
                   sectionRange="Questions 17 – 20",
                   sectionInstruction="Choose the correct letter, A, B or C."),
            mc_abc(18, "What is the most important requirement for volunteers at the festivals?", "interpersonal skills", "personal interest in the event", "flexibility", "A", "Kỹ năng giao tiếp (A)."),
            mc_abc(19, "New volunteers will start working in the week beginning", "2 September", "9 September", "23 September", "B", "9 tháng 9 (B)."),
            mc_abc(20, "What is the next annual event for volunteers?", "a boat trip", "a barbecue", "a party", "A", "Chuyến đi thuyền (A)."),
        ],
    )


def cam20_t2_p3():
    opinion_opts = [
        ("A", "The information given about this was too vague."),
        ("B", "This may not be relevant to their course."),
        ("C", "This will involve only a small number of statistics."),
        ("D", "It will be easy to find facts about this."),
        ("E", "The facts about this may not be reliable."),
        ("F", "No useful research has been done on this."),
        ("G", "The information provided about this was interesting."),
    ]
    letters = list("ABCDEFG")
    return part(
        3, 21, 30,
        "Questions 21–25: Matching A–G. Questions 26–30: Choose A, B or C.",
        [
            match(21, "Population", letters, "D", labeled=opinion_opts,
                  sectionRange="Questions 21 – 25",
                  sectionInstruction="What is Rosie and Colin's opinion about each of the following aspects of human geography? Choose FIVE answers from the box and write the correct letter, A–G, next to Questions 21–25.",
                  sectionTitle="Aspects of human geography"),
            match(22, "Health", letters, "G", labeled=opinion_opts),
            match(23, "Economies", letters, "B", labeled=opinion_opts),
            match(24, "Culture", letters, "A", labeled=opinion_opts),
            match(25, "Poverty", letters, "E", labeled=opinion_opts),
            mc_abc(26, "Rosie says that in her own city the main problem is", "crime", "housing", "unemployment", "A", "Tội phạm (A).",
                   sectionRange="Questions 26 – 30",
                   sectionInstruction="Choose the correct letter, A, B or C."),
            mc_abc(27, "What recent additions to the outskirts of their cities are both students happy about?", "conference centres", "sports centres", "retail centres", "A", "Trung tâm hội nghị (A)."),
            mc_abc(28, "The students agree that developing disused industrial sites may", "have unexpected costs", "damage the urban environment", "destroy valuable historical buildings", "A", "Chi phí bất ngờ (A)."),
            mc_abc(29, "The students will mention Masdar City as an example of an attempt to achieve", "daily collections for waste recycling", "sustainable energy use", "free transport for everyone", "B", "Năng lượng bền vững (B)."),
            mc_abc(30, "When discussing the ecotown of Greenhill Abbots, Colin is uncertain about", "what its objectives were", "why there was opposition to it", "how much of it has actually been built", "C", "Đã xây bao nhiêu (C)."),
        ],
    )


def cam20_t2_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "growth in interest started with … of food on social media:", "photos", "Ảnh.", word_limit=1,
                sectionTitle="Developing food trend"),
            gap(32, "Sales of … food brands have grown rapidly:", "vegan", "Thuần chay.", word_limit=1),
            gap(33, "Famous … are influential:", "chefs", "Đầu bếp.", word_limit=1),
            gap(34, "… were invited to visit growers in South Africa:", "journalists", "Nhà báo.", word_limit=1),
            gap(35, "Advertising focused on its … benefits:", "health", "Sức khỏe.", word_limit=1),
            gap(36, "Promotion in the USA through … shops:", "coffee", "Cà phê.", word_limit=1),
            gap(37, "appealed to consumers concerned about the …:", "environment", "Môi trường.", word_limit=1),
            gap(38, "strengthen the … of Norwegian seafood:", "reputation", "Danh tiếng.", word_limit=1),
            gap(39, "success led to an increase in its …:", "price", "Giá.", word_limit=1),
            gap(40, "poor quality …:", "soil", "Đất.", word_limit=1),
        ],
        notePassageLayout="lecture",
        passageTitle="Developing food trend",
        notePassage=[
            np_static("• The growth in interest in food fashions started with "), np_gap(31),
            np_static(" of food being shared on social media."),
            np_static("• The UK food industry is constantly developing products which are new or different."),
            np_static("• Influencers on social media become 'ambassadors' for a brand."),
            np_static("– Sales of "), np_gap(32), np_static(" food brands have grown rapidly this way."),
            np_static("• Supermarkets track demand for ingredients on social media."),
            np_static("– Famous "), np_gap(33), np_static(" are influential."),
            np_section("Marketing campaigns"),
            np_static("The avocado:"),
            np_static("– "), np_gap(34), np_static(" were invited to visit growers in South Africa."),
            np_static("– Advertising focused on its "), np_gap(35), np_static(" benefits."),
            np_static("Oat milk:"),
            np_static("– A Swedish brand's media campaign received publicity by upsetting competitors."),
            np_static("– Promotion in the USA through "), np_gap(36), np_static(" shops reduced the need for advertising."),
            np_static("– It appealed to consumers who are concerned about the "), np_gap(37),
            np_static("Norwegian skrei:"),
            np_static("– has helped strengthen the "), np_gap(38), np_static(" of Norwegian seafood."),
            np_section("Ethical concerns"),
            np_static("Quinoa:"),
            np_static("– Its success led to an increase in its "), np_gap(39),
            np_static("– Overuse of resources resulted in poor quality "), np_gap(40),
        ],
    )


# ── Cam20 Test 3 ─────────────────────────────────────────────────────────────

CAM20_T3_P1_TABLE = {
    "headers": ["Name of companies", "Information about costs", "Additional notes"],
    "rows": [
        {"cells": [
            [tbl_static("Peak Rentals")],
            [tbl_static("Prices range from 105 dollars to "), tbl_gap(1), tbl_static(" dollars per room per month")],
            [tbl_static("• The furniture is very "), tbl_gap(2),
             tbl_break(), tbl_static("• Delivers in 1-2 days"),
             tbl_break(), tbl_static("• Special offer: free "), tbl_gap(3),
             tbl_static(" with every living room set")],
        ]},
        {"cells": [
            [tbl_gap(4), tbl_static(" and Oliver")],
            [tbl_static("• Mid-range prices"),
             tbl_break(), tbl_static("• 12% monthly fee for "), tbl_gap(5)],
            [tbl_static("Also offers a cleaning service")],
        ]},
        {"cells": [
            [tbl_static("Larch Furniture")],
            [tbl_static("Offers cheapest prices for renting furniture and "), tbl_gap(6), tbl_static(" items")],
            [tbl_static("• Must have own "), tbl_gap(7),
             tbl_break(), tbl_static("• Minimum contract length: six months")],
        ]},
        {"cells": [
            [tbl_gap(8), tbl_static(" Rentals")],
            [tbl_static("See the "), tbl_gap(9), tbl_static(" for the most up-to-date prices")],
            [tbl_gap(10), tbl_static(" are allowed within 7 days of delivery")],
        ]},
    ],
}


def cam20_t3_p1():
    return part(
        1, 1, 10,
        "Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Peak Rentals upper price:", "139", "$139.", word_limit=2, sectionTitle="Furniture rental companies"),
            gap(2, "furniture is very …:", "modern", "Hiện đại.", word_limit=2),
            gap(3, "free … with living room set:", "lamp", "Đèn.", word_limit=2),
            gap(4, "company name:", "aaron", "Aaron.", word_limit=2),
            gap(5, "12% monthly fee for …:", "damage", "Hư hỏng.", word_limit=2),
            gap(6, "furniture and … items:", "electronic", "Điện tử.", word_limit=2),
            gap(7, "must have own …:", "insurance", "Bảo hiểm.", word_limit=2),
            gap(8, "… Rentals (company name):", "space", "Space Rentals.", word_limit=2),
            gap(9, "see the … for prices:", "app", "Ứng dụng.", word_limit=2),
            gap(10, "… allowed within 7 days:", "exchanges", "Đổi trả.", word_limit=2),
        ],
        notePassageLayout="table",
        passageTitle="Furniture rental companies",
        noteTable=CAM20_T3_P1_TABLE,
    )


def cam20_t3_p2():
    letters = list("ABCDEFG")
    return part(
        2, 11, 20,
        "Questions 11–16: Choose A, B or C. Questions 17–20: Label the map A–G.",
        [
            mc_abc(11, "Who was responsible for starting the community project?", "the castle owners", "a national charity", "the local council", "B", "Tổ chức từ thiện (B).",
                   sectionRange="Questions 11 – 16",
                   sectionInstruction="Choose the correct letter, A, B or C."),
            mc_abc(12, "How was the gold coin found?", "Heavy rain had removed some of the soil.", "The ground was dug up by wild rabbits.", "A person with a metal detector searched the area.", "A", "Mưa làm lộ đất (A)."),
            mc_abc(13, "What led the archaeologists to believe there was an ancient village on this site?", "the lucky discovery of old records", "the bases of several structures visible in the grass", "the unusual stones found near the castle", "B", "Móng công trình (B)."),
            mc_abc(14, "What are the team still hoping to find?", "everyday pottery", "animal bones", "pieces of jewellery", "A", "Đồ gốm hàng ngày (A)."),
            mc_abc(15, "What was found on the other side of the river from the castle?", "the remains of a large palace", "the outline of fields", "a number of small huts", "C", "Lều nhỏ (C)."),
            mc_abc(16, "What do the team plan to do after work ends this summer?", "prepare a display for a museum", "take part in a television programme", "start to organise school visits", "A", "Triển lãm bảo tàng (A)."),
            map_label(17, "bridge foundations", letters, "B",
                      sectionRange="Questions 17 – 20",
                      sectionInstruction="Label the map below. Write the correct letter, A–G, next to Questions 17–20."),
            map_label(18, "rubbish pit", letters, "A"),
            map_label(19, "meeting hall", letters, "G"),
            map_label(20, "fish pond", letters, "E"),
        ],
        imageFile="map.jpg",
    )


def cam20_t3_p3():
    comment_opts = [
        ("A", "Its origin is somewhat controversial."),
        ("B", "It is historically significant for a country."),
        ("C", "It was effective at attracting audiences."),
        ("D", "It is included in a recent project."),
        ("E", "It contains insights into the show."),
        ("F", "It resembles an artwork."),
    ]
    letters = list("ABCDEF")
    return part(
        3, 21, 30,
        "Questions 21–26: Choose A, B or C. Questions 27–30: Matching A–F.",
        [
            mc_abc(21, "Finn was pleased to discover that their topic", "was not familiar to their module leader", "had not been chosen by other students", "did not prove to be difficult to research", "B", "Chưa ai chọn (B).",
                   sectionRange="Questions 21 – 26",
                   sectionInstruction="Choose the correct letter, A, B or C."),
            mc_abc(22, "Maya says a mistaken belief about theatre programmes is that", "Theatres pay companies to produce them.", "Few theatre-goers buy them nowadays.", "They contain far more adverts than previously.", "A", "Nhà hát trả tiền (A)."),
            mc_abc(23, "Finn was surprised that, in early British theatre, programmes", "were difficult for audiences to obtain.", "were given out free of charge.", "were seen as a kind of contract.", "C", "Như hợp đồng (C)."),
            mc_abc(24, "Maya feels their project should include an explanation of why companies of actors", "promoted their own plays.", "performed plays outdoors.", "had to tour with their plays.", "C", "Phải lưu diễn (C)."),
            mc_abc(25, "Finn and Maya both think that, compared to nineteenth-century programmes, those from the eighteenth century", "were more original.", "were more colourful.", "were more informative.", "C", "Nhiều thông tin hơn (C)."),
            mc_abc(26, "Maya doesn't fully understand why, in the twentieth century,", "Very few theatre programmes were printed in the USA.", "British theatre programmes failed to develop for so long.", "Theatre programmes in Britain copied fashions from the USA.", "B", "Phát triển chậm (B)."),
            match(27, "Ruy Blas", letters, "F", labeled=comment_opts,
                  sectionRange="Questions 27 – 30",
                  sectionInstruction="What comment is made about the programme for each of the following shows? Choose FOUR answers from the box and write the correct letter, A–F, next to Questions 27–30.",
                  sectionTitle="Shows"),
            match(28, "Man of La Mancha", letters, "E", labeled=comment_opts),
            match(29, "The Tragedy of Jane Shore", letters, "B", labeled=comment_opts),
            match(30, "The Sailors' Festival", letters, "D", labeled=comment_opts),
        ],
    )


def cam20_t3_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "without the need for any …:", "adaptation", "Điều chỉnh.", word_limit=1,
                sectionTitle="Inclusive design"),
            gap(32, "catering for people with … problems:", "cognitive difficulties", "Khó khăn nhận thức.", word_limit=2),
            gap(33, "… which are adjustable:", "desks", "Bàn.", word_limit=1),
            gap(34, "… in public toilets:", "taps", "Vòi nước.", word_limit=1),
            gap(35, "avoid using … in interfaces:", "blue", "Màu xanh.", word_limit=1),
            gap(36, "mouse, keyboard or their …:", "voice", "Giọng nói.", word_limit=1),
            gap(37, "problematic for … women:", "pregnant", "Mang thai.", word_limit=1),
            gap(38, "size of women's …:", "shoulders", "Vai.", word_limit=1),
            gap(39, "PPE for female … officers:", "police", "Cảnh sát.", word_limit=1),
            gap(40, "… in offices is often too low:", "temperature", "Nhiệt độ.", word_limit=1),
        ],
        notePassageLayout="lecture",
        passageTitle="Inclusive design",
        notePassage=[
            np_section("Definition"),
            np_static("• Designing products that can be accessed by a diverse range of people without the need for any "), np_gap(31),
            np_static("• Not the same as universal design: that is design for everyone, including catering for people with "), np_gap(32),
            np_static(" problems"),
            np_section("Examples of inclusive design"),
            np_static("• "), np_gap(33), np_static(" which are adjustable, avoiding back or neck problems"),
            np_static("• "), np_gap(34), np_static(" in public toilets which are easier to use"),
            np_section("To assist the elderly:"),
            np_static("• Designers avoid using "), np_gap(35), np_static(" in interfaces"),
            np_static("• People can make commands using a mouse, keyboard or their "), np_gap(36),
            np_section("Impact of non-inclusive designs"),
            np_static("Access"),
            np_static("– Loss of independence for disabled people."),
            np_static("Safety"),
            np_static("– Seatbelts are especially problematic for "), np_gap(37), np_static(" women."),
            np_static("– PPE jackets are often unsuitable because of the size of women's "), np_gap(38),
            np_static("– PPE for female "), np_gap(39), np_static(" officers dealing with emergencies is the worst."),
            np_static("Comfort in the workplace"),
            np_static("– The "), np_gap(40), np_static(" in offices is often too low for women."),
        ],
    )


# ── Cam20 Test 4 ─────────────────────────────────────────────────────────────

def cam20_t4_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "… Hotel on George Street:", "kings", "Kings Hotel.", word_limit=2,
                sectionTitle="Advice on family visit"),
            gap(2, "family room per night:", "125", "£125.", word_limit=2),
            gap(3, "a … tour of the city centre:", "walking", "Đi bộ.", word_limit=2),
            gap(4, "a trip by … to the old fort:", "boat", "Thuyền.", word_limit=2),
            gap(5, "best day to visit Science Museum:", "tuesday", "Thứ Ba.", word_limit=2),
            gap(6, "exhibition about …:", "space", "Không gian.", word_limit=2),
            gap(7, "Clacton Market — good for …:", "vegetarian", "Đồ chay.", word_limit=2),
            gap(8, "have lunch before … p.m.:", "2:30", "2:30.", word_limit=2),
            gap(9, "save up to … % on tickets:", "75", "75%.", word_limit=2),
            gap(10, "view of the …:", "port", "Cảng.", word_limit=2),
        ],
        notePassageLayout="form",
        passageTitle="Advice on family visit",
        notePassage=[
            np_section("Accommodation"),
            np_static("• "), np_gap(1), np_static(" Hotel on George Street"),
            np_static("• cost of a family room per night: £ "), np_gap(2), np_static(" (approx.)"),
            np_section("Recommended trips"),
            np_static("• a "), np_gap(3), np_static(" tour of the city centre (starts in Carlton Square)"),
            np_static("• a trip by "), np_gap(4), np_static(" to the old fort"),
            np_section("Science Museum"),
            np_static("• best day to visit: "), np_gap(5),
            np_static("• see the exhibition about "), np_gap(6), np_static(", which opens soon"),
            np_section("Food"),
            np_static("• Clacton Market: good for "), np_gap(7), np_static(" food"),
            np_static("• need to have lunch before "), np_gap(8), np_static(" p.m."),
            np_section("Theatre tickets"),
            np_static("• save up to "), np_gap(9), np_static(" % on ticket prices at bargaintickets.com"),
            np_section("Free activities"),
            np_static("Blakewell Gardens:"),
            np_static("• Roots Music Festival"),
            np_static("• climb Telegraph Hill to see a view of the "), np_gap(10),
        ],
    )


def cam20_t4_p2():
    event_opts = [
        ("A", "the introduction of pay for the players"),
        ("B", "a change to the design of the goal"),
        ("C", "the first use of lights for matches"),
        ("D", "the introduction of goalkeepers"),
        ("E", "the first international match"),
        ("F", "two changes to the rules of the game"),
        ("G", "the introduction of a fee for spectators"),
        ("H", "an agreement on the length of a game"),
    ]
    letters = list("ABCDEFGH")
    return part(
        2, 11, 20,
        "Questions 11–12 and 13–14: Choose TWO A–E. Questions 15–20: Matching A–H.",
        [
            *choose_two(11, 12,
                        "Which TWO things does the speaker say about visiting the football stadium with children?",
                        [("A", "Children can get their photo taken with a football player."),
                         ("B", "There is a competition for children today."),
                         ("C", "Parents must stay with their children at all times."),
                         ("D", "Children will need sunhats and drinks."),
                         ("E", "The café has a special offer on meals for children.")],
                        "B/C", "Cuộc thi (B) và ở cạnh con (C).",
                        sectionRange="Questions 11 and 12",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(13, 14,
                        "Which TWO features of the stadium tour are new this year?",
                        [("A", "VIP tour"),
                         ("B", "360 cinema experience"),
                         ("C", "audio guide"),
                         ("D", "dressing room tour"),
                         ("E", "tours in other languages")],
                        "A/C", "VIP (A) và audio guide (C).",
                        sectionRange="Questions 13 and 14",
                        sectionInstruction="Choose TWO letters, A–E."),
            match(15, "1870", letters, "D", labeled=event_opts,
                  sectionRange="Questions 15 – 20",
                  sectionInstruction="Which event in the history of football in the UK took place in each of the following years? Choose SIX answers from the box and write the correct letter, A–H, next to Questions 15–20.",
                  sectionTitle="Events in the history of football"),
            match(16, "1874", letters, "F", labeled=event_opts),
            match(17, "1875", letters, "B", labeled=event_opts),
            match(18, "1877", letters, "H", labeled=event_opts),
            match(19, "1878", letters, "C", labeled=event_opts),
            match(20, "1880", letters, "G", labeled=event_opts),
        ],
    )


def cam20_t4_p3():
    return part(
        3, 21, 30,
        "Questions 21–22 and 23–24: Choose TWO A–E. Questions 25–30: Choose A, B or C.",
        [
            *choose_two(21, 22,
                        "Which TWO benefits for children of learning to write did both students find surprising?",
                        [("A", "improved fine motor skills"),
                         ("B", "improved memory"),
                         ("C", "improved concentration"),
                         ("D", "improved imagination"),
                         ("E", "improved spatial awareness")],
                        "C/E", "Tập trung (C) và không gian (E).",
                        sectionRange="Questions 21 and 22",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(23, 24,
                        "For children with dyspraxia, which TWO problems with handwriting do the students think are easiest to correct?",
                        [("A", "not spacing letters correctly"),
                         ("B", "not writing in a straight line"),
                         ("C", "applying too much pressure when writing"),
                         ("D", "confusing letter shapes"),
                         ("E", "writing very slowly")],
                        "A/C", "Khoảng cách chữ (A) và lực bút (C).",
                        sectionRange="Questions 23 and 24",
                        sectionInstruction="Choose TWO letters, A–E."),
            mc_abc(25, "What does the woman say about using laptops to teach writing to children with dyslexia?", "Children often lack motivation to learn that way.", "Children become fluent relatively quickly.", "Children react more positively if they make a mistake.", "C", "Phản ứng tích cực khi sai (C).",
                   sectionRange="Questions 25 – 30",
                   sectionInstruction="Choose the correct letter, A, B or C.",
                   sectionTitle="Teaching handwriting"),
            mc_abc(26, "When discussing whether to teach cursive or print writing, the woman thinks that", "Cursive writing disadvantages a certain group of children.", "Print writing is associated with lower academic performance.", "Most teachers in the UK prefer a traditional approach to handwriting.", "A", "Chữ viết tay bất lợi nhóm trẻ (A)."),
            mc_abc(27, "According to the students, what impact does poor handwriting have on exam performance?", "There is evidence to suggest grades are affected by poor handwriting.", "Neat handwriting is less important now than it used to be.", "Candidates write more slowly and produce shorter answers.", "A", "Ảnh hưởng điểm (A)."),
            mc_abc(28, "What prediction does the man make about the future of handwriting?", "Touch typing will be taught before writing by hand.", "Children will continue to learn to write by hand.", "People will dislike handwriting on digital devices.", "B", "Vẫn học viết tay (B)."),
            mc_abc(29, "The woman is concerned that relying on digital devices has made it difficult for her to", "take detailed notes.", "spell and punctuate.", "read old documents.", "B", "Chính tả và dấu câu (B)."),
            mc_abc(30, "How do the students feel about their own handwriting?", "concerned they are unable to write quickly", "embarrassed by comments made about it", "regretful that they have lost the habit", "C", "Mất thói quen viết (C)."),
        ],
    )


def cam20_t4_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "destroy … and other rodents:", "rats", "Chuột.", word_limit=1,
                sectionTitle="Research in the area around Chembe Bird Sanctuary"),
            gap(32, "prevent farmers from being bitten by …:", "snakes", "Rắn.", word_limit=1),
            gap(33, "support the economy by encouraging …:", "tourism", "Du lịch.", word_limit=1),
            gap(34, "accidentally killed by …:", "traffic", "Giao thông.", word_limit=1),
            gap(35, "especially at times when there are a lot of …:", "rain", "Mưa.", word_limit=1),
            gap(36, "illegally shoot them or … them:", "poison", "Đầu độc.", word_limit=1),
            gap(37, "providing a … for chickens:", "building", "Nhà/chuồng.", word_limit=1),
            gap(38, "keeping a …:", "dog", "Chó.", word_limit=1),
            gap(39, "making a …:", "noise", "Tiếng ồn.", word_limit=1),
            gap(40, "A … of methods is usually most effective:", "combination", "Kết hợp.", word_limit=1),
        ],
        notePassageLayout="lecture",
        passageTitle="Research in the area around Chembe Bird Sanctuary",
        notePassage=[
            np_section("The importance of birds of prey to the local communities"),
            np_static("• They destroy "), np_gap(31), np_static(" and other rodents."),
            np_static("• They help to prevent farmers from being bitten by "), np_gap(32),
            np_static("• They have been an important part of the local culture for many years."),
            np_static("• They now support the economy by encouraging "), np_gap(33), np_static(" in the area."),
            np_section("Falling numbers of birds of prey"),
            np_static("• The birds may be accidentally killed:"),
            np_static("– by "), np_gap(34), np_static(" when they are hunting or sleeping"),
            np_static("– by electrocution from contact with power lines, especially at times when there are a lot of "), np_gap(35),
            np_static("• Local farmers may illegally shoot them or "), np_gap(36), np_static(" them."),
            np_section("Ways of protecting chickens from birds of prey"),
            np_static("• clearing away vegetation from the area (unhelpful)"),
            np_static("• providing a "), np_gap(37), np_static(" for chickens (expensive)"),
            np_static("• frightening birds of prey by:"),
            np_static("– keeping a "), np_gap(38),
            np_static("– making a "), np_gap(39), np_static(" – e.g. with metal objects"),
            np_static("• A "), np_gap(40), np_static(" of methods is usually most effective."),
        ],
    )


TESTS = [
    {
        "folder": "Listening IELTS_Test1_Cam19", "cambridge": 19, "test": 1,
        "title": "IELTS Listening — Cambridge 19 Test 1",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam19_t1_p1},
            {"partNumber": 2, "template": "p2-a12", "file": "exam_part2.json", "build": cam19_t1_p2},
            {"partNumber": 3, "template": "p3-c4", "file": "exam_part3.json", "build": cam19_t1_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam19_t1_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test2_Cam19", "cambridge": 19, "test": 2,
        "title": "IELTS Listening — Cambridge 19 Test 2",
        "parts": [
            {"partNumber": 1, "template": "p1-a4", "file": "exam_part1.json", "build": cam19_t2_p1},
            {"partNumber": 2, "template": "p2-a10", "file": "exam_part2.json", "build": cam19_t2_p2},
            {"partNumber": 3, "template": "p3-c5", "file": "exam_part3.json", "build": cam19_t2_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam19_t2_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test3_Cam19", "cambridge": 19, "test": 3,
        "title": "IELTS Listening — Cambridge 19 Test 3",
        "parts": [
            {"partNumber": 1, "template": "p1-a4", "file": "exam_part1.json", "build": cam19_t3_p1},
            {"partNumber": 2, "template": "p2-a13", "file": "exam_part2.json", "build": cam19_t3_p2},
            {"partNumber": 3, "template": "p3-c3", "file": "exam_part3.json", "build": cam19_t3_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam19_t3_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test4_Cam19", "cambridge": 19, "test": 4,
        "title": "IELTS Listening — Cambridge 19 Test 4",
        "parts": [
            {"partNumber": 1, "template": "p1-a4", "file": "exam_part1.json", "build": cam19_t4_p1},
            {"partNumber": 2, "template": "p2-a13", "file": "exam_part2.json", "build": cam19_t4_p2},
            {"partNumber": 3, "template": "p3-c5", "file": "exam_part3.json", "build": cam19_t4_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam19_t4_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test1_Cam20", "cambridge": 20, "test": 1,
        "title": "IELTS Listening — Cambridge 20 Test 1",
        "parts": [
            {"partNumber": 1, "template": "p1-a5", "file": "exam_part1.json", "build": cam20_t1_p1},
            {"partNumber": 2, "template": "p2-a10", "file": "exam_part2.json", "build": cam20_t1_p2},
            {"partNumber": 3, "template": "p3-c4", "file": "exam_part3.json", "build": cam20_t1_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam20_t1_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test2_Cam20", "cambridge": 20, "test": 2,
        "title": "IELTS Listening — Cambridge 20 Test 2",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam20_t2_p1},
            {"partNumber": 2, "template": "p2-a13", "file": "exam_part2.json", "build": cam20_t2_p2},
            {"partNumber": 3, "template": "p3-c5", "file": "exam_part3.json", "build": cam20_t2_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam20_t2_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test3_Cam20", "cambridge": 20, "test": 3,
        "title": "IELTS Listening — Cambridge 20 Test 3",
        "parts": [
            {"partNumber": 1, "template": "p1-a5", "file": "exam_part1.json", "build": cam20_t3_p1},
            {"partNumber": 2, "template": "p2-a12", "file": "exam_part2.json", "build": cam20_t3_p2},
            {"partNumber": 3, "template": "p3-c5", "file": "exam_part3.json", "build": cam20_t3_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam20_t3_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test4_Cam20", "cambridge": 20, "test": 4,
        "title": "IELTS Listening — Cambridge 20 Test 4",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam20_t4_p1},
            {"partNumber": 2, "template": "p2-a13", "file": "exam_part2.json", "build": cam20_t4_p2},
            {"partNumber": 3, "template": "p3-c4", "file": "exam_part3.json", "build": cam20_t4_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam20_t4_p4},
        ],
    },
]

MAP_IMAGES = [
    ("Listening IELTS_Test1_Cam19", "Test1_Listening_Cam19.pdf", 2),
    ("Listening IELTS_Test3_Cam20", "Test3_Listening_Cam20.pdf", 2),
]


def main():
    print("Building IELTS Listening Cam19 T1–T4 + Cam20 T1–T4…\n")
    grand_total = 0
    for spec in TESTS:
        meta = {
            "version": 1,
            "cambridge": spec["cambridge"],
            "test": spec["test"],
            "title": spec["title"],
            "bandHint": (
                f"IELTS · Cambridge {spec['cambridge']} · Test {spec['test']} · "
                "4 parts · 40 câu"
            ),
            "examType": "ielts",
            "examMode": "practice",
            "durationMinutes": 30,
            "audioFile": "listening.mp3",
            "parts": spec["parts"],
        }
        parts = {p["partNumber"]: p["build"]() for p in spec["parts"]}
        grand_total += write_test(spec["folder"], meta, parts)

    print("\nExtracting map images…")
    for folder, pdf_name, page_idx in MAP_IMAGES:
        pdf = IELTS / folder / pdf_name
        out = IELTS / folder / "map.jpg"
        if pdf.exists():
            extract_map_image(pdf, page_idx, out)
        else:
            print(f"  ⚠ PDF not found: {pdf}")

    print(f"\nDone — {len(TESTS)} tests, {grand_total} question-slots written.")
    print("Next: pnpm ielts:validate / ielts:pack for each folder.")


if __name__ == "__main__":
    main()