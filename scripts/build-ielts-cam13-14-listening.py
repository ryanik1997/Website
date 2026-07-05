"""Rebuild Cam13 T1–T4 + Cam14 T1–T4 Listening JSON from ielts-cam13-14-dump.txt.

Run:
  python scripts/build-ielts-cam13-14-listening.py
  pnpm ielts:validate "IELTS/Listening IELTS_Test1_Cam13"
  pnpm ielts:pack "IELTS/Listening IELTS_Test1_Cam13"
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


# ── Cam13 Test 1 ─────────────────────────────────────────────────────────────

def cam13_t1_p1():
    return part(
        1, 1, 10,
        "Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "how to … and cook with seasonal products:", "choose"),
            gap(2, "also offers … classes:", "private"),
            gap(3, "clients who return get a … discount:", "20/percent/twenty percent"),
            gap(4, "food that is …:", "healthy"),
            gap(5, "recipes to strengthen your …:", "bones"),
            gap(6, "they have a free … every Thursday:", "lecture"),
            gap(7, "The … Centre:", "arretsa"),
            gap(8, "mainly … food:", "vegetarian"),
            gap(9, "located near the …:", "market"),
            gap(10, "skills with a …:", "knife"),
        ],
        passageTitle="COOKERY CLASSES",
        notePassageLayout="table",
        noteTables=[{
            "gapNumbers": list(range(1, 11)),
            "instruction": "Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer.",
            "title": "COOKERY CLASSES",
            "headers": ["Cookery Class", "Focus", "Other Information"],
            "rows": [
                {"cells": [
                    [tbl_static("Example"), tbl_break(), tbl_static("The Food Studio")],
                    [tbl_static("how to "), tbl_gap(1),
                     tbl_static(" and cook with seasonal products")],
                    [tbl_static("• small classes"),
                     tbl_break(), tbl_static("• also offers "), tbl_gap(2),
                     tbl_static(" classes"),
                     tbl_break(), tbl_static("• clients who return get a "), tbl_gap(3),
                     tbl_static(" discount")],
                ]},
                {"cells": [
                    [tbl_static("Bond's Cookery School")],
                    [tbl_static("food that is "), tbl_gap(4)],
                    [tbl_static("• includes recipes to strengthen your "), tbl_gap(5),
                     tbl_break(), tbl_static("• they have a free "), tbl_gap(6),
                     tbl_static(" every Thursday")],
                ]},
                {"cells": [
                    [tbl_static("The "), tbl_gap(7), tbl_static(" Centre")],
                    [tbl_static("mainly "), tbl_gap(8), tbl_static(" food")],
                    [tbl_static("• located near the "), tbl_gap(9),
                     tbl_break(), tbl_static("• a special course in skills with a "), tbl_gap(10),
                     tbl_static(" is sometimes available")],
                ]},
            ],
        }],
    )


def cam13_t1_p2():
    letters = list("ABCDEFGHI")
    return part(
        2, 11, 20,
        "Questions 11–13: Choose A, B or C. Questions 14–20: Label the map A–I.",
        [
            mc(11, "Why are changes needed to traffic systems in Granford?", [
                ("A", "The number of traffic accidents has risen."),
                ("B", "The amount of traffic on the roads has increased."),
                ("C", "The types of vehicles on the roads have changed."),
            ], "B", sectionRange="Questions 11 – 13",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(12, "In a survey, local residents particularly complained about", [
                ("A", "dangerous driving by parents."),
                ("B", "pollution from trucks and lorries."),
                ("C", "inconvenience from parked cars."),
            ], "C"),
            mc(13, "According to the speaker, one problem with the new regulations will be", [
                ("A", "raising money to pay for them."),
                ("B", "finding a way to make people follow them."),
                ("C", "getting the support of the police."),
            ], "B"),
            map_label(14, "New traffic lights", letters, "E",
                      sectionRange="Questions 14 – 20",
                      sectionInstruction="Label the map below. Write the correct letter, A–I, next to Questions 14–20.",
                      sectionTitle="Proposed traffic changes in Granford"),
            map_label(15, "Pedestrian crossing", letters, "D"),
            map_label(16, "Parking allowed", letters, "A"),
            map_label(17, "New 'No Parking' sign", letters, "G"),
            map_label(18, "New disabled parking spaces", letters, "C"),
            map_label(19, "Widened pavement", letters, "H"),
            map_label(20, "Lorry loading/unloading restrictions", letters, "I"),
        ],
        imageFile="map.jpg",
    )


def cam13_t1_p3():
    flow_opts = [
        ("A", "container"), ("B", "soil"), ("C", "weight"), ("D", "condition"),
        ("E", "height"), ("F", "colour"), ("G", "types"), ("H", "depths"),
    ]
    letters = list("ABCDEFGH")
    labeled = flow_opts
    return part(
        3, 21, 30,
        "Questions 21–25: Choose A, B or C. Questions 26–30: Complete the flow-chart A–H.",
        [
            mc(21, "Why is Jack interested in investigating seed germination?", [
                ("A", "He may do a module on a related topic later on."),
                ("B", "He wants to have a career in plant science."),
                ("C", "He is thinking of choosing this topic for his dissertation."),
            ], "A", sectionRange="Questions 21 – 25",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(22, "Jack and Emma agree the main advantage of their present experiment is that it can be", [
                ("A", "described very easily."),
                ("B", "carried out inside the laboratory."),
                ("C", "completed in the time available."),
            ], "C"),
            mc(23, "What do they decide to check with their tutor?", [
                ("A", "whether their aim is appropriate"),
                ("B", "whether anyone else has chosen this topic"),
                ("C", "whether the assignment contributes to their final grade"),
            ], "B"),
            mc(24, "They agree that Graves' book on seed germination is disappointing because", [
                ("A", "it fails to cover recent advances in seed science."),
                ("B", "the content is irrelevant for them."),
                ("C", "its focus is very theoretical."),
            ], "C"),
            mc(25, "What does Jack say about the article on seed germination by Lee Hall?", [
                ("A", "The diagrams of plant development are useful."),
                ("B", "The analysis of seed germination statistics is thorough."),
                ("C", "The findings on seed germination after fires are surprising."),
            ], "B"),
            flow_match(26, labeled, letters, "G",
                       "Select seeds of different", "and sizes.",
                       sectionRange="Questions 26 – 30",
                       sectionInstruction="Complete the flow-chart below. Choose FIVE answers from the box and write the correct letter, A–H, next to Questions 26–30.",
                       sectionTitle="Stages in the experiment"),
            flow_match(27, labeled, letters, "C",
                       "Measure and record the", "and size of each one."),
            flow_match(28, labeled, letters, "H", "Decide on the", "to be used."),
            flow_match(29, labeled, letters, "A",
                       "Use a different", "for each seed and label it."),
            flow_match(30, labeled, letters, "E",
                       "After about 3 weeks, record the plant's", ".",
                       flowChartEnd="Investigate the findings."),
        ],
    )


def cam13_t1_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "the … — because of its general adaptability:", "crow", sectionTitle="Effects of urban environments on animals"),
            gap(32, "walls of city buildings are similar to …:", "cliffs"),
            gap(33, "many urban animals are adapting with unusual …:", "speed"),
            gap(34, "the size of their … had increased:", "brain/brains"),
            gap(35, "locate new sources of …:", "food"),
            gap(36, "Catarina Miranda focused on the … of urban and rural blackbirds:", "behaviour/behavior"),
            gap(37, "afraid of situations that were …:", "new"),
            gap(38, "respond to … by producing lower levels of hormones:", "stress"),
            gap(39, "urban squirrels use their … to help them communicate:", "tail/tails"),
            gap(40, "some changes may not be …:", "permanent"),
        ],
        passageTitle="Effects of urban environments on animals",
        notePassageLayout="lecture",
        notePassage=[
            np_section("Introduction"),
            np_static("Recent urban developments represent massive environmental changes. Previously thought that only a few animals were suitable for city life, e.g."),
            np_static("• the "), np_gap(31), np_static(" — because of its general adaptability"),
            np_static("• the pigeon — because walls of city buildings are similar to "), np_gap(32),
            np_static("• In fact, many urban animals are adapting with unusual "), np_gap(33),
            np_section("Recent research"),
            np_static("• Emilie Snell-Rood studied small urbanised mammal specimens from museums in Minnesota"),
            np_static("– She found the size of their "), np_gap(34), np_static(" had increased."),
            np_static("– She suggests this may be due to the need to locate new sources of "), np_gap(35),
            np_static("and to deal with new dangers."),
            np_static("• Catarina Miranda focused on the "), np_gap(36),
            np_static("of urban and rural blackbirds."),
            np_static("– She found urban birds were often braver, but were afraid of situations that were"), np_gap(37),
            np_static("• Jonathan Atwell studies how animals respond to urban environments."),
            np_static("– He found that some animals respond to "), np_gap(38),
            np_static("by producing lower levels of hormones."),
            np_static("• Sarah Partan's team found urban squirrels use their "), np_gap(39),
            np_static("to help them communicate"),
            np_section("Long-term possibilities"),
            np_static("Species of animals may develop which are unique to cities. However, some changes may not be "), np_gap(40),
        ],
    )


# ── Cam13 Test 2 ─────────────────────────────────────────────────────────────

def cam13_t2_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "covers cycling and … all over Australia:", "races", sectionTitle="South City Cycling Club"),
            gap(2, "includes the club fee and …:", "insurance"),
            gap(3, "club kit made by a company called …:", "jerriz"),
            gap(4, "Level B: speed about …:", "25/twenty-five"),
            gap(5, "Tuesdays at 5.30 am, meet at the …:", "stadium"),
            gap(6, "Thursdays at 5.30 am, meet at the entrance to the …:", "park"),
            gap(7, "Members often have … together afterwards:", "coffee"),
            gap(8, "There is not always a … with the group:", "leader"),
            gap(9, "Check and print the … on the website:", "route"),
            gap(10, "Bikes must have …:", "lights"),
        ],
        notePassageLayout="form",
        notePassage=[
            np_example("Example\nName of club secretary: Jim Hunter"),
            np_section("Membership"),
            np_static("• Full membership costs $260; this covers cycling and"), np_gap(1),
            np_static("all over Australia"),
            np_static("• Recreational membership costs $108"),
            np_static("• Cost of membership includes the club fee and"), np_gap(2),
            np_static("• The club kit is made by a company called"), np_gap(3),
            np_section("Training rides"),
            np_static("• Chance to improve cycling skills and fitness"),
            np_static("• Level B: speed about"), np_gap(4),
            np_static("• Weekly sessions"),
            np_static("– Tuesdays at 5.30 am, meet at the"), np_gap(5),
            np_static("– Thursdays at 5.30 am, meet at the entrance to the"), np_gap(6),
            np_section("Further information"),
            np_static("• Rides are about an hour and a half"),
            np_static("• Members often have"), np_gap(7), np_static("together afterwards"),
            np_static("• There is not always a"), np_gap(8), np_static("with the group on these rides"),
            np_static("• Check and print the"), np_gap(9), np_static("on the website beforehand"),
            np_static("• Bikes must have"), np_gap(10),
        ],
    )


def cam13_t2_p2():
    return part(
        2, 11, 20,
        "Questions 11–16: Choose A, B or C. Questions 17–18 and 19–20: Choose TWO A–E.",
        [
            mc(11, "How much time for volunteering does the company allow per employee?", [
                ("A", "two hours per week"),
                ("B", "one day per month"),
                ("C", "8 hours per year"),
            ], "C", sectionRange="Questions 11 – 16",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(12, "In feedback almost all employees said that volunteering improved their", [
                ("A", "chances of promotion."),
                ("B", "job satisfaction."),
                ("C", "relationships with colleagues."),
            ], "B"),
            mc(13, "Last year some staff helped unemployed people with their", [
                ("A", "literacy skills."),
                ("B", "job applications."),
                ("C", "communication skills."),
            ], "B"),
            mc(14, "This year the company will start a new volunteering project with a local", [
                ("A", "school."),
                ("B", "park."),
                ("C", "charity."),
            ], "B"),
            mc(15, "Where will the Digital Inclusion Day be held?", [
                ("A", "at the company's training facility"),
                ("B", "at a college"),
                ("C", "in a community centre"),
            ], "B"),
            mc(16, "What should staff do if they want to take part in the Digital Inclusion Day?", [
                ("A", "fill in a form"),
                ("B", "attend a training workshop"),
                ("C", "get permission from their manager"),
            ], "A"),
            *choose_two(17, 18,
                        "What TWO things are mentioned about the participants on the last Digital Inclusion Day?",
                        [("A", "They were all over 70."),
                         ("B", "They never used their computer."),
                         ("C", "Their phones were mostly old-fashioned."),
                         ("D", "They only used their phones for making calls."),
                         ("E", "They initially showed little interest.")],
                        "C/E", "Điện thoại cũ (C) và ít quan tâm (E).",
                        sectionRange="Questions 17 and 18",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(19, 20,
                        "What TWO activities on the last Digital Inclusion Day did participants describe as useful?",
                        [("A", "learning to use tablets"),
                         ("B", "communicating with family"),
                         ("C", "shopping online"),
                         ("D", "playing online games"),
                         ("E", "sending emails")],
                        "B/D", "Gia đình (B) và email (D).",
                        sectionRange="Questions 19 and 20",
                        sectionInstruction="Choose TWO letters, A–E."),
        ],
    )


def cam13_t2_p3():
    comment_opts = [
        ("A", "lacked a conclusion"),
        ("B", "useful in the future"),
        ("C", "not enough"),
        ("D", "sometimes distracting"),
        ("E", "showed originality"),
        ("F", "covered a wide range"),
        ("G", "not too technical"),
    ]
    return part(
        3, 21, 30,
        "Questions 21–25: Choose A, B or C. Questions 26–30: Matching A–G.",
        [
            mc(21, "Russ says that his difficulty in planning the presentation is due to", [
                ("A", "his lack of knowledge about the topic."),
                ("B", "his uncertainty about what he should try to achieve."),
                ("C", "the short time that he has for preparation."),
            ], "B", sectionRange="Questions 21 – 25",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(22, "Russ and his tutor agree that his approach in the presentation will be", [
                ("A", "to concentrate on how nanotechnology is used in one field."),
                ("B", "to follow the chronological development of nanotechnology."),
                ("C", "to show the range of applications of nanotechnology."),
            ], "A"),
            mc(23, "In connection with slides, the tutor advises Russ to", [
                ("A", "talk about things that he can find slides to illustrate."),
                ("B", "look for slides to illustrate the points he makes."),
                ("C", "consider omitting slides altogether."),
            ], "C"),
            mc(24, "They both agree that the best way for Russ to start his presentation is", [
                ("A", "to encourage the audience to talk."),
                ("B", "to explain what Russ intends to do."),
                ("C", "to provide an example."),
            ], "C"),
            mc(25, "What does the tutor advise Russ to do next while preparing his presentation?", [
                ("A", "summarise the main point he wants to make"),
                ("B", "read the notes he has already made"),
                ("C", "list the topics he wants to cover"),
            ], "A"),
            match(26, "structure", list("ABCDEFG"), "A", labeled=comment_opts,
                  sectionRange="Questions 26 – 30",
                  sectionInstruction="What comments do the speakers make about each of the following aspects of Russ's previous presentation? Choose FIVE answers from the box and write the correct letter, A–G, next to Questions 26–30.",
                  sectionTitle="Aspects of Russ's previous presentation"),
            match(27, "eye contact", list("ABCDEFG"), "C", labeled=comment_opts),
            match(28, "body language", list("ABCDEFG"), "D", labeled=comment_opts),
            match(29, "choice of words", list("ABCDEFG"), "G", labeled=comment_opts),
            match(30, "handouts", list("ABCDEFG"), "B", labeled=comment_opts),
        ],
    )


def cam13_t2_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "the time and … of past events:", "location", sectionTitle="Episodic memory"),
            gap(32, "general information about the …:", "world"),
            gap(33, "does not involve recalling … information:", "personal"),
            gap(34, "the more … given to an event:", "attention"),
            gap(35, "to remember a …:", "name"),
            gap(36, "memories can be added to a … of related information:", "network"),
            gap(37, "the … of retrieval affects the strength of memories:", "frequency"),
            gap(38, "the … of an object near to the place where you left your car:", "colour/color"),
            gap(39, "games which stimulate the …:", "brain"),
            gap(40, "possibly because their concept of the … may be absent:", "self"),
        ],
        passageTitle="Episodic memory",
        notePassageLayout="lecture",
        notePassage=[
            np_static("• the ability to recall details, e.g. the time and"), np_gap(31),
            np_static("of past events"),
            np_static("• different to semantic memory — the ability to remember general information about the"), np_gap(32),
            np_static(", which does not involve recalling"), np_gap(33), np_static("information"),
            np_section("Forming episodic memories involves three steps:"),
            np_section("Encoding"),
            np_static("• involves receiving and processing information"),
            np_static("• the more"), np_gap(34), np_static("given to an event, the more successfully it can be encoded"),
            np_static("• to remember a"), np_gap(35), np_static("— it is useful to have a strategy for encoding such information"),
            np_section("Consolidation"),
            np_static("• how memories are strengthened and stored"),
            np_static("• most effective when memories can be added to a"), np_gap(36),
            np_static("of related information"),
            np_static("• the"), np_gap(37), np_static("of retrieval affects the strength of memories"),
            np_section("Retrieval"),
            np_static("• memory retrieval often depends on using a prompt e.g. the"), np_gap(38),
            np_static("of an object near to the place where you left your car"),
            np_section("Episodic memory impairments"),
            np_static("• these affect people with a wide range of medical conditions"),
            np_static("• games which stimulate the"), np_gap(39),
            np_static("have been found to help people with schizophrenia"),
            np_static("children with autism may have difficulty forming episodic memories —"),
            np_static("possibly because their concept of the"), np_gap(40), np_static("may be absent"),
            np_static("memory training may help autistic children develop social skills"),
        ],
    )


# ── Cam13 Test 3 ─────────────────────────────────────────────────────────────

def cam13_t3_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Average rent: £ … a month:", "850", sectionTitle="Moving to Sanford City"),
            gap(2, "Linda travels to work by …:", "bike/bicycle"),
            gap(3, "Limited … in city centre:", "parking"),
            gap(4, "Trains to London every … minutes:", "30/thirty"),
            gap(5, "Poor tram service at …:", "weekend/weekends"),
            gap(6, "New … opened recently:", "cinema"),
            gap(7, "… has excellent reputation:", "hospital"),
            gap(8, "Good … on Bridge Street:", "dentist"),
            gap(9, "Meet Linda on … after 5.30 pm:", "thursday"),
            gap(10, "In the … opposite the station:", "cafe"),
        ],
        notePassageLayout="form",
        notePassage=[
            np_example("Example\nDalton's friend living in suburb of: Sanford"),
            np_section("Accommodation"),
            np_static("• Average rent: £"), np_gap(1), np_static("a month"),
            np_section("Transport"),
            np_static("• Linda travels to work by"), np_gap(2),
            np_static("• Limited"), np_gap(3), np_static("in city centre"),
            np_static("• Trains to London every"), np_gap(4), np_static("minutes"),
            np_static("• Poor tram service at"), np_gap(5),
            np_section("Advantages of living in Sanford"),
            np_static("• New"), np_gap(6), np_static("opened recently"),
            np_static("•"), np_gap(7), np_static("has excellent reputation"),
            np_static("• Good"), np_gap(8), np_static("on Bridge Street"),
            np_section("Meet Linda"),
            np_static("• Meet Linda on"), np_gap(9), np_static("after 5.30 pm"),
            np_static("• In the"), np_gap(10), np_static("opposite the station"),
        ],
    )


def cam13_t3_p2():
    adv_opts = [
        ("A", "not dependent on season"),
        ("B", "enjoyable"),
        ("C", "low risk of injury"),
        ("D", "fitness level unimportant"),
        ("E", "sociable"),
        ("F", "fast results"),
        ("G", "motivating"),
    ]
    return part(
        2, 11, 20,
        "Questions 11–16: Matching A–G. Questions 17–18 and 19–20: Choose TWO A–E.",
        [
            match(11, "using a gym", list("ABCDEFG"), "F", labeled=adv_opts,
                  sectionRange="Questions 11 – 16",
                  sectionInstruction="What advantage does the speaker mention for each of the following physical activities? Choose SIX answers from the box and write the correct letter, A–G, next to Questions 11–16."),
            match(12, "running", list("ABCDEFG"), "D", labeled=adv_opts),
            match(13, "swimming", list("ABCDEFG"), "A", labeled=adv_opts),
            match(14, "cycling", list("ABCDEFG"), "B", labeled=adv_opts),
            match(15, "doing yoga", list("ABCDEFG"), "C", labeled=adv_opts),
            match(16, "training with a personal trainer", list("ABCDEFG"), "G", labeled=adv_opts),
            *choose_two(17, 18,
                        "For which TWO reasons does the speaker say people give up going to the gym?",
                        [("A", "lack of time"),
                         ("B", "loss of confidence"),
                         ("C", "too much effort required"),
                         ("D", "high costs"),
                         ("E", "feeling less successful than others")],
                        "B/C", "Mất tự tin (B) và quá nhiều effort (C).",
                        sectionRange="Questions 17 and 18",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(19, 20,
                        "Which TWO pieces of advice does the speaker give for setting goals?",
                        [("A", "write goals down"),
                         ("B", "have achievable aims"),
                         ("D", "give yourself rewards"),
                         ("E", "challenge yourself")],
                        "B/D", "Mục tiêu khả thi (B) và phần thưởng (D).",
                        sectionRange="Questions 19 and 20",
                        sectionInstruction="Choose TWO letters, A–E."),
        ],
    )


def cam13_t3_p3():
    dye_opts = [
        ("A", "It is expensive."),
        ("B", "The colour is too strong."),
        ("C", "The colour is not long-lasting."),
        ("D", "It is very poisonous."),
        ("E", "It can damage the fabric."),
        ("F", "The colour may be unexpected."),
        ("G", "It is unsuitable for some fabrics."),
        ("H", "It is not generally available."),
    ]
    return part(
        3, 21, 30,
        "Questions 21–24: Choose A, B or C. Questions 25–30: Matching A–H.",
        [
            mc(21, "What first inspired Jim to choose this project?", [
                ("A", "textiles displayed in an exhibition"),
                ("B", "a book about a botanic garden"),
                ("C", "carpets he saw on holiday"),
            ], "C", sectionRange="Questions 21 – 24",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(22, "Jim eventually decided to do a practical investigation which involved", [
                ("A", "using a range of dyes with different fibres."),
                ("B", "applying different dyes to one type of fibre."),
                ("C", "testing one dye and a range of fibres."),
            ], "B"),
            mc(23, "When doing his experiments, Jim was surprised by", [
                ("A", "how much natural material was needed to make the dye."),
                ("B", "the fact that dyes were widely available on the internet."),
                ("C", "the time that he had to leave the fabric in the dye."),
            ], "A"),
            mc(24, "What problem did Jim have with using tartrazine as a fabric dye?", [
                ("A", "It caused a slight allergic reaction."),
                ("B", "It was not a permanent dye on cotton."),
                ("C", "It was ineffective when used on nylon."),
            ], "B"),
            match(25, "turmeric", list("ABCDEFGH"), "C", labeled=dye_opts,
                  sectionRange="Questions 25 – 30",
                  sectionInstruction="What problem is identified with each of the following natural dyes? Choose SIX answers from the box and write the correct letter, A–H, next to Questions 25–30.",
                  sectionTitle="Problems"),
            match(26, "beetroot", list("ABCDEFGH"), "F", labeled=dye_opts),
            match(27, "Tyrian purple", list("ABCDEFGH"), "H", labeled=dye_opts),
            match(28, "logwood", list("ABCDEFGH"), "D", labeled=dye_opts),
            match(29, "cochineal", list("ABCDEFGH"), "A", labeled=dye_opts),
            match(30, "metal oxide", list("ABCDEFGH"), "E", labeled=dye_opts),
        ],
    )


def cam13_t3_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "recognisable by their blue …:", "tongue/tongues", sectionTitle="The sleepy lizard (tiliqua rugosa)"),
            gap(32, "Their diet consists mainly of …:", "plants"),
            gap(33, "Their main predators are large birds and …:", "snakes"),
            gap(34, "lizards can use the … to help them navigate:", "sky"),
            gap(35, "keep the same … for several years:", "partner/partners"),
            gap(36, "little … noted between parents and children:", "contact"),
            gap(37, "to provide … for female lizards:", "protection"),
            gap(38, "GPS systems attached to the … of the lizards:", "tail/tails"),
            gap(39, "information on the number of … taken:", "steps"),
            gap(40, "reduce chances of …:", "injury/injuries"),
        ],
        passageTitle="The sleepy lizard (tiliqua rugosa)",
        notePassageLayout="lecture",
        notePassage=[
            np_section("Description"),
            np_static("• They are common in Western and South Australia"),
            np_static("• They are brown, but recognisable by their blue"), np_gap(31),
            np_static("• They are relatively large"),
            np_static("• Their diet consists mainly of"), np_gap(32),
            np_static("• Their main predators are large birds and"), np_gap(33),
            np_section("Navigation study"),
            np_static("One study found that lizards can use the"), np_gap(34),
            np_static("to help them navigate"),
            np_section("Observations in the wild"),
            np_static("Observations show that these lizards keep the same"), np_gap(35),
            np_static("for several years"),
            np_section("What people want"),
            np_section("Possible reasons:"),
            np_static("to improve the survival of their young"),
            np_static("(but little"), np_gap(36), np_static("has been noted between parents and children)"),
            np_static("• to provide"), np_gap(37), np_static("for female lizards"),
            np_section("Tracking study"),
            np_static("A study was carried out using GPS systems attached to the"), np_gap(38),
            np_static("of the lizards"),
            np_static("This provided information on the lizards' location and even the number of"), np_gap(39),
            np_static("taken"),
            np_static("It appeared that the lizards were trying to avoid one another"),
            np_static("This may be in order to reduce chances of"), np_gap(40),
        ],
    )


# ── Cam13 Test 4 ─────────────────────────────────────────────────────────────

def cam13_t4_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Alex is training in …:", "finance", sectionTitle="Alex's Training"),
            gap(2, "didn't have a qualification from school in …:", "maths/math/mathematics"),
            gap(3, "should have done the diploma in … skills:", "business"),
            gap(4, "the youngest was …:", "17/seventeen"),
            gap(5, "same amount of … as permanent staff:", "holiday/holidays/vacation/vacations"),
            gap(6, "Trainees go to … one day per month:", "college"),
            gap(7, "company is in a convenient …:", "location"),
            gap(8, "Don't wear …:", "jeans"),
            gap(9, "Don't be …:", "late"),
            gap(10, "Make sure you …:", "smile"),
        ],
        notePassageLayout="form",
        notePassage=[
            np_example("Example\nAlex completed his training in 2014"),
            np_section("About the applicant:"),
            np_static("• At first, Alex did his training in the"), np_gap(1), np_static("department."),
            np_static("• Alex didn't have a qualification from school in"), np_gap(2),
            np_static("• Alex thinks he should have done the diploma in"), np_gap(3), np_static("skills."),
            np_static("• Age of other trainees: the youngest was"), np_gap(4),
            np_section("Benefits of doing training at JPNW:"),
            np_static("• Lots of opportunities because of the size of the organisation."),
            np_static("• Trainees receive the same amount of"), np_gap(5), np_static("as permanent staff."),
            np_static("• The training experience increases people's confidence a lot."),
            np_static("• Trainees go to"), np_gap(6), np_static("one day per month."),
            np_static("• The company is in a convenient"), np_gap(7),
            np_section("Advice for interview:"),
            np_static("• Don't wear"), np_gap(8),
            np_static("• Don't be"), np_gap(9),
            np_static("• Make sure you"), np_gap(10),
        ],
    )


def cam13_t4_p2():
    trail_opts = [
        ("A", "It has a good place to stop and rest."),
        ("B", "It is suitable for all abilities."),
        ("C", "It involves crossing a river."),
        ("D", "It demands a lot of skill."),
        ("E", "It may be closed in bad weather."),
        ("F", "It has some very narrow sections."),
    ]
    return part(
        2, 11, 20,
        "Questions 11–16: Choose A, B or C. Questions 17–20: Matching A–F.",
        [
            mc(11, "Annie recommends that when cross-country skiing the visitors should", [
                ("A", "get away from the regular trails."),
                ("B", "stop to enjoy views of the scenery."),
                ("C", "go at a slow speed at the beginning."),
            ], "A", sectionRange="Questions 11 – 16",
               sectionInstruction="Choose the correct letter, A, B or C."),
            mc(12, "What does Annie tell the group about this afternoon's dog-sled trip?", [
                ("A", "Those who want to can take part in a race."),
                ("B", "Anyone has the chance to drive a team of dogs."),
                ("C", "One group member will be chosen to lead the trail."),
            ], "B"),
            mc(13, "What does Annie say about the team relay event?", [
                ("A", "All participants receive a medal."),
                ("B", "The course is 4 km long."),
                ("C", "Each team is led by a teacher."),
            ], "A"),
            mc(14, "On the snow-shoe trip, the visitors will", [
                ("A", "visit an old gold mine."),
                ("B", "learn about unusual flowers."),
                ("C", "climb to the top of a mountain."),
            ], "C"),
            mc(15, "The cost of accommodation in the mountain hut includes", [
                ("A", "a supply of drinking water."),
                ("B", "transport of visitors' luggage."),
                ("C", "cooked meals."),
            ], "A"),
            mc(16, "If there is a storm while the visitors are in the hut, they should", [
                ("A", "contact the bus driver."),
                ("B", "wait until the weather improves."),
                ("C", "use the emergency locator beacon."),
            ], "B"),
            match(17, "Highland Trail", list("ABCDEF"), "B", labeled=trail_opts,
                  sectionRange="Questions 17 – 20",
                  sectionInstruction="What information does Annie give about skiing on each of the following mountain trails? Choose FOUR answers from the box and write the correct letter, A–F, next to Questions 17–20.",
                  sectionTitle="Mountain trails"),
            match(18, "Pine Trail", list("ABCDEF"), "D", labeled=trail_opts),
            match(19, "Stony Trail", list("ABCDEF"), "A", labeled=trail_opts),
            match(20, "Loser's Trail", list("ABCDEF"), "E", labeled=trail_opts),
        ],
    )


def cam13_t4_p3():
    return part(
        3, 21, 30,
        "Questions 21–26: Choose A, B or C. Questions 27–28 and 29–30: Choose TWO A–E.",
        [
            mc(21, "What was Jack's attitude to nutritional food labels before this project?", [
                ("A", "He didn't read everything on them."),
                ("B", "He didn't think they were important."),
                ("C", "He thought they were too complicated."),
            ], "A", sectionRange="Questions 21 – 26",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Labels giving nutritional information on food packaging"),
            mc(22, "Alice says that before doing this project,", [
                ("A", "she was unaware of what certain foods contained."),
                ("B", "she was too lazy to read food labels."),
                ("C", "she was only interested in the number of calories."),
            ], "A"),
            mc(23, "When discussing supermarket brands of pizza, Jack agrees with Alice that", [
                ("A", "the list of ingredients is shocking."),
                ("B", "he will hesitate before buying pizza again."),
                ("C", "the nutritional label is misleading."),
            ], "A"),
            mc(24, "Jack prefers the daily value system to other labelling systems because it is", [
                ("A", "more accessible."),
                ("B", "more logical."),
                ("C", "more comprehensive."),
            ], "B"),
            mc(25, "What surprised both students about one flavour of crisps?", [
                ("A", "The percentage of artificial additives given was incorrect."),
                ("B", "The products did not contain any meat."),
                ("C", "The labels did not list all the ingredients."),
            ], "B"),
            mc(26, "What do the students think about research into the impact of nutritional food labelling?", [
                ("A", "It did not produce clear results."),
                ("B", "It focused on the wrong people."),
                ("C", "It made unrealistic recommendations."),
            ], "A"),
            *choose_two(27, 28,
                        "Which TWO things surprised the students about the traffic-light system for nutritional labels?",
                        [("A", "its widespread use"),
                         ("B", "the fact that it is voluntary for supermarkets"),
                         ("C", "how little research was done before its introduction"),
                         ("D", "its unpopularity with food manufacturers"),
                         ("E", "the way that certain colours are used")],
                        "B/C", "Tự nguyện (B) và ít nghiên cứu (C).",
                        sectionRange="Questions 27 and 28",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(29, 30,
                        "Which TWO things are true about the participants in the study on the traffic-light system?",
                        [("A", "They had low literacy levels."),
                         ("B", "They were regular consumers of packaged food."),
                         ("C", "They were selected randomly."),
                         ("D", "They were from all socio-economic groups."),
                         ("E", "They were interviewed face-to-face")],
                        "D/E", "Mọi tầng lớp (D) và phỏng vấn trực tiếp (E).",
                        sectionRange="Questions 29 and 30",
                        sectionInstruction="Choose TWO letters, A–E."),
        ],
    )


def cam13_t4_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "ordered the … of every coffee house:", "destruction", sectionTitle="The history of coffee"),
            gap(32, "Coffee shops were compared to …:", "universities/university"),
            gap(33, "social and … changes:", "political"),
            gap(34, "named according to the … they came from:", "port/ports"),
            gap(35, "most cultivation depended on …:", "slaves/slavery"),
            gap(36, "coffee was used as a form of …:", "taxation"),
            gap(37, "Coffee became almost as important as …:", "sugar"),
            gap(38, "move towards the consumption of … in Britain:", "tea"),
            gap(39, "Prices dropped because of improvements in …:", "transportation"),
            gap(40, "coffee helped them to work at …:", "night"),
        ],
        passageTitle="The history of coffee",
        notePassage=[
            np_section("Coffee in the Arab world"),
            np_static("• There was small-scale trade in wild coffee from Ethiopia."),
            np_static("• 1522 — Coffee was approved in the Ottoman court as a type of medicine."),
            np_static("• 1623 In Constantinople, the ruler ordered the"), np_gap(31),
            np_static("of every coffee house."),
            np_section("Coffee arrives in Europe (17th century)"),
            np_static("• Coffee shops were compared to"), np_gap(32),
            np_static("• They played an important part in social and"), np_gap(33), np_static("changes"),
            np_section("Coffee and European colonisation"),
            np_static("• European powers established coffee plantations in their colonies."),
            np_static("• Types of coffee were often named according to the"), np_gap(34),
            np_static("they came from"),
            np_static("• In Brazil and the Caribbean, most cultivation depended on"), np_gap(35),
            np_static("• In Java, coffee was used as a form of"), np_gap(36),
            np_static("• Coffee became almost as important as"), np_gap(37),
            np_static("• The move towards the consumption of"), np_gap(38),
            np_static("in Britain did not also take place in the USA"),
            np_section("Coffee in the 19th century"),
            np_static("• Prices dropped because of improvements in"), np_gap(39),
            np_static("• Industrial workers found coffee helped them to work at"), np_gap(40),
        ],
    )


# ── Cam14 Test 1 ─────────────────────────────────────────────────────────────

def cam14_t1_p1():
    return part(
        1, 1, 10,
        "Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Nationality:", "canadian"),
            gap(2, "business (to buy antique …):", "furniture"),
            gap(3, "Current address:", "park"),
            gap(4, "wallet containing approximately £ …:", "250"),
            gap(5, "Items stolen — a …:", "phone"),
            gap(6, "Date of theft:", "10 september/10th september"),
            gap(7, "outside the … at about 4 pm:", "museum"),
            gap(8, "boys asked for the …:", "time"),
            gap(9, "slim build with … hair:", "blond/blonde"),
            gap(10, "Crime reference number:", "8795482361"),
        ],
        passageTitle="CRIME REPORT FORM",
        notePassageLayout="form",
        notePassage=[
            np_example("Example\nName: Louise Taylor"),
            np_section("Personal information"),
            np_static("Nationality:"), np_gap(1),
            np_static("Date of birth: 14 December 1977"),
            np_static("Occupation: interior designer"),
            np_static("Reason for visit: business (to buy antique"), np_gap(2), np_static(")"),
            np_static("Length of stay: two months"),
            np_static("Current address:"), np_gap(3), np_static("Apartments (No 15)"),
            np_section("Details of theft"),
            np_static("Items stolen:"),
            np_static("• a wallet containing approximately £"), np_gap(4),
            np_static("• a"), np_gap(5),
            np_static("Date of theft:"), np_gap(6),
            np_section("Possible time and place of theft"),
            np_static("• Location: outside the"), np_gap(7), np_static("at about 4 pm"),
            np_section("Details of suspect"),
            np_static("• some boys asked for the"), np_gap(8), np_static("then ran off"),
            np_static("• one had a T-shirt with a picture of a tiger"),
            np_static("• he was about 12, slim build with"), np_gap(9), np_static("hair"),
            np_static("Crime reference number allocated"), np_gap(10),
        ],
    )


def cam14_t1_p2():
    policy_opts = [
        ("A", "It is encouraged."),
        ("B", "There are some restrictions."),
        ("C", "It is against the rules."),
    ]
    return part(
        2, 11, 20,
        "Questions 11–12 and 13–14: Choose TWO A–E. Questions 15–20: Matching A–C.",
        [
            *choose_two(11, 12,
                        "Which TWO pieces of advice for the first week of an apprenticeship does the manager give?",
                        [("A", "get to know colleagues"),
                         ("B", "learn from any mistakes"),
                         ("C", "ask lots of questions"),
                         ("D", "react positively to feedback"),
                         ("E", "enjoy new challenges")],
                        "A/C", "Quen đồng nghiệp (A) và hỏi nhiều (C).",
                        sectionRange="Questions 11 and 12",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(13, 14,
                        "Which TWO things does the manager say mentors can help with?",
                        [("A", "confidence-building"),
                         ("B", "making career plans"),
                         ("C", "completing difficult tasks"),
                         ("D", "making a weekly timetable"),
                         ("E", "reviewing progress")],
                        "B/E", "Kế hoạch nghề (B) và review tiến độ (E).",
                        sectionRange="Questions 13 and 14",
                        sectionInstruction="Choose TWO letters, A–E."),
            match(15, "Using the internet", list("ABC"), "B", labeled=policy_opts,
                  sectionRange="Questions 15 – 20",
                  sectionInstruction="What does the manager say about each of the following aspects of the company policy for apprentices? Write the correct letter, A, B or C, next to Questions 15–20.",
                  sectionTitle="Company policy for apprentices"),
            match(16, "Flexible working", list("ABC"), "B", labeled=policy_opts),
            match(17, "Booking holidays", list("ABC"), "C", labeled=policy_opts),
            match(18, "Working overtime", list("ABC"), "A", labeled=policy_opts),
            match(19, "Wearing trainers", list("ABC"), "A", labeled=policy_opts),
            match(20, "Bringing food to work", list("ABC"), "C", labeled=policy_opts),
        ],
    )


def cam14_t1_p3():
    decision_opts = [
        ("A", "use visuals"),
        ("B", "keep it short"),
        ("C", "involve other students"),
        ("D", "check the information is accurate"),
        ("E", "provide a handout"),
        ("F", "focus on one example"),
        ("G", "do online research"),
    ]
    return part(
        3, 21, 30,
        "Questions 21–25: Choose A, B or C. Questions 26–30: Matching A–G.",
        [
            mc(21, "Carla and Rob were surprised to learn that coastal cities", [
                ("A", "contain nearly half the world's population."),
                ("B", "include most of the world's largest cities."),
                ("C", "are growing twice as fast as other cities."),
            ], "B", sectionRange="Questions 21 – 25",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Cities built by the sea"),
            mc(22, "According to Rob, building coastal cities near to rivers", [
                ("A", "may bring pollution to the cities."),
                ("B", "may reduce the land available for agriculture."),
                ("C", "may mean the countryside is spoiled by industry."),
            ], "A"),
            mc(23, "What mistake was made when building water drainage channels in Miami in the 1950s?", [
                ("A", "There were not enough of them."),
                ("B", "They were made of unsuitable materials."),
                ("C", "They did not allow for the effects of climate change."),
            ], "C"),
            mc(24, "What do Rob and Carla think that the authorities in Miami should do immediately?", [
                ("A", "take measures to restore ecosystems"),
                ("B", "pay for a new flood prevention system"),
                ("C", "stop disposing of waste materials into the ocean"),
            ], "B"),
            mc(25, "What do they agree should be the priority for international action?", [
                ("A", "greater coordination of activities"),
                ("B", "more sharing of information"),
                ("C", "agreement on shared policies"),
            ], "A"),
            match(26, "Historical background", list("ABCDEFG"), "B", labeled=decision_opts,
                  sectionRange="Questions 26 – 30",
                  sectionInstruction="What decision do the students make about each of the following parts of their presentation? Choose FIVE answers from the box and write the correct letter, A–G, next to Questions 26–30.",
                  sectionTitle="Parts of the presentation"),
            match(27, "Geographical factors", list("ABCDEFG"), "A", labeled=decision_opts),
            match(28, "Past mistakes", list("ABCDEFG"), "F", labeled=decision_opts),
            match(29, "Future risks", list("ABCDEFG"), "G", labeled=decision_opts),
            match(30, "International implications", list("ABCDEFG"), "C", labeled=decision_opts),
        ],
    )


def cam14_t1_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "growth in population and …:", "industry", sectionTitle="Marine renewable energy (ocean energy)"),
            gap(32, "waves provide a … source of renewable energy:", "constant"),
            gap(33, "waves can move in any …:", "direction"),
            gap(34, "movement of sand on the … of the ocean:", "floor"),
            gap(35, "Tides are more … than waves:", "predictable"),
            gap(36, "will be created in a … at Swansea:", "bay"),
            gap(37, "stored water released through …:", "gates"),
            gap(38, "no … is required to make it work:", "fuel"),
            gap(39, "likely to create a number of …:", "jobs"),
            gap(40, "may harm fish by affecting …:", "migration"),
        ],
        passageTitle="Marine renewable energy (ocean energy)",
        notePassageLayout="lecture",
        notePassage=[
            np_section("Introduction"),
            np_static("More energy required because of growth in population and"), np_gap(31),
            np_section("What's needed:"),
            np_static("• renewable energy sources"),
            np_static("• methods that won't create pollution"),
            np_section("Wave energy"),
            np_static("Advantage: waves provide a"), np_gap(32), np_static("source of renewable energy"),
            np_static("Electricity can be generated using offshore or onshore systems"),
            np_static("Onshore systems may use a reservoir"),
            np_static("Problems:"),
            np_static("• waves can move in any"), np_gap(33),
            np_static("• movement of sand, etc. on the"), np_gap(34), np_static("of the ocean may be affected"),
            np_section("Tidal energy"),
            np_static("Tides are more"), np_gap(35), np_static("than waves"),
            np_static("Planned tidal lagoon in Wales:"),
            np_static("• will be created in a"), np_gap(36), np_static("at Swansea"),
            np_static("• breakwater (dam) containing 16 turbines"),
            np_static("• rising tide forces water through turbines, generating electricity"),
            np_static("• stored water is released through"), np_gap(37),
            np_static(", driving the turbines in the reverse direction"),
            np_section("Advantages:"),
            np_static("• not dependent on weather"),
            np_static("• no"), np_gap(38), np_static("is required to make it work"),
            np_static("• likely to create a number of"), np_gap(39),
            np_section("Problem:"),
            np_static("• may harm fish and birds, e.g. by affecting"), np_gap(40),
            np_static("and building up silt"),
            np_section("Ocean thermal energy conversion"),
            np_static("Uses a difference in temperature between the surface and lower levels"),
            np_static("Water brought to the surface in a pipe"),
        ],
    )


# ── Cam14 Test 2 ─────────────────────────────────────────────────────────────

def cam14_t2_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Contact phone:", "2194429785/219 442 9785", sectionTitle="TOTAL HEALTH CLINIC – PATIENT DETAILS"),
            gap(2, "Date of birth:", "10 october/10th october"),
            gap(3, "works as a …:", "manager"),
            gap(4, "Insurance company:", "cawley"),
            gap(5, "pain in her left …:", "knee"),
            gap(6, "When it began … ago:", "3weeks/3 weeks"),
            gap(7, "belongs to a … club:", "tennis"),
            gap(8, "goes … regularly:", "running"),
            gap(9, "injured her … last year:", "shoulder"),
            gap(10, "no regular medication apart from …:", "vitamins"),
        ],
        passageTitle="TOTAL HEALTH CLINIC – PATIENT DETAILS",
        notePassageLayout="form",
        notePassage=[
            np_section("Personal information"),
            np_example("Example"),
            np_static("Name: Julie Anne ……Garcia….."),
            np_static("Contact phone: "), np_gap(1),
            np_static("Date of birth: "), np_gap(2), np_static(", 1992"),
            np_static("Occupation: works as a "), np_gap(3),
            np_static("Insurance company: "), np_gap(4), np_static(" Life Insurance"),
            np_section("Details of the problem"),
            np_static("Type of problem: pain in her left "), np_gap(5),
            np_static("When it began: "), np_gap(6), np_static(" ago"),
            np_static("Action already taken: has taken painkillers and applied ice"),
            np_section("Other information"),
            np_static("Sports played: belongs to a "), np_gap(7), np_static(" club"),
            np_static("goes "), np_gap(8), np_static(" regularly"),
            np_static("Medical history: injured her "), np_gap(9), np_static(" last year"),
            np_static("no allergies"),
            np_static("no regular medication apart from "), np_gap(10),
        ],
    )


def cam14_t2_p2():
    letters = list("ABCDEFGH")
    return part(
        2, 11, 20,
        "Questions 11–15: Choose A, B or C. Questions 16–20: Label the plan A–H.",
        [
            mc(11, "Before Queen Elizabeth I visited the castle in 1576,", [
                ("A", "repairs were carried out to the guest rooms."),
                ("B", "a new building was constructed for her."),
                ("C", "a fire damaged part of the main hall."),
            ], "B", sectionRange="Questions 11 – 15",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Visit to Branley Castle"),
            mc(12, "In 1982, the castle was sold to", [
                ("A", "the government."),
                ("B", "the Fenys family."),
                ("C", "an entertainment company."),
            ], "C"),
            mc(13, "In some of the rooms, visitors can", [
                ("A", "speak to experts on the history of the castle."),
                ("B", "interact with actors dressed as famous characters."),
                ("C", "see models of historical figures moving and talking."),
            ], "C"),
            mc(14, "In the castle park, visitors can", [
                ("A", "see an 800-year-old tree."),
                ("B", "go to an art exhibition."),
                ("C", "visit a small zoo."),
            ], "B"),
            mc(15, "At the end of the visit, the group will have", [
                ("A", "afternoon tea in the conservatory."),
                ("B", "the chance to meet the castle's owners."),
                ("C", "a photograph together on the Great Staircase."),
            ], "A"),
            map_label(16, "Starting point for walking the walls", letters, "H",
                      sectionRange="Questions 16 – 20",
                      sectionInstruction="Label the plan below. Write the correct letter, A–H, next to Questions 16–20.",
                      sectionTitle="Branley Castle"),
            map_label(17, "Bow and arrow display", letters, "D"),
            map_label(18, "Hunting birds display", letters, "F"),
            map_label(19, "Traditional dancing", letters, "A"),
            map_label(20, "Shop", letters, "E"),
        ],
        imageFile="map.jpg",
    )


def cam14_t2_p3():
    action_opts = [
        ("A", "make it more interactive"),
        ("B", "reduce visual input"),
        ("C", "add personal opinions"),
        ("D", "contact one of the researchers"),
        ("E", "make detailed notes"),
        ("F", "find information online"),
        ("G", "check timing"),
        ("H", "organise the content more clearly"),
    ]
    return part(
        3, 21, 30,
        "Questions 21–24: Choose A, B or C. Questions 25–30: Matching A–H.",
        [
            mc(21, "How will Rosie and Martin introduce their presentation?", [
                ("A", "with a drawing of woolly mammoths in their natural habitat"),
                ("B", "with a timeline showing when woolly mammoths lived"),
                ("C", "with a video clip about woolly mammoths"),
            ], "B", sectionRange="Questions 21 – 24",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Woolly mammoths on St Paul's Island"),
            mc(22, "What was surprising about the mammoth tooth found by Russell Graham?", [
                ("A", "It was still embedded in the mammoth's jawbone."),
                ("B", "It was from an unknown species of mammoth."),
                ("C", "It was not as old as mammoth remains from elsewhere."),
            ], "C"),
            mc(23, "The students will use an animated diagram to demonstrate how the mammoths", [
                ("A", "became isolated on the island."),
                ("B", "spread from the island to other areas."),
                ("C", "coexisted with other animals on the island."),
            ], "A"),
            mc(24, "According to Martin, what is unusual about the date of the mammoths' extinction on the island?", [
                ("A", "how exact it is"),
                ("B", "how early it is"),
                ("C", "how it was established"),
            ], "A"),
            match(25, "Introduction", list("ABCDEFGH"), "E", labeled=action_opts,
                  sectionRange="Questions 25 – 30",
                  sectionInstruction="What action will the students take for each of the following sections of their presentation? Choose SIX answers from the box and write the correct letter, A–H, next to Questions 25–30.",
                  sectionTitle="Part of presentation"),
            match(26, "Discovery of the mammoth tooth", list("ABCDEFGH"), "D", labeled=action_opts),
            match(27, "Initial questions asked by the researchers", list("ABCDEFGH"), "H", labeled=action_opts),
            match(28, "Further research carried out on the island", list("ABCDEFGH"), "F", labeled=action_opts),
            match(29, "Findings and possible explanations", list("ABCDEFGH"), "G", labeled=action_opts),
            match(30, "Relevance to the present day", list("ABCDEFGH"), "C", labeled=action_opts),
        ],
    )


def cam14_t2_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "invented … and other ceremonies:", "dances", sectionTitle="THE HISTORY OF WEATHER FORECASTING"),
            gap(32, "observe and interpret the sky to ensure their …:", "survival"),
            gap(33, "using weather phenomena such as …:", "clouds"),
            gap(34, "calendar made up of a number of … connected with the weather:", "festivals"),
            gap(35, "Aristotle described haloes and …:", "comets"),
            gap(36, "about the significance of the colour of the …:", "sky"),
            gap(37, "recognised value of … for the first time:", "instruments"),
            gap(38, "Galileo invented the …:", "thermometer"),
            gap(39, "Franklin identified the movement of …:", "storms"),
            gap(40, "data sent to the same place by …:", "telegraph"),
        ],
        passageTitle="THE HISTORY OF WEATHER FORECASTING",
        notePassage=[
            np_section("Ancient cultures"),
            np_static("● many cultures believed that floods and other disasters were involved in the creation of the world"),
            np_static("● many cultures invented"), np_gap(31),
            np_static(" and other ceremonies to make the weather gods friendly"),
            np_static("● people needed to observe and interpret the sky to ensure their"), np_gap(32),
            np_static("● around 650 BC, Babylonians started forecasting, using weather phenomena such as"), np_gap(33),
            np_static("● by 300 BC, the Chinese had a calendar made up of a number of"), np_gap(34),
            np_static(" connected with the weather"),
            np_section("Ancient Greeks"),
            np_static("● a more scientific approach"),
            np_static("● Aristotle tried to explain the formation of various weather phenomena"),
            np_static("● Aristotle also described haloes and"), np_gap(35),
            np_section("Middle Ages"),
            np_static("● Aristotle's work considered accurate"),
            np_static("● many proverbs, e.g. about the significance of the colour of the"), np_gap(36),
            np_static(", passed on accurate information."),
            np_section("15th–19th centuries"),
            np_static("● 15th century: scientists recognised value of"), np_gap(37),
            np_static(" for the first time"),
            np_static("● Galileo invented the"), np_gap(38),
            np_static("● Pascal showed relationship between atmospheric pressure and altitude"),
            np_static("● from the 17th century, scientists could measure atmospheric pressure and temperature"),
            np_static("● 18th century: Franklin identified the movement of"), np_gap(39),
            np_static("● 19th century: data from different locations could be sent to the same place by"), np_gap(40),
        ],
    )


# ── Cam14 Test 3 ─────────────────────────────────────────────────────────────

def cam14_t3_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "the … room for talks:", "tesla", sectionTitle="Flanders Conference Hotel"),
            gap(2, "projector and … available:", "microphone"),
            gap(3, "area for coffee and an …:", "exhibition"),
            gap(4, "free … throughout:", "wifi"),
            gap(5, "buffet lunch costs $ … per head:", "45"),
            gap(6, "Rooms will cost $ … including breakfast:", "135"),
            gap(7, "hotel also has a spa and rooftop …:", "pool"),
            gap(8, "free shuttle service to the …:", "airport"),
            gap(9, "Wilby Street (quite near the …):", "sea"),
            gap(10, "near to restaurants and many …:", "clubs"),
        ],
        passageTitle="Flanders Conference Hotel",
        notePassageLayout="form",
        notePassage=[
            np_example("Example"),
            np_static("Customer Services Manager: …………Angela……….."),
            np_static("Date available"),
            np_static("● weekend beginning February 4th"),
            np_section("Conference facilities"),
            np_static("● the "), np_gap(1), np_static(" room for talks"),
            np_static("(projector and "), np_gap(2), np_static(" available)"),
            np_static("● area for coffee and an "), np_gap(3),
            np_static("● free "), np_gap(4), np_static(" throughout"),
            np_static("● a standard buffet lunch costs $"), np_gap(5), np_static(" per head"),
            np_section("Accommodation"),
            np_static("● Rooms will cost $"), np_gap(6), np_static(" including breakfast."),
            np_section("Other facilities"),
            np_static("● The hotel also has a spa and rooftop "), np_gap(7),
            np_static("● There's a free shuttle service to the "), np_gap(8),
            np_section("Location"),
            np_static("● Wilby Street (quite near the "), np_gap(9), np_static(")"),
            np_static("● near to restaurants and many "), np_gap(10),
        ],
    )


def cam14_t3_p2():
    help_opts = [
        ("A", "overcome physical difficulties"),
        ("B", "rediscover skills not used for a long time"),
        ("C", "improve their communication skills"),
        ("D", "solve problems independently"),
        ("E", "escape isolation"),
        ("F", "remember past times"),
        ("G", "start a new hobby"),
    ]
    return part(
        2, 11, 20,
        "Questions 11–12 and 13–14: Choose TWO A–E. Questions 15–20: Matching A–G.",
        [
            *choose_two(11, 12,
                        "Which TWO activities that volunteers do are mentioned?",
                        [("A", "decorating"),
                         ("B", "cleaning"),
                         ("C", "delivering meals"),
                         ("D", "shopping"),
                         ("E", "childcare")],
                        "A/E", "Trang trí (A) và childcare (E).",
                        sectionRange="Questions 11 and 12",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(13, 14,
                        "Which TWO ways that volunteers can benefit from volunteering are mentioned?",
                        [("A", "learning how to be part of a team"),
                         ("B", "having a sense of purpose"),
                         ("C", "realising how lucky they are"),
                         ("D", "improved ability at time management"),
                         ("E", "boosting their employment prospects")],
                        "B/E", "Mục đích (B) và việc làm (E).",
                        sectionRange="Questions 13 and 14",
                        sectionInstruction="Choose TWO letters, A–E."),
            match(15, "Habib", list("ABCDEFG"), "F", labeled=help_opts,
                  sectionRange="Questions 15 – 20",
                  sectionInstruction="What has each of the following volunteers helped someone to do? Choose SIX answers from the box and write the correct letter, A–G, next to Questions 15–20.",
                  sectionTitle="Volunteers"),
            match(16, "Consuela", list("ABCDEFG"), "A", labeled=help_opts),
            match(17, "Minh", list("ABCDEFG"), "E", labeled=help_opts),
            match(18, "Tanya", list("ABCDEFG"), "G", labeled=help_opts),
            match(19, "Alexei", list("ABCDEFG"), "D", labeled=help_opts),
            match(20, "Juba", list("ABCDEFG"), "C", labeled=help_opts),
        ],
    )


def cam14_t3_p3():
    problem_opts = [
        ("A", "makes a lot of mistakes in rehearsals"),
        ("B", "keeps making unhelpful suggestions"),
        ("C", "has difficulty with rhythm"),
        ("D", "misses too many rehearsals"),
        ("E", "has a health problem"),
        ("F", "doesn't mix with other students"),
    ]
    return part(
        3, 21, 30,
        "Questions 21–26: Complete the notes. Questions 27–30: Matching A–F.",
        [
            gap(21, "consists of around … students:", "50", word_limit=1,
                sectionRange="Questions 21 – 26",
                sectionInstruction="Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
                sectionTitle="Background on school marching band"),
            gap(22, "due to play in a … band competition:", "regional", word_limit=1),
            gap(23, "invited to play in the town's …:", "carnival", word_limit=1),
            gap(24, "listened to a talk by a …:", "drummer", word_limit=1),
            gap(25, "Joe will discuss a … with the band:", "film", word_limit=1),
            gap(26, "Joe hopes the band will attend a … next month:", "parade", word_limit=1),
            match(27, "flautist", list("ABCDEF"), "D", labeled=problem_opts,
                  sectionRange="Questions 27 – 30",
                  sectionInstruction="What problem does Joe mention in connection with each of the following band members? Choose FOUR answers from the box and write the correct letter, A–F, next to Questions 27–30.",
                  sectionTitle="Band members"),
            match(28, "trumpeter", list("ABCDEF"), "B", labeled=problem_opts),
            match(29, "trombonist", list("ABCDEF"), "E", labeled=problem_opts),
            match(30, "percussionist", list("ABCDEF"), "F", labeled=problem_opts),
        ],
        notePassage=[
            np_static("• It consists of around"), np_gap(21), np_static("students."),
            np_static("• It is due to play in a"), np_gap(22), np_static("band competition."),
            np_static("• It has been invited to play in the town's"), np_gap(23), np_static("."),
            np_static("• They have listened to a talk by a"), np_gap(24), np_static("."),
            np_static("• Joe will discuss a"), np_gap(25), np_static("with the band."),
            np_static("• Joe hopes the band will attend a"), np_gap(26), np_static("next month."),
        ],
    )


def cam14_t3_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "studied piano and … before turning to composition:", "violin", sectionTitle="CONCERTS IN UNIVERSITY ARTS FESTIVAL"),
            gap(32, "compositions show a great deal of …:", "energy"),
            gap(33, "her music is very expressive and also …:", "complex"),
            gap(34, "festival will include her … called The Oresteia:", "opera"),
            gap(35, "Lim described the sounds in The Oresteia as …:", "disturbing"),
            gap(36, "performed by piano and …:", "clarinet"),
            gap(37, "celebrates Australia's cultural …:", "diversity"),
            gap(38, "studied … before studying music:", "physics"),
            gap(39, "became well known as composer of music for …:", "dance"),
            gap(40, "music for the 1996 …:", "olympics"),
        ],
        passageTitle="CONCERTS IN UNIVERSITY ARTS FESTIVAL",
        notePassage=[
            np_section("Concert 1"),
            np_static("● Australian composer: Liza Lim"),
            np_static("● studied piano and "), np_gap(31), np_static(" before turning to composition"),
            np_static("● performers and festivals around the world have given her a lot of commissions"),
            np_static("● compositions show a great deal of "), np_gap(32),
            np_static(" and are drawn from various cultural sources"),
            np_static("● her music is very expressive and also "), np_gap(33),
            np_static("● festival will include her "), np_gap(34), np_static(" called The Oresteia"),
            np_static("● Lim described the sounds in The Oresteia as "), np_gap(35),
            np_static("● British composers: Ralph Vaughan Williams, Frederick Delius"),
            np_section("Concert 2"),
            np_static("● British composers: Benjamin Britten, Judith Weir"),
            np_static("● Australian composer: Ross Edwards"),
            np_static("● festival will include The Tower of Remoteness, inspired by nature"),
            np_static("● The Tower of Remoteness is performed by piano and "), np_gap(36),
            np_static("● compositions include music for children"),
            np_static("● celebrates Australia's cultural "), np_gap(37),
            np_section("Concert 3"),
            np_static("● Australian composer: Carl Vine"),
            np_static("● played cornet then piano"),
            np_static("● studied "), np_gap(38), np_static(" before studying music"),
            np_static("● worked in Sydney as a pianist and composer"),
            np_static("● became well known as composer of music for "), np_gap(39),
            np_static("● festival will include his music for the 1996 "), np_gap(40),
            np_static("● British composers: Edward Elgar, Thomas Adès"),
        ],
    )


# ── Cam14 Test 4 ─────────────────────────────────────────────────────────────

def cam14_t4_p1():
    avail_opts = [
        ("A", "included in cost of hiring room"),
        ("B", "available at extra charge"),
        ("C", "not available"),
    ]
    return part(
        1, 1, 10,
        "Questions 1–7: Complete the notes. Questions 8–10: Matching A–C.",
        [
            gap(1, "number of people who can sit down to eat:", "85", word_limit=1,
                sectionRange="Questions 1 – 7",
                sectionInstruction="Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
                sectionTitle="Enquiry about booking hotel room for event"),
            gap(2, "see the … in pots on the terrace:", "roses", word_limit=1),
            gap(3, "view of a group of …:", "trees", word_limit=1),
            gap(4, "has a … view of the lake:", "stage", word_limit=1),
            gap(5, "can give a … while people are eating:", "speech", word_limit=1),
            gap(6, "will provide … if there are any problems:", "support", word_limit=1),
            gap(7, "in hotel rooms or …:", "cabins", word_limit=1),
            match(8, "outdoor swimming pool", list("ABC"), "C", labeled=avail_opts,
                  sectionRange="Questions 8 – 10",
                  sectionInstruction="What is said about using each of the following hotel facilities? Choose THREE answers from the box and write the correct letter, A, B or C, next to Questions 8–10.",
                  sectionTitle="Hotel facilities"),
            match(9, "gym", list("ABC"), "A", labeled=avail_opts),
            match(10, "tennis courts", list("ABC"), "B", labeled=avail_opts),
        ],
        passageTitle="Enquiry about booking hotel room for event",
        notePassageLayout="form",
        notePassage=[
            np_example("Example"),
            np_static("Andrew is the ……Events…… Manager"),
            np_section("Rooms"),
            np_static("Adelphi Room"),
            np_static("number of people who can sit down to eat: "), np_gap(1),
            np_static("has a gallery suitable for musicians"),
            np_static("can go out and see the "), np_gap(2), np_static(" in pots on the terrace"),
            np_static("terrace has a view of a group of "), np_gap(3),
            np_static("Carlton Room"),
            np_static("number of people who can sit down to eat: 110"),
            np_static("has a "), np_gap(4), np_static(" view of the lake"),
            np_section("Options"),
            np_static("Master of Ceremonies:"),
            np_static("can give a "), np_gap(5), np_static(" while people are eating"),
            np_static("will provide "), np_gap(6), np_static(" if there are any problems"),
            np_section("Accommodation:"),
            np_static("in the hotel rooms or "), np_gap(7),
        ],
    )


def cam14_t4_p2():
    info_opts = [
        ("A", "all downhill"),
        ("B", "suitable for beginners"),
        ("C", "only in good weather"),
        ("D", "food included"),
        ("E", "no charge"),
        ("F", "swimming possible"),
        ("G", "fully booked today"),
        ("H", "transport not included"),
    ]
    return part(
        2, 11, 20,
        "Questions 11–16: Matching A–H. Questions 17–18 and 19–20: Choose TWO A–E.",
        [
            match(11, "dolphin watching", list("ABCDEFGH"), "G", labeled=info_opts,
                  sectionRange="Questions 11 – 16",
                  sectionInstruction="What information does the speaker give about each of the following excursions? Choose SIX answers from the box and write the correct letter, A–H, next to Questions 11–16.",
                  sectionTitle="Excursions"),
            match(12, "forest walk", list("ABCDEFGH"), "D", labeled=info_opts),
            match(13, "cycle trip", list("ABCDEFGH"), "A", labeled=info_opts),
            match(14, "local craft tour", list("ABCDEFGH"), "E", labeled=info_opts),
            match(15, "observatory trip", list("ABCDEFGH"), "F", labeled=info_opts),
            match(16, "horse riding", list("ABCDEFGH"), "B", labeled=info_opts),
            *choose_two(17, 18,
                        "Which TWO things does the speaker say about the attraction called Musical Favourites?",
                        [("A", "You pay extra for drinks."),
                         ("B", "You must book it in advance."),
                         ("C", "You get a reduction if you buy two tickets."),
                         ("D", "You can meet the performers."),
                         ("E", "You can take part in the show.")],
                        "B/D", "Đặt trước (B) và gặp nghệ sĩ (D).",
                        sectionRange="Questions 17 and 18",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(19, 20,
                        "Which TWO things does the speaker say about the Castle Feast?",
                        [("A", "Visitors can dance after the meal."),
                         ("B", "There is a choice of food."),
                         ("C", "Visitors wear historical costume."),
                         ("D", "Knives and forks are not used."),
                         ("E", "The entertainment includes horse races.")],
                        "A/D", "Nhảy sau bữa (A) và không dùng dao nĩa (D).",
                        sectionRange="Questions 19 and 20",
                        sectionInstruction="Choose TWO letters, A–E."),
        ],
    )


def cam14_t4_p3():
    comment_opts = [
        ("A", "translated into many other languages"),
        ("B", "hard to read"),
        ("C", "inspired a work in a different area of art"),
        ("D", "more popular than the author's other works"),
        ("E", "original title refers to another book"),
        ("F", "started a new genre"),
        ("G", "unlikely topic"),
    ]
    return part(
        3, 21, 30,
        "Questions 21–25: Choose A, B or C. Questions 26–30: Matching A–G.",
        [
            mc(21, "What does Trevor find interesting about the purpose of children's literature?", [
                ("A", "the fact that authors may not realise what values they're teaching"),
                ("B", "the fact that literature can be entertaining and educational at the same time"),
                ("C", "the fact that adults expect children to imitate characters in literature"),
            ], "A", sectionRange="Questions 21 – 25",
               sectionInstruction="Choose the correct letter, A, B or C.",
               sectionTitle="Children's literature"),
            mc(22, "Trevor says the module about the purpose of children's literature made him", [
                ("A", "analyse some of the stories that his niece reads."),
                ("B", "wonder how far popularity reflects good quality."),
                ("C", "decide to start writing some children's stories."),
            ], "C"),
            mc(23, "Stephanie is interested in the Pictures module because", [
                ("A", "she intends to become an illustrator."),
                ("B", "she can remember beautiful illustrations from her childhood."),
                ("C", "she believes illustrations are more important than words."),
            ], "A"),
            mc(24, "Trevor and Stephanie agree that comics", [
                ("A", "are inferior to books."),
                ("B", "have the potential for being useful."),
                ("C", "discourage children from using their imagination."),
            ], "B"),
            mc(25, "With regard to books aimed at only boys or only girls, Trevor was surprised", [
                ("A", "how long the distinction had gone unquestioned."),
                ("B", "how few books were aimed at both girls and boys."),
                ("C", "how many children enjoyed books intended for the opposite sex."),
            ], "B"),
            match(26, "Perrault's fairy tales", list("ABCDEFG"), "F", labeled=comment_opts,
                  sectionRange="Questions 26 – 30",
                  sectionInstruction="What comment is made about each of these stories? Choose FIVE answers from the box and write the correct letter, A–G, next to Questions 26–30.",
                  sectionTitle="Stories"),
            match(27, "The Swiss Family Robinson", list("ABCDEFG"), "E", labeled=comment_opts),
            match(28, "The Nutcracker and The Mouse King", list("ABCDEFG"), "C", labeled=comment_opts),
            match(29, "The Lord of the Rings", list("ABCDEFG"), "B", labeled=comment_opts),
            match(30, "War Horse", list("ABCDEFG"), "G", labeled=comment_opts),
        ],
    )


def cam14_t4_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "semicircle of large stones round a …:", "spring", sectionTitle="THE HUNT FOR SUNKEN SETTLEMENTS AND ANCIENT SHIPWRECKS"),
            gap(32, "research into structures, … and human remains:", "tools"),
            gap(33, "used in the oil industry, e.g. to make …:", "maps"),
            gap(34, "they were expensive and …:", "heavy"),
            gap(35, "architectural elements made of …:", "marble"),
            gap(36, "… is used for short distance communication:", "light"),
            gap(37, "AW can send data to another AW that has better …:", "camera/cameras"),
            gap(38, "one carrying … supplies:", "medical"),
            gap(39, "tablets may have been used for cleaning the …:", "eyes"),
            gap(40, "containers of olive oil or …:", "wine"),
        ],
        passageTitle="THE HUNT FOR SUNKEN SETTLEMENTS AND ANCIENT SHIPWRECKS",
        notePassage=[
            np_section("ATLIT-YAM"),
            np_static("● was a village on coast of eastern Mediterranean"),
            np_static("● thrived until about 7,000 BC"),
            np_static("● stone homes had a courtyard"),
            np_static("● had a semicircle of large stones round a "), np_gap(31),
            np_static("● cause of destruction unknown – now under the sea"),
            np_static("● biggest settlement from the prehistoric period found on the seabed"),
            np_static("● research carried out into structures, "), np_gap(32),
            np_static(" and human remains"),
            np_section("TRADITIONAL AUTONOMOUS UNDERWATER VEHICLES (AUVs)"),
            np_static("● used in the oil industry, e.g. to make "), np_gap(33),
            np_static("● problems: they were expensive and "), np_gap(34),
            np_section("LATEST AUVs"),
            np_static("● much easier to use, relatively cheap, sophisticated"),
            np_section("Tests:"),
            np_static("● Marzamemi, Sicily: found ancient Roman ships carrying architectural elements made of "), np_gap(35),
            np_section("Underwater internet:"),
            np_static("● "), np_gap(36),
            np_static(" is used for short distance communication, acoustic waves for long distance"),
            np_static("● plans for communication with researchers by satellite"),
            np_static("● AUV can send data to another AUV that has better "), np_gap(37),
            np_static(", for example"),
            np_section("Planned research in Gulf of Baratti:"),
            np_static("to find out more about wrecks of ancient Roman ships, including:"),
            np_static("– one carrying "), np_gap(38),
            np_static(" supplies; tablets may have been used for cleaning the "), np_gap(39),
            np_static("– others carrying containers of olive oil or "), np_gap(40),
        ],
    )


# ── Registry ─────────────────────────────────────────────────────────────────

TESTS = [
    {
        "folder": "Listening IELTS_Test1_Cam13", "cambridge": 13, "test": 1,
        "title": "IELTS Listening — Cambridge 13 Test 1",
        "parts": [
            {"partNumber": 1, "template": "p1-a2", "file": "exam_part1.json", "build": cam13_t1_p1},
            {"partNumber": 2, "template": "p2-a12", "file": "exam_part2.json", "build": cam13_t1_p2},
            {"partNumber": 3, "template": "p3-c6", "file": "exam_part3.json", "build": cam13_t1_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam13_t1_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test2_Cam13", "cambridge": 13, "test": 2,
        "title": "IELTS Listening — Cambridge 13 Test 2",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam13_t2_p1},
            {"partNumber": 2, "template": "p2-a10", "file": "exam_part2.json", "build": cam13_t2_p2},
            {"partNumber": 3, "template": "p3-c4", "file": "exam_part3.json", "build": cam13_t2_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam13_t2_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test3_Cam13", "cambridge": 13, "test": 3,
        "title": "IELTS Listening — Cambridge 13 Test 3",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam13_t3_p1},
            {"partNumber": 2, "template": "p2-a10", "file": "exam_part2.json", "build": cam13_t3_p2},
            {"partNumber": 3, "template": "p3-c4", "file": "exam_part3.json", "build": cam13_t3_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam13_t3_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test4_Cam13", "cambridge": 13, "test": 4,
        "title": "IELTS Listening — Cambridge 13 Test 4",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam13_t4_p1},
            {"partNumber": 2, "template": "p2-a11", "file": "exam_part2.json", "build": cam13_t4_p2},
            {"partNumber": 3, "template": "p3-c5", "file": "exam_part3.json", "build": cam13_t4_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam13_t4_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test1_Cam14", "cambridge": 14, "test": 1,
        "title": "IELTS Listening — Cambridge 14 Test 1",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam14_t1_p1},
            {"partNumber": 2, "template": "p2-a10", "file": "exam_part2.json", "build": cam14_t1_p2},
            {"partNumber": 3, "template": "p3-c4", "file": "exam_part3.json", "build": cam14_t1_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam14_t1_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test2_Cam14", "cambridge": 14, "test": 2,
        "title": "IELTS Listening — Cambridge 14 Test 2",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam14_t2_p1},
            {"partNumber": 2, "template": "p2-a12", "file": "exam_part2.json", "build": cam14_t2_p2},
            {"partNumber": 3, "template": "p3-c4", "file": "exam_part3.json", "build": cam14_t2_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam14_t2_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test3_Cam14", "cambridge": 14, "test": 3,
        "title": "IELTS Listening — Cambridge 14 Test 3",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam14_t3_p1},
            {"partNumber": 2, "template": "p2-a10", "file": "exam_part2.json", "build": cam14_t3_p2},
            {"partNumber": 3, "template": "p3-c2", "file": "exam_part3.json", "build": cam14_t3_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam14_t3_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test4_Cam14", "cambridge": 14, "test": 4,
        "title": "IELTS Listening — Cambridge 14 Test 4",
        "parts": [
            {"partNumber": 1, "template": "p1-a4", "file": "exam_part1.json", "build": cam14_t4_p1},
            {"partNumber": 2, "template": "p2-a10", "file": "exam_part2.json", "build": cam14_t4_p2},
            {"partNumber": 3, "template": "p3-c4", "file": "exam_part3.json", "build": cam14_t4_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam14_t4_p4},
        ],
    },
]

MAP_IMAGES = [
    ("Listening IELTS_Test1_Cam13", "Test1_Listening_Cam13.pdf", 2),
    ("Listening IELTS_Test2_Cam14", "Test2_Listening_Cam14.pdf", 2),
]


def main():
    print("Building IELTS Listening Cam13 T1–T4 + Cam14 T1–T4…\n")
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