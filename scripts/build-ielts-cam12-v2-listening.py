"""Rebuild Cam12 T1–T4 Listening JSON from ielts-cam12-v2-dump.txt (high-quality OCR).

Run:
  python scripts/build-ielts-cam12-v2-listening.py
  pnpm ielts:validate "IELTS/Listening IELTS_Test1_Cam12"
  pnpm ielts:pack "IELTS/Listening IELTS_Test1_Cam12"
"""
from __future__ import annotations

import importlib.util
import json
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
write_test = _base.write_test

MC3 = _base.MC3


def np_example(text):
    return {"type": "example", "text": text}


def flow_match(n, labeled, letters, answer, gap_lead, gap_trail="", **extra):
    # prompt = gap_lead for validator (UI renders gapLead, not prompt)
    return match(
        n, gap_lead, letters, answer,
        labeled=labeled,
        flowChart=True,
        gapLead=gap_lead,
        gapTrail=gap_trail,
        **extra,
    )


# ── Test 1 (Book Test 5) ─────────────────────────────────────────────────────

def cam12_t1_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Photos of the … that surround the lake:", "mountains",
                sectionTitle="FAMILY EXCURSIONS"),
            gap(2, "40-minute ride on a:", "horse"),
            gap(3, "Walk in the farm's … by the lake:", "garden/gardens"),
            gap(4, "Available at extra cost:", "lunch"),
            gap(5, "A … is provided:", "map"),
            gap(6, "Only suitable for cyclists who have some:", "experience"),
            gap(7, "Bikes can be hired from … (near Cruise Ship Terminal):", "ratchesons"),
            gap(8, "A … (can be hired):", "helmet"),
            gap(9, "There are no … or accommodation in the area:", "shops"),
            gap(10, "Total cost for whole family:", "267"),
        ],
        passageTitle="FAMILY EXCURSIONS",
        notePassageLayout="form",
        notePassage=[
            np_section("Cruise on a lake"),
            np_example("Example"),
            np_example("Travel on an old steamship"),
            np_static("• Can take photos of the"), np_gap(1),
            np_static("that surround the lake"),
            np_section("Farm visit"),
            np_static("• Children can help feed the sheep"),
            np_static("• Visit can include a 40-minute ride on a"), np_gap(2),
            np_static("• Visitors can walk in the farm's"), np_gap(3),
            np_static("by the lake"),
            np_static("•"), np_gap(4), np_static("is available at extra cost"),
            np_section("Cycling trips"),
            np_static("• Cyclists explore the Back Road"),
            np_static("• A"), np_gap(5), np_static("is provided"),
            np_static("• Only suitable for cyclists who have some"), np_gap(6),
            np_static("• Bikes can be hired from"), np_gap(7),
            np_static("(near the Cruise Ship Terminal)"),
            np_static("• Cyclists need:"),
            np_static("– a repair kit"),
            np_static("– food and drink"),
            np_static("– a"), np_gap(8), np_static("(can be hired)"),
            np_static("• There are no"), np_gap(9),
            np_static("or accommodation in the area"),
            np_section("Cost"),
            np_static("• Total cost for whole family of cruise and farm visit: $"), np_gap(10),
        ],
    )


def cam12_t1_p2():
    resp_opts = [
        ("A", "training courses"),
        ("B", "food stocks"),
        ("C", "first aid"),
        ("D", "breakages"),
        ("E", "staff discounts"),
        ("F", "timetables"),
    ]
    return part(
        2, 11, 20,
        "Questions 11–14: Choose A, B or C. Questions 15–16: Choose TWO A–E. Questions 17–20: Matching A–F.",
        [
            mc(11, "According to the manager, what do most people like about the job of kitchen assistant?", [
                ("A", "the variety of work"),
                ("B", "the friendly atmosphere"),
                ("C", "the opportunities for promotion"),
            ], "A", sectionRange="Questions 11 – 14",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Talk to new kitchen assistants"),
            mc(12, "The manager is concerned about some of the new staff's", [
                ("A", "jewellery."),
                ("B", "hair styles."),
                ("C", "shoes."),
            ], "A"),
            mc(13, "The manager says that the day is likely to be busy for kitchen staff because", [
                ("A", "it is a public holiday."),
                ("B", "the head chef is absent"),
                ("C", "the restaurant is almost fully booked."),
            ], "C"),
            mc(14, "Only kitchen staff who are 18 or older are allowed to use", [
                ("A", "the waste disposal unit."),
                ("B", "the electric mixer."),
                ("C", "the meat slicer."),
            ], "C"),
            *choose_two(15, 16,
                        "According to the manager, which TWO things can make the job of kitchen assistant stressful?",
                        [("A", "They have to follow orders immediately."),
                         ("B", "The kitchen gets very hot."),
                         ("C", "They may not be able to take a break."),
                         ("D", "They have to do overtime."),
                         ("E", "The work is physically demanding.")],
                        "A/E", "Lệnh ngay (A) và vật lý (E).",
                        sectionRange="Questions 15 and 16",
                        sectionInstruction="Choose TWO letters, A–E."),
            match(17, "Joy Parkins", list("ABCDEF"), "F", labeled=resp_opts,
                  sectionRange="Questions 17 – 20",
                  sectionInstruction="What is the responsibility of each of the following restaurant staff? Choose FOUR answers from the box and write the correct letter, A–F, next to Questions 17–20.",
                  sectionTitle="RESPONSIBILITIES"),
            match(18, "David Field", list("ABCDEF"), "C", labeled=resp_opts),
            match(19, "Dexter Wills", list("ABCDEF"), "D", labeled=resp_opts),
            match(20, "Mike Smith", list("ABCDEF"), "B", labeled=resp_opts),
        ],
    )


def cam12_t1_p3():
    return part(
        3, 21, 30,
        "Questions 21–23: Choose A, B or C. Questions 24–30: Complete the notes. Write ONE WORD ONLY.",
        [
            mc(21, "What will be the main topic of Trudie and Stewart's paper?", [
                ("A", "how public library services are organised in different countries"),
                ("B", "how changes in society are reflected in public libraries"),
                ("C", "how the funding of public libraries has changed"),
            ], "B", sectionRange="Questions 21 – 23",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Paper on Public Libraries"),
            mc(22, "They agree that one disadvantage of free digitalised books is that", [
                ("A", "they may take a long time to read."),
                ("B", "they can be difficult to read."),
                ("C", "they are generally old."),
            ], "C"),
            mc(23, "Stewart expects that in the future libraries will", [
                ("A", "maintain their traditional function."),
                ("B", "become centres for local communities."),
                ("C", "no longer contain any books."),
            ], "C"),
            gap(24, "Whether it has a … of its own:", "budget", word_limit=1,
                sectionRange="Questions 24 – 30",
                sectionInstruction="Complete the notes below. Write ONE WORD ONLY for each answer.",
                sectionTitle="Study of local library: possible questions"),
            gap(25, "Laws regarding all aspects of:", "employment"),
            gap(26, "Take the … of customers into account:", "safety"),
            gap(27, "… required in case of accidents:", "insurance"),
            gap(28, "A famous person's … located in the library:", "diary"),
            gap(29, "A … of local organisations:", "database"),
            gap(30, "Different from a library in a:", "museum"),
        ],
        notePassage=[
            np_static("• whether it has a"), np_gap(24), np_static("of its own"),
            np_static("• its policy regarding noise of various kinds"),
            np_static("• how it's affected by laws regarding all aspects of"), np_gap(25),
            np_static("• how the design needs to take the"), np_gap(26),
            np_static("of customers into account"),
            np_static("• what"), np_gap(27), np_static("is required in case of accidents"),
            np_static("• why a famous person's"), np_gap(28),
            np_static("is located in the library"),
            np_static("• whether it has a"), np_gap(29), np_static("of local organisations"),
            np_static("• how it's different from a library in a"), np_gap(30),
        ],
    )


def cam12_t1_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.",
        [
            gap(31, "Many business values can result in:", "damage",
                word_limit=2, sectionTitle="Four business values"),
            gap(32, "Potential … that may result:", "side effects", word_limit=2),
            gap(33, "Team had to build a:", "bridge", word_limit=1,
                sectionTitle="Collaboration"),
            gap(34, "Other teams experienced … from trying to collaborate:", "confusion", word_limit=1),
            gap(35, "Sales of a … were poor because of collaboration:", "smartphone", word_limit=1),
            gap(36, "Bad use of various company …:", "resources", word_limit=1,
                sectionTitle="Industriousness"),
            gap(37, "People who avoid doing tasks that are …:", "unnecessary/not necessary", word_limit=2),
            gap(38, "Advertising campaign for a …:", "chocolate bar", word_limit=2,
                sectionTitle="Creativity"),
            gap(39, "Response to a particular …:", "problem", word_limit=1),
            gap(40, "Pioneers had a … far higher than followers:", "market share", word_limit=2,
                sectionTitle="Excellence"),
        ],
        passageTitle="Four business values",
        notePassageLayout="lecture",
        notePassage=[
            np_static("Many business values can result in"), np_gap(31),
            np_static("Senior managers need to understand and deal with the potential"),
            np_gap(32), np_static("that may result."),
            np_section("Collaboration"),
            np_static("During a training course, the speaker was in a team that had to build a"),
            np_gap(33),
            np_static("Other teams experienced"), np_gap(34), np_static("from trying to collaborate."),
            np_static("The speaker's team won because they reduced collaboration."),
            np_static("Sales of a"), np_gap(35), np_static("were poor because of collaboration."),
            np_section("Industriousness"),
            np_static("Hard work may be a bad use of various company"), np_gap(36),
            np_static("The word 'lazy' in this context refers to people who avoid doing tasks that are"),
            np_gap(37),
            np_section("Creativity"),
            np_static("An advertising campaign for a"), np_gap(38),
            np_static("was memorable but failed to boost sales."),
            np_static("Creativity should be used as a response to a particular"), np_gap(39),
            np_section("Excellence"),
            np_static("According to one study, on average, pioneers had a"), np_gap(40),
            np_static("that was far higher than that of followers."),
            np_static("Companies that always aim at excellence may miss opportunities."),
        ],
    )


# ── Test 2 (Book Test 6) ─────────────────────────────────────────────────────

def cam12_t2_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "In town centre, starting at:", "2.45", sectionTitle="Events during Kenton Festival"),
            gap(2, "A … will perform:", "band"),
            gap(3, "Performance of a … about Helen Tungate:", "play"),
            gap(4, "Helen Tungate is a:", "scientist"),
            gap(5, "Fireworks situated across the:", "river"),
            gap(6, "Relationships children have with their:", "grandparents"),
            gap(7, "Venue: … House:", "handsworth"),
            gap(8, "Performance of … dances:", "traditional"),
            gap(9, "Venue: the … market:", "outdoor"),
            gap(10, "Festival … in shop windows:", "logo"),
        ],
        notePassageLayout="form",
        notePassage=[
            np_example("Example\nStart date: 16th May"),
            np_section("Opening ceremony (first day)"),
            np_static("• In town centre, starting at"), np_gap(1),
            np_static("• The mayor will make a speech"),
            np_static("• A"), np_gap(2), np_static("will perform"),
            np_static("• Performance of a"), np_gap(3),
            np_static("about Helen Tungate (a"), np_gap(4), np_static(")"),
            np_static("• Evening fireworks display situated across the"), np_gap(5),
            np_section("Other events"),
            np_static("• Videos about relationships that children have with their"), np_gap(6),
            np_static("• Venue:"), np_gap(7), np_static("House"),
            np_static("• Performance of"), np_gap(8), np_static("dances"),
            np_static("• Venue: the"), np_gap(9), np_static("market in the town centre"),
            np_static("• Time: 2 and 5 pm every day except 1st day of festival"),
            np_static("• Several professional concerts and one by children"),
            np_static("• Venue: library"),
            np_static("• Time: 6.30 pm on the 18th"),
            np_static("• Tickets available online from festival box office and from shops which have"),
            np_static("the festival"), np_gap(10), np_static("in their windows"),
        ],
    )


def cam12_t2_p2():
    day_opts = [
        ("A", "The playwright will be present."),
        ("B", "The play was written to celebrate an anniversary."),
        ("C", "The play will be performed inside a historic building."),
        ("D", "The play will be accompanied by live music."),
        ("E", "The play will be performed outdoors."),
        ("F", "The play will be performed for the first time."),
        ("G", "The performance will be attended by officials from the town."),
    ]
    return part(
        2, 11, 20,
        "Questions 11–15: Choose A, B or C. Questions 16–20: Matching A–G.",
        [
            mc(11, "When the group meet at the airport they will have", [
                ("A", "breakfast."),
                ("B", "coffee."),
                ("C", "lunch."),
            ], "B", sectionRange="Questions 11 – 15",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Theatre trip to Munich"),
            mc(12, "The group will be met at Munich Airport by", [
                ("A", "an employee at the National Theatre."),
                ("B", "a theatre manager."),
                ("C", "a tour operator."),
            ], "C"),
            mc(13, "How much will they pay per night for a double room at the hotel?", [
                ("A", "110 euros"),
                ("B", "120 euros"),
                ("C", "150 euros"),
            ], "A"),
            mc(14, "What type of restaurant will they go to on Tuesday evening?", [
                ("A", "an Italian restaurant"),
                ("B", "a Lebanese restaurant"),
                ("C", "a typical restaurant of the region"),
            ], "B"),
            mc(15, "Who will they meet on Wednesday afternoon?", [
                ("A", "an actor"),
                ("B", "a playwright"),
                ("C", "a theatre director"),
            ], "C"),
            match(16, "Wednesday", list("ABCDEFG"), "F", labeled=day_opts,
                  sectionRange="Questions 16 – 20",
                  sectionInstruction="What does the man say about the play on each of the following days? Choose FIVE answers from the box and write the correct letter, A–G, next to Questions 16–20.",
                  sectionTitle="COMMENTS"),
            match(17, "Thursday", list("ABCDEFG"), "B", labeled=day_opts),
            match(18, "Friday", list("ABCDEFG"), "E", labeled=day_opts),
            match(19, "Saturday", list("ABCDEFG"), "G", labeled=day_opts),
            match(20, "Monday", list("ABCDEFG"), "C", labeled=day_opts),
        ],
    )


def cam12_t2_p3():
    flow_opts = [
        ("A", "bullet points"),
        ("B", "film"),
        ("C", "notes"),
        ("D", "structure"),
        ("E", "student paper"),
        ("F", "textbook"),
        ("G", "documentary"),
    ]
    letters = list("ABCDEFG")
    labeled = flow_opts
    return part(
        3, 21, 30,
        "Questions 21–25: Choose A, B or C. Questions 26–30: Complete the flow-chart A–G.",
        [
            mc(21, "James chose to take Scandinavian Studies because when he was a child", [
                ("A", "he was often taken to Denmark"),
                ("B", "his mother spoke to him in Danish."),
                ("C", "a number of Danish people visited his family."),
            ], "C", sectionRange="Questions 21 – 25",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(22, "When he graduates, James would like to", [
                ("A", "take a postgraduate course."),
                ("B", "work in the media."),
                ("C", "become a translator."),
            ], "B"),
            mc(23, "Which course will end this term?", [
                ("A", "Swedish cinema"),
                ("B", "Danish television programmes"),
                ("C", "Scandinavian literature"),
            ], "C"),
            mc(24, "They agree that James's literature paper this term will be on", [
                ("A", "19th century playwrights."),
                ("B", "the Icelandic sagas."),
                ("C", "modern Scandinavian novels."),
            ], "A"),
            mc(25, "Beth recommends that James's paper should be", [
                ("A", "a historical overview of the genre."),
                ("B", "an in-depth analysis of a single writer."),
                ("C", "a study of the social background to the literature."),
            ], "C"),
            flow_match(26, labeled, letters, "E",
                       "He'll read a", "and choose his topic.",
                       sectionRange="Questions 26 – 30",
                       sectionInstruction="Complete the flow-chart below. Choose FIVE answers from the box and write the correct letter, A–G, next to Questions 26–30.",
                       sectionTitle="How James will write his paper on the Vikings"),
            flow_match(27, labeled, letters, "G", "He'll borrow a", "from Beth."),
            flow_match(28, labeled, letters, "D", "He'll plan the", "of the paper."),
            flow_match(29, labeled, letters, "C",
                       "He'll read some source material and write", ""),
            flow_match(30, labeled, letters, "A",
                       "He'll write the paper using", "",
                       flowChartEnd="He'll write the complete paper."),
        ],
    )


def cam12_t2_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "Behaviour in the general category of:", "bullying", sectionTitle="Conflict at work"),
            gap(32, "People wanting to prove their:", "superiority"),
            gap(33, "Differences in … between people:", "personality"),
            gap(34, "… conflicts:", "structural"),
            gap(35, "Can cause … that may last for months:", "absence"),
            gap(36, "Many have both … and anxiety:", "confidence", sectionTitle="Chief Executives (CEOs)"),
            gap(37, "Conflict between people who have different:", "visions"),
            gap(38,
                "A structure that is more … may create a feeling of uncertainty about who staff should report to.",
                "democratic",
                sectionTitle="Other managers",
                gapTrail="may create a feeling of uncertainty about who staff should report to."),
            gap(39, "Bosses need to try hard to gain:", "respect", sectionTitle="Minimising conflict"),
            gap(40, "Role of … to resolve conflicts:", "mediator"),
        ],
        passageTitle="Conflict at work",
        notePassage=[
            np_static("Conflict mostly consists of behaviour in the general category of"), np_gap(31),
            np_static("Often a result of people wanting to prove their"), np_gap(32),
            np_static("Also caused by differences in"), np_gap(33), np_static("between people"),
            np_gap(34), np_static("conflicts: people more concerned about own team than about company"),
            np_static("Conflict-related stress can cause"), np_gap(35),
            np_static("that may last for months"),
            np_section("Chief Executives (CEOs)"),
            np_static("Many have both"), np_gap(36), np_static("and anxiety"),
            np_static("May not like to have their decisions questioned"),
            np_static("There may be conflict between people who have different"), np_gap(37),
            np_section("Other managers"),
            np_static("A structure that is more"), np_gap(38),
            np_static("may create a feeling of uncertainty about who staff should report to."),
            np_section("Minimising conflict"),
            np_static("Bosses need to try hard to gain"), np_gap(39),
            np_static("Someone from outside the company may be given the role of"), np_gap(40),
            np_static("in order to resolve conflicts."),
        ],
        notePassageLayout="lecture",
    )


# ── Test 3 (Book Test 7) ─────────────────────────────────────────────────────

def cam12_t3_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(1, "Expanded section for books on:", "travel/travel(l)ing", sectionTitle="PUBLIC LIBRARY"),
            gap(2, "New section on local:", "history"),
            gap(3, "Also possible to … there:", "study"),
            gap(4, "New section of books for:", "teenagers"),
            gap(5, "Experiments using things from your:", "kitchen"),
            gap(6, "Novel based on a real:", "crime"),
            gap(7, "No … is necessary:", "appointment/booking", word_limit=2),
            gap(8, "Free check of blood … and cholesterol:", "sugar"),
            gap(9, "Library shop sells wall-charts, cards and:", "stamps"),
            gap(10, "Free … is available:", "parking"),
        ],
        notePassageLayout="form",
        notePassage=[
            np_example("Example\nThe library re-opened last month"),
            np_section("The library now has"),
            np_static("• a seating area with magazines"),
            np_static("• an expanded section for books on"), np_gap(1),
            np_static("• a new section on local"), np_gap(2),
            np_static("• a community room for meetings (also possible to"), np_gap(3),
            np_static("there)"),
            np_static("• a new section of books for"), np_gap(4),
            np_section("For younger children"),
            np_static("• the next Science Club meeting: experiments using things from your"),
            np_gap(5),
            np_static("• Reading Challenge: read six books during the holidays"),
            np_section("For adults"),
            np_static("• this Friday: a local author talks about a novel based on a real"),
            np_gap(6),
            np_static("• IT support is available on Tuesdays — no"), np_gap(7),
            np_static("is necessary"),
            np_static("• free check of blood"), np_gap(8),
            np_static("and cholesterol levels (over 60s only)"),
            np_section("Other information"),
            np_static("• the library shop sells wall-charts, cards and"), np_gap(9),
            np_static("• evenings and weekends: free"), np_gap(10), np_static("is available"),
        ],
    )


def cam12_t3_p2():
    return part(
        2, 11, 20,
        "Questions 11–12 and 13–14: Choose TWO A–E. Questions 15–17: Choose A, B or C. Questions 18–20: Complete the table.",
        [
            *choose_two(11, 12,
                        "Which TWO age groups are taking increasing numbers of holidays with BC Travel?",
                        [("A", "16–30 years"),
                         ("B", "31–42 years"),
                         ("C", "43–54 years"),
                         ("D", "55–64 years"),
                         ("E", "over 65 years")],
                        "D/E", "55–64 (D) và trên 65 (E).",
                        sectionRange="Questions 11 and 12",
                        sectionInstruction="Choose TWO letters, A–E.",
                        sectionTitle="BC Travel"),
            *choose_two(13, 14,
                        "Which TWO are the main reasons given for the popularity of activity holidays?",
                        [("A", "Clients make new friends."),
                         ("B", "Clients learn a useful skill."),
                         ("C", "Clients learn about a different culture."),
                         ("D", "Clients are excited by the risk involved."),
                         ("E", "Clients find them good value for money.")],
                        "A/C", "Bạn mới (A) và văn hóa (C).",
                        sectionRange="Questions 13 and 14",
                        sectionInstruction="Choose TWO letters, A–E."),
            mc(15, "How does BC Travel plan to expand the painting holidays?", [
                ("A", "by adding to the number of locations"),
                ("B", "by increasing the range of levels"),
                ("C", "by employing more teachers"),
            ], "C", sectionRange="Questions 15 – 17",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(16, "Why are BC Travel's cooking holidays unusual?", [
                ("A", "They only use organic foods."),
                ("B", "They have an international focus."),
                ("C", "They mainly involve vegetarian dishes."),
            ], "B"),
            mc(17, "What does the speaker say about the photography holidays?", [
                ("A", "Clients receive individual tuition."),
                ("B", "The tutors are also trained guides."),
                ("C", "Advice is given on selling photographs."),
            ], "A"),
            gap(18, "Also reduces:", "stress", word_limit=1,
                sectionRange="Questions 18 – 20",
                sectionInstruction="Complete the table below. Write ONE WORD ONLY for each answer.",
                sectionTitle="Fitness Holidays"),
            gap(19, "Main focus:", "weight", word_limit=1),
            gap(20, "Specially designed for:", "families", word_limit=1),
        ],
        notePassageLayout="table",
        noteTables=[{
            "gapNumbers": [18, 19, 20],
            "instruction": "Questions 18 – 20\nComplete the table below. Write ONE WORD ONLY for each answer.",
            "title": "Fitness Holidays",
            "headers": ["Location", "Main focus", "Other comments"],
            "rows": [
                {"cells": [
                    [tbl_static("Ireland and Italy")],
                    [tbl_static("general fitness")],
                    [tbl_static("• personally designed programme."),
                     tbl_static("• also reduces"), tbl_gap(18)],
                ]},
                {"cells": [
                    [tbl_static("Greece")],
                    [tbl_gap(19), tbl_static("control")],
                    [tbl_static("• includes exercise on the beach")],
                ]},
                {"cells": [
                    [tbl_static("Morocco")],
                    [tbl_static("mountain biking")],
                    [tbl_static("• wide variety of levels"),
                     tbl_static("• one holiday that is specially designed for"), tbl_gap(20)],
                ]},
            ],
        }],
    )


def cam12_t3_p3():
    flow_opts = [
        ("A", "patterns"),
        ("B", "names"),
        ("C", "sources"),
        ("D", "questions"),
        ("E", "employees"),
        ("F", "solutions"),
        ("G", "headings"),
        ("H", "officials"),
    ]
    letters = list("ABCDEFGH")
    labeled = flow_opts
    return part(
        3, 21, 30,
        "Questions 21–26: Complete the flow-chart A–H. Questions 27–30: Choose A, B or C.",
        [
            flow_match(21, labeled, letters, "C",
                       "Locate and read relevant articles, noting key information and also", "",
                       sectionRange="Questions 21 – 26",
                       sectionInstruction="Complete the flow-chart below. Choose SIX answers from the box and write the correct letter, A–H, next to Questions 21–26.",
                       sectionTitle="RESEARCH"),
            flow_match(22, labeled, letters, "E",
                       "Select interviewees — these may be site", ", visitors or"),
            flow_match(23, labeled, letters, "H", "city", ""),
            flow_match(24, labeled, letters, "B",
                       "Check whether", "of interviewees can be used"),
            flow_match(25, labeled, letters, "A",
                       "Select relevant information and try to identify", ""),
            flow_match(26, labeled, letters, "F", "Do NOT end with", ""),
            mc(27, "Natalie and Dave agree one reason why so few people visit Horton Castle is that", [
                ("A", "the publicity is poor."),
                ("B", "it is difficult to get to."),
                ("C", "there is little there of interest."),
            ], "A", sectionRange="Questions 27 – 30",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(28, "Natalie and Dave agree that the greatest problem with a visitor centre could be", [
                ("A", "covering the investment costs."),
                ("B", "finding a big enough space for it."),
                ("C", "dealing with planning restrictions."),
            ], "C"),
            mc(29, "What does Dave say about conditions in the town of Horton?", [
                ("A", "There is a lot of unemployment."),
                ("B", "There are few people of working age."),
                ("C", "There are opportunities for skilled workers."),
            ], "B"),
            mc(30, "According to Natalie, one way to prevent damage to the castle site would be to", [
                ("A", "insist visitors have a guide."),
                ("B", "make visitors keep to the paths."),
                ("C", "limit visitor numbers."),
            ], "B"),
        ],
    )


def cam12_t3_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "Birds which feed on:", "insects",
                sectionTitle="The effects of environmental change on birds"),
            gap(32, "Effects on birds' … or mental processes:", "behaviour/behavior"),
            gap(33, "Usually learned from a bird's:", "father"),
            gap(34, "Songs learned are less:", "complex/complicated"),
            gap(35, "Negative effect on birds':", "reproduction/breeding"),
            gap(36, "Allow more … for the experimenter:", "control"),
            gap(37, "Migrating birds such as … containing mercury:", "duck/ducks"),
            gap(38, "Problems in learning:", "language"),
            gap(39, "Mercury in a mother's body from …:", "food"),
            gap(40, "Will affect everyone's energy:", "cost/costs/price/prices/bill/bills"),
        ],
        passageTitle="The effects of environmental change on birds",
        notePassageLayout="lecture",
        notePassage=[
            np_section("Mercury (Hg)"),
            np_static("• Highly toxic"),
            np_static("• Released into the atmosphere from coal"),
            np_static("• In water it may be consumed by fish"),
            np_static("• It has also recently been found to affect birds which feed on"), np_gap(31),
            np_section("Research on effects of mercury on birds"),
            np_static("• Claire Varian-Ramos is investigating:"),
            np_static("– the effects on birds'"), np_gap(32),
            np_static("or mental processes, e.g. memory"),
            np_static("– the effects on bird song (usually learned from a bird's"), np_gap(33), np_static(")"),
            np_static("Findings:"),
            np_static("– songs learned by birds exposed to mercury are less"), np_gap(34),
            np_static("– this may have a negative effect on birds'"), np_gap(35),
            np_static("Lab-based studies:"),
            np_static("– allow more"), np_gap(36), np_static("for the experimenter"),
            np_section("Implications for humans"),
            np_static("• Migrating birds such as"), np_gap(37),
            np_static("containing mercury may be eaten by humans"),
            np_static("• Mercury also causes problems in learning"), np_gap(38),
            np_static("• Mercury in a mother's body from"), np_gap(39),
            np_static("• may affect the unborn child"),
            np_static("• New regulations for mercury emissions will affect everyone's energy"),
            np_gap(40),
        ],
    )


# ── Test 4 (Book Test 8) ─────────────────────────────────────────────────────

def cam12_t4_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Wants a … job:", "temporary", sectionTitle="Cycle tour leader: Applicant enquiry"),
            gap(2, "Will soon start work as a:", "doctor"),
            gap(3, "Has led cycle trips in:", "africa"),
            gap(4, "Voluntary work with a … club:", "youth"),
            gap(5, "Available from the 1st of:", "may"),
            gap(6, "Can't eat:", "cheese"),
            gap(7, "Address: 27 … Place:", "arbuthnot"),
            gap(8, "Postcode:", "dg7 4ph"),
            gap(9, "Interview on:", "tuesday"),
            gap(10, "Will plan a short … about being a tour guide:", "talk/presentation", word_limit=2),
        ],
        notePassageLayout="form",
        notePassage=[
            np_example("Example\nName: Margaret Smith"),
            np_section("About the applicant:"),
            np_static("• wants a"), np_gap(1), np_static("job"),
            np_static("• will soon start work as a"), np_gap(2),
            np_static("• has led cycle trips in"), np_gap(3),
            np_static("• interested in being a leader of a cycling trip for families"),
            np_static("• is currently doing voluntary work with members of a"), np_gap(4),
            np_static("club"),
            np_static("• available for five months from the 1st of"), np_gap(5),
            np_static("• can't eat"), np_gap(6),
            np_section("Contact details:"),
            np_static("• address: 27"), np_gap(7), np_static("Place, Dumfries"),
            np_static("• postcode:"), np_gap(8),
            np_section("Interview:"),
            np_static("• interview at 2.30 pm on"), np_gap(9),
            np_static("• will plan a short"), np_gap(10), np_static("about being a tour guide"),
        ],
    )


def cam12_t4_p2():
    letters = list("ABCDEFGHI")
    return part(
        2, 11, 20,
        "Questions 11–14: Choose A, B or C. Questions 15–20: Label the map A–I.",
        [
            mc(11, "Which is the most rapidly-growing group of residents in the Sheepmarket area?", [
                ("A", "young professional people"),
                ("B", "students from the university"),
                ("C", "employees in the local market"),
            ], "A", sectionRange="Questions 11 – 14",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Visiting the Sheepmarket area"),
            mc(12, "The speaker recommends the side streets in the Sheepmarket for their", [
                ("A", "international restaurants."),
                ("B", "historical buildings."),
                ("C", "arts and crafts."),
            ], "C"),
            mc(13, "Clothes designed by entrants for the Young Fashion competition must", [
                ("A", "be modelled by the designers themselves."),
                ("B", "be inspired by aspects of contemporary culture."),
                ("C", "be made from locally produced materials."),
            ], "B"),
            mc(14, "Car parking is free in some car parks if you", [
                ("A", "stay for less than an hour."),
                ("B", "buy something in the shops."),
                ("C", "park in the evenings or at weekends."),
            ], "B"),
            map_label(15, "The Reynolds House", letters, "H",
                      sectionRange="Questions 15 – 20",
                      sectionInstruction="Label the map below. Write the correct letter, A–I, next to Questions 15–20.",
                      sectionTitle="Art and History in the Sheepmarket"),
            map_label(16, "The Thumb", letters, "C"),
            map_label(17, "The Museum", letters, "F"),
            map_label(18, "The Contemporary Art Gallery", letters, "G"),
            map_label(19, "The Warner Gallery", letters, "I"),
            map_label(20, "Nucleus", letters, "B"),
        ],
        imageFile="map.jpg",
    )


def cam12_t4_p3():
    film_opts = [
        ("A", "clearly shows the historical period"),
        ("B", "contains only parts of the play"),
        ("C", "is too similar to another kind of film"),
        ("D", "turned out to be unpopular with audiences"),
        ("E", "presents the play in a different period from the original"),
        ("F", "sets the original in a different country"),
        ("G", "incorporates a variety of art forms"),
    ]
    return part(
        3, 21, 30,
        "Questions 21–24: Complete the table (ONE WORD). Questions 25–30: Matching A–G.",
        [
            gap(21, "Book containing a … of adaptations:", "classification", word_limit=1,
                sectionRange="Questions 21 – 24",
                sectionInstruction="Complete the table below. Write ONE WORD ONLY for each answer.",
                sectionTitle="Presentation on film adaptations of Shakespeare's plays"),
            gap(22, "Suggest the … adaptations:", "worst", word_limit=1),
            gap(23, "Prepare some …:", "slides", word_limit=1),
            gap(24, "Relationship between adaptations and …:", "issues", word_limit=1),
            match(25, "Ran", list("ABCDEFG"), "F", labeled=film_opts,
                  sectionRange="Questions 25 – 30",
                  sectionInstruction="What do the speakers say about each of the following films? Choose SIX answers from the box and write the correct letter, A–G, next to questions 25–30.",
                  sectionTitle="Films"),
            match(26, "Much Ado About Nothing", list("ABCDEFG"), "A", labeled=film_opts),
            match(27, "Romeo & Juliet", list("ABCDEFG"), "E", labeled=film_opts),
            match(28, "Hamlet", list("ABCDEFG"), "C", labeled=film_opts),
            match(29, "Prospero's Books", list("ABCDEFG"), "G", labeled=film_opts),
            match(30, "Looking for Richard", list("ABCDEFG"), "B", labeled=film_opts),
        ],
        notePassageLayout="table",
        noteTables=[{
            "gapNumbers": [21, 22, 23, 24],
            "instruction": "Complete the table below. Write ONE WORD ONLY for each answer.",
            "title": "Presentation on film adaptations of Shakespeare's plays",
            "headers": ["Stages of presentation", "Work still to be done"],
            "rows": [
                {"cells": [
                    [tbl_static("Introduce Giannetti's book, containing a"),
                     tbl_gap(21), tbl_static("of adaptations")],
                    [tbl_static("Organise notes")],
                ]},
                {"cells": [
                    [tbl_static("Ask class to suggest the"), tbl_gap(22),
                     tbl_static("adaptations")],
                    [tbl_static("No further work needed")],
                ]},
                {"cells": [
                    [tbl_static("Present Rachel Malchow's ideas")],
                    [tbl_static("Prepare some"), tbl_gap(23)],
                ]},
                {"cells": [
                    [tbl_static("Discuss relationship between adaptations and"),
                     tbl_gap(24), tbl_static("at the time of making the film")],
                    [tbl_static("No further work needed")],
                ]},
            ],
        }],
    )


def cam12_t4_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "Neighbours are in their:", "garden/gardens", sectionTitle="Noise in Cities"),
            gap(32, "Noise is a … issue:", "political"),
            gap(33, "Effect on the … of schoolchildren:", "work/study"),
            gap(34, "Sound of a … in a town:", "fountain"),
            gap(35, "Methods from … sciences:", "social"),
            gap(36, "Urban environments which are …:", "lively"),
            gap(37, "Do not get much … in acoustics:", "training"),
            gap(38, "How sound relates to:", "culture"),
            gap(39, "Understand the … of sound:", "nature"),
            gap(40, "Virtual reality programs are …:", "silent"),
        ],
        passageTitle="Noise in Cities",
        notePassage=[
            np_static("Past research focused on noise level (measured in decibels) and people's responses."),
            np_section("Noise 'maps'"),
            np_static("• show that the highest noise levels are usually found on roads"),
            np_static("• do not show other sources of noise, e.g. when windows are open or people's"),
            np_static("neighbours are in their"), np_gap(31),
            np_static("• ignore variations in people's perceptions of noise"),
            np_static("• have made people realize that the noise is a"), np_gap(32),
            np_static("issue that must be dealt with"),
            np_section("Problems caused by noise"),
            np_static("• sleep disturbance"),
            np_static("• increase in amount of stress"),
            np_static("• effect on the"), np_gap(33), np_static("of schoolchildren"),
            np_section("Different types of noise"),
            np_static("• Some noises can be considered pleasant e.g. the sound of a"), np_gap(34),
            np_static("in a town"),
            np_static("• To investigate this, researchers may use methods from"), np_gap(35),
            np_static("sciences e.g. questionnaires"),
            np_section("What people want"),
            np_static("• Plenty of activity in urban environments which are"), np_gap(36),
            np_static(", but also allow people to relax"),
            np_section("But architects and town planners"),
            np_static("• do not get much"), np_gap(37), np_static("in acoustics"),
            np_static("• regard sound as the responsibility of engineers"),
            np_section("Understanding sound as an art form"),
            np_static("We need to know"),
            np_static("• how sound relates to"), np_gap(38),
            np_static("• what can be learnt from psychology about the effects of sound"),
            np_static("• whether physics can help us understand the"), np_gap(39), np_static("of sound"),
            np_section("Virtual reality programs"),
            np_static("• advantage: predict the effect of buildings"),
            np_static("• current disadvantage: they are"), np_gap(40),
        ],
    )


# ── Registry ─────────────────────────────────────────────────────────────────

TESTS = [
    {
        "folder": "Listening IELTS_Test1_Cam12", "cambridge": 12, "test": 1,
        "title": "IELTS Listening — Cambridge 12 Test 1",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam12_t1_p1},
            {"partNumber": 2, "template": "p2-a13", "file": "exam_part2.json", "build": cam12_t1_p2},
            {"partNumber": 3, "template": "p3-c1", "file": "exam_part3.json", "build": cam12_t1_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam12_t1_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test2_Cam12", "cambridge": 12, "test": 2,
        "title": "IELTS Listening — Cambridge 12 Test 2",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam12_t2_p1},
            {"partNumber": 2, "template": "p2-a11", "file": "exam_part2.json", "build": cam12_t2_p2},
            {"partNumber": 3, "template": "p3-c6", "file": "exam_part3.json", "build": cam12_t2_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam12_t2_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test3_Cam12", "cambridge": 12, "test": 3,
        "title": "IELTS Listening — Cambridge 12 Test 3",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam12_t3_p1},
            {"partNumber": 2, "template": "p2-a10", "file": "exam_part2.json", "build": cam12_t3_p2},
            {"partNumber": 3, "template": "p3-c6", "file": "exam_part3.json", "build": cam12_t3_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam12_t3_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test4_Cam12", "cambridge": 12, "test": 4,
        "title": "IELTS Listening — Cambridge 12 Test 4",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam12_t4_p1},
            {"partNumber": 2, "template": "p2-a12", "file": "exam_part2.json", "build": cam12_t4_p2},
            {"partNumber": 3, "template": "p3-c7", "file": "exam_part3.json", "build": cam12_t4_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam12_t4_p4},
        ],
    },
]

MAP_IMAGES = [
    ("Listening IELTS_Test4_Cam12", "Test4_Listening_Cam12.pdf", 2),
]


def main():
    print("Building IELTS Listening Cam12 T1–T4 (v2 OCR)…\n")
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