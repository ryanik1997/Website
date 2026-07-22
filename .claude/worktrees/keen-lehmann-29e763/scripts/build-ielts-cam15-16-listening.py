"""Rebuild Cam15 T1–T4 + Cam16 T1–T4 Listening JSON from ielts-cam15-16-dump.txt.

Run:
  python scripts/build-ielts-cam15-16-listening.py
  pnpm ielts:validate "IELTS/Listening IELTS_Test1_Cam15"
  pnpm ielts:pack "IELTS/Listening IELTS_Test1_Cam15"
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


def np_example(text):
    return {"type": "example", "text": text}


def flow_match(n, labeled, letters, answer, gap_lead, gap_trail="", **extra):
    return match(
        n, gap_lead, letters, answer,
        labeled=labeled,
        flowChart=True,
        gapLead=gap_lead,
        gapTrail=gap_trail,
        **extra,
    )


# ── Cam15 Test 1 ─────────────────────────────────────────────────────────────

def cam15_t1_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Name of agent: Becky …:", "jamieson", sectionTitle="Bankside Recruitment Agency"),
            gap(2, "Best to call her in the …:", "afternoon"),
            gap(3, "Must have good … skills:", "communication"),
            gap(4, "Jobs are usually for at least one …:", "week"),
            gap(5, "Pay is usually £ … per hour:", "10/ten"),
            gap(6, "Wear a … to the interview:", "suit"),
            gap(7, "Must bring your … to the interview:", "passport"),
            gap(8, "Questions about each applicant's …:", "personality"),
            gap(9, "The … you receive at interview will benefit you:", "feedback"),
            gap(10, "Less … is involved in applying for jobs:", "time"),
        ],
        notePassageLayout="form",
        notePassage=[
            np_section("Bankside Recruitment Agency"),
            np_static("• Address of agency: 497 Eastside, Docklands"),
            np_static("• Name of agent: Becky "), np_gap(1),
            np_static("• Phone number: 07866 510333"),
            np_static("• Best to call her in the "), np_gap(2),
            np_section("Typical jobs"),
            np_static("• Clerical and admin roles, mainly in the finance industry"),
            np_static("• Must have good "), np_gap(3), np_static(" skills"),
            np_static("• Jobs are usually for at least one "), np_gap(4),
            np_static("• Pay is usually £"), np_gap(5), np_static(" per hour"),
            np_section("Registration process"),
            np_static("• Wear a "), np_gap(6), np_static(" to the interview"),
            np_static("• Must bring your "), np_gap(7), np_static(" to the interview"),
            np_static("• They will ask questions about each applicant's "), np_gap(8),
            np_section("Advantages of using an agency"),
            np_static("• The "), np_gap(9), np_static(" you receive at interview will benefit you"),
            np_static("• Will get access to vacancies which are not advertised"),
            np_static("• Less "), np_gap(10), np_static(" is involved in applying for jobs"),
        ],
    )


def cam15_t1_p2():
    return part(
        2, 11, 20,
        "Questions 11–14: Choose A, B or C. Questions 15–20: Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            mc(11, "According to the speaker, the company", [
                ("A", "has been in business for longer than most of its competitors."),
                ("B", "arranges holidays to more destinations than its competitors."),
                ("C", "has more customers than its competitors."),
            ], "A", sectionRange="Questions 11 – 14",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Matthews Island Holidays"),
            mc(12, "Where can customers meet the tour manager before travelling to the Isle of Man?", [
                ("A", "Liverpool"),
                ("B", "Heysham"),
                ("C", "Luton"),
            ], "B"),
            mc(13, "How many lunches are included in the price of the holiday?", [
                ("A", "three"),
                ("B", "four"),
                ("C", "five"),
            ], "A"),
            mc(14, "Customers have to pay extra for", [
                ("A", "guaranteeing themselves a larger room."),
                ("B", "booking at short notice."),
                ("C", "transferring to another date."),
            ], "C"),
            gap(15, "Hotel dining room has view of the …:", "river", word_limit=1,
                sectionRange="Questions 15 – 20",
                sectionInstruction="Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer.",
                sectionTitle="Timetable for Isle of Man holiday"),
            gap(16, "Tynwald may have been founded in … not 979:", "1422", word_limit=1),
            gap(17, "Train to the … of Snaefell:", "top", word_limit=1),
            gap(18, "Company provides a … for local transport and heritage sites:", "pass", word_limit=1),
            gap(19, "Take the … railway train from Douglas to Port Erin:", "steam", word_limit=1),
            gap(20, "Free time, then coach to Castletown – former … has old castle:", "capital", word_limit=1),
        ],
        notePassageLayout="table",
        noteTables=[{
            "gapNumbers": list(range(15, 21)),
            "instruction": "Questions 15 – 20\nComplete the table below. Write ONE WORD AND/OR A NUMBER for each answer.",
            "title": "Timetable for Isle of Man holiday",
            "headers": ["", "Activity", "Notes"],
            "rows": [
                {"cells": [
                    [tbl_static("Day 1")],
                    [tbl_static("Arrive")],
                    [tbl_static("Introduction by manager"), tbl_break(),
                     tbl_static("Hotel dining room has view of the "), tbl_gap(15)],
                ]},
                {"cells": [
                    [tbl_static("Day 2")],
                    [tbl_static("Tynwald Exhibition and Peel")],
                    [tbl_static("Tynwald may have been founded in "), tbl_gap(16),
                     tbl_static(" not 979.")],
                ]},
                {"cells": [
                    [tbl_static("Day 3")],
                    [tbl_static("Trip to Snaefell")],
                    [tbl_static("Travel along promenade in tram; train to Laxey; train to the "),
                     tbl_gap(17), tbl_static(" of Snaefell")],
                ]},
                {"cells": [
                    [tbl_static("Day 4")],
                    [tbl_static("Free day")],
                    [tbl_static("Company provides a "), tbl_gap(18),
                     tbl_static(" for local transport and heritage sites.")],
                ]},
                {"cells": [
                    [tbl_static("Day 5")],
                    [tbl_static("Take the "), tbl_gap(19),
                     tbl_static(" railway train from Douglas to Port Erin")],
                    [tbl_static("Free time, then coach to Castletown – former "), tbl_gap(20),
                     tbl_static(" has old castle.")],
                ]},
                {"cells": [
                    [tbl_static("Day 6")],
                    [tbl_static("Leave")],
                    [tbl_static("Leave the island by ferry or plane")],
                ]},
            ],
        }],
    )


def cam15_t1_p3():
    trait_opts = [
        ("A", "outgoing"), ("B", "selfish"), ("C", "independent"),
        ("D", "attention-seeking"), ("E", "introverted"), ("F", "co-operative"),
        ("G", "caring"), ("H", "competitive"),
    ]
    letters = list("ABCDEFGH")
    return part(
        3, 21, 30,
        "Questions 21–26: Matching A–H. Questions 27–28: Choose A, B or C. Questions 29–30: Choose TWO A–E.",
        [
            match(21, "the eldest child", letters, "G", labeled=trait_opts,
                  sectionRange="Questions 21 – 26",
                  sectionInstruction="What did findings of previous research claim about the personality traits a child is likely to have because of their position in the family? Choose SIX answers from the box and write the correct letter, A–H, next to Questions 21–26.",
                  sectionTitle="Personality traits"),
            match(22, "a middle child", letters, "F", labeled=trait_opts),
            match(23, "the youngest child", letters, "A", labeled=trait_opts),
            match(24, "a twin", letters, "E", labeled=trait_opts),
            match(25, "an only child", letters, "B", labeled=trait_opts),
            match(26, "a child with much older siblings", letters, "C", labeled=trait_opts),
            mc(27, "What do the speakers say about the evidence relating to birth order and academic success?", [
                ("A", "There is conflicting evidence about whether oldest children perform best in intelligence tests."),
                ("B", "There is little doubt that birth order has less influence on academic achievement than socio-economic status."),
                ("C", "Some studies have neglected to include important factors such as family size."),
            ], "C", sectionRange="Questions 27 and 28",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(28, "What does Ruth think is surprising about the difference in oldest children's academic performance?", [
                ("A", "It is mainly thanks to their roles as teachers for their younger siblings."),
                ("B", "The advantages they have only lead to a slightly higher level of achievement."),
                ("C", "The extra parental attention they receive at a young age makes little difference."),
            ], "A"),
            *choose_two(29, 30,
                        "Which TWO experiences of sibling rivalry do the speakers agree has been valuable for them?",
                        [("A", "learning to share"),
                         ("B", "learning to stand up for oneself"),
                         ("C", "learning to be a good loser"),
                         ("D", "learning to be tolerant"),
                         ("E", "learning to say sorry")],
                        "B/D", "Tự vệ (B) và khoan dung (D).",
                        sectionRange="Questions 29 and 30",
                        sectionInstruction="Choose TWO letters, A–E."),
        ],
    )


def cam15_t1_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "provides … and food for a wide range of species:", "shelter", sectionTitle="The Eucalyptus Tree in Australia"),
            gap(32, "leaves provide … which is used to make a disinfectant:", "oil"),
            gap(33, "lime used for making … was absorbed:", "roads"),
            gap(34, "… feed on eucalyptus leaves:", "insects"),
            gap(35, "resulting in the growth of …:", "grass/grasses"),
            gap(36, "make more … available to the trees:", "water"),
            gap(37, "maintain the quality of the …:", "soil"),
            gap(38, "growth of … rainforest:", "dry"),
            gap(39, "a … ecosystem:", "simple"),
            gap(40, "ideal environment for the … of the bell-miner:", "nest/nests"),
        ],
        passageTitle="The Eucalyptus Tree in Australia",
        notePassageLayout="lecture",
        notePassage=[
            np_section("Importance"),
            np_static("• it provides "), np_gap(31), np_static(" and food for a wide range of species"),
            np_static("• its leaves provide "), np_gap(32), np_static(" which is used to make a disinfectant"),
            np_section("Reasons for present decline in number"),
            np_section("A) Diseases"),
            np_static("(i) 'Mundulla Yellows'"),
            np_static("• Cause – lime used for making "), np_gap(33), np_static(" was absorbed"),
            np_static("– trees were unable to take in necessary iron through their roots"),
            np_static("(ii) 'Bell-miner Associated Die-back'"),
            np_static("• Cause – "), np_gap(34), np_static(" feed on eucalyptus leaves"),
            np_static("– they secrete a substance containing sugar"),
            np_static("– bell-miner birds are attracted by this and keep away other species"),
            np_section("B) Bushfires"),
            np_static("William Jackson's theory:"),
            np_static("• high-frequency bushfires result in the growth of "), np_gap(35),
            np_static("• mid-frequency bushfires result in the growth of eucalyptus forests because they:"),
            np_static("– make more "), np_gap(36), np_static(" available to the trees"),
            np_static("– maintain the quality of the "), np_gap(37),
            np_static("• low-frequency bushfires result in the growth of '"), np_gap(38), np_static("' rainforest, which is:"),
            np_static("– a "), np_gap(39), np_static(" ecosystem"),
            np_static("– an ideal environment for the "), np_gap(40), np_static(" of the bell-miner"),
        ],
    )


# ── Cam15 Test 2 ─────────────────────────────────────────────────────────────

def cam15_t2_p1():
    return part(
        1, 1, 10,
        "Questions 1–4: Complete the table below. Write ONE WORD ONLY for each answer. "
        "Questions 5–10: Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(1, "company called …:", "eustatis", word_limit=1,
                sectionRange="Questions 1 – 4",
                sectionInstruction="Complete the table below. Write ONE WORD ONLY for each answer.",
                sectionTitle="Festival information"),
            gap(2, "has had a good …:", "review", word_limit=1),
            gap(3, "a … show:", "dance", word_limit=1),
            gap(4, "show is called …:", "chat", word_limit=1),
            gap(5, "Making … food:", "healthy", word_limit=1,
                sectionRange="Questions 5 – 10",
                sectionInstruction="Complete the notes below. Write ONE WORD ONLY for each answer.",
                sectionTitle="Activities"),
            gap(6, "Making …:", "posters", word_limit=1),
            gap(7, "Making toys from …:", "wood", word_limit=1),
            gap(8, "Swimming in the …:", "lake", word_limit=1),
            gap(9, "expert on …:", "insects", word_limit=1),
            gap(10, "festival organiser's …:", "blog", word_limit=1),
        ],
        noteTables=[
            {
                "gapNumbers": [1, 2, 3, 4],
                "instruction": "Questions 1 – 4\nComplete the table below. Write ONE WORD ONLY for each answer.",
                "title": "Festival information",
                "headers": ["Date", "Type of event", "Details"],
                "rows": [
                    {"cells": [
                        [tbl_static("17th")], [tbl_static("a concert")],
                        [tbl_static("performers from Canada")],
                    ]},
                    {"cells": [
                        [tbl_static("18th")], [tbl_static("a ballet")],
                        [tbl_static("company called "), tbl_gap(1)],
                    ]},
                    {"cells": [
                        [tbl_static("19th–20th (afternoon)")], [tbl_static("a play")],
                        [tbl_static("type of play: a comedy called Jemima"),
                         tbl_break(), tbl_static("has had a good "), tbl_gap(2)],
                    ]},
                    {"cells": [
                        [tbl_static("20th (evening)")], [tbl_gap(3), tbl_static(" show")],
                        [tbl_static("show is called "), tbl_gap(4)],
                    ]},
                ],
            },
        ],
        notePassageSections=[{
            "gapNumbers": [5, 6, 7, 8, 9, 10],
            "instruction": "Questions 5 – 10\nComplete the notes below. Write ONE WORD ONLY for each answer.",
            "title": "Activities",
            "blocks": [
                np_section("Workshops"),
                np_static("• Making "), np_gap(5), np_static(" food"),
                np_static("• (children only) Making "), np_gap(6),
                np_static("• (adults only) Making toys from "), np_gap(7),
                np_static(" using various tools"),
                np_section("Outdoor activities"),
                np_static("• Swimming in the "), np_gap(8),
                np_static("• Walking in the woods, led by an expert on "), np_gap(9),
                np_static("See the festival organiser's "), np_gap(10),
                np_static(" for more information"),
            ],
        }],
        passageTitle="Festival information",
    )


def cam15_t2_p2():
    letters = list("ABCDEFGHI")
    return part(
        2, 11, 20,
        "Questions 11–14: Choose A, B or C. Questions 15–20: Label the map A–I.",
        [
            mc(11, "The park was originally established", [
                ("A", "as an amenity provided by the city council."),
                ("B", "as land belonging to a private house."),
                ("C", "as a shared area set up by the local community."),
            ], "C", sectionRange="Questions 11 – 14",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Minster Park"),
            mc(12, "Why is there a statue of Diane Gosforth in the park?", [
                ("A", "She was a resident who helped to lead a campaign."),
                ("B", "She was a council member responsible for giving the public access."),
                ("C", "She was a senior worker at the park for many years."),
            ], "A"),
            mc(13, "During the First World War, the park was mainly used for", [
                ("A", "exercises by troops."),
                ("B", "growing vegetables."),
                ("C", "public meetings."),
            ], "B"),
            mc(14, "When did the physical transformation of the park begin?", [
                ("A", "2013"),
                ("B", "2015"),
                ("C", "2016"),
            ], "C"),
            map_label(15, "statue of Diane Gosforth", letters, "E",
                      sectionRange="Questions 15 – 20",
                      sectionInstruction="Label the map below. Write the correct letter, A–I, next to Questions 15–20.",
                      sectionTitle="Minster Park"),
            map_label(16, "wooden sculptures", letters, "C"),
            map_label(17, "playground", letters, "B"),
            map_label(18, "maze", letters, "F"),
            map_label(19, "tennis courts", letters, "A"),
            map_label(20, "fitness area", letters, "G"),
        ],
        imageFile="map.jpg",
    )


def cam15_t2_p3():
    topic_opts = [
        ("A", "poverty"), ("B", "education"), ("C", "Dickens's travels"),
        ("D", "entertainment"), ("E", "crime and the law"), ("F", "wealth"),
        ("G", "medicine"), ("H", "a woman's life"),
    ]
    letters = list("ABCDEFGH")
    return part(
        3, 21, 30,
        "Questions 21–22 and 23–24: Choose TWO A–E. Questions 25–30: Matching A–H.",
        [
            *choose_two(21, 22,
                        "Which TWO groups of people is the display primarily intended for?",
                        [("A", "students from the English department"),
                         ("B", "residents of the local area"),
                         ("C", "the university's teaching staff"),
                         ("D", "potential new students"),
                         ("E", "students from other departments")],
                        "B/D", "Cư dân (B) và sinh viên mới (D).",
                        sectionRange="Questions 21 and 22",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(23, 24,
                        "What are Cathy and Graham's TWO reasons for choosing the novelist Charles Dickens?",
                        [("A", "His speeches inspired others to try to improve society."),
                         ("B", "He used his publications to draw attention to social problems."),
                         ("C", "His novels are well-known now."),
                         ("D", "He was consulted on a number of social issues."),
                         ("E", "His reputation has changed in recent times.")],
                        "B/C", "Vấn đề xã hội (B) và tiểu thuyết nổi tiếng (C).",
                        sectionRange="Questions 23 and 24",
                        sectionInstruction="Choose TWO letters, A–E."),
            match(25, "The Pickwick Papers", letters, "G", labeled=topic_opts,
                  sectionRange="Questions 25 – 30",
                  sectionInstruction="What topic do Cathy and Graham choose to illustrate with each novel? Choose SIX answers from the box and write the correct letter, A–H, next to Questions 25–30.",
                  sectionTitle="Novels by Dickens"),
            match(26, "Oliver Twist", letters, "B", labeled=topic_opts),
            match(27, "Nicholas Nickleby", letters, "D", labeled=topic_opts),
            match(28, "Martin Chuzzlewit", letters, "C", labeled=topic_opts),
            match(29, "Bleak House", letters, "H", labeled=topic_opts),
            match(30, "Little Dorrit", letters, "F", labeled=topic_opts),
        ],
    )


def cam15_t2_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "… was seen as the main priority to ensure the supply of water:", "irrigation",
                sectionTitle="Agricultural programme in Mozambique"),
            gap(32, "Most of the work organised by farmers' associations was done by …:", "women"),
            gap(33, "provided … for the fences:", "wire/wires"),
            gap(34, "… for suitable crops:", "seed/seeds"),
            gap(35, "… for the fences on their land:", "posts"),
            gap(36, "lack of …:", "transport"),
            gap(37, "Training in methods of food …:", "preservation"),
            gap(38, "special places where … could be kept:", "fish/fishes"),
            gap(39, "suggested keeping …:", "bees"),
            gap(40, "the … phase of the programme:", "design"),
        ],
        passageTitle="Agricultural programme in Mozambique",
        notePassage=[
            np_section("How the programme was organised"),
            np_static("• It focused on a dry and arid region in Chicualacuala district, near the Limpopo River."),
            np_static("• People depended on the forest to provide charcoal as a source of income."),
            np_static("• "), np_gap(31), np_static(" was seen as the main priority to ensure the supply of water."),
            np_static("• Most of the work organised by farmers' associations was done by "), np_gap(32),
            np_static("• Fenced areas were created to keep animals away from crops."),
            np_static("• The programme provided"),
            np_static("– "), np_gap(33), np_static(" for the fences"),
            np_static("– "), np_gap(34), np_static(" for suitable crops"),
            np_static("– water pumps"),
            np_static("• The farmers provided"),
            np_static("– labour"),
            np_static("– "), np_gap(35), np_static(" for the fences on their land"),
            np_section("Further developments"),
            np_static("• The marketing of produce was sometimes difficult due to lack of "), np_gap(36),
            np_static("• Training was therefore provided in methods of food "), np_gap(37),
            np_static("• Farmers made special places where "), np_gap(38), np_static(" could be kept"),
            np_static("• Local people later suggested keeping "), np_gap(39),
            np_section("Evaluation and lessons learned"),
            np_static("• Agricultural production increased, improving incomes and food security."),
            np_static("• Enough time must be allowed, particularly for the "), np_gap(40),
            np_static(" phase of the programme."),
        ],
    )


# ── Cam15 Test 3 ─────────────────────────────────────────────────────────────

def cam15_t3_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Administrative assistant in a company that produces … (North London):", "furniture",
                sectionTitle="Employment Agency: Possible Jobs"),
            gap(2, "go to … and take notes:", "meetings"),
            gap(3, "management of …:", "diary"),
            gap(4, "attention to …:", "detail/details"),
            gap(5, "need a minimum of … of experience of teleconferencing:", "1/one year"),
            gap(6, "managing …:", "deliveries"),
            gap(7, "very organised and …:", "tidy"),
            gap(8, "used to working in a …:", "team"),
            gap(9, "able to cope with items that are …:", "heavy"),
            gap(10, "… service:", "customer"),
        ],
        notePassageLayout="form",
        notePassage=[
            np_section("Employment Agency: Possible Jobs"),
            np_section("First Job"),
            np_static("Administrative assistant in a company that produces "), np_gap(1),
            np_static("(North London)"),
            np_section("Responsibilities"),
            np_static("• data entry"),
            np_static("• go to "), np_gap(2), np_static(" and take notes"),
            np_static("• general admin"),
            np_static("• management of "), np_gap(3),
            np_section("Requirements"),
            np_static("• good computer skills including spreadsheets"),
            np_static("• good interpersonal skills"),
            np_static("• attention to "), np_gap(4),
            np_section("Experience"),
            np_static("• need a minimum of "), np_gap(5),
            np_static(" of experience of teleconferencing"),
            np_section("Second Job"),
            np_static("Warehouse assistant in South London"),
            np_section("Responsibilities"),
            np_static("• stock management"),
            np_static("• managing "), np_gap(6),
            np_section("Requirements"),
            np_static("• ability to work with numbers"),
            np_static("• good computer skills"),
            np_static("• very organised and "), np_gap(7),
            np_static("• good communication skills"),
            np_static("• used to working in a "), np_gap(8),
            np_static("• able to cope with items that are "), np_gap(9),
            np_section("Need experience of"),
            np_static("• driving in London"),
            np_static("• warehouse work"),
            np_static("• "), np_gap(10), np_static(" service"),
        ],
    )


def cam15_t3_p2():
    return part(
        2, 11, 20,
        "Questions 11–16: Choose A, B or C. Questions 17–18 and 19–20: Choose TWO A–E.",
        [
            mc(11, "When did the Street Play Scheme first take place?", [
                ("A", "two years ago"),
                ("B", "three years ago"),
                ("C", "six years ago"),
            ], "B", sectionRange="Questions 11 – 16",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Street Play Scheme"),
            mc(12, "How often is Beechwood Road closed to traffic now?", [
                ("A", "once a week"),
                ("B", "on Saturdays and Sundays"),
                ("C", "once a month"),
            ], "A"),
            mc(13, "Who is responsible for closing the road?", [
                ("A", "a council official"),
                ("B", "the police"),
                ("C", "local wardens"),
            ], "C"),
            mc(14, "Residents who want to use their cars", [
                ("A", "have to park in another street."),
                ("B", "must drive very slowly."),
                ("C", "need permission from a warden."),
            ], "B"),
            mc(15, "Alice says that Street Play Schemes are most needed in", [
                ("A", "wealthy areas."),
                ("B", "quiet suburban areas."),
                ("C", "areas with heavy traffic."),
            ], "C"),
            mc(16, "What has been the reaction of residents who are not parents?", [
                ("A", "Many of them were unhappy at first."),
                ("B", "They like seeing children play in the street."),
                ("C", "They are surprised by the lack of noise."),
            ], "B"),
            *choose_two(17, 18,
                        "Which TWO benefits for children does Alice think are the most important?",
                        [("A", "increased physical activity"),
                         ("B", "increased sense of independence"),
                         ("C", "opportunity to learn new games"),
                         ("D", "opportunity to be part of a community"),
                         ("E", "opportunity to make new friends")],
                        "B/D", "Độc lập (B) và cộng đồng (D).",
                        sectionRange="Questions 17 and 18",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(19, 20,
                        "Which TWO results of the King Street experiment surprised Alice?",
                        [("A", "more shoppers"),
                         ("B", "improved safety"),
                         ("C", "less air pollution"),
                         ("D", "more relaxed atmosphere"),
                         ("E", "less noise pollution")],
                        "A/E", "Nhiều người mua sắm (A) và ít ồn (E).",
                        sectionRange="Questions 19 and 20",
                        sectionInstruction="Choose TWO letters, A–E."),
        ],
    )


def cam15_t3_p3():
    action_opts = [
        ("A", "She will definitely look for a suitable article."),
        ("B", "She may look for a suitable article."),
        ("C", "She definitely won't look for an article."),
    ]
    return part(
        3, 21, 30,
        "Questions 21–26: Complete the notes below. Write ONE WORD ONLY for each answer. Questions 27–30: Matching A–C.",
        [
            gap(21, "what … the item is on:", "page", word_limit=1,
                sectionRange="Questions 21 – 26",
                sectionInstruction="Complete the notes below. Write ONE WORD ONLY for each answer.",
                sectionTitle="What Hazel should analyse about items in newspapers"),
            gap(22, "the … of the item, including the headline:", "size", word_limit=1),
            gap(23, "any … accompanying the item:", "graphic/graphics", word_limit=1),
            gap(24, "the … of the item:", "structure", word_limit=1),
            gap(25, "the writer's main …:", "purpose", word_limit=1),
            gap(26, "the … the writer may make about the reader:", "assumption/assumptions", word_limit=1),
            match(27, "national news item", list("ABC"), "A", labeled=action_opts,
                  sectionRange="Questions 27 – 30",
                  sectionInstruction="What does Hazel decide to do about each of the following types of articles? Write the correct letter, A, B or C, next to Questions 27–30.",
                  sectionTitle="Types of articles"),
            match(28, "editorial", list("ABC"), "C", labeled=action_opts),
            match(29, "human interest", list("ABC"), "C", labeled=action_opts),
            match(30, "arts", list("ABC"), "B", labeled=action_opts),
        ],
        notePassage=[
            np_static("• what "), np_gap(21), np_static(" the item is on"),
            np_static("• the "), np_gap(22), np_static(" of the item, including the headline"),
            np_static("• any "), np_gap(23), np_static(" accompanying the item"),
            np_static("• the "), np_gap(24), np_static(" of the item, e.g. what's made prominent"),
            np_static("• the writer's main "), np_gap(25),
            np_static("• the "), np_gap(26), np_static(" the writer may make about the reader"),
        ],
    )


def cam15_t3_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "water was used to wash off …:", "mud", sectionTitle="Early history of keeping clean"),
            gap(32, "soap-like material found in … cylinders:", "clay"),
            gap(33, "scraper made of …:", "metal"),
            gap(34, "used soap to colour their …:", "hair"),
            gap(35, "water carried to Roman … by aqueducts:", "bath/baths"),
            gap(36, "decline in bathing contributed to occurrence of …:", "disease/diseases"),
            gap(37, "… began to be added to soap:", "perfume"),
            gap(38, "making soda ash from …:", "salt"),
            gap(39, "turned soapmaking into a …:", "science"),
            gap(40, "no longer a … on soap:", "tax"),
        ],
        passageTitle="Early history of keeping clean",
        notePassage=[
            np_section("Prehistoric times"),
            np_static("• water was used to wash off "), np_gap(31),
            np_section("Ancient Babylon"),
            np_static("• soap-like material found in "), np_gap(32), np_static(" cylinders"),
            np_section("Ancient Greece"),
            np_static("• people cleaned themselves with sand and other substances"),
            np_static("• used a strigil — scraper made of "), np_gap(33),
            np_static("• washed clothes in streams"),
            np_section("Ancient Germany and Gaul"),
            np_static("• used soap to colour their "), np_gap(34),
            np_section("Ancient Rome"),
            np_static("• animal fat, ashes and clay mixed through action of rain, used for washing clothes"),
            np_static("• from about 312 BC, water carried to Roman "), np_gap(35), np_static(" by aqueducts"),
            np_section("Europe in Middle Ages"),
            np_static("• decline in bathing contributed to occurrence of "), np_gap(36),
            np_static("• "), np_gap(37), np_static(" began to be added to soap"),
            np_section("Europe from 17th century"),
            np_static("• 1600s: cleanliness and bathing started becoming usual"),
            np_static("• 1791: Leblanc invented a way of making soda ash from "), np_gap(38),
            np_static("• early 1800s: Chevreul turned soapmaking into a "), np_gap(39),
            np_static("• from 1800s, there was no longer a "), np_gap(40), np_static(" on soap"),
        ],
    )


# ── Cam15 Test 4 ─────────────────────────────────────────────────────────────

def cam15_t4_p1():
    return part(
        1, 1, 10,
        "Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Occupation:", "journalist", sectionTitle="Customer Satisfaction Survey"),
            gap(2, "Reason for travel today:", "shopping"),
            gap(3, "Name of station returning to:", "staunfirth"),
            gap(4, "Type of ticket purchased: standard … ticket:", "return"),
            gap(5, "Cost of ticket: £ …:", "23.70"),
            gap(6, "Where ticket was bought:", "online"),
            gap(7, "Least satisfied with: the … this morning:", "delay"),
            gap(8, "how much … was provided:", "information"),
            gap(9, "lack of seats, particularly on the …:", "platform/platforms"),
            gap(10, "the … available:", "parking"),
        ],
        passageTitle="Customer Satisfaction Survey",
        notePassageLayout="form",
        notePassage=[
            np_example("Example\nName: Sophie Bird"),
            np_section("Customer details"),
            np_static("• Occupation:"), np_gap(1),
            np_static("• Reason for travel today:"), np_gap(2),
            np_section("Journey information"),
            np_static("• Name of station returning to:"), np_gap(3),
            np_static("• Type of ticket purchased: standard "), np_gap(4), np_static(" ticket"),
            np_static("• Cost of ticket: £"), np_gap(5),
            np_static("• When ticket was purchased: yesterday"),
            np_static("• Where ticket was bought:"), np_gap(6),
            np_section("Satisfaction with journey"),
            np_static("• Most satisfied with: the wifi"),
            np_static("• Least satisfied with: the "), np_gap(7), np_static(" this morning"),
            np_section("Satisfaction with station facilities"),
            np_static("• how much "), np_gap(8), np_static(" was provided"),
            np_static("• Most satisfied with: lack of seats, particularly on the "), np_gap(9),
            np_static("• Least satisfied with: the "), np_gap(10), np_static(" available"),
        ],
    )


def cam15_t4_p2():
    letters = list("ABCDEFGH")
    return part(
        2, 11, 20,
        "Questions 11–16: Label the map A–H. Questions 17–18 and 19–20: Choose TWO A–E.",
        [
            map_label(11, "cafe", letters, "D",
                      sectionRange="Questions 11 – 16",
                      sectionInstruction="Label the map below. Write the correct letter, A–H, next to Questions 11–16.",
                      sectionTitle="Croft Valley Park"),
            map_label(12, "toilets", letters, "C"),
            map_label(13, "formal gardens", letters, "G"),
            map_label(14, "outdoor gym", letters, "H"),
            map_label(15, "skateboard ramp", letters, "A"),
            map_label(16, "wild flowers", letters, "E"),
            *choose_two(17, 18,
                        "What does the speaker say about the adventure playground?",
                        [("A", "Children must be supervised."),
                         ("B", "It costs more in winter."),
                         ("C", "Some activities are only for younger children."),
                         ("D", "No payment is required."),
                         ("E", "It was recently expanded.")],
                        "A/D", "Giám sát (A) và miễn phí (D).",
                        sectionRange="Questions 17 and 18",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(19, 20,
                        "What does the speaker say about the glass houses?",
                        [("A", "They are closed at weekends."),
                         ("B", "Volunteers are needed to work there."),
                         ("C", "They were badly damaged by fire."),
                         ("D", "More money is needed to repair some of the glass."),
                         ("E", "Visitors can see palm trees from tropical regions.")],
                        "A/C", "Cuối tuần đóng (A) và hỏa hoạn (C).",
                        sectionRange="Questions 19 and 20",
                        sectionInstruction="Choose TWO letters, A–E."),
        ],
        imageFile="map.jpg",
    )


def cam15_t4_p3():
    who_opts = [
        ("A", "Annie"), ("B", "Jack"), ("C", "both Annie and Jack"),
    ]
    return part(
        3, 21, 30,
        "Questions 21–24: Choose A, B or C. Questions 25–30: Matching A–C.",
        [
            mc(21, "What did Annie discover from reading about icehouses?", [
                ("A", "why they were first created"),
                ("B", "how the ice was kept frozen"),
                ("C", "where they were located"),
            ], "B", sectionRange="Questions 21 – 24",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Presentation about refrigeration"),
            mc(22, "What point does Annie make about refrigeration in ancient Rome?", [
                ("A", "It became a commercial business."),
                ("B", "It used snow from nearby."),
                ("C", "It took a long time to become popular."),
            ], "A"),
            mc(23, "In connection with modern refrigerators, both Annie and Jack are worried about", [
                ("A", "the complexity of the technology."),
                ("B", "the fact that some are disposed of irresponsibly."),
                ("C", "the large number that quickly break down."),
            ], "B"),
            mc(24, "What do Jack and Annie agree regarding domestic fridges?", [
                ("A", "They are generally good value for money."),
                ("B", "There are plenty of useful variations."),
                ("C", "They are more useful than other domestic appliances."),
            ], "A"),
            match(25, "the goods that are refrigerated", list("ABC"), "B", labeled=who_opts,
                  sectionRange="Questions 25 – 30",
                  sectionInstruction="Who is going to do research into each topic? Write the correct letter, A, B or C, next to Questions 25–30.",
                  sectionTitle="Topics"),
            match(26, "the effects on health", list("ABC"), "A", labeled=who_opts),
            match(27, "the impact on food producers", list("ABC"), "A", labeled=who_opts),
            match(28, "the impact on cities", list("ABC"), "B", labeled=who_opts),
            match(29, "refrigerated transport", list("ABC"), "A", labeled=who_opts),
            match(30, "domestic fridges", list("ABC"), "C", labeled=who_opts),
        ],
    )


def cam15_t4_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "people's possessions were used to measure Britain's …:", "wealth",
                sectionTitle="How the Industrial Revolution affected life in Britain"),
            gap(32, "Developments in production of goods and in …:", "technology"),
            gap(33, "new types of … that were used then:", "power"),
            gap(34, "The leading industry was …:", "textile/textiles"),
            gap(35, "New … made factories necessary:", "machines"),
            gap(36, "greater access to …:", "newspapers"),
            gap(37, "not limited to buying … goods:", "local"),
            gap(38, "inside stores because of better …:", "lighting"),
            gap(39, "because … were bigger:", "windows"),
            gap(40, "… that was persuasive became much more common:", "advertising"),
        ],
        passageTitle="How the Industrial Revolution affected life in Britain",
        notePassage=[
            np_section("19th century"),
            np_static("• For the first time, people's possessions were used to measure Britain's "), np_gap(31),
            np_static("• Developments in production of goods and in "), np_gap(32), np_static(" greatly changed lives."),
            np_section("MAIN AREAS OF CHANGE"),
            np_section("Manufacturing"),
            np_static("• The Industrial Revolution would not have happened without the new types of "), np_gap(33),
            np_static(" that were used then."),
            np_static("• The leading industry was "), np_gap(34), np_static(" (its products became widely available)."),
            np_static("• New "), np_gap(35), np_static(" made factories necessary and so more people moved into towns."),
            np_section("Transport"),
            np_static("• The railways took the place of canals."),
            np_static("• Because of the new transport:"),
            np_static("greater access to "), np_gap(36), np_static(" made people more aware of what they could buy in shops."),
            np_static("when shopping, people were not limited to buying "), np_gap(37), np_static(" goods."),
            np_section("Retailing"),
            np_static("• The first department stores were opened."),
            np_static("• The displays of goods were more visible:"),
            np_static("– inside stores because of better "), np_gap(38),
            np_static("– outside stores, because "), np_gap(39), np_static(" were bigger."),
            np_static("• "), np_gap(40), np_static(" that was persuasive became much more common."),
        ],
    )


# ── Cam16 Test 1 ─────────────────────────────────────────────────────────────

def cam16_t1_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Create a cover for an …:", "egg", sectionTitle="Children's Engineering Workshops"),
            gap(2, "build the tallest …:", "tower"),
            gap(3, "Make a … powered by a balloon:", "car"),
            gap(4, "trucks and …:", "animals"),
            gap(5, "build the longest …:", "bridge"),
            gap(6, "Create a short …:", "movie/film"),
            gap(7, "Build, … and program a humanoid robot:", "decorate"),
            gap(8, "Held on … from 10 am to 11 am:", "wednesdays"),
            gap(9, "… Industrial Estate, Grasford:", "fradstone"),
            gap(10, "Plenty of … is available:", "parking"),
        ],
        notePassageLayout="form",
        notePassage=[
            np_section("Tiny Engineers (ages 4–5)"),
            np_static("Activities"),
            np_static("• Create a cover for an "), np_gap(1),
            np_static(" so they can drop it from a height without breaking it."),
            np_static("• Take part in a competition to build the tallest "), np_gap(2),
            np_static("• Make a "), np_gap(3), np_static(" powered by a balloon."),
            np_section("Junior Engineers (ages 6–8)"),
            np_static("Activities:"),
            np_static("• Build model cars, trucks and "), np_gap(4),
            np_static(" and learn how to program them so they can move."),
            np_static("• Take part in a competition to build the longest "), np_gap(5),
            np_static(" using card and wood."),
            np_static("• Create a short "), np_gap(6), np_static(" with special software."),
            np_static("• Build, "), np_gap(7), np_static(" and program a humanoid robot."),
            np_static("Cost for a five-week block: £50"),
            np_static("Held on "), np_gap(8), np_static(" from 10 am to 11 am"),
            np_section("Location"),
            np_static("Building 10A, "), np_gap(9), np_static(" Industrial Estate, Grasford"),
            np_static("Plenty of "), np_gap(10), np_static(" is available."),
        ],
    )


def cam16_t1_p2():
    letters = list("ABCDEFGHIJ")
    return part(
        2, 11, 20,
        "Questions 11–14: Choose A, B or C. Questions 15–20: Label the plan A–J.",
        [
            mc(11, "Stevenson's was founded in", [
                ("A", "1923."),
                ("B", "1924."),
                ("C", "1926."),
            ], "C", sectionRange="Questions 11 – 14",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(12, "Originally, Stevenson's manufactured goods for", [
                ("A", "the healthcare industry."),
                ("B", "the automotive industry."),
                ("C", "the machine tools industry."),
            ], "A"),
            mc(13, "What does the speaker say about the company premises?", [
                ("A", "The company has recently moved."),
                ("B", "The company has no plans to move."),
                ("C", "The company is going to move shortly."),
            ], "B"),
            mc(14, "The programme for the work experience group includes", [
                ("A", "time to do research."),
                ("B", "meetings with a teacher."),
                ("C", "talks by staff."),
            ], "C"),
            map_label(15, "coffee room", letters, "H",
                      sectionRange="Questions 15 – 20",
                      sectionInstruction="Label the map below. Write the correct letter, A–J, next to Questions 15–20.",
                      sectionTitle="Plan of Stevenson's site"),
            map_label(16, "warehouse", letters, "C"),
            map_label(17, "staff canteen", letters, "G"),
            map_label(18, "meeting room", letters, "B"),
            map_label(19, "human resources", letters, "I"),
            map_label(20, "boardroom", letters, "A"),
        ],
        imageFile="map.jpg",
    )


def cam16_t1_p3():
    meaning_opts = [
        ("A", "a childhood memory"), ("B", "hope for the future"), ("C", "fast movement"),
        ("D", "a potential threat"), ("E", "the power of colour"), ("F", "the continuity of life"),
        ("G", "protection of nature"), ("H", "a confused attitude to nature"),
    ]
    letters = list("ABCDEFGH")
    return part(
        3, 21, 30,
        "Questions 21–22 and 23–24: Choose TWO A–E. Questions 25–30: Matching A–H.",
        [
            *choose_two(21, 22,
                        "Which TWO parts of the introductory stage to their art projects do Jess and Tom agree were useful?",
                        [("A", "the Bird Park visit"),
                         ("B", "the workshop sessions"),
                         ("C", "the Natural History Museum visit"),
                         ("D", "the projects done in previous years"),
                         ("E", "the handouts with research sources")],
                        "C/E", "Bảo tàng (C) và tài liệu (E).",
                        sectionRange="Questions 21 and 22",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(23, 24,
                        "In which TWO ways do both Jess and Tom decide to change their proposals?",
                        [("A", "by giving a rationale for their action plans"),
                         ("B", "by being less specific about the outcome"),
                         ("C", "by adding a video diary presentation"),
                         ("D", "by providing a timeline and a mind map"),
                         ("E", "by making their notes more evaluative")],
                        "B/E", "Ít cụ thể (B) và đánh giá (E).",
                        sectionRange="Questions 23 and 24",
                        sectionInstruction="Choose TWO letters, A–E."),
            match(25, "Falcon (Landseer)", letters, "D", labeled=meaning_opts,
                  sectionRange="Questions 25 – 30",
                  sectionInstruction="Which personal meaning do the students decide to give to each of the following pictures? Choose SIX answers from the box and write the correct letter, A–H, next to Questions 25–30.",
                  sectionTitle="Pictures"),
            match(26, "Fish hawk (Audubon)", letters, "F", labeled=meaning_opts),
            match(27, "Kingfisher (van Gogh)", letters, "A", labeled=meaning_opts),
            match(28, "Portrait of William Wells", letters, "C", labeled=meaning_opts),
            match(29, "Vairumati (Gauguin)", letters, "H", labeled=meaning_opts),
            match(30, "Portrait of Giovanni de Medici", letters, "G", labeled=meaning_opts),
        ],
    )


def cam16_t1_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "Stoicism is still relevant today because of its … appeal:", "practical", sectionTitle="Stoicism"),
            gap(32, "despite not being intended for …:", "publication"),
            gap(33, "the … people make in response can be controlled:", "choices"),
            gap(34, "experiences which others would consider as …:", "negative"),
            gap(35, "organised a … about Cato to motivate his men:", "play"),
            gap(36, "Adam Smith's ideas on … were influenced by Stoicism:", "capitalism"),
            gap(37, "treatment for … is based on ideas from Stoicism:", "depression"),
            gap(38, "people learn to base their thinking on …:", "logic"),
            gap(39, "identifying obstacles as …:", "opportunity"),
            gap(40, "requires a lot of …:", "practice/practise"),
        ],
        passageTitle="Stoicism",
        notePassage=[
            np_static("Stoicism is still relevant today because of its "), np_gap(31), np_static(" appeal."),
            np_section("Ancient Stoics"),
            np_static("• Stoicism was founded over 2,000 years ago in Greece."),
            np_static("• The Stoics' ideas are surprisingly well known, despite not being intended for "), np_gap(32),
            np_section("Stoic principles"),
            np_static("• Happiness could be achieved by leading a virtuous life."),
            np_static("• Controlling emotions was essential."),
            np_static("• Epictetus said that external events cannot be controlled but the "), np_gap(33),
            np_static(" people make in response can be controlled."),
            np_static("• A Stoic is someone who has a different view on experiences which others would consider as "), np_gap(34),
            np_section("The influence of Stoicism"),
            np_static("• George Washington organised a "), np_gap(35), np_static(" about Cato to motivate his men."),
            np_static("• The French artist Delacroix was a Stoic."),
            np_static("• Adam Smith's ideas on "), np_gap(36), np_static(" were influenced by Stoicism."),
            np_static("• Some of today's political leaders are inspired by the Stoics."),
            np_static("• Cognitive Behaviour Therapy (CBT)"),
            np_static("– the treatment for "), np_gap(37), np_static(" is based on ideas from Stoicism"),
            np_static("– people learn to base their thinking on "), np_gap(38),
            np_static("• In business, people benefit from Stoicism by identifying obstacles as "), np_gap(39),
            np_section("Relevance of Stoicism"),
            np_static("• It requires a lot of "), np_gap(40), np_static(" but Stoicism can help people to lead a good life."),
            np_static("• It teaches people that having a strong character is more important than anything else."),
        ],
    )


# ── Cam16 Test 2 ─────────────────────────────────────────────────────────────

def cam16_t2_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Photos must not be in a … or an album:", "frame", sectionTitle="Copying photos to digital format"),
            gap(2, "The cost for 360 photos is £ …:", "195"),
            gap(3, "Before the completed order is sent, … is required:", "payment"),
            gap(4, "folder with the name …:", "grandparents"),
            gap(5, "The … and contrast can be improved:", "colour/color"),
            gap(6, "scanned by …:", "hand"),
            gap(7, "change the …:", "background"),
            gap(8, "not correctly in …:", "focus"),
            gap(9, "Orders are completed within …:", "ten/10 days"),
            gap(10, "Send the photos in a box (not …):", "plastic"),
        ],
        notePassageLayout="form",
        notePassage=[
            np_static("Name of company: Picturerep"),
            np_section("Requirements"),
            np_static("• Maximum size of photos is 30 cm, minimum size 4 cm."),
            np_static("• Photos must not be in a "), np_gap(1), np_static(" or an album."),
            np_section("Cost"),
            np_static("• The cost for 360 photos is £"), np_gap(2), np_static(" (including one disk)."),
            np_static("• Before the completed order is sent, "), np_gap(3), np_static(" is required."),
            np_section("Services included in the price"),
            np_static("• Photos can be placed in a folder, e.g. with the name "), np_gap(4),
            np_static("• The "), np_gap(5), np_static(" and contrast can be improved if necessary."),
            np_static("• Photos which are very fragile will be scanned by "), np_gap(6),
            np_section("Special restore service (costs extra)"),
            np_static("• It may be possible to remove an object from a photo, or change the "), np_gap(7),
            np_static("• A photo which is not correctly in "), np_gap(8), np_static(" cannot be fixed."),
            np_section("Other information"),
            np_static("• Orders are completed within "), np_gap(9),
            np_static("• Send the photos in a box (not "), np_gap(10), np_static(")."),
        ],
    )


def cam16_t2_p2():
    comment_opts = [
        ("A", "pupils help to plan menus"),
        ("B", "only vegetarian food"),
        ("C", "different food every week"),
        ("D", "daily change in menu"),
    ]
    return part(
        2, 11, 20,
        "Questions 11–15: Choose A, B or C. Questions 16–18: Matching A–D. Questions 19–20: Choose TWO A–E.",
        [
            mc(11, "Dartfield House school used to be", [
                ("A", "a tourist information centre."),
                ("B", "a private home."),
                ("C", "a local council building."),
            ], "C", sectionRange="Questions 11 – 15",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(12, "What is planned with regard to the lower school?", [
                ("A", "All buildings on the main site will be improved."),
                ("B", "The lower school site will be used for new homes."),
                ("C", "Additional school buildings will be constructed on the lower school site."),
            ], "B"),
            mc(13, "The catering has been changed because of", [
                ("A", "long queuing times."),
                ("B", "changes to the school timetable."),
                ("C", "dissatisfaction with the menus."),
            ], "A"),
            mc(14, "Parents are asked to", [
                ("A", "help their children to decide in advance which serving point to use."),
                ("B", "make sure their children have enough money for food."),
                ("C", "advise their children on healthy food to eat."),
            ], "A"),
            mc(15, "What does the speaker say about the existing canteen?", [
                ("A", "Food will still be served there."),
                ("B", "Only staff will have access to it."),
                ("C", "Pupils can take their food into it."),
            ], "C"),
            match(16, "World Adventures", list("ABCD"), "D", labeled=comment_opts,
                  sectionRange="Questions 16 – 18",
                  sectionInstruction="What comment does the speaker make about each of the following serving points in the Food Hall? Choose THREE answers from the box and write the correct letter, A–D, next to Questions 16–18.",
                  sectionTitle="Food available at serving points in Food Hall"),
            match(17, "Street Life", list("ABCD"), "A", labeled=comment_opts),
            match(18, "Speedy Italian", list("ABCD"), "B", labeled=comment_opts),
            *choose_two(19, 20,
                        "Which TWO optional after-school lessons are new?",
                        [("A", "swimming"),
                         ("B", "piano"),
                         ("C", "acting"),
                         ("D", "cycling"),
                         ("E", "theatre sound and lighting")],
                        "B/C", "Piano (B) và diễn xuất (C).",
                        sectionRange="Questions 19 and 20",
                        sectionInstruction="Choose TWO letters, A–E."),
        ],
    )


def cam16_t2_p3():
    return part(
        3, 21, 30,
        "Questions 21–24: Choose A, B or C. Questions 25–30: Complete the flow-chart below. Write ONE WORD ONLY for each answer.",
        [
            mc(21, "Luke read that one reason why we often forget dreams is that", [
                ("A", "our memories cannot cope with too much information."),
                ("B", "we might otherwise be confused about what is real."),
                ("C", "we do not think they are important."),
            ], "B", sectionRange="Questions 21 – 24",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Assignment on sleep and dreams"),
            mc(22, "What do Luke and Susie agree about dreams predicting the future?", [
                ("A", "It may just be due to chance."),
                ("B", "It only happens with certain types of event."),
                ("C", "It happens more often than some people think."),
            ], "A"),
            mc(23, "Susie says that a study on pre-school children having a short nap in the day", [
                ("A", "had controversial results."),
                ("B", "used faulty research methodology."),
                ("C", "failed to reach any clear conclusions."),
            ], "C"),
            mc(24, "In their last assignment, both students had problems with", [
                ("A", "statistical analysis."),
                ("B", "making an action plan."),
                ("C", "self-assessment."),
            ], "C"),
            gap(25, "Twelve students from the … department:", "history", word_limit=1,
                flowChart=True, gapLead="Twelve students from the", gapTrail="department",
                sectionRange="Questions 25 – 30",
                sectionInstruction="Complete the flow-chart below. Write ONE WORD ONLY for each answer.",
                sectionTitle="Assignment plan"),
            gap(26, "Answers on …:", "paper", word_limit=1,
                flowChart=True, gapLead="Answers on", gapTrail=""),
            gap(27, "Check ethical guidelines for working with …:", "humans/people", word_limit=1,
                flowChart=True, gapLead="Check ethical guidelines for working with", gapTrail=""),
            gap(28, "risk is assessed and … is kept to a minimum:", "stress", word_limit=1,
                flowChart=True, gapLead="Ensure that risk is assessed and", gapTrail="is kept to a minimum"),
            gap(29, "Calculate the correlation and make a …:", "graph", word_limit=1,
                flowChart=True, gapLead="Calculate the correlation and make a", gapTrail=""),
            gap(30, "… the research:", "evaluate", word_limit=1,
                flowChart=True, gapLead="", gapTrail="the research"),
        ],
        flowChartSteps=[
            {"type": "static", "label": "Decide on research question:",
             "text": "Is there a relationship between hours of sleep and number of dreams?"},
            {"type": "gap", "label": "Decide on sample:", "number": 25},
            {"type": "static", "label": "Decide on methodology:", "text": "Self-reporting"},
            {"type": "gap", "label": "Decide on procedure:", "number": 26},
            {"type": "gap", "number": 27},
            {"type": "gap", "number": 28},
            {"type": "gap", "label": "Analyse the results:", "number": 29},
            {"type": "gap", "number": 30},
        ],
    )


def cam16_t2_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "dance increases …:", "creativity", sectionTitle="Health benefits of dance"),
            gap(32, "dance could be used as a form of …:", "therapy"),
            gap(33, "accessible for people with low levels of …:", "fitness"),
            gap(34, "better … reduces the risk of accidents:", "balance"),
            gap(35, "improves … function by making it work faster:", "brain"),
            gap(36, "gives people more … to take exercise:", "motivation"),
            gap(37, "can lessen the feeling of …:", "isolation"),
            gap(38, "uses up as many … as other intense forms of exercise:", "calories"),
            gap(39, "women suffering from … benefited from doing Zumba:", "obesity"),
            gap(40, "Zumba became a … for the participants:", "habit"),
        ],
        passageTitle="Health benefits of dance",
        notePassage=[
            np_section("Recent findings"),
            np_static("• All forms of dance produce various hormones associated with feelings of happiness."),
            np_static("• Dancing with others has a more positive impact than dancing alone."),
            np_static("• An experiment on university students suggested that dance increases "), np_gap(31),
            np_static("• For those with mental illness, dance could be used as a form of "), np_gap(32),
            np_section("Benefits of dance for older people"),
            np_static("• accessible for people with low levels of "), np_gap(33),
            np_static("• reduces the risk of heart disease"),
            np_static("• better "), np_gap(34), np_static(" reduces the risk of accidents"),
            np_static("• improves "), np_gap(35), np_static(" function by making it work faster"),
            np_static("• improves participants' general well-being"),
            np_static("• gives people more "), np_gap(36), np_static(" to take exercise"),
            np_static("• can lessen the feeling of "), np_gap(37), np_static(", very common in older people"),
            np_section("Benefits of Zumba"),
            np_static("• A study at The University of Wisconsin showed that doing Zumba for 40 minutes uses up as many "), np_gap(38),
            np_static(" as other quite intense forms of exercise."),
            np_static("• The American Journal of Health Behavior study showed that:"),
            np_static("– women suffering from "), np_gap(39), np_static(" benefited from doing Zumba."),
            np_static("– Zumba became a "), np_gap(40), np_static(" for the participants."),
        ],
    )


# ── Cam16 Test 3 ─────────────────────────────────────────────────────────────

def cam16_t3_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "taken to practise in a …:", "park", sectionTitle="Junior Cycle Camp"),
            gap(2, "Instructors wear … shirts:", "blue"),
            gap(3, "A … is required and training is given:", "reference"),
            gap(4, "quiet times during the morning for a … or a game:", "story"),
            gap(5, "Classes are held even if there is …:", "rain"),
            gap(6, "a …:", "snack"),
            gap(7, "Charlie's …:", "medication"),
            gap(8, "his … will be checked:", "helmet"),
            gap(9, "go to the … to meet his class instructor:", "tent"),
            gap(10, "The course costs $ … per week:", "199"),
        ],
        notePassageLayout="form",
        notePassage=[
            np_static("The course focuses on skills and safety."),
            np_static("• Charlie would be placed in Level 5."),
            np_static("• First of all, children at this level are taken to practise in a "), np_gap(1),
            np_section("Instructors"),
            np_static("• Instructors wear "), np_gap(2), np_static(" shirts."),
            np_static("• A "), np_gap(3), np_static(" is required and training is given."),
            np_section("Classes"),
            np_static("• The size of the classes is limited."),
            np_static("• There are quiet times during the morning for a "), np_gap(4), np_static(" or a game."),
            np_static("• Classes are held even if there is "), np_gap(5),
            np_section("What to bring"),
            np_static("• a change of clothing"),
            np_static("• a "), np_gap(6),
            np_static("• shoes (not sandals)"),
            np_static("• Charlie's "), np_gap(7),
            np_section("Day 1"),
            np_static("• Charlie should arrive at 9.20 am on the first day."),
            np_static("• Before the class, his "), np_gap(8), np_static(" will be checked."),
            np_static("• He should then go to the "), np_gap(9), np_static(" to meet his class instructor."),
            np_section("Cost"),
            np_static("• The course costs $"), np_gap(10), np_static(" per week."),
        ],
    )


def cam16_t3_p2():
    info_opts = [
        ("A", "not a permanent job"), ("B", "involves leading a team"), ("C", "experience not essential"),
        ("D", "intensive work but also fun"), ("E", "chance to earn more through overtime"),
        ("F", "chance for rapid promotion"), ("G", "accommodation available"), ("H", "local travel involved"),
    ]
    return part(
        2, 11, 20,
        "Questions 11–12 and 13–14: Choose TWO A–E. Questions 15–20: Matching A–H.",
        [
            *choose_two(11, 12,
                        "According to Megan, what are the TWO main advantages of working in the agriculture and horticulture sectors?",
                        [("A", "the active lifestyle"),
                         ("B", "the above-average salaries"),
                         ("C", "the flexible working opportunities"),
                         ("D", "the opportunities for overseas travel"),
                         ("E", "the chance to be in a natural environment")],
                        "A/C", "Lối sống (A) và linh hoạt (C).",
                        sectionRange="Questions 11 and 12",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(13, 14,
                        "Which TWO of the following are likely to be disadvantages for people working outdoors?",
                        [("A", "the increasing risk of accidents"),
                         ("B", "being in a very quiet location"),
                         ("C", "difficult weather conditions at times"),
                         ("D", "the cost of housing"),
                         ("E", "the level of physical fitness required")],
                        "B/C", "Yên tĩnh (B) và thời tiết (C).",
                        sectionRange="Questions 13 and 14",
                        sectionInstruction="Choose TWO letters, A–E."),
            match(15, "Fresh food commercial manager", list("ABCDEFGH"), "D", labeled=info_opts,
                  sectionRange="Questions 15 – 20",
                  sectionInstruction="What information does Megan give about each of the following job opportunities? Choose SIX answers from the box and write the correct letter, A–H, next to Questions 15–20.",
                  sectionTitle="Job opportunities"),
            match(16, "Agronomist", list("ABCDEFGH"), "F", labeled=info_opts),
            match(17, "Fresh produce buyer", list("ABCDEFGH"), "A", labeled=info_opts),
            match(18, "Garden centre sales manager", list("ABCDEFGH"), "H", labeled=info_opts),
            match(19, "Tree technician", list("ABCDEFGH"), "C", labeled=info_opts),
            match(20, "Farm worker", list("ABCDEFGH"), "G", labeled=info_opts),
        ],
    )


def cam16_t3_p3():
    return part(
        3, 21, 30,
        "Questions 21–22 and 23–24: Choose TWO A–E. Questions 25–30: Choose A, B or C.",
        [
            *choose_two(21, 22,
                        "Which TWO points does Adam make about his experiment on artificial sweeteners?",
                        [("A", "The results were what he had predicted."),
                         ("B", "The experiment was simple to set up."),
                         ("C", "A large sample of people was tested."),
                         ("D", "The subjects were unaware of what they were drinking."),
                         ("E", "The test was repeated several times for each person.")],
                        "C/D", "Mẫu lớn (C) và không biết (D).",
                        sectionRange="Questions 21 and 22",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(23, 24,
                        "Which TWO problems did Rosie have when measuring the fat content of nuts?",
                        [("A", "She used the wrong sort of nuts."),
                         ("B", "She used an unsuitable chemical."),
                         ("C", "She did not grind the nuts finely enough."),
                         ("D", "The information on the nut package was incorrect."),
                         ("E", "The weighing scales may have been unsuitable.")],
                        "C/E", "Nghiền không đủ (C) và cân (E).",
                        sectionRange="Questions 23 and 24",
                        sectionInstruction="Choose TWO letters, A–E."),
            mc(25, "Adam suggests that restaurants could reduce obesity if their menus", [
                ("A", "offered fewer options."),
                ("B", "had more low-calorie foods."),
                ("C", "were organised in a particular way."),
            ], "C", sectionRange="Questions 25 – 30",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(26, "The students agree that food manufacturers deliberately", [
                ("A", "make calorie counts hard to understand."),
                ("B", "fail to provide accurate calorie counts."),
                ("C", "use ineffective methods to reduce calories."),
            ], "A"),
            mc(27, "What does Rosie say about levels of exercise in England?", [
                ("A", "The amount recommended is much too low."),
                ("B", "Most people overestimate how much they do."),
                ("C", "Women now exercise more than they used to."),
            ], "B"),
            mc(28, "Adam refers to the location and width of stairs in a train station to illustrate", [
                ("A", "practical changes that can influence people's behaviour."),
                ("B", "methods of helping people who have mobility problems."),
                ("C", "ways of preventing accidents by controlling crowd movement."),
            ], "A"),
            mc(29, "What do the students agree about including reference to exercise in their presentation?", [
                ("A", "They should probably leave it out."),
                ("B", "They need to do more research on it."),
                ("C", "They should discuss this with their tutor."),
            ], "A"),
            mc(30, "What are the students going to do next for their presentation?", [
                ("A", "prepare some slides for it"),
                ("B", "find out how long they have for it"),
                ("C", "decide on its content and organisation"),
            ], "C"),
        ],
    )


def cam16_t3_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "We imagine someone like a … knitting:", "grandmother", sectionTitle="Hand knitting"),
            gap(32, "A … ago, knitting was expected to disappear:", "decade"),
            gap(33, "People are buying more … for knitting nowadays:", "equipment"),
            gap(34, "gives support in times of … difficulty:", "economic"),
            gap(35, "requires only … skills and little money to start:", "basic"),
            gap(36, "Findings show early knitted items to be … in shape:", "round"),
            gap(37, "The first needles were made of natural materials such as wood and …:", "bone"),
            gap(38, "Early yarns felt … to touch:", "rough"),
            gap(39, "Geographical areas had their own … of knitting:", "style"),
            gap(40, "Everyday tasks like looking after … were done while knitting:", "sheep"),
        ],
        passageTitle="Hand knitting",
        notePassage=[
            np_section("Interest in knitting"),
            np_static("• Knitting has a long history around the world."),
            np_static("• We imagine someone like a "), np_gap(31), np_static(" knitting."),
            np_static("• A "), np_gap(32), np_static(" ago, knitting was expected to disappear."),
            np_static("• The number of knitting classes is now increasing."),
            np_static("• People are buying more "), np_gap(33), np_static(" for knitting nowadays."),
            np_section("Benefits of knitting"),
            np_static("• gives support in times of "), np_gap(34), np_static(" difficulty"),
            np_static("• requires only "), np_gap(35), np_static(" skills and little money to start"),
            np_static("• reduces stress in a busy life"),
            np_section("Early knitting"),
            np_static("• The origins are not known."),
            np_static("• Findings show early knitted items to be "), np_gap(36), np_static(" in shape."),
            np_static("• The first needles were made of natural materials such as wood and "), np_gap(37),
            np_static("• Early yarns felt "), np_gap(38), np_static(" to touch."),
            np_static("• Wool became the most popular yarn for spinning."),
            np_static("• Geographical areas had their own "), np_gap(39), np_static(" of knitting."),
            np_static("• Everyday tasks like looking after "), np_gap(40), np_static(" were done while knitting."),
        ],
    )


# ── Cam16 Test 4 ─────────────────────────────────────────────────────────────

def cam16_t4_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "available for week beginning … May:", "28th", sectionTitle="Holiday rental"),
            gap(2, "cost for the week: £ …:", "550"),
            gap(3, "… Cottage — cost for the week: £480:", "chervil"),
            gap(4, "building was originally a …:", "garage"),
            gap(5, "walk through doors from living room into a …:", "garden"),
            gap(6, "several … spaces at the front:", "parking"),
            gap(7, "central heating and stove that burns …:", "wood"),
            gap(8, "views of old … from living room:", "bridge"),
            gap(9, "view of hilltop … from the bedroom:", "monument"),
            gap(10, "deadline for final payment: end of …:", "march"),
        ],
        notePassageLayout="form",
        notePassage=[
            np_static("Owners' names: Jack Fitzgerald and Shirley Fitzgerald"),
            np_section("Granary Cottage"),
            np_static("• available for week beginning "), np_gap(1), np_static(" May"),
            np_static("• cost for the week: £"), np_gap(2),
            np_section("Chervil Cottage"),
            np_static("• "), np_gap(3), np_static(" Cottage"),
            np_static("• cost for the week: £480"),
            np_static("• building was originally a "), np_gap(4),
            np_static("• walk through doors from living room into a "), np_gap(5),
            np_static("• several "), np_gap(6), np_static(" spaces at the front"),
            np_static("• bathroom has a shower"),
            np_static("• central heating and stove that burns "), np_gap(7),
            np_static("• views of old "), np_gap(8), np_static(" from living room"),
            np_static("• view of hilltop "), np_gap(9), np_static(" from the bedroom"),
            np_section("Payment"),
            np_static("• deposit: £144"),
            np_static("• deadline for final payment: end of "), np_gap(10),
        ],
    )


def cam16_t4_p2():
    letters = list("ABCDEFGHI")
    return part(
        2, 11, 20,
        "Questions 11–14: Choose A, B or C. Questions 15–20: Label the map A–I.",
        [
            mc(11, "A survey found people's main concern about traffic in the area was", [
                ("A", "cuts to public transport."),
                ("B", "poor maintenance of roads."),
                ("C", "changes in the type of traffic."),
            ], "C", sectionRange="Questions 11 – 14",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Local council report on traffic and highways"),
            mc(12, "Which change will shortly be made to the cycle path next to the river?", [
                ("A", "It will be widened."),
                ("B", "It will be extended."),
                ("C", "It will be resurfaced."),
            ], "A"),
            mc(13, "Plans for a pedestrian crossing have been postponed because", [
                ("A", "the Post Office has moved."),
                ("B", "the proposed location is unsafe."),
                ("C", "funding is not available at present."),
            ], "B"),
            mc(14, "On Station Road, notices have been erected", [
                ("A", "telling cyclists not to leave their bikes outside the station ticket office."),
                ("B", "asking motorists to switch off engines when waiting at the level crossing."),
                ("C", "warning pedestrians to leave enough time when crossing the railway line."),
            ], "B"),
            map_label(15, "New car park", letters, "C",
                      sectionRange="Questions 15 – 20",
                      sectionInstruction="Label the map below. Write the correct letter, A–I, next to Questions 15–20.",
                      sectionTitle="Recreation ground after proposed changes"),
            map_label(16, "New cricket pitch", letters, "F"),
            map_label(17, "Children's playground", letters, "A"),
            map_label(18, "Skateboard ramp", letters, "I"),
            map_label(19, "Pavilion", letters, "E"),
            map_label(20, "Notice board", letters, "H"),
        ],
        imageFile="map.jpg",
    )


def cam16_t4_p3():
    opinion_opts = [
        ("A", "They agree it has been disappointing."),
        ("B", "They think it should be cheaper."),
        ("C", "They are surprised it has been so successful."),
        ("D", "They agree that more investment is required."),
        ("E", "They think the system has been well designed."),
        ("F", "They disagree about the reasons for its success."),
        ("G", "They think it has expanded too quickly."),
    ]
    return part(
        3, 21, 30,
        "Questions 21–22 and 23–24: Choose TWO A–E. Questions 25–30: Matching A–G.",
        [
            *choose_two(21, 22,
                        "Which TWO benefits of city bike-sharing schemes do the students agree are the most important?",
                        [("A", "reducing noise pollution"),
                         ("B", "reducing traffic congestion"),
                         ("C", "improving air quality"),
                         ("D", "encouraging health and fitness"),
                         ("E", "making cycling affordable")],
                        "B/C", "Tắc đường (B) và không khí (C).",
                        sectionRange="Questions 21 and 22",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(23, 24,
                        "Which TWO things do the students think are necessary for successful bike-sharing schemes?",
                        [("A", "Bikes should have a GPS system."),
                         ("B", "The app should be easy to use."),
                         ("C", "Public awareness should be raised."),
                         ("D", "Only one scheme should be available."),
                         ("E", "There should be a large network of cycle lanes.")],
                        "B/C", "App dễ dùng (B) và nhận thức (C).",
                        sectionRange="Questions 23 and 24",
                        sectionInstruction="Choose TWO letters, A–E."),
            match(25, "Amsterdam", list("ABCDEFG"), "C", labeled=opinion_opts,
                  sectionRange="Questions 25 – 30",
                  sectionInstruction="What is the speakers' opinion of the bike-sharing schemes in each of the following cities? Choose SIX answers from the box and write the correct letter, A–G, next to Questions 25–30.",
                  sectionTitle="Cities"),
            match(26, "Dublin", list("ABCDEFG"), "F", labeled=opinion_opts),
            match(27, "London", list("ABCDEFG"), "D", labeled=opinion_opts),
            match(28, "Buenos Aires", list("ABCDEFG"), "E", labeled=opinion_opts),
            match(29, "New York", list("ABCDEFG"), "B", labeled=opinion_opts),
            match(30, "Sydney", list("ABCDEFG"), "A", labeled=opinion_opts),
        ],
    )


def cam16_t4_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "Portuguese ships transporting … stopped at the island:", "spice/spices",
                sectionTitle="The extinction of the dodo bird"),
            gap(32, "The Dutch established a … on the island:", "colony/settlement"),
            gap(33, "A Dutch painting suggests the dodo was very …:", "fat"),
            gap(34, "The only remaining soft tissue is a dried …:", "head"),
            gap(35, "the birds were capable of rapid …:", "movement"),
            gap(36, "use their small wings to maintain …:", "balance/balancing"),
            gap(37, "Their … was of average size:", "brain"),
            gap(38, "Their sense of … enabled them to find food:", "smell"),
            gap(39, "… also escaped onto the island and ate the birds' eggs:", "rats"),
            gap(40, "the … was destroyed:", "forest"),
        ],
        passageTitle="The extinction of the dodo bird",
        notePassage=[
            np_static("The dodo was a large flightless bird which used to inhabit the island of Mauritius."),
            np_section("History"),
            np_static("• 1507 — Portuguese ships transporting "), np_gap(31),
            np_static(" stopped at the island to collect food and water."),
            np_static("• 1638 — The Dutch established a "), np_gap(32), np_static(" on the island."),
            np_static("• They killed the dodo birds for their meat."),
            np_static("• The last one was killed in 1681."),
            np_section("Description"),
            np_static("• The only record we have is written descriptions and pictures (possibly unreliable)."),
            np_static("• A Dutch painting suggests the dodo was very "), np_gap(33),
            np_static("• The only remaining soft tissue is a dried "), np_gap(34),
            np_static("• Recent studies of a dodo skeleton suggest the birds were capable of rapid "), np_gap(35),
            np_static("• It's thought they were able to use their small wings to maintain "), np_gap(36),
            np_static("• Their "), np_gap(37), np_static(" was of average size."),
            np_static("• Their sense of "), np_gap(38), np_static(" enabled them to find food."),
            np_section("Reasons for extinction"),
            np_static("• Hunting was probably not the main cause."),
            np_static("• Sailors brought dogs and monkeys."),
            np_static("• "), np_gap(39), np_static(" also escaped onto the island and ate the birds' eggs."),
            np_static("• The arrival of farming meant the "), np_gap(40), np_static(" was destroyed."),
        ],
    )


# ── Test registry ────────────────────────────────────────────────────────────

TESTS = [
    {
        "folder": "Listening IELTS_Test1_Cam15", "cambridge": 15, "test": 1,
        "title": "IELTS Listening — Cambridge 15 Test 1",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam15_t1_p1},
            {"partNumber": 2, "template": "p2-a6", "file": "exam_part2.json", "build": cam15_t1_p2},
            {"partNumber": 3, "template": "p3-c5", "file": "exam_part3.json", "build": cam15_t1_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam15_t1_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test2_Cam15", "cambridge": 15, "test": 2,
        "title": "IELTS Listening — Cambridge 15 Test 2",
        "parts": [
            {"partNumber": 1, "template": "p1-a4", "file": "exam_part1.json", "build": cam15_t2_p1},
            {"partNumber": 2, "template": "p2-a12", "file": "exam_part2.json", "build": cam15_t2_p2},
            {"partNumber": 3, "template": "p3-c3", "file": "exam_part3.json", "build": cam15_t2_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam15_t2_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test3_Cam15", "cambridge": 15, "test": 3,
        "title": "IELTS Listening — Cambridge 15 Test 3",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam15_t3_p1},
            {"partNumber": 2, "template": "p2-a10", "file": "exam_part2.json", "build": cam15_t3_p2},
            {"partNumber": 3, "template": "p3-c4", "file": "exam_part3.json", "build": cam15_t3_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam15_t3_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test4_Cam15", "cambridge": 15, "test": 4,
        "title": "IELTS Listening — Cambridge 15 Test 4",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam15_t4_p1},
            {"partNumber": 2, "template": "p2-a12", "file": "exam_part2.json", "build": cam15_t4_p2},
            {"partNumber": 3, "template": "p3-c4", "file": "exam_part3.json", "build": cam15_t4_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam15_t4_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test1_Cam16", "cambridge": 16, "test": 1,
        "title": "IELTS Listening — Cambridge 16 Test 1",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam16_t1_p1},
            {"partNumber": 2, "template": "p2-a12", "file": "exam_part2.json", "build": cam16_t1_p2},
            {"partNumber": 3, "template": "p3-c5", "file": "exam_part3.json", "build": cam16_t1_p3},
            {"partNumber": 4, "template": "p4-d1", "file": "exam_part4.json", "build": cam16_t1_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test2_Cam16", "cambridge": 16, "test": 2,
        "title": "IELTS Listening — Cambridge 16 Test 2",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam16_t2_p1},
            {"partNumber": 2, "template": "p2-a10", "file": "exam_part2.json", "build": cam16_t2_p2},
            {"partNumber": 3, "template": "p3-c6", "file": "exam_part3.json", "build": cam16_t2_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam16_t2_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test3_Cam16", "cambridge": 16, "test": 3,
        "title": "IELTS Listening — Cambridge 16 Test 3",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam16_t3_p1},
            {"partNumber": 2, "template": "p2-a13", "file": "exam_part2.json", "build": cam16_t3_p2},
            {"partNumber": 3, "template": "p3-c3", "file": "exam_part3.json", "build": cam16_t3_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam16_t3_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test4_Cam16", "cambridge": 16, "test": 4,
        "title": "IELTS Listening — Cambridge 16 Test 4",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam16_t4_p1},
            {"partNumber": 2, "template": "p2-a12", "file": "exam_part2.json", "build": cam16_t4_p2},
            {"partNumber": 3, "template": "p3-c5", "file": "exam_part3.json", "build": cam16_t4_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam16_t4_p4},
        ],
    },
]

MAP_IMAGES = [
    ("Listening IELTS_Test2_Cam15", "Test2_Listening_Cam15.pdf", 2),
    ("Listening IELTS_Test4_Cam15", "Test4_Listening_Cam15.pdf", 1),
    ("Listening IELTS_Test1_Cam16", "Test1_Listening_Cam16.pdf", 2),
    ("Listening IELTS_Test4_Cam16", "Test4_Listening_Cam16.pdf", 2),
]


def main():
    print("Building IELTS Listening Cam15 T1–T4 + Cam16 T1–T4…\n")
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

    print(f"\nDone — {len(TESTS)} tests, {grand_total} question-slots written.")
    print("Next: pnpm ielts:validate / ielts:pack for each folder.")


if __name__ == "__main__":
    main()