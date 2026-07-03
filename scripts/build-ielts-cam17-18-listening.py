"""Rebuild Cam17 T1–T4 + Cam18 T1–T4 Listening JSON from ielts-cam17-18-dump.txt.

Run:
  python scripts/build-ielts-cam17-18-listening.py
  pnpm ielts:validate "IELTS/Listening IELTS_Test1_Cam17"
  pnpm ielts:pack "IELTS/Listening IELTS_Test1_Cam17"
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


# ── Cam17 Test 1 ─────────────────────────────────────────────────────────────

def cam17_t1_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "making sure the beach does not have … on it:", "litter",
                sectionTitle="Buckworth Conservation Group"),
            gap(2, "no …:", "dogs"),
            gap(3, "next task is taking action to attract … to the place:", "insects"),
            gap(4, "identifying types of …:", "butterflies"),
            gap(5, "building a new …:", "wall"),
            gap(6, "walk across the sands and reach the …:", "island"),
            gap(7, "wear appropriate …:", "boots"),
            gap(8, "suitable for … to participate in:", "beginners"),
            gap(9, "making … out of wood:", "spoons"),
            gap(10, "cost of session (no camping): £ …:", "35/thirty five"),
        ],
        notePassageLayout="form",
        notePassage=[
            np_section("Buckworth Conservation Group"),
            np_section("Regular activities"),
            np_section("Beach"),
            np_static("• making sure the beach does not have "), np_gap(1),
            np_static(" on it"),
            np_static("• no "), np_gap(2),
            np_section("Nature reserve"),
            np_static("• maintaining paths"),
            np_static("• nesting boxes for birds installed"),
            np_static("• next task is taking action to attract "), np_gap(3),
            np_static(" to the place"),
            np_static("• identifying types of "), np_gap(4),
            np_static("• building a new "), np_gap(5),
            np_section("Forthcoming events"),
            np_section("Saturday"),
            np_static("• meet at Dunsmore Beach car park"),
            np_static("• walk across the sands and reach the "), np_gap(6),
            np_static("• take a picnic"),
            np_static("• wear appropriate "), np_gap(7),
            np_section("Woodwork session"),
            np_static("• suitable for "), np_gap(8), np_static(" to participate in"),
            np_static("• making "), np_gap(9), np_static(" out of wood"),
            np_static("• 17th, from 10 a.m. to 3 p.m."),
            np_static("• cost of session (no camping): £"), np_gap(10),
        ],
    )


def cam17_t1_p2():
    return part(
        2, 11, 20,
        "Questions 11–14: Choose A, B or C. Questions 15–20: Choose TWO A–E.",
        [
            mc(11, "What is the maximum number of people who can stand on each side of the boat?", [
                ("A", "9"), ("B", "15"), ("C", "18"),
            ], "A", sectionRange="Questions 11 – 14",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Boat trip round Tasmania"),
            mc(12, "What colour are the tour boats?", [
                ("A", "dark red"), ("B", "jet black"), ("C", "light green"),
            ], "C"),
            mc(13, "Which lunchbox is suitable for someone who doesn't eat meat or fish?", [
                ("A", "Lunchbox 1"), ("B", "Lunchbox 2"), ("C", "Lunchbox 3"),
            ], "B"),
            mc(14, "What should people do with their litter?", [
                ("A", "take it home"),
                ("B", "hand it to a member of staff"),
                ("C", "put it in the bins provided on the boat"),
            ], "B"),
            *choose_two(15, 16,
                        "Which TWO features of the lighthouse does Lou mention?",
                        [("A", "why it was built"),
                         ("B", "who built it"),
                         ("C", "how long it took to build"),
                         ("D", "who staffed it"),
                         ("E", "what it was built with")],
                        "A/D", "Lý do xây (A) và nhân viên (D).",
                        sectionRange="Questions 15 and 16",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(17, 18,
                        "Which TWO types of creature might come close to the boat?",
                        [("A", "sea eagles"),
                         ("B", "fur seals"),
                         ("C", "dolphins"),
                         ("D", "whales"),
                         ("E", "penguins")],
                        "B/C", "Hải cẩu (B) và cá heo (C).",
                        sectionRange="Questions 17 and 18",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(19, 20,
                        "Which TWO points does Lou make about the caves?",
                        [("A", "Only large tourist boats can visit them."),
                         ("B", "The entrances to them are often blocked."),
                         ("C", "It is too dangerous for individuals to go near them."),
                         ("D", "Someone will explain what is inside them."),
                         ("E", "They cannot be reached on foot.")],
                        "D/E", "Giải thích bên trong (D) và không đi bộ (E).",
                        sectionRange="Questions 19 and 20",
                        sectionInstruction="Choose TWO letters, A–E."),
        ],
    )


def cam17_t1_p3():
    opinion_opts = [
        ("A", "Tim found this easier than expected."),
        ("B", "Tim thought this was not very clearly organised."),
        ("C", "Diana may do some further study on this."),
        ("D", "They both found the reading required for this was difficult."),
        ("E", "Tim was shocked at something he learned on this module."),
        ("F", "They were both surprised how little is known about some aspects of this."),
    ]
    letters = list("ABCDEF")
    return part(
        3, 21, 30,
        "Questions 21–26: Choose A, B or C. Questions 27–30: Matching A–F.",
        [
            mc(21, "What problem did both Diana and Tim have when arranging their work experience?", [
                ("A", "making initial contact with suitable farms"),
                ("B", "organising transport to and from the farm"),
                ("C", "finding a placement for the required length of time"),
            ], "A", sectionRange="Questions 21 – 26",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Work experience for veterinary science students"),
            mc(22, "Tim was pleased to be able to help", [
                ("A", "a lamb that had a broken leg."),
                ("B", "a sheep that was having difficulty giving birth."),
                ("C", "a newly born lamb that was having trouble feeding."),
            ], "B"),
            mc(23, "Diana says the sheep on her farm", [
                ("A", "were of various different varieties."),
                ("B", "were mainly reared for their meat."),
                ("C", "had better quality wool than sheep on the hills."),
            ], "B"),
            mc(24, "What did the students learn about adding supplements to chicken feed?", [
                ("A", "These should only be given if specially needed."),
                ("B", "It is worth paying extra for the most effective ones."),
                ("C", "The amount given at one time should be limited."),
            ], "A"),
            mc(25, "What happened when Diana was working with dairy cows?", [
                ("A", "She identified some cows incorrectly."),
                ("B", "She accidentally threw some milk away."),
                ("C", "She made a mistake when storing milk."),
            ], "C"),
            mc(26, "What did both farmers mention about vets and farming?", [
                ("A", "Vets are failing to cope with some aspects of animal health."),
                ("B", "There needs to be a fundamental change in the training of vets."),
                ("C", "Some jobs could be done by the farmer rather than by a vet."),
            ], "C"),
            match(27, "Medical terminology", letters, "A", labeled=opinion_opts,
                  sectionRange="Questions 27 – 30",
                  sectionInstruction="What opinion do the students give about each of the following modules on their veterinary science course? Choose FOUR answers from the box and write the correct letter, A–F, next to Questions 27–30.",
                  sectionTitle="Modules on Veterinary Science course"),
            match(28, "Diet and nutrition", letters, "E", labeled=opinion_opts),
            match(29, "Animal disease", letters, "F", labeled=opinion_opts),
            match(30, "Wildlife medication", letters, "C", labeled=opinion_opts),
        ],
    )


def cam17_t1_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "Mazes are a type of …:", "puzzle", sectionTitle="Labyrinths"),
            gap(32, "… is needed to navigate through a maze:", "logic"),
            gap(33, "the word 'maze' is derived from a word meaning a feeling of …:", "confusion"),
            gap(34, "they have frequently been used in … and prayer:", "meditation"),
            gap(35, "Ancient carvings on … have been found across many cultures:", "stone"),
            gap(36, "Ancient Greeks used the symbol on …:", "coins"),
            gap(37, "The largest surviving example of a turf labyrinth once had a big … at its centre:", "tree"),
            gap(38, "walking a maze can reduce a person's … rate:", "breathing"),
            gap(39, "patients who can't walk can use 'finger labyrinths' made from …:", "paper"),
            gap(40, "Alzheimer's sufferers experience less …:", "anxiety"),
        ],
        passageTitle="Labyrinths",
        notePassage=[
            np_section("Definition"),
            np_static("• a winding spiral path leading to a central area"),
            np_section("Labyrinths compared with mazes"),
            np_static("• Mazes are a type of "), np_gap(31),
            np_static("– "), np_gap(32), np_static(" is needed to navigate through a maze"),
            np_static("– the word 'maze' is derived from a word meaning a feeling of "), np_gap(33),
            np_static("• Labyrinths represent a journey through life"),
            np_static("– they have frequently been used in "), np_gap(34), np_static(" and prayer"),
            np_section("Early examples of the labyrinth spiral"),
            np_static("• Ancient carvings on "), np_gap(35),
            np_static(" have been found across many cultures"),
            np_static("• The Pima, a Native American tribe, wove the symbol on baskets"),
            np_static("• Ancient Greeks used the symbol on "), np_gap(36),
            np_section("Walking labyrinths"),
            np_static("• The largest surviving example of a turf labyrinth once had a big "),
            np_gap(37), np_static(" at its centre"),
            np_section("Labyrinths nowadays"),
            np_static("• Believed to have a beneficial impact on mental and physical health, e.g., walking a maze can reduce a person's "),
            np_gap(38), np_static(" rate"),
            np_static("• Used in medical and health and fitness settings and also prisons"),
            np_static("• Popular with patients, visitors and staff in hospitals"),
            np_static("– patients who can't walk can use 'finger labyrinths' made from "), np_gap(39),
            np_static("– research has shown that Alzheimer's sufferers experience less "), np_gap(40),
        ],
    )


# ── Cam17 Test 2 ─────────────────────────────────────────────────────────────

def cam17_t2_p1():
    return part(
        1, 1, 10,
        "Questions 1–7: Complete the notes below. Write ONE WORD ONLY for each answer. "
        "Questions 8–10: Complete the table below. Write ONE WORD ONLY for each answer.",
        [
            gap(1, "Help with … books:", "collecting", word_limit=1,
                sectionRange="Questions 1 – 7",
                sectionInstruction="Complete the notes below. Write ONE WORD ONLY for each answer.",
                sectionTitle="Opportunities for voluntary work in Southoe village"),
            gap(2, "Help needed to keep … of books up to date:", "records", word_limit=1),
            gap(3, "Library is in the … Room in the village hall:", "west", word_limit=1),
            gap(4, "Help by providing …:", "transport", word_limit=1),
            gap(5, "Help with hobbies such as …:", "art", word_limit=1),
            gap(6, "Taking Mrs Carroll to …:", "hospital", word_limit=1),
            gap(7, "Work in the … at Mr Selsbury's house:", "garden", word_limit=1),
            gap(8, "19 Oct …:", "quiz", word_limit=1,
                sectionRange="Questions 8 – 10",
                sectionInstruction="Complete the table below. Write ONE WORD ONLY for each answer.",
                sectionTitle="Village social events"),
            gap(9, "18 Nov dance — checking …:", "tickets", word_limit=1),
            gap(10, "31 Dec New Year's Eve party — designing the …:", "poster", word_limit=1),
        ],
        noteTables=[
            {
                "gapNumbers": list(range(1, 8)),
                "instruction": "Questions 1 – 7\nComplete the notes below. Write ONE WORD ONLY for each answer.",
                "title": "Opportunities for voluntary work in Southoe village",
                "headers": ["Section", "Details"],
                "rows": [
                    {"cells": [
                        [tbl_static("Library")],
                        [tbl_static("Help with "), tbl_gap(1), tbl_static(" books (times to be arranged)"),
                         tbl_break(), tbl_static("Help needed to keep "), tbl_gap(2),
                         tbl_static(" of books up to date"),
                         tbl_break(), tbl_static("Library is in the "), tbl_gap(3),
                         tbl_static(" Room in the village hall")],
                    ]},
                    {"cells": [
                        [tbl_static("Lunch club")],
                        [tbl_static("Help by providing "), tbl_gap(4),
                         tbl_break(), tbl_static("Help with hobbies such as "), tbl_gap(5)],
                    ]},
                    {"cells": [
                        [tbl_static("Help for individuals needed next week")],
                        [tbl_static("Taking Mrs Carroll to "), tbl_gap(6),
                         tbl_break(), tbl_static("Work in the "), tbl_gap(7),
                         tbl_static(" at Mr Selsbury's house")],
                    ]},
                ],
            },
            {
                "gapNumbers": [8, 9, 10],
                "instruction": "Questions 8 – 10\nComplete the table below. Write ONE WORD ONLY for each answer.",
                "title": "Village social events",
                "headers": ["Date", "Event", "Location", "Help needed"],
                "rows": [
                    {"cells": [
                        [tbl_static("19 Oct")], [tbl_gap(8)], [tbl_static("Village hall")],
                        [tbl_static("providing refreshments")],
                    ]},
                    {"cells": [
                        [tbl_static("18 Nov")], [tbl_static("dance")], [tbl_static("Village hall")],
                        [tbl_static("checking "), tbl_gap(9)],
                    ]},
                    {"cells": [
                        [tbl_static("31 Dec")], [tbl_static("New Year's Eve party")],
                        [tbl_static("Mountfort Hotel")],
                        [tbl_static("designing the "), tbl_gap(10)],
                    ]},
                ],
            },
        ],
    )


def cam17_t2_p2():
    activity_opts = [
        ("A", "shopping"), ("B", "watching cows being milked"), ("C", "seeing old farming equipment"),
        ("D", "eating and drinking"), ("E", "starting a trip"), ("F", "seeing rare breeds of animals"),
        ("G", "helping to look after animals"), ("H", "using farming tools"),
    ]
    letters = list("ABCDEFGH")
    return part(
        2, 11, 20,
        "Questions 11–14: Choose A, B or C. Questions 15–20: Matching A–H.",
        [
            mc(11, "Many past owners made changes to", [
                ("A", "the gardens."), ("B", "the house."), ("C", "the farm."),
            ], "B", sectionRange="Questions 11 – 14",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Oniton Hall"),
            mc(12, "Sir Edward Downes built Oniton Hall because he wanted", [
                ("A", "a place for discussing politics."),
                ("B", "a place to display his wealth."),
                ("C", "a place for artists and writers."),
            ], "B"),
            mc(13, "Visitors can learn about the work of servants in the past from", [
                ("A", "audio guides."), ("B", "photographs."), ("C", "people in costume."),
            ], "C"),
            mc(14, "What is new for children at Oniton Hall?", [
                ("A", "clothes for dressing up"),
                ("B", "mini tractors"),
                ("C", "the adventure playground"),
            ], "C"),
            match(15, "dairy", letters, "D", labeled=activity_opts,
                  sectionRange="Questions 15 – 20",
                  sectionInstruction="Which activity is offered at each of the following locations on the farm? Choose SIX answers from the box and write the correct letter, A–H, next to Questions 15–20.",
                  sectionTitle="Locations on the farm"),
            match(16, "large barn", letters, "C", labeled=activity_opts),
            match(17, "small barn", letters, "G", labeled=activity_opts),
            match(18, "stables", letters, "A", labeled=activity_opts),
            match(19, "shed", letters, "E", labeled=activity_opts),
            match(20, "parkland", letters, "F", labeled=activity_opts),
        ],
    )


def cam17_t2_p3():
    opinion_opts = [
        ("A", "They both expected this to be more traditional."),
        ("B", "They both thought this was original."),
        ("C", "They agree this created the right atmosphere."),
        ("D", "They agree this was a major strength."),
        ("E", "They were both disappointed by this."),
        ("F", "They disagree about why this was an issue."),
        ("G", "They disagree about how this could be improved."),
    ]
    letters = list("ABCDEFG")
    return part(
        3, 21, 30,
        "Questions 21–22: Choose TWO A–E. Questions 23–27: Matching A–G. Questions 28–30: Choose A, B or C.",
        [
            *choose_two(21, 22,
                        "Which TWO things do the students agree they need to include in their reviews of Romeo and Juliet?",
                        [("A", "analysis of the text"),
                         ("B", "a summary of the plot"),
                         ("C", "a description of the theatre"),
                         ("D", "a personal reaction"),
                         ("E", "a reference to particular scenes")],
                        "D/E", "Phản ứng cá nhân (D) và cảnh cụ thể (E).",
                        sectionRange="Questions 21 and 22",
                        sectionInstruction="Choose TWO letters, A–E."),
            match(23, "the set", letters, "B", labeled=opinion_opts,
                  sectionRange="Questions 23 – 27",
                  sectionInstruction="Which opinion do the speakers give about each of the following aspects of The Emporium's production of Romeo and Juliet? Choose FIVE answers from the box and write the correct letter, A–G, next to Questions 23–27.",
                  sectionTitle="Aspects of the production"),
            match(24, "the lighting", letters, "C", labeled=opinion_opts),
            match(25, "the costume design", letters, "D", labeled=opinion_opts),
            match(26, "the music", letters, "E", labeled=opinion_opts),
            match(27, "the actors' delivery", letters, "F", labeled=opinion_opts),
            mc(28, "The students think the story of Romeo and Juliet is still relevant for young people today because", [
                ("A", "it illustrates how easily conflict can start."),
                ("B", "it deals with problems that families experience."),
                ("C", "it teaches them about relationships."),
            ], "A", sectionRange="Questions 28 – 30",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(29, "The students found watching Romeo and Juliet in another language", [
                ("A", "frustrating."), ("B", "demanding."), ("C", "moving."),
            ], "C"),
            mc(30, "Why do the students think Shakespeare's plays have such international appeal?", [
                ("A", "The stories are exciting."),
                ("B", "There are recognisable characters."),
                ("C", "They can be interpreted in many ways."),
            ], "C"),
        ],
    )


def cam17_t2_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(31, "has approximately … speakers:", "321000", sectionTitle="The impact of digital technology on the Icelandic language"),
            gap(32, "has a … that is still growing:", "vocabulary"),
            gap(33, "has its own words for computer-based concepts, such as web browser and …:", "podcast"),
            gap(34, "are big users of digital technology, such as …:", "smartphones"),
            gap(35, "are becoming … very quickly:", "bilingual"),
            gap(36, "are having discussions using only English while they are in the … at school:", "playground"),
            gap(37, "are better able to identify the content of a … in English than Icelandic:", "picture"),
            gap(38, "because of how complicated its … is:", "grammar"),
            gap(39, "is worried that young Icelanders may lose their … as Icelanders:", "identity"),
            gap(40, "is worried about the consequences of children not being … in either Icelandic or English:", "fluent"),
        ],
        passageTitle="The impact of digital technology on the Icelandic language",
        notePassage=[
            np_section("The Icelandic language"),
            np_static("• has approximately "), np_gap(31), np_static(" speakers"),
            np_static("• has a "), np_gap(32), np_static(" that is still growing"),
            np_static("• has not changed a lot over the last thousand years"),
            np_static("• has its own words for computer-based concepts, such as web browser and "), np_gap(33),
            np_section("Young speakers"),
            np_static("• are big users of digital technology, such as "), np_gap(34),
            np_static("• are becoming "), np_gap(35), np_static(" very quickly"),
            np_static("• are having discussions using only English while they are in the "),
            np_gap(36), np_static(" at school"),
            np_static("• are better able to identify the content of a "), np_gap(37),
            np_static(" in English than Icelandic"),
            np_section("Technology and internet companies"),
            np_static("• write very little in Icelandic because of the small number of speakers and because of how complicated its "),
            np_gap(38), np_static(" is"),
            np_section("The Icelandic government"),
            np_static("• has set up a fund to support the production of more digital content in the language"),
            np_static("• believes that Icelandic has a secure future"),
            np_static("• is worried that young Icelanders may lose their "), np_gap(39),
            np_static(" as Icelanders"),
            np_static("• is worried about the consequences of children not being "), np_gap(40),
            np_static(" in either Icelandic or English"),
        ],
    )


# ── Cam17 Test 3 ─────────────────────────────────────────────────────────────

def cam17_t3_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Recommends surfing for … holidays in the summer:", "family",
                sectionTitle="Advice on surfing holidays"),
            gap(2, "Need to be quite …:", "fit"),
            gap(3, "Lahinch has some good quality … and surf schools:", "hotels"),
            gap(4, "Good surf school at … beach:", "carrowniskey"),
            gap(5, "Surf camp lasts for one …:", "week"),
            gap(6, "Can also explore the local … by kayak:", "bay"),
            gap(7, "Best month to go: …:", "september"),
            gap(8, "Average temperature in summer: approx. … degrees:", "19/nineteen"),
            gap(9, "Wetsuit and surfboard: … euros per day:", "30/thirty"),
            gap(10, "Also advisable to hire … for warmth:", "boots"),
        ],
        notePassageLayout="form",
        notePassage=[
            np_section("Advice on surfing holidays"),
            np_section("Jack's advice"),
            np_static("• Recommends surfing for "), np_gap(1), np_static(" holidays in the summer"),
            np_static("• Need to be quite "), np_gap(2),
            np_section("Irish surfing locations"),
            np_section("County Clare"),
            np_static("– Lahinch has some good quality "), np_gap(3), np_static(" and surf schools"),
            np_static("– There are famous cliffs nearby"),
            np_section("County Mayo"),
            np_static("– Good surf school at "), np_gap(4), np_static(" beach"),
            np_static("– Surf camp lasts for one "), np_gap(5),
            np_static("– Can also explore the local "), np_gap(6), np_static(" by kayak"),
            np_section("Weather"),
            np_static("• Best month to go: "), np_gap(7),
            np_static("• Average temperature in summer: approx. "), np_gap(8),
            np_static(" degrees"),
            np_section("Costs"),
            np_section("Equipment"),
            np_static("– Wetsuit and surfboard: "), np_gap(9), np_static(" euros per day"),
            np_static("– Also advisable to hire "), np_gap(10), np_static(" for warmth"),
        ],
    )


def cam17_t3_p2():
    info_opts = [
        ("A", "has limited availability"), ("B", "is no longer available"),
        ("C", "is for over 8s only"), ("D", "requires help from parents"),
        ("E", "involves an additional fee"), ("F", "is a new activity"),
        ("G", "was requested by children"),
    ]
    letters = list("ABCDEFG")
    return part(
        2, 11, 20,
        "Questions 11–12: Choose TWO A–E. Questions 13–15: Choose A, B or C. Questions 16–20: Matching A–G.",
        [
            *choose_two(11, 12,
                        "Which TWO facts are given about the school's extended hours childcare service?",
                        [("A", "It started recently."),
                         ("B", "More children attend after school than before school."),
                         ("C", "An average of 50 children attend in the mornings."),
                         ("D", "A child cannot attend both the before and after school sessions."),
                         ("E", "The maximum number of children who can attend is 70.")],
                        "B/E", "Nhiều hơn sau giờ học (B) và tối đa 70 (E).",
                        sectionRange="Questions 11 and 12",
                        sectionInstruction="Choose TWO letters, A–E."),
            mc(13, "How much does childcare cost for a complete afternoon session per child?", [
                ("A", "£3.50"), ("B", "£5.70"), ("C", "£7.20"),
            ], "C", sectionRange="Questions 13 – 15",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(14, "What does the manager say about food?", [
                ("A", "Children with allergies should bring their own food."),
                ("B", "Children may bring healthy snacks with them."),
                ("C", "Children are given a proper meal at 5 p.m."),
            ], "A"),
            mc(15, "What is different about arrangements in the school holidays?", [
                ("A", "Children from other schools can attend."),
                ("B", "Older children can attend."),
                ("C", "A greater number of children can attend."),
            ], "B"),
            match(16, "Spanish", letters, "E", labeled=info_opts,
                  sectionRange="Questions 16 – 20",
                  sectionInstruction="What information is given about each of the following activities on offer? Choose FIVE answers from the box and write the correct letter, A–G, next to Questions 16–20.",
                  sectionTitle="Activities"),
            match(17, "Music", letters, "D", labeled=info_opts),
            match(18, "Painting", letters, "G", labeled=info_opts),
            match(19, "Yoga", letters, "F", labeled=info_opts),
            match(20, "Cooking", letters, "C", labeled=info_opts),
        ],
    )


def cam17_t3_p3():
    aspect_opts = [
        ("A", "being flexible"), ("B", "focusing on details"), ("C", "having a smart appearance"),
        ("D", "hiding your emotions"), ("E", "relying on experts"), ("F", "trusting your own views"),
        ("G", "doing one thing at a time"), ("H", "thinking of the future"),
    ]
    letters = list("ABCDEFGH")
    return part(
        3, 21, 30,
        "Questions 21–24: Choose A, B or C. Questions 25–30: Matching A–H.",
        [
            mc(21, "Holly has chosen the Orion Stadium placement because", [
                ("A", "it involves children."), ("B", "it is outdoors."), ("C", "it sounds like fun."),
            ], "B", sectionRange="Questions 21 – 24",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Holly's Work Placement Tutorial"),
            mc(22, "Which aspect of safety does Dr Green emphasise most?", [
                ("A", "ensuring children stay in the stadium"),
                ("B", "checking the equipment children will use"),
                ("C", "removing obstacles in changing rooms"),
            ], "A"),
            mc(23, "What does Dr Green say about the spectators?", [
                ("A", "They can be hard to manage."),
                ("B", "They make useful volunteers."),
                ("C", "They shouldn't take photographs."),
            ], "A"),
            mc(24, "What has affected the schedule in the past?", [
                ("A", "bad weather"), ("B", "an injury"), ("C", "extra time"),
            ], "B"),
            match(25, "Communication", letters, "C", labeled=aspect_opts,
                  sectionRange="Questions 25 – 30",
                  sectionInstruction="What do Holly and her tutor agree is an important aspect of each of the following events management skills? Choose SIX answers from the box and write the correct letter, A–H, next to Questions 25–30.",
                  sectionTitle="Events management skills"),
            match(26, "Organisation", letters, "A", labeled=aspect_opts),
            match(27, "Time management", letters, "D", labeled=aspect_opts),
            match(28, "Creativity", letters, "B", labeled=aspect_opts),
            match(29, "Leadership", letters, "F", labeled=aspect_opts),
            match(30, "Networking", letters, "H", labeled=aspect_opts),
        ],
    )


def cam17_t3_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "hibernated underwater or buried themselves in …:", "mud",
                sectionTitle="Bird Migration Theory"),
            gap(32, "redstarts experience the loss of …:", "feathers"),
            gap(33, "the two species of birds had a similar …:", "shape"),
            gap(34, "birds fly to the … in winter:", "moon"),
            gap(35, "a stork was killed in Germany which had an African spear in its …:", "neck"),
            gap(36, "previously there had been no … that storks migrate to Africa:", "evidence"),
            gap(37, "Little was known about the … and journeys of migrating birds:", "destinations"),
            gap(38, "incapable of travelling across huge …:", "oceans"),
            gap(39, "Ringing depended on what is called the … of dead birds:", "recovery"),
            gap(40, "the first … to show the migration of European birds was printed:", "atlas"),
        ],
        passageTitle="Bird Migration Theory",
        notePassage=[
            np_static("Most birds are believed to migrate seasonally."),
            np_section("Hibernation theory"),
            np_static("• It was believed that birds hibernated underwater or buried themselves in "), np_gap(31),
            np_static("• This theory was later disproved by experiments on caged birds."),
            np_section("Transmutation theory"),
            np_static("• Aristotle believed birds changed from one species into another in summer and winter."),
            np_static("– In autumn he observed that redstarts experience the loss of "), np_gap(32),
            np_static(" and thought they then turned into robins."),
            np_static("– Aristotle's assumptions were logical because the two species of birds had a similar "), np_gap(33),
            np_section("17th century"),
            np_static("• Charles Morton popularised the idea that birds fly to the "), np_gap(34),
            np_static(" in winter."),
            np_section("Scientific developments"),
            np_static("• In 1822, a stork was killed in Germany which had an African spear in its "), np_gap(35),
            np_static("– previously there had been no "), np_gap(36),
            np_static(" that storks migrate to Africa"),
            np_static("• Little was known about the "), np_gap(37),
            np_static(" and journeys of migrating birds until the practice of ringing was established."),
            np_static("– It was thought large birds carried small birds on some journeys because they were considered incapable of travelling across huge "), np_gap(38),
            np_static("– Ringing depended on what is called the "), np_gap(39),
            np_static(" of dead birds."),
            np_static("• In 1931, the first "), np_gap(40),
            np_static(" to show the migration of European birds was printed."),
        ],
    )


# ── Cam17 Test 4 ─────────────────────────────────────────────────────────────

def cam17_t4_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD for each answer.",
        [
            gap(1, "Cleaning the … throughout the apartment:", "floor/floors", word_limit=1,
                sectionTitle="Easy Life Cleaning Services"),
            gap(2, "Cleaning the …:", "fridge", word_limit=1),
            gap(3, "Ironing clothes — … only:", "shirts", word_limit=1),
            gap(4, "Cleaning all the … from the inside:", "windows", word_limit=1),
            gap(5, "Washing down the …:", "balcony", word_limit=1),
            gap(6, "They can organise a plumber or an … if necessary:", "electrician", word_limit=1),
            gap(7, "A special cleaning service is available for customers who are allergic to …:", "dust", word_limit=1),
            gap(8, "all cleaners have a background check carried out by the …:", "police", word_limit=1),
            gap(9, "All cleaners are given … for two weeks:", "training", word_limit=1),
            gap(10, "Customers send a … after each visit:", "review", word_limit=1),
        ],
        notePassageLayout="form",
        notePassage=[
            np_section("Easy Life Cleaning Services"),
            np_section("Basic cleaning package offered"),
            np_static("• Cleaning all surfaces"),
            np_static("• Cleaning the "), np_gap(1), np_static(" throughout the apartment"),
            np_static("• Cleaning shower, sinks, toilet etc."),
            np_section("Additional services agreed"),
            np_section("Every week"),
            np_static("– Cleaning the "), np_gap(2),
            np_static("– Ironing clothes — "), np_gap(3), np_static(" only"),
            np_section("Every month"),
            np_static("– Cleaning all the "), np_gap(4), np_static(" from the inside"),
            np_static("– Washing down the "), np_gap(5),
            np_section("Other possibilities"),
            np_static("• They can organise a plumber or an "), np_gap(6),
            np_static(" if necessary."),
            np_static("• A special cleaning service is available for customers who are allergic to "), np_gap(7),
            np_section("Information on the cleaners"),
            np_static("• Before being hired, all cleaners have a background check carried out by the "), np_gap(8),
            np_static("• References are required."),
            np_static("• All cleaners are given "), np_gap(9), np_static(" for two weeks."),
            np_static("• Customers send a "), np_gap(10), np_static(" after each visit."),
            np_static("• Usually, each customer has one regular cleaner."),
        ],
    )


def cam17_t4_p2():
    way_opts = [
        ("A", "improving relationships and teamwork"),
        ("B", "offering incentives and financial benefits"),
        ("C", "providing career opportunities"),
    ]
    return part(
        2, 11, 20,
        "Questions 11–14: Choose A, B or C. Questions 15–20: Matching A–C.",
        [
            mc(11, "Many hotel managers are unaware that their staff often leave because of", [
                ("A", "a lack of training."), ("B", "long hours."), ("C", "low pay."),
            ], "A", sectionRange="Questions 11 – 14",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(12, "What is the impact of high staff turnover on managers?", [
                ("A", "an increased workload"), ("B", "low morale"), ("C", "an inability to meet targets"),
            ], "A"),
            mc(13, "What mistake should managers always avoid?", [
                ("A", "failing to treat staff equally"),
                ("B", "reorganising shifts without warning"),
                ("C", "neglecting to have enough staff during busy periods"),
            ], "A"),
            mc(14, "What unexpected benefit did Dunwich Hotel notice after improving staff retention rates?", [
                ("A", "a fall in customer complaints"),
                ("B", "an increase in loyalty club membership"),
                ("C", "a rise in spending per customer"),
            ], "C"),
            match(15, "The Sun Club", list("ABC"), "A", labeled=way_opts,
                  sectionRange="Questions 15 – 20",
                  sectionInstruction="Which way of reducing staff turnover was used in each of the following hotels? Write the correct letter, A, B or C, next to Questions 15–20.",
                  sectionTitle="Hotels"),
            match(16, "The Portland", list("ABC"), "C", labeled=way_opts),
            match(17, "Bluewater Hotels", list("ABC"), "B", labeled=way_opts),
            match(18, "Pentlow Hotels", list("ABC"), "C", labeled=way_opts),
            match(19, "Green Planet", list("ABC"), "B", labeled=way_opts),
            match(20, "The Amesbury", list("ABC"), "A", labeled=way_opts),
        ],
    )


def cam17_t4_p3():
    comment_opts = [
        ("A", "It could cause excessive sweating."),
        ("B", "The material was being mass produced for another purpose."),
        ("C", "People often needed to make their own."),
        ("D", "It often had to be replaced."),
        ("E", "The material was expensive."),
        ("F", "It was unpopular among spectators."),
        ("G", "It caused injuries."),
        ("H", "No one using it liked it at first."),
    ]
    letters = list("ABCDEFGH")
    return part(
        3, 21, 30,
        "Questions 21–22 and 23–24: Choose TWO A–E. Questions 25–30: Matching A–H.",
        [
            *choose_two(21, 22,
                        "Which TWO points do Thomas and Jeanne make about Thomas's sporting activities at school?",
                        [("A", "He should have felt more positive about them."),
                         ("B", "The training was too challenging for him."),
                         ("C", "He could have worked harder at them."),
                         ("D", "His parents were disappointed in him."),
                         ("E", "His fellow students admired him.")],
                        "C/E", "Làm việc chăm hơn (C) và bạn cùng lớp ngưỡng mộ (E).",
                        sectionRange="Questions 21 and 22",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(23, 24,
                        "Which TWO feelings did Thomas experience when he was in Kenya?",
                        [("A", "disbelief"), ("B", "relief"), ("C", "stress"),
                         ("D", "gratitude"), ("E", "homesickness")],
                        "A/D", "Không tin (A) và biết ơn (D).",
                        sectionRange="Questions 23 and 24",
                        sectionInstruction="Choose TWO letters, A–E."),
            match(25, "the table tennis bat", letters, "B", labeled=comment_opts,
                  sectionRange="Questions 25 – 30",
                  sectionInstruction="What comment do the students make about the development of each of the following items of sporting equipment? Choose SIX answers from the box and write the correct letter, A–H, next to Questions 25–30.",
                  sectionTitle="Items of sporting equipment"),
            match(26, "the cricket helmet", letters, "G", labeled=comment_opts),
            match(27, "the cycle helmet", letters, "C", labeled=comment_opts),
            match(28, "the golf club", letters, "H", labeled=comment_opts),
            match(29, "the hockey stick", letters, "A", labeled=comment_opts),
            match(30, "the football", letters, "D", labeled=comment_opts),
        ],
    )


def cam17_t4_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "colour described as …:", "golden", sectionTitle="Maple syrup"),
            gap(32, "very … compared to refined sugar:", "healthy"),
            gap(33, "best growing conditions and … are in Canada and North America:", "climate"),
            gap(34, "used hot … to heat the sap:", "rock/rocks"),
            gap(35, "Tree trunks may not have the correct … until they have been growing for 40 years:", "diameter"),
            gap(36, "A tap is drilled into the trunk and a … carries the sap into a bucket:", "tube"),
            gap(37, "Large pans of sap called evaporators are heated by means of a …:", "fire"),
            gap(38, "A lot of … is produced during the evaporation process:", "steam"),
            gap(39, "'Sugar sand' is removed because it makes the syrup look … and affects the taste:", "cloudy"),
            gap(40, "A huge quantity of sap is needed to make a … of maple syrup:", "litre/liter"),
        ],
        passageTitle="Maple syrup",
        notePassage=[
            np_section("What is maple syrup?"),
            np_static("• made from the sap of the maple tree"),
            np_static("• colour described as "), np_gap(31),
            np_static("• added to food or used in cooking"),
            np_static("• very "), np_gap(32), np_static(" compared to refined sugar"),
            np_section("The maple tree"),
            np_static("• has many species"),
            np_static("• needs sunny days and cool nights"),
            np_static("• needs moist soil but does not need fertiliser as well"),
            np_static("• maple leaf has been on the Canadian flag since 1964"),
            np_static("• best growing conditions and "), np_gap(33),
            np_static(" are in Canada and North America"),
            np_section("Early maple sugar producers"),
            np_static("• made holes in the tree trunks"),
            np_static("• used hot "), np_gap(34), np_static(" to heat the sap"),
            np_static("• used tree bark to make containers for collection"),
            np_static("• sweetened food and drink with sugar"),
            np_section("Today's maple syrup"),
            np_section("The trees"),
            np_static("• Tree trunks may not have the correct "), np_gap(35),
            np_static(" until they have been growing for 40 years."),
            np_static("• The changing temperature and movement of water within the tree produces the sap."),
            np_section("The production"),
            np_static("• A tap is drilled into the trunk and a "), np_gap(36),
            np_static(" carries the sap into a bucket."),
            np_static("• Large pans of sap called evaporators are heated by means of a "), np_gap(37),
            np_static("."),
            np_static("• A lot of "), np_gap(38), np_static(" is produced during the evaporation process."),
            np_static("• 'Sugar sand' is removed because it makes the syrup look "), np_gap(39),
            np_static(" and affects the taste."),
            np_static("• The syrup is ready for use."),
            np_static("• A huge quantity of sap is needed to make a "), np_gap(40),
            np_static(" of maple syrup."),
        ],
    )


# ── Cam18 Test 1 ─────────────────────────────────────────────────────────────

def cam18_t1_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Postcode:", "dw30 7yz", sectionTitle="Transport survey"),
            gap(2, "Date of bus journey:", "24(th) april"),
            gap(3, "Reason for trip: shopping and visit to the …:", "dentist"),
            gap(4, "Travelled by bus because cost of … too high:", "parking"),
            gap(5, "Got on bus at … Street:", "claxby"),
            gap(6, "bus today was …:", "late"),
            gap(7, "frequency of buses in the …:", "evening"),
            gap(8, "Goes to the … by car:", "supermarket"),
            gap(9, "Dislikes travelling by bike in the city centre because of the …:", "pollution"),
            gap(10, "Doesn't own a bike because of a lack of …:", "storage"),
        ],
        notePassageLayout="form",
        notePassage=[
            np_section("Transport survey"),
            np_static("Name: Sadie Jones"),
            np_static("Year of birth: 1991"),
            np_static("Postcode: "), np_gap(1),
            np_section("Travelling by bus"),
            np_static("Date of bus journey: "), np_gap(2),
            np_static("Reason for trip: shopping and visit to the "), np_gap(3),
            np_static("Travelled by bus because cost of "), np_gap(4), np_static(" too high"),
            np_static("Got on bus at "), np_gap(5), np_static(" Street"),
            np_static("Complaints about bus service:"),
            np_static("– bus today was "), np_gap(6),
            np_static("– frequency of buses in the "), np_gap(7),
            np_section("Travelling by car"),
            np_static("Goes to the "), np_gap(8), np_static(" by car"),
            np_section("Travelling by bicycle"),
            np_static("Dislikes travelling by bike in the city centre because of the "), np_gap(9),
            np_static("Doesn't own a bike because of a lack of "), np_gap(10),
        ],
    )


def cam18_t1_p2():
    help_opts = [
        ("A", "experience on stage"), ("B", "original, new ideas"), ("C", "parenting skills"),
        ("D", "an understanding of food and diet"), ("E", "retail experience"),
        ("F", "a good memory"), ("G", "a good level of fitness"),
    ]
    letters = list("ABCDEFG")
    return part(
        2, 11, 20,
        "Questions 11–13: Choose A, B or C. Questions 14–15: Choose TWO A–E. Questions 16–20: Matching A–G.",
        [
            mc(11, "Why does the speaker apologise about the seats?", [
                ("A", "They are too small."),
                ("B", "There are not enough of them."),
                ("C", "Some of them are very close together."),
            ], "C", sectionRange="Questions 11 – 13",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Becoming a volunteer for ACE"),
            mc(12, "What does the speaker say about the age of volunteers?", [
                ("A", "The age of volunteers is less important than other factors."),
                ("B", "Young volunteers are less reliable than older ones."),
                ("C", "Most volunteers are about 60 years old."),
            ], "A"),
            mc(13, "What does the speaker say about training?", [
                ("A", "It is continuous."), ("B", "It is conducted by a manager."), ("C", "It takes place online."),
            ], "A"),
            *choose_two(14, 15,
                        "Which TWO issues does the speaker ask the audience to consider before they apply to be volunteers?",
                        [("A", "their financial situation"),
                         ("B", "their level of commitment"),
                         ("C", "their work experience"),
                         ("D", "their ambition"),
                         ("E", "their availability")],
                        "B/E", "Cam kết (B) và thời gian rảnh (E).",
                        sectionRange="Questions 14 and 15",
                        sectionInstruction="Choose TWO letters, A–E."),
            match(16, "Fundraising", letters, "B", labeled=help_opts,
                  sectionRange="Questions 16 – 20",
                  sectionInstruction="What does the speaker suggest would be helpful for each of the following areas of voluntary work? Choose FIVE answers from the box and write the correct letter, A–G, next to Questions 16–20.",
                  sectionTitle="Area of voluntary work"),
            match(17, "Litter collection", letters, "G", labeled=help_opts),
            match(18, "'Playmates'", letters, "C", labeled=help_opts),
            match(19, "Story club", letters, "D", labeled=help_opts),
            match(20, "First aid", letters, "A", labeled=help_opts),
        ],
    )


def cam18_t1_p3():
    return part(
        3, 21, 30,
        "Questions 21–26: Choose A, B or C. Questions 27–28 and 29–30: Choose TWO A–E.",
        [
            mc(21, "What problem did Chantal have at the start of the talk?", [
                ("A", "Her view of the speaker was blocked."),
                ("B", "She was unable to find an empty seat."),
                ("C", "The students next to her were talking."),
            ], "A", sectionRange="Questions 21 – 26",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Talk on jobs in fashion design"),
            mc(22, "What were Hugo and Chantal surprised to hear about the job market?", [
                ("A", "It has become more competitive than it used to be."),
                ("B", "There is more variety in it than they had realised."),
                ("C", "Some areas of it are more exciting than others."),
            ], "B"),
            mc(23, "Hugo and Chantal agree that the speaker's message was", [
                ("A", "unfair to them at times."),
                ("B", "hard for them to follow."),
                ("C", "critical of the industry."),
            ], "A"),
            mc(24, "What do Hugo and Chantal criticise about their school careers advice?", [
                ("A", "when they received the advice"),
                ("B", "how much advice was given"),
                ("C", "who gave the advice"),
            ], "B"),
            mc(25, "When discussing their future, Hugo and Chantal disagree on", [
                ("A", "which is the best career in fashion."),
                ("B", "when to choose a career in fashion."),
                ("C", "why they would like a career in fashion."),
            ], "B"),
            mc(26, "How does Hugo feel about being an unpaid assistant?", [
                ("A", "He is realistic about the practice."),
                ("B", "He feels the practice is dishonest."),
                ("C", "He thinks others want to change the practice."),
            ], "A"),
            *choose_two(27, 28,
                        "Which TWO mistakes did the speaker admit she made in her first job?",
                        [("A", "being dishonest to her employer"),
                         ("B", "paying too much attention to how she looked"),
                         ("C", "expecting to become well known"),
                         ("D", "trying to earn a lot of money"),
                         ("E", "openly disliking her client")],
                        "B/E", "Ngoại hình (B) và kiếm tiền (E).",
                        sectionRange="Questions 27 and 28",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(29, 30,
                        "Which TWO pieces of retail information do Hugo and Chantal agree would be useful?",
                        [("A", "the reasons people return fashion items"),
                         ("B", "how much time people have to shop for clothes"),
                         ("C", "fashion designs people want but can't find"),
                         ("D", "the best time of year for fashion buying"),
                         ("E", "the most popular fashion sizes")],
                        "A/C", "Lý do trả hàng (A) và thiết kế thiếu (C).",
                        sectionRange="Questions 29 and 30",
                        sectionInstruction="Choose TWO letters, A–E."),
        ],
    )


def cam18_t1_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "damage to … in the park:", "fences", sectionTitle="Elephant translocation"),
            gap(32, "a suitable group of elephants from the same … was selected:", "family"),
            gap(33, "vets and park staff made use of … to help guide the elephants:", "helicopters"),
            gap(34, "this process had to be completed quickly to reduce …:", "stress"),
            gap(35, "elephants had to be turned on their … to avoid damage to their lungs:", "sides"),
            gap(36, "elephants' … had to be monitored constantly:", "breathing"),
            gap(37, "data including the size of their tusks and … was taken:", "feet"),
            gap(38, "… opportunities:", "employment"),
            gap(39, "a reduction in the number of poachers and …:", "weapons"),
            gap(40, "an increase in … as a contributor to GDP:", "tourism"),
        ],
        passageTitle="Elephant translocation",
        notePassage=[
            np_section("Reasons for overpopulation at Majete National Park"),
            np_static("• strict enforcement of anti-poaching laws"),
            np_static("• successful breeding"),
            np_section("Problems caused by elephant overpopulation"),
            np_static("• greater competition, causing hunger for elephants"),
            np_static("• damage to "), np_gap(31), np_static(" in the park"),
            np_section("The translocation process"),
            np_static("• a suitable group of elephants from the same "), np_gap(32),
            np_static(" was selected"),
            np_static("• vets and park staff made use of "), np_gap(33),
            np_static(" to help guide the elephants into an open plain"),
            np_static("• elephants were immobilised with tranquilisers"),
            np_static("– this process had to be completed quickly to reduce "), np_gap(34),
            np_static("– elephants had to be turned on their "), np_gap(35),
            np_static(" to avoid damage to their lungs"),
            np_static("– elephants' "), np_gap(36), np_static(" had to be monitored constantly"),
            np_static("– tracking devices were fitted to the matriarchs"),
            np_static("– data including the size of their tusks and "), np_gap(37), np_static(" was taken"),
            np_static("• elephants were taken by truck to their new reserve"),
            np_section("Advantages of translocation at Nkhotakota Wildlife Park"),
            np_static("• "), np_gap(38), np_static(" opportunities"),
            np_static("• a reduction in the number of poachers and "), np_gap(39),
            np_static("• an example of conservation that other parks can follow"),
            np_static("• an increase in "), np_gap(40), np_static(" as a contributor to GDP"),
        ],
    )


# ── Cam18 Test 2 ─────────────────────────────────────────────────────────────

def cam18_t2_p1():
    return part(
        1, 1, 10,
        "Questions 1–5: Complete the notes below. Write ONE WORD ONLY for each answer. "
        "Questions 6–10: Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "… provided for all staff:", "training", word_limit=1,
                sectionRange="Questions 1 – 5",
                sectionInstruction="Complete the notes below. Write ONE WORD ONLY for each answer.",
                sectionTitle="Working at Milo's Restaurants"),
            gap(2, "… during weekdays at all Milo's Restaurants:", "discount", word_limit=1),
            gap(3, "… provided after midnight:", "taxi", word_limit=1),
            gap(4, "maintaining a high standard of …:", "service", word_limit=1),
            gap(5, "must have a qualification in …:", "english", word_limit=1),
            gap(6, "… Street — Breakfast supervisor:", "wivenhoe",
                sectionRange="Questions 6 – 10",
                sectionInstruction="Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer."),
            gap(7, "Making sure … is clean:", "equipment"),
            gap(8, "Starting salary £ … per hour:", "9.75"),
            gap(9, "Maintaining stock and organising …:", "deliveries"),
            gap(10, "No work on a … once a month:", "sunday"),
        ],
        noteTables=[
            {
                "gapNumbers": list(range(1, 6)),
                "instruction": "Questions 1 – 5\nComplete the notes below. Write ONE WORD ONLY for each answer.",
                "title": "Working at Milo's Restaurants",
                "headers": ["Section", "Details"],
                "rows": [
                    {"cells": [
                        [tbl_static("Benefits")],
                        [tbl_static("• "), tbl_gap(1), tbl_static(" provided for all staff"),
                         tbl_break(), tbl_static("• "), tbl_gap(2),
                         tbl_static(" during weekdays at all Milo's Restaurants"),
                         tbl_break(), tbl_static("• "), tbl_gap(3), tbl_static(" provided after midnight")],
                    ]},
                    {"cells": [
                        [tbl_static("Person specification")],
                        [tbl_static("• must be prepared to work well in a team"),
                         tbl_break(), tbl_static("• must care about maintaining a high standard of "), tbl_gap(4),
                         tbl_break(), tbl_static("• must have a qualification in "), tbl_gap(5)],
                    ]},
                ],
            },
            {
                "gapNumbers": list(range(6, 11)),
                "instruction": "Questions 6 – 10\nComplete the table below. Write ONE WORD AND/OR A NUMBER for each answer.",
                "headers": ["Location", "Job title", "Responsibilities include", "Pay and conditions"],
                "rows": [
                    {"cells": [
                        [tbl_static("6 "), tbl_gap(6), tbl_static(" Street")],
                        [tbl_static("Breakfast supervisor")],
                        [tbl_static("Checking portions, etc. are correct"),
                         tbl_break(), tbl_static("Making sure "), tbl_gap(7), tbl_static(" is clean")],
                        [tbl_static("Starting salary £"), tbl_gap(8), tbl_static(" per hour"),
                         tbl_break(), tbl_static("Start work at 5.30 a.m.")],
                    ]},
                    {"cells": [
                        [tbl_static("City Road")],
                        [tbl_static("Junior chef")],
                        [tbl_static("Supporting senior chefs"),
                         tbl_break(), tbl_static("Maintaining stock and organising "), tbl_gap(9)],
                        [tbl_static("Annual salary £23,000"),
                         tbl_break(), tbl_static("No work on a "), tbl_gap(10), tbl_static(" once a month")],
                    ]},
                ],
            },
        ],
    )


def cam18_t2_p2():
    letters = list("ABCDEFGHI")
    return part(
        2, 11, 20,
        "Questions 11–12 and 13–14: Choose TWO A–E. Questions 15–20: Label the map A–I.",
        [
            *choose_two(11, 12,
                        "What are the TWO main reasons why this site has been chosen for the housing development?",
                        [("A", "It has suitable geographical features."),
                         ("B", "There is easy access to local facilities."),
                         ("C", "It has good connections with the airport."),
                         ("D", "The land is of little agricultural value."),
                         ("E", "It will be convenient for workers.")],
                        "B/E", "Tiện ích địa phương (B) và thuận tiện cho người lao động (E).",
                        sectionRange="Questions 11 and 12",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(13, 14,
                        "Which TWO aspects of the planned housing development have people given positive feedback about?",
                        [("A", "the facilities for cyclists"),
                         ("B", "the impact on the environment"),
                         ("C", "the encouragement of good relations between residents"),
                         ("D", "the low cost of all the accommodation"),
                         ("E", "the rural location")],
                        "B/C", "Môi trường (B) và quan hệ cư dân (C).",
                        sectionRange="Questions 13 and 14",
                        sectionInstruction="Choose TWO letters, A–E."),
            map_label(15, "School", letters, "G",
                      sectionRange="Questions 15 – 20",
                      sectionInstruction="Label the map below. Write the correct letter, A–I, next to Questions 15–20."),
            map_label(16, "Sports centre", letters, "C"),
            map_label(17, "Clinic", letters, "D"),
            map_label(18, "Community centre", letters, "B"),
            map_label(19, "Supermarket", letters, "H"),
            map_label(20, "Playground", letters, "A"),
        ],
        imageFile="map.jpg",
    )


def cam18_t2_p3():
    comment_opts = [
        ("A", "This country suffered the most severe loss of life."),
        ("B", "The impact on agriculture was predictable."),
        ("C", "There was a significant increase in deaths of young people."),
        ("D", "Animals suffered from a sickness."),
        ("E", "This country saw the highest rise in food prices in the world."),
        ("F", "It caused a particularly harsh winter."),
    ]
    letters = list("ABCDEF")
    return part(
        3, 21, 30,
        "Questions 21–24: Choose A, B or C. Questions 25–26: Choose TWO A–E. Questions 27–30: Matching A–F.",
        [
            mc(21, "Why do the students think the Laki eruption of 1783 is so important?", [
                ("A", "It was the most severe eruption in modern times."),
                ("B", "It led to the formal study of volcanoes."),
                ("C", "It had a profound effect on society."),
            ], "C", sectionRange="Questions 21 – 24",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(22, "What surprised Adam about observations made at the time?", [
                ("A", "the number of places producing them"),
                ("B", "the contradictions in them"),
                ("C", "the lack of scientific data to support them"),
            ], "A"),
            mc(23, "According to Michelle, what did the contemporary sources say about the Laki haze?", [
                ("A", "People thought it was similar to ordinary fog."),
                ("B", "It was associated with health issues."),
                ("C", "It completely blocked out the sun for weeks."),
            ], "B"),
            mc(24, "Adam corrects Michelle when she claims that Benjamin Franklin", [
                ("A", "came to the wrong conclusion about the cause of the haze."),
                ("B", "was the first to identify the reason for the haze."),
                ("C", "supported the opinions of other observers about the haze."),
            ], "B"),
            *choose_two(25, 26,
                        "Which TWO issues following the Laki eruption surprised the students?",
                        [("A", "how widespread the effects were"),
                         ("B", "how long-lasting the effects were"),
                         ("C", "the number of deaths it caused"),
                         ("D", "the speed at which the volcanic ash cloud spread"),
                         ("E", "how people ignored the warning signs")],
                        "A/B", "Phạm vi rộng (A) và kéo dài (B).",
                        sectionRange="Questions 25 and 26",
                        sectionInstruction="Choose TWO letters, A–E."),
            match(27, "Iceland", letters, "D", labeled=comment_opts,
                  sectionRange="Questions 27 – 30",
                  sectionInstruction="What comment do the students make about the impact of the Laki eruption on the following countries? Choose FOUR answers from the box and write the correct letter, A–F, next to Questions 27–30.",
                  sectionTitle="Countries"),
            match(28, "Egypt", letters, "F", labeled=comment_opts),
            match(29, "UK", letters, "C", labeled=comment_opts),
            match(30, "USA", letters, "A", labeled=comment_opts),
        ],
    )


def cam18_t2_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "They are … but can be overlooked by consumers and designers:", "convenient",
                sectionTitle="Pockets"),
            gap(32, "Men started to wear … in the 18th century:", "suits"),
            gap(33, "A … sewed pockets into the lining of the garments:", "tailor"),
            gap(34, "Bigger pockets might be made for men who belonged to a certain type of …:", "profession"),
            gap(35, "Women's pockets were less … than men's:", "visible"),
            gap(36, "Pockets were produced in pairs using … to link them together:", "string/strings"),
            gap(37, "Pockets hung from the women's … under skirts and petticoats:", "waist/waists"),
            gap(38, "Items such as … could be reached through a gap in the material:", "perfume"),
            gap(39, "hidden pockets had a negative effect on the … of women:", "image"),
            gap(40, "before women carried a …:", "handbag"),
        ],
        passageTitle="Pockets",
        notePassage=[
            np_section("Reason for choice of subject"),
            np_static("• They are "), np_gap(31),
            np_static(" but can be overlooked by consumers and designers."),
            np_section("Pockets in men's clothes"),
            np_static("• Men started to wear "), np_gap(32), np_static(" in the 18th century."),
            np_static("• A "), np_gap(33), np_static(" sewed pockets into the lining of the garments."),
            np_static("• The wearer could use the pockets for small items."),
            np_static("• Bigger pockets might be made for men who belonged to a certain type of "),
            np_gap(34), np_static("."),
            np_section("Pockets in women's clothes"),
            np_static("• Women's pockets were less "), np_gap(35), np_static(" than men's."),
            np_static("• Women were very concerned about pickpockets."),
            np_static("• Pockets were produced in pairs using "), np_gap(36),
            np_static(" to link them together."),
            np_static("• Pockets hung from the women's "), np_gap(37),
            np_static(" under skirts and petticoats."),
            np_static("• Items such as "), np_gap(38),
            np_static(" could be reached through a gap in the material."),
            np_static("• Pockets, of various sizes, stayed inside clothing for many decades."),
            np_static("• When dresses changed shape, hidden pockets had a negative effect on the "),
            np_gap(39), np_static(" of women."),
            np_static("• Bags called 'pouches' became popular, before women carried a "), np_gap(40), np_static("."),
        ],
    )


# ── Cam18 Test 3 ─────────────────────────────────────────────────────────────

def cam18_t3_p1():
    return part(
        1, 1, 10,
        "Questions 1–4: Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer. "
        "Questions 5–10: Complete the table below. Write NO MORE THAN TWO WORDS for each answer.",
        [
            gap(1, "Home address: 52 … Street, Peacetown:", "marrowfield",
                sectionRange="Questions 1 – 4",
                sectionInstruction="Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.",
                sectionTitle="Wayside Camera Club membership form"),
            gap(2, "Heard about us: from a …:", "relative"),
            gap(3, "Reasons for joining: to …:", "socialise/socialize"),
            gap(4, "Type of membership: … membership (£30):", "full"),
            gap(5, "Title of competition '…':", "domestic life", word_limit=2,
                sectionRange="Questions 5 – 10",
                sectionInstruction="Complete the table below. Write NO MORE THAN TWO WORDS for each answer.",
                sectionTitle="Photography competitions"),
            gap(6, "Scene must show some …:", "clouds", word_limit=2),
            gap(7, "The … was wrong:", "timing", word_limit=2),
            gap(8, "Title of competition '…':", "animal magic", word_limit=2),
            gap(9, "Scene must show …:", "animal movement/movement", word_limit=2),
            gap(10, "The photograph was too …:", "dark", word_limit=2),
        ],
        noteTables=[
            {
                "gapNumbers": list(range(1, 5)),
                "instruction": "Questions 1 – 4\nComplete the form below. Write ONE WORD AND/OR A NUMBER for each answer.",
                "title": "Wayside Camera Club membership form",
                "headers": ["Field", "Details"],
                "rows": [
                    {"cells": [
                        [tbl_static("Name")], [tbl_static("Dan Green")],
                    ]},
                    {"cells": [
                        [tbl_static("Email address")], [tbl_static("dan1068@market.com")],
                    ]},
                    {"cells": [
                        [tbl_static("Home address")],
                        [tbl_static("52 "), tbl_gap(1), tbl_static(" Street, Peacetown")],
                    ]},
                    {"cells": [
                        [tbl_static("Heard about us")],
                        [tbl_static("from a "), tbl_gap(2)],
                    ]},
                    {"cells": [
                        [tbl_static("Reasons for joining")],
                        [tbl_static("to enter competitions; to "), tbl_gap(3)],
                    ]},
                    {"cells": [
                        [tbl_static("Type of membership")],
                        [tbl_gap(4), tbl_static(" membership (£30)")],
                    ]},
                ],
            },
            {
                "gapNumbers": list(range(5, 11)),
                "instruction": "Questions 5 – 10\nComplete the table below. Write NO MORE THAN TWO WORDS for each answer.",
                "title": "Photography competitions",
                "headers": ["Title of competition", "Instructions", "Feedback to Dan"],
                "rows": [
                    {"cells": [
                        [tbl_gap(5)],
                        [tbl_static("A scene in the home")],
                        [tbl_static("The picture's composition was not good.")],
                    ]},
                    {"cells": [
                        [tbl_static("'Beautiful Sunsets'")],
                        [tbl_static("Scene must show some "), tbl_gap(6)],
                        [tbl_static("The "), tbl_gap(7), tbl_static(" was wrong.")],
                    ]},
                    {"cells": [
                        [tbl_gap(8)],
                        [tbl_static("Scene must show "), tbl_gap(9)],
                        [tbl_static("The photograph was too "), tbl_gap(10)],
                    ]},
                ],
            },
        ],
    )


def cam18_t3_p2():
    return part(
        2, 11, 20,
        "Questions 11–12 and 13–14: Choose TWO A–E. Questions 15–20: Choose A, B or C.",
        [
            *choose_two(11, 12,
                        "Which TWO warnings does Dan give about picking mushrooms?",
                        [("A", "Don't pick more than one variety of mushroom at a time."),
                         ("B", "Don't pick mushrooms near busy roads."),
                         ("C", "Don't eat mushrooms given to you."),
                         ("D", "Don't eat mushrooms while picking them."),
                         ("E", "Don't pick old mushrooms.")],
                        "B/C", "Không gần đường (B) và không ăn khi hái (C).",
                        sectionRange="Questions 11 and 12",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(13, 14,
                        "Which TWO ideas about wild mushrooms does Dan say are correct?",
                        [("A", "Mushrooms should always be peeled before eating."),
                         ("B", "Mushrooms eaten by animals may be unsafe."),
                         ("C", "Cooking destroys toxins in mushrooms."),
                         ("D", "Brightly coloured mushrooms can be edible."),
                         ("E", "All poisonous mushrooms have a bad smell.")],
                        "B/D", "Động vật ăn không an toàn (B) và màu sáng có thể ăn được (D).",
                        sectionRange="Questions 13 and 14",
                        sectionInstruction="Choose TWO letters, A–E."),
            mc(15, "What advice does Dan give about picking mushrooms in parks?", [
                ("A", "Choose wooded areas."), ("B", "Don't disturb wildlife."), ("C", "Get there early."),
            ], "C", sectionRange="Questions 15 – 20",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(16, "Dan says it is a good idea for beginners to", [
                ("A", "use a mushroom app."), ("B", "join a group."), ("C", "take a reference book."),
            ], "B"),
            mc(17, "What does Dan say is important for conservation?", [
                ("A", "selecting only fully grown mushrooms"),
                ("B", "picking a limited amount of mushrooms"),
                ("C", "avoiding areas where rare mushroom species grow"),
            ], "B"),
            mc(18, "According to Dan, some varieties of wild mushrooms are in decline because there is", [
                ("A", "a huge demand for them from restaurants."),
                ("B", "a lack of rain in this part of the country."),
                ("C", "a rise in building developments locally."),
            ], "C"),
            mc(19, "Dan says that when storing mushrooms, people should", [
                ("A", "keep them in the fridge for no more than two days."),
                ("B", "keep them in a brown bag in a dark room."),
                ("C", "leave them for a period after washing them."),
            ], "A"),
            mc(20, "What does Dan say about trying new varieties of mushrooms?", [
                ("A", "Experiment with different recipes."),
                ("B", "Expect some to have a strong taste."),
                ("C", "Cook them for a long time."),
            ], "A"),
        ],
    )


def cam18_t3_p3():
    job_opts = [
        ("A", "These jobs are likely to be at risk."),
        ("B", "Their role has become more interesting in recent years."),
        ("C", "The number of people working in this sector has fallen dramatically."),
        ("D", "This job will require more qualifications."),
        ("E", "Higher disposable income has led to a huge increase in jobs."),
        ("F", "There is likely to be a significant rise in demand for this service."),
        ("G", "Both employment and productivity have risen."),
    ]
    letters = list("ABCDEFG")
    return part(
        3, 21, 30,
        "Questions 21–22 and 23–24: Choose TWO A–E. Questions 25–30: Matching A–G.",
        [
            *choose_two(21, 22,
                        "Which TWO opinions about the Luddites do the students express?",
                        [("A", "Their actions were ineffective."),
                         ("B", "They are still influential today."),
                         ("C", "They have received unfair criticism."),
                         ("D", "They were proved right."),
                         ("E", "Their attitude is understandable.")],
                        "A/E", "Không hiệu quả (A) và thái độ dễ hiểu (E).",
                        sectionRange="Questions 21 and 22",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(23, 24,
                        "Which TWO predictions about the future of work are the students doubtful about?",
                        [("A", "Work will be more rewarding."),
                         ("B", "Unemployment will fall."),
                         ("C", "People will want to delay retiring."),
                         ("D", "Working hours will be shorter."),
                         ("E", "People will change jobs more frequently.")],
                        "B/D", "Thất nghiệp giảm (B) và giờ làm ngắn hơn (D).",
                        sectionRange="Questions 23 and 24",
                        sectionInstruction="Choose TWO letters, A–E."),
            match(25, "Accountants", letters, "A", labeled=job_opts,
                  sectionRange="Questions 25 – 30",
                  sectionInstruction="What comment do the students make about each of the following jobs? Choose SIX answers from the box and write the correct letter, A–G, next to Questions 25–30.",
                  sectionTitle="Jobs"),
            match(26, "Hairdressers", letters, "F", labeled=job_opts),
            match(27, "Administrative staff", letters, "C", labeled=job_opts),
            match(28, "Agricultural workers", letters, "E", labeled=job_opts),
            match(29, "Care workers", letters, "B", labeled=job_opts),
            match(30, "Bank clerks", letters, "G", labeled=job_opts),
        ],
    )


def cam18_t3_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "would aim to set up legal and … ways of improving safety:", "technical",
                sectionTitle="Space Traffic Management"),
            gap(32, "Satellites are now quite … and therefore more widespread:", "cheap"),
            gap(33, "there are constellations made up of … of satellites:", "thousands"),
            gap(34, "satellites are not required to transmit information to help with their …:", "identification"),
            gap(35, "There are few systems for … satellites:", "tracking"),
            gap(36, "Operators may be unwilling to share details of satellites used for … or commercial reasons:", "military"),
            gap(37, "It may be hard to collect details of the object's … at a given time:", "location"),
            gap(38, "Scientists can only make a … about where the satellite will go:", "prediction"),
            gap(39, "The information should be combined in one …:", "database"),
            gap(40, "A coordinated system must be designed to create … in its users:", "trust"),
        ],
        passageTitle="Space Traffic Management",
        notePassage=[
            np_section("A Space Traffic Management system"),
            np_static("• is a concept similar to Air Traffic Control, but for satellites rather than planes."),
            np_static("• would aim to set up legal and "), np_gap(31),
            np_static(" ways of improving safety."),
            np_static("• does not actually exist at present."),
            np_section("Problems in developing effective Space Traffic Management"),
            np_static("• Satellites are now quite "), np_gap(32),
            np_static(" and therefore more widespread"),
            np_static("(e.g. there are constellations made up of "), np_gap(33),
            np_static(" of satellites)."),
            np_static("• At present, satellites are not required to transmit information to help with their "),
            np_gap(34), np_static("."),
            np_static("• There are few systems for "), np_gap(35), np_static(" satellites."),
            np_static("• Small pieces of debris may be difficult to identify."),
            np_static("• Operators may be unwilling to share details of satellites used for "),
            np_gap(36), np_static(" or commercial reasons."),
            np_static("• It may be hard to collect details of the object's "), np_gap(37),
            np_static(" at a given time."),
            np_static("• Scientists can only make a "), np_gap(38),
            np_static(" about where the satellite will go."),
            np_section("Solutions"),
            np_static("• Common standards should be agreed on for the presentation of information."),
            np_static("• The information should be combined in one "), np_gap(39), np_static("."),
            np_static("• A coordinated system must be designed to create "), np_gap(40),
            np_static(" in its users."),
        ],
    )


# ── Cam18 Test 4 ─────────────────────────────────────────────────────────────

def cam18_t4_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Role:", "receptionist", sectionTitle="Job details from employment agency"),
            gap(2, "Location: Fordham … Centre:", "medical"),
            gap(3, "… Road, Fordham:", "chastens"),
            gap(4, "making … and reorganising them:", "appointments"),
            gap(5, "maintaining the internal …:", "database"),
            gap(6, "… (essential):", "experience"),
            gap(7, "a calm and … manner:", "confident"),
            gap(8, "a … job — further opportunities may be available:", "temporary"),
            gap(9, "hours: 7.45 a.m. to … p.m. Monday to Friday:", "1.15"),
            gap(10, "… is available onsite:", "parking"),
        ],
        notePassageLayout="form",
        notePassage=[
            np_section("Job details from employment agency"),
            np_static("Role: "), np_gap(1),
            np_section("Location"),
            np_static("Fordham "), np_gap(2), np_static(" Centre"),
            np_gap(3), np_static(" Road, Fordham"),
            np_section("Work involves"),
            np_static("• dealing with enquiries"),
            np_static("• making "), np_gap(4), np_static(" and reorganising them"),
            np_static("• maintaining the internal "), np_gap(5),
            np_static("• general administration"),
            np_section("Requirements"),
            np_static("• "), np_gap(6), np_static(" (essential)"),
            np_static("• a calm and "), np_gap(7), np_static(" manner"),
            np_static("• good IT skills"),
            np_section("Other information"),
            np_static("• a "), np_gap(8), np_static(" job — further opportunities may be available"),
            np_static("• hours: 7.45 a.m. to "), np_gap(9), np_static(" p.m. Monday to Friday"),
            np_static("• "), np_gap(10), np_static(" is available onsite"),
        ],
    )


def cam18_t4_p2():
    info_opts = [
        ("A", "Parents must supervise their children."),
        ("B", "There are new things to see."),
        ("C", "It is closed today."),
        ("D", "This is only for school groups."),
        ("E", "There is a quiz for visitors."),
        ("F", "It features something created by students."),
        ("G", "An expert is here today."),
        ("H", "There is a one-way system."),
    ]
    letters = list("ABCDEFGH")
    return part(
        2, 11, 20,
        "Questions 11–14: Choose A, B or C. Questions 15–20: Matching A–H.",
        [
            mc(11, "The museum building was originally", [
                ("A", "a factory."), ("B", "a private home."), ("C", "a hall of residence."),
            ], "B", sectionRange="Questions 11 – 14",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(12, "The university uses part of the museum building as", [
                ("A", "teaching rooms."), ("B", "a research library."), ("C", "administration offices."),
            ], "A"),
            mc(13, "What does the guide say about the entrance fee?", [
                ("A", "Visitors decide whether or not they wish to pay."),
                ("B", "Only children and students receive a discount."),
                ("C", "The museum charges extra for special exhibitions."),
            ], "A"),
            mc(14, "What are visitors advised to leave in the cloakroom?", [
                ("A", "cameras"), ("B", "coats"), ("C", "bags"),
            ], "C"),
            match(15, "Four Seasons", letters, "F", labeled=info_opts,
                  sectionRange="Questions 15 – 20",
                  sectionInstruction="What information does the speaker give about each of the following areas of the museum? Choose SIX answers from the box and write the correct letter, A–H, next to Questions 15–20.",
                  sectionTitle="Areas of museum"),
            match(16, "Farmhouse Kitchen", letters, "G", labeled=info_opts),
            match(17, "A Year on the Farm", letters, "E", labeled=info_opts),
            match(18, "Wagon Walk", letters, "A", labeled=info_opts),
            match(19, "Bees are Magic", letters, "C", labeled=info_opts),
            match(20, "The Pond", letters, "B", labeled=info_opts),
        ],
    )


def cam18_t4_p3():
    comment_opts = [
        ("A", "demonstrated independence"), ("B", "asked for teacher support"),
        ("C", "developed a competitive attitude"), ("D", "seemed to find the activity calming"),
        ("E", "seemed pleased with the results"), ("F", "seemed confused"),
        ("G", "seemed to find the activity easy"),
    ]
    letters = list("ABCDEFG")
    return part(
        3, 21, 30,
        "Questions 21–22: Choose TWO A–E. Questions 23–27: Matching A–G. Questions 28–30: Choose A, B or C.",
        [
            *choose_two(21, 22,
                        "Which TWO educational skills were shown in the video of children doing origami?",
                        [("A", "solving problems"),
                         ("B", "following instructions"),
                         ("C", "working cooperatively"),
                         ("D", "learning through play"),
                         ("E", "developing hand-eye coordination")],
                        "B/D", "Làm theo hướng dẫn (B) và học qua chơi (D).",
                        sectionRange="Questions 21 and 22",
                        sectionInstruction="Choose TWO letters, A–E."),
            match(23, "Sid", letters, "F", labeled=comment_opts,
                  sectionRange="Questions 23 – 27",
                  sectionInstruction="Which comment do the students make about each of the following children in the video? Choose FIVE answers from the box and write the correct letter, A–G, next to Questions 23–27.",
                  sectionTitle="Children"),
            match(24, "Jack", letters, "A", labeled=comment_opts),
            match(25, "Naomi", letters, "E", labeled=comment_opts),
            match(26, "Anya", letters, "D", labeled=comment_opts),
            match(27, "Zara", letters, "G", labeled=comment_opts),
            mc(28, "Before starting an origami activity in class, the students think it is important for the teacher to", [
                ("A", "make models that demonstrate the different stages."),
                ("B", "check children understand the terminology involved."),
                ("C", "tell children not to worry if they find the activity difficult."),
            ], "A", sectionRange="Questions 28 – 30",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(29, "The students agree that some teachers might be unwilling to use origami in class because", [
                ("A", "they may not think that crafts are important."),
                ("B", "they may not have the necessary skills."),
                ("C", "they may worry that it will take up too much time."),
            ], "B"),
            mc(30, "Why do the students decide to use origami in their maths teaching practice?", [
                ("A", "to correct a particular misunderstanding"),
                ("B", "to set a challenge"),
                ("C", "to introduce a new concept"),
            ], "A"),
        ],
    )


def cam18_t4_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "We know more about its overall … than about its author:", "plot",
                sectionTitle="Victor Hugo"),
            gap(32, "He spoke publicly about social issues, such as … and education:", "poverty"),
            gap(33, "Victor Hugo had to live elsewhere in …:", "europe"),
            gap(34, "He used his income from the sale of some … he had written to buy a house on Guernsey:", "poetry"),
            gap(35, "The ground floor contains portraits, … and tapestries that he valued:", "drawings"),
            gap(36, "He bought cheap … made of wood and turned this into beautiful wall carvings:", "furniture"),
            gap(37, "The first floor consists of furnished areas with wallpaper and … that have a Chinese design:", "lamps"),
            gap(38, "He wrote in a room at the top of the house that had a view of the …:", "harbour/harbor"),
            gap(39, "He entertained other writers as well as poor … in his house:", "children"),
            gap(40, "Victor Hugo's … gave ownership of the house to the city of Paris in 1927:", "relatives"),
        ],
        passageTitle="Victor Hugo",
        notePassage=[
            np_section("His novel, Les Misérables"),
            np_static("• It has been adapted for theatre and cinema."),
            np_static("• We know more about its overall "), np_gap(31), np_static(" than about its author."),
            np_section("His early career"),
            np_static("• In Paris, his career was successful and he led the Romantic movement."),
            np_static("• He spoke publicly about social issues, such as "), np_gap(32),
            np_static(" and education."),
            np_static("• Napoleon III disliked his views and exiled him."),
            np_section("His exile from France"),
            np_static("• Victor Hugo had to live elsewhere in "), np_gap(33), np_static("."),
            np_static("• He used his income from the sale of some "), np_gap(34),
            np_static(" he had written to buy a house on Guernsey."),
            np_section("His house on Guernsey"),
            np_static("• Victor Hugo lived in this house until the end of the Empire in France."),
            np_static("• The ground floor contains portraits, "), np_gap(35),
            np_static(" and tapestries that he valued."),
            np_static("• He bought cheap "), np_gap(36),
            np_static(" made of wood and turned this into beautiful wall carvings."),
            np_static("• The first floor consists of furnished areas with wallpaper and "), np_gap(37),
            np_static(" that have a Chinese design."),
            np_static("• The library still contains many of his favourite books."),
            np_static("• He wrote in a room at the top of the house that had a view of the "), np_gap(38), np_static("."),
            np_static("• He entertained other writers as well as poor "), np_gap(39), np_static(" in his house."),
            np_static("• Victor Hugo's "), np_gap(40),
            np_static(" gave ownership of the house to the city of Paris in 1927."),
        ],
    )


# ── Test registry ────────────────────────────────────────────────────────────

TESTS = [
    {
        "folder": "Listening IELTS_Test1_Cam17", "cambridge": 17, "test": 1,
        "title": "IELTS Listening — Cambridge 17 Test 1",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam17_t1_p1},
            {"partNumber": 2, "template": "p2-a10", "file": "exam_part2.json", "build": cam17_t1_p2},
            {"partNumber": 3, "template": "p3-c4", "file": "exam_part3.json", "build": cam17_t1_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam17_t1_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test2_Cam17", "cambridge": 17, "test": 2,
        "title": "IELTS Listening — Cambridge 17 Test 2",
        "parts": [
            {"partNumber": 1, "template": "p1-a4", "file": "exam_part1.json", "build": cam17_t2_p1},
            {"partNumber": 2, "template": "p2-a13", "file": "exam_part2.json", "build": cam17_t2_p2},
            {"partNumber": 3, "template": "p3-c5", "file": "exam_part3.json", "build": cam17_t2_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam17_t2_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test3_Cam17", "cambridge": 17, "test": 3,
        "title": "IELTS Listening — Cambridge 17 Test 3",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam17_t3_p1},
            {"partNumber": 2, "template": "p2-a13", "file": "exam_part2.json", "build": cam17_t3_p2},
            {"partNumber": 3, "template": "p3-c4", "file": "exam_part3.json", "build": cam17_t3_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam17_t3_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test4_Cam17", "cambridge": 17, "test": 4,
        "title": "IELTS Listening — Cambridge 17 Test 4",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam17_t4_p1},
            {"partNumber": 2, "template": "p2-a10", "file": "exam_part2.json", "build": cam17_t4_p2},
            {"partNumber": 3, "template": "p3-c3", "file": "exam_part3.json", "build": cam17_t4_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam17_t4_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test1_Cam18", "cambridge": 18, "test": 1,
        "title": "IELTS Listening — Cambridge 18 Test 1",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam18_t1_p1},
            {"partNumber": 2, "template": "p2-a13", "file": "exam_part2.json", "build": cam18_t1_p2},
            {"partNumber": 3, "template": "p3-c3", "file": "exam_part3.json", "build": cam18_t1_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam18_t1_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test2_Cam18", "cambridge": 18, "test": 2,
        "title": "IELTS Listening — Cambridge 18 Test 2",
        "parts": [
            {"partNumber": 1, "template": "p1-a4", "file": "exam_part1.json", "build": cam18_t2_p1},
            {"partNumber": 2, "template": "p2-a12", "file": "exam_part2.json", "build": cam18_t2_p2},
            {"partNumber": 3, "template": "p3-c5", "file": "exam_part3.json", "build": cam18_t2_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam18_t2_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test3_Cam18", "cambridge": 18, "test": 3,
        "title": "IELTS Listening — Cambridge 18 Test 3",
        "parts": [
            {"partNumber": 1, "template": "p1-a4", "file": "exam_part1.json", "build": cam18_t3_p1},
            {"partNumber": 2, "template": "p2-a10", "file": "exam_part2.json", "build": cam18_t3_p2},
            {"partNumber": 3, "template": "p3-c4", "file": "exam_part3.json", "build": cam18_t3_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam18_t3_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test4_Cam18", "cambridge": 18, "test": 4,
        "title": "IELTS Listening — Cambridge 18 Test 4",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam18_t4_p1},
            {"partNumber": 2, "template": "p2-a13", "file": "exam_part2.json", "build": cam18_t4_p2},
            {"partNumber": 3, "template": "p3-c5", "file": "exam_part3.json", "build": cam18_t4_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam18_t4_p4},
        ],
    },
]

MAP_IMAGES = [
    ("Listening IELTS_Test2_Cam18", "Test2_Listening_Cam18.pdf", 3),
]


def main():
    print("Building IELTS Listening Cam17 T1–T4 + Cam18 T1–T4…\n")
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