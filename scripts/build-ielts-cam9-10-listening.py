"""Generate exam_part1–4.json + meta.json + exam.json for Cam9 T3/T4 and Cam10 T1–T4.

Run:
  python scripts/build-ielts-cam9-10-listening.py
  pnpm ielts:validate "IELTS/Listening IELTS_Test3_Cam9"
"""
from __future__ import annotations

import json
import copy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / "Tainguyen" / "templates"
IELTS = ROOT / "Tainguyen" / "IELTS"

MC3 = lambda labels: [{"id": k, "label": v} for k, v in labels]
LETTER_OPTS = lambda letters: [{"id": c, "label": c} for c in letters]


def gap(n, prompt, answer, explanation="Điền theo audio.", word_limit=1, **extra):
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


def match(n, prompt, option_letters, answer, explanation="Chọn theo audio.", labeled=None, **extra):
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


def mc(n, prompt, options, answer, explanation="Chọn theo audio.", **extra):
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


def choose_two(n1, n2, prompt, options, answer, explanation, **section):
    return [
        match(n1, prompt, list("ABCDE"), answer, explanation, options, **section),
        match(n2, prompt, list("ABCDE"), answer, f"{explanation} (cặp {n1}–{n2})", options),
    ]


def load_template_part(filename: str) -> dict:
    data = json.loads((TEMPLATES / filename).read_text(encoding="utf-8"))
    return copy.deepcopy(data["parts"][0])


def patch_answers(part: dict, answers: dict[int, str]) -> dict:
    for q in part["questions"]:
        if q["number"] not in answers:
            continue
        ans = answers[q["number"]]
        if q["type"] in ("matching", "multiple-choice"):
            q["answer"] = ans.upper() if "/" not in ans and len(ans) == 1 else ans.upper()
        else:
            q["answer"] = ans.lower()
    return part


def merge_parts(meta: dict, parts: dict[int, dict]) -> dict:
    audio = meta.get("audioFile", "listening.mp3")
    merged = []
    for spec in sorted(meta["parts"], key=lambda x: x["partNumber"]):
        p = copy.deepcopy(parts[spec["partNumber"]])
        if not p.get("audioFile"):
            p["audioFile"] = audio
        merged.append(p)
    return {
        "version": 1,
        "title": meta["title"],
        "durationMinutes": meta.get("durationMinutes", 30),
        "bandHint": meta["bandHint"],
        "examType": meta.get("examType", "ielts"),
        "examMode": meta.get("examMode", "practice"),
        "parts": merged,
    }


def write_test(folder: str, meta: dict, parts: dict[int, dict]) -> int:
    out = IELTS / folder
    out.mkdir(parents=True, exist_ok=True)
    clean_meta = {
        k: v for k, v in meta.items() if k != "folder"
    }
    clean_meta["parts"] = [
        {"partNumber": p["partNumber"], "template": p["template"], "file": p["file"]}
        for p in meta["parts"]
    ]
    (out / "meta.json").write_text(
        json.dumps(clean_meta, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    for spec in meta["parts"]:
        n = spec["partNumber"]
        (out / spec["file"]).write_text(
            json.dumps(parts[n], ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    exam = merge_parts(clean_meta, parts)
    (out / "exam.json").write_text(
        json.dumps(exam, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    total = sum(len(p["questions"]) for p in exam["parts"])
    print(f"  {folder}: {total} questions → exam.json")
    return total


# ── Cam9 Test 3 ──────────────────────────────────────────────────────────────

def cam9_t3_p1():
    return part(
        1, 1, 10,
        "Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Distance from beach:", "300", gapLead="just", gapTrail="metres from beach",
                sectionRange="Questions 1 – 5",
                sectionInstruction="Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer."),
            gap(2, "Facility:", "sunshade", gapLead=""),
            gap(3, "Facility:", "balcony", gapLead=""),
            gap(4, "Overlooking:", "forest", gapLead="overlooking"),
            gap(5, "Cost:", "319", gapLead="£"),
            gap(6, "Cancellation cover:", "10000", gapLead="£",
                sectionRange="Questions 6 – 10",
                sectionInstruction="Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer.",
                sectionTitle="GREEK ISLAND HOLIDAYS — Insurance Benefits"),
            gap(7, "Additional benefit:", "relative", gapLead="allows a", gapTrail="to travel to resort"),
            gap(8, "Missed departure:", "missed", gapLead=""),
            gap(9, "Personal belongings:", "item", gapLead="£500 for one"),
            gap(10, "Assistant Manager:", "ludlow", gapLead="Ben"),
        ],
        passageTitle="Greek Island Holidays",
        notePassageLayout="table",
        noteTables=[
            {
                "gapNumbers": [1, 2, 3, 4, 5],
                "instruction": "Questions 1 – 5\nComplete the table below. Write ONE WORD AND/OR A NUMBER for each answer.",
                "headers": ["Apartments", "Facilities", "Other Information", "Cost"],
                "rows": [
                    {"cells": [
                        [tbl_static("Rose Garden Apartments")],
                        [tbl_static("studio flat")],
                        [tbl_static("entertainment programme: Greek dancing")],
                        [tbl_static("£219")],
                    ]},
                    {"cells": [
                        [tbl_static("Blue Bay Apartments")],
                        [tbl_static("large salt-water swimming pool")],
                        [tbl_static("just "), tbl_gap(1), tbl_static(" metres from beach"),
                         tbl_break(), tbl_static("near shops")],
                        [tbl_static("£275")],
                    ]},
                    {"cells": [
                        [tbl_static("2 "), tbl_gap(2), tbl_static(" Apartments")],
                        [tbl_static("terrace")],
                        [tbl_static("watersports")],
                        [tbl_static("£490")],
                    ]},
                    {"cells": [
                        [tbl_static("The Grand")],
                        [tbl_static("Greek paintings")],
                        [tbl_static("overlooking "), tbl_gap(4), tbl_break(),
                         tbl_static("near a supermarket and a disco"), tbl_break(), tbl_gap(3)],
                        [tbl_static("5 £"), tbl_gap(5)],
                    ]},
                ],
            },
            {
                "gapNumbers": [6, 7, 8, 9, 10],
                "instruction": "Questions 6 – 10\nComplete the table below. Write ONE WORD AND/OR A NUMBER for each answer.",
                "sectionTitle": "Insurance Benefits",
                "headers": ["", "Maximum Amount"],
                "rows": [
                    {"cells": [
                        [tbl_static("Cancellation")],
                        [tbl_static("6 £"), tbl_gap(6)],
                    ]},
                    {"cells": [
                        [tbl_static("Hospital")],
                        [tbl_static("£600. Additional benefit allows a "), tbl_gap(7),
                         tbl_static(" to travel to resort")],
                    ]},
                    {"cells": [
                        [tbl_gap(8)],
                        [tbl_static("Up to £1000. Depends on reason")],
                    ]},
                    {"cells": [
                        [tbl_static("Personal belongings")],
                        [tbl_static("Up to £3000; £500 for one "), tbl_gap(9)],
                    ]},
                    {"cells": [
                        [tbl_static("Name of Assistant Manager: Ben "), tbl_gap(10)],
                        [tbl_static("Direct phone line: 081260 543216")],
                    ]},
                ],
            },
        ],
    )


def cam9_t3_p2():
    return patch_answers(load_template_part("ielts-listening-p2-a8-template.json"), {
        11: "C", 12: "A", 13: "C",
        14: "E", 15: "H", 16: "F", 17: "C", 18: "G",
        19: "120", 20: "5 to 12",
    })


def cam9_t3_p3():
    return patch_answers(load_template_part("ielts-listening-p3-c2-template.json"), {
        21: "fishing industry", 22: "statistics", 23: "note-taking",
        24: "confidence", 25: "ideas", 26: "student support",
        27: "places", 28: "general", 29: "3 times", 30: "25",
    })


def cam9_t3_p4():
    work_opts = [
        ("A", "advertising"), ("B", "animal care"), ("C", "building"),
        ("D", "educational links"), ("E", "engine maintenance"),
        ("F", "food and drink"), ("G", "sales"), ("H", "staffing"),
    ]
    return part(
        4, 31, 40,
        "Questions 31–32: Choose A, B or C. Questions 33–40: Complete the notes. "
        "Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            mc(31, "The owners of the underground house", [
                ("A", "had no experience of living in a rural area"),
                ("B", "were interested in environmental issues"),
                ("C", "wanted a professional project manager"),
            ], "B", sectionRange="Questions 31 – 32",
               sectionInstruction="Choose the correct letter A, B or C."),
            mc(32, "What does the speaker say about the site of the house?", [
                ("A", "The land was quite cheap"),
                ("B", "Stone was being extracted nearby"),
                ("C", "It was in a completely unspoilt area"),
            ], "A"),
            gap(33, "Constructed of two layers of:", "glass", word_limit=1,
                gapLead="The south-facing side was constructed of two layers of",
                sectionRange="Questions 33 – 40",
                sectionInstruction="Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
                sectionTitle="The Underground House"),
            gap(34, "Improve the:", "insulation", word_limit=1,
                gapLead="A layer of foam was used to improve the", gapTrail="of the building"),
            gap(35, "Internal mirrors and:", "windows", word_limit=1,
                gapLead="To increase the light, the building has many internal mirrors and"),
            gap(36, "Produce more:", "electricity", word_limit=1,
                gapLead="In future, the house may produce more", gapTrail="than it needs"),
            gap(37, "Recycled wood for the:", "floor", word_limit=1,
                gapLead="Recycled wood was used for the", gapTrail="of the house"),
            gap(38, "Processing domestic:", "waste", word_limit=1,
                gapLead="The system for processing domestic"),
            gap(39, "Large quantities of:", "concrete", word_limit=1,
                gapLead="The use of large quantities of", gapTrail="in construction was environmentally harmful"),
            gap(40, "Within:", "15 years", word_limit=2,
                gapLead="But the house will have paid its 'environmental debt' within"),
        ],
        passageTitle="The Underground House",
        notePassage=[
            np_section("Design"),
            np_static("Built in the earth, with two floors"),
            np_static("The south-facing side was constructed of two layers of"), np_gap(33),
            np_static("Photovoltaic tiles were attached"),
            np_static("A layer of foam was used to improve the"), np_gap(34), np_static("of the building"),
            np_section("Special features"),
            np_static("To increase the light, the building has many internal mirrors and"), np_gap(35),
            np_static("In future, the house may produce more"), np_gap(36), np_static("than it needs"),
            np_static("Recycled wood was used for the"), np_gap(37), np_static("of the house"),
            np_static("The system for processing domestic"), np_gap(38), np_static("is organic"),
            np_section("Environmental issues"),
            np_static("The use of large quantities of"), np_gap(39),
            np_static("in construction was environmentally harmful"),
            np_static("But the house will have paid its 'environmental debt' within"), np_gap(40),
        ],
    )


# ── Cam9 Test 4 ──────────────────────────────────────────────────────────────

def cam9_t4_p1():
    free_opts = [
        ("A", "acupuncture"), ("B", "employment medicals"), ("C", "sports injury therapy"),
        ("D", "travel advice"), ("E", "vaccinations"),
    ]
    p = load_template_part("ielts-listening-p1-mixed-a4.json")
    patch_answers(p, {
        1: "babies", 2: "eshcol", 3: "evening", 4: "gormley",
        5: "B/E", 6: "B/E",
        7: "heart", 8: "primary school", 9: "4.30", 10: "ages",
    })
    for q in p["questions"]:
        if q["number"] in (5, 6):
            q["answer"] = "B/E"
    return p


def cam9_t4_p2():
    return patch_answers(load_template_part("ielts-listening-p2-a9-template.json"), {
        11: "B", 12: "C", 13: "E",
        14: "B", 15: "E", 16: "D", 17: "A", 18: "C",
        19: "732281", 20: "thursday",
    })


def cam9_t4_p3():
    return patch_answers(load_template_part("ielts-listening-p3-c1-template.json"), {
        21: "A", 22: "C",
        23: "approach", 24: "mature", 25: "interest",
        26: "groups", 27: "every 2 days", 28: "2 weeks",
        29: "confident", 30: "education system",
    })


def cam9_t4_p4():
    return part(
        4, 31, 40,
        "Questions 31–36: Choose A, B or C. Questions 37–40: Complete the table. Write ONE WORD ONLY for each answer.",
        [
            mc(31, "What led the group to choose their topic?", [
                ("A", "They were concerned about the decline of one species"),
                ("B", "They were interested in the effects of city growth"),
                ("C", "They wanted to investigate a recent phenomenon"),
            ], "C", sectionRange="Questions 31 – 36",
               sectionInstruction="Choose the correct letter A, B or C.",
               sectionTitle="Wildlife in city gardens"),
            mc(32, "The exact proportion of land devoted to private gardens was confirmed by", [
                ("A", "consulting some official documents"),
                ("B", "taking large-scale photos"),
                ("C", "discussions with town surveyors"),
            ], "A"),
            mc(33, "The group asked garden owners to", [
                ("A", "take part in formal interviews"),
                ("B", "keep a record of animals they saw"),
                ("C", "get in contact when they saw a rare species"),
            ], "B"),
            mc(34, "The group made their observations in gardens", [
                ("A", "which had a large number of animal species"),
                ("B", "which they considered to be representative"),
                ("C", "which had stable populations of rare animals"),
            ], "B"),
            mc(35, "The group did extensive reading on", [
                ("A", "wildlife problems in rural areas"),
                ("B", "urban animal populations"),
                ("C", "current gardening practices"),
            ], "A"),
            mc(36, "The speaker focuses on three animal species because", [
                ("A", "a lot of data has been obtained about them"),
                ("B", "the group were most interested in them"),
                ("C", "they best indicated general trends"),
            ], "C"),
            gap(37, "Frogs:", "frog", word_limit=1,
                sectionRange="Questions 37 – 40",
                sectionInstruction="Complete the table below. Write ONE WORD ONLY for each answer."),
            gap(38, "Safer from:", "predators", word_limit=1),
            gap(39, "Easy to:", "count", word_limit=1),
            gap(40, "Variety of:", "seed", word_limit=1),
        ],
        notePassageLayout="table",
        noteTable={
            "headers": ["Animals", "Reason for population increase in gardens", "Comments"],
            "rows": [
                {"cells": [
                    [tbl_gap(37)],
                    [tbl_static("suitable stretches of water")],
                    [tbl_static("massive increase in urban population")],
                ]},
                {"cells": [
                    [tbl_static("Hedgehogs")],
                    [tbl_static("safer from "), tbl_gap(38)],
                    [tbl_static("easy to "), tbl_gap(39), tbl_static(" them accurately")],
                ]},
                {"cells": [
                    [tbl_static("Song thrushes")],
                    [tbl_static("a variety of "), tbl_gap(40), tbl_static(" to eat")],
                    [tbl_static("more nesting places available")],
                ]},
            ],
        },
    )


# ── Cam10 Test 1 ─────────────────────────────────────────────────────────────

def cam10_t1_p1():
    return part(
        1, 1, 10,
        "Questions 1–6: Complete the notes below. Write ONE WORD for each answer. "
        "Questions 7–10: Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Address:", "ardleigh", word_limit=1, gapLead="Address: 24",
                sectionRange="Questions 1 – 6",
                sectionInstruction="Complete the notes below. Write ONE WORD for each answer.",
                sectionTitle="SELF-DRIVE TOURS IN THE USA"),
            gap(2, "Heard about company from:", "newspaper", word_limit=1),
            gap(3, "Theme parks:", "theme", word_limit=1,
                gapLead="customer wants to visit some", gapTrail="parks with her children"),
            gap(4, "Not a:", "tent", word_limit=1,
                gapLead="customer wants to stay in a lodge, not a"),
            gap(5, "See the:", "castle", word_limit=1,
                gapLead="Customer wants to see the", gapTrail="on the way to Cambria"),
            gap(6, "Spend time on the:", "beach", word_limit=1,
                gapLead="At San Diego, wants to spend time on the"),
            gap(7, "Total distance:", "2020", word_limit=1,
                sectionRange="Questions 7 – 10",
                sectionInstruction="Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer."),
            gap(8, "Includes:", "flight", word_limit=1),
            gap(9, "Price:", "429", word_limit=1, gapLead="£"),
            gap(10, "Includes:", "dinner", word_limit=1),
        ],
        passageTitle="Self-drive tours in the USA",
        notePassageLayout="form",
        notePassageSections=[
            {
                "gapNumbers": [1, 2, 3, 4, 5, 6],
                "instruction": "Questions 1 – 6\nComplete the notes below. Write ONE WORD for each answer.",
                "title": "SELF-DRIVE TOURS IN THE USA",
                "blocks": [
                    np_static("Example\nName: Andrea …Brown…"),
                    np_static("Address: 24"), np_gap(1), np_static("Road"),
                    np_static("Heard about company from:"), np_gap(2),
                    np_section("Trip One"),
                    np_static("Los Angeles: customer wants to visit some"), np_gap(3),
                    np_static("parks with her children"),
                    np_static("Yosemite Park: customer wants to stay in a lodge, not a"), np_gap(4),
                    np_section("Trip Two"),
                    np_static("Customer wants to see the"), np_gap(5), np_static("on the way to Cambria"),
                    np_static("At San Diego, wants to spend time on the"), np_gap(6),
                ],
            },
        ],
        noteTables=[{
            "gapNumbers": [7, 8, 9, 10],
            "instruction": "Questions 7 – 10\nComplete the table below. Write ONE WORD AND/OR A NUMBER for each answer.",
            "headers": ["", "Number of days", "Total distance", "Price (per person)", "Includes"],
            "rows": [
                {"cells": [
                    [tbl_static("Trip One")], [tbl_static("12 days")],
                    [tbl_static("7 "), tbl_gap(7), tbl_static(" km")],
                    [tbl_static("£525")],
                    [tbl_static("accommodation, car, one "), tbl_gap(8)],
                ]},
                {"cells": [
                    [tbl_static("Trip Two")], [tbl_static("9 days")], [tbl_static("980 km")],
                    [tbl_static("9 £"), tbl_gap(9)],
                    [tbl_static("accommodation, car, "), tbl_gap(10)],
                ]},
            ],
        }],
    )


def cam10_t1_p2():
    facilities_opts = [
        ("A", "the gym"), ("B", "the tracks"), ("C", "the indoor pool"),
        ("D", "the outdoor pool"), ("E", "the sports training for children"),
    ]
    choose_prompt = "Which TWO facilities at the leisure club have recently been improved?"
    return part(
        2, 11, 20,
        "Questions 11–12: Choose TWO letters A–E. Questions 13–20: Complete the notes. "
        "Write NO MORE THAN TWO WORDS for each answer.",
        [
            *choose_two(11, 12, choose_prompt, facilities_opts, "A/C", "Hồ bơi trong (C) và ngoài (A).",
                        sectionRange="Questions 11 – 12",
                        sectionInstruction="Choose TWO letters, A–E."),
            gap(13, "Health problems:", "health problems", word_limit=2,
                sectionRange="Questions 13 – 20",
                sectionInstruction="Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.",
                sectionTitle="Joining the leisure club"),
            gap(14, "Safety rules:", "safety rules", word_limit=2),
            gap(15, "Six-week:", "plan", word_limit=1),
            gap(16, "Compulsory fee:", "joining", word_limit=1),
            gap(17, "Gold members:", "free entry", word_limit=2),
            gap(18, "Priority during:", "peak", word_limit=1),
            gap(19, "Bring guests:", "guests", word_limit=1),
            gap(20, "Take:", "photo card", word_limit=2),
        ],
        passageTitle="Leisure club",
        notePassage=[
            np_section("Personal Assessment"),
            np_static("New members should describe any"), np_gap(13),
            np_static("The"), np_gap(14), np_static("will be explained to you before you use the equipment"),
            np_static("You will be given a six-week"), np_gap(15),
            np_section("Types of membership"),
            np_static("There is a compulsory £90"), np_gap(16), np_static("fee for members"),
            np_static("Gold members are given"), np_gap(17), np_static("to all the LP clubs"),
            np_static("Premier members are given priority during"), np_gap(18), np_static("hours"),
            np_static("Premier members can bring some"), np_gap(19), np_static("every month"),
            np_static("Members should always take their"), np_gap(20), np_static("with them"),
        ],
    )


def cam10_t1_p3():
    return part(
        3, 21, 30,
        "Questions 21–25: Choose A, B or C. Questions 26–30: Complete the notes. Write ONE WORD ONLY for each answer.",
        [
            mc(21, "Students entering the design competition have to", [
                ("A", "produce an energy-efficient design"),
                ("B", "adapt an existing energy-saving appliance"),
                ("C", "develop a new use for current technology"),
            ], "C", sectionRange="Questions 21 – 25",
               sectionInstruction="Choose the correct letter A, B or C.",
               sectionTitle="Global Design Competition"),
            mc(22, "John chose a dishwasher because he wanted to make dishwashers", [
                ("A", "more appealing"), ("B", "more common"), ("C", "more economical"),
            ], "A"),
            mc(23, "The stone in John's 'Rockpool' design is used", [
                ("A", "for decoration"), ("B", "to switch it on"), ("C", "to stop water escaping"),
            ], "B"),
            mc(24, "In the holding chamber, the carbon dioxide", [
                ("A", "changes back to a gas"), ("B", "dries the dishes"), ("C", "is allowed to cool"),
            ], "A"),
            mc(25, "At the end of the cleaning process, the carbon dioxide", [
                ("A", "is released into the air"), ("B", "is disposed of with the waste"),
                ("C", "is collected ready to be re-used"),
            ], "C"),
            gap(26, "Prepare for:", "presentation", word_limit=1,
                sectionRange="Questions 26 – 30",
                sectionInstruction="Complete the notes below. Write ONE WORD ONLY for each answer."),
            gap(27, "Make a:", "model", word_limit=1),
            gap(28, "Good quality:", "material", word_limit=1),
            gap(29, "Apply for a:", "grant", word_limit=1),
            gap(30, "Check:", "technical", word_limit=1,
                gapLead="The professor will check the", gapTrail="information in John's written report"),
        ],
        notePassage=[
            np_static("John needs help preparing for his"), np_gap(26),
            np_static("The professor advises John to make a"), np_gap(27), np_static("of his design"),
            np_static("John's main problem is getting good quality"), np_gap(28),
            np_static("The professor suggests John apply for a"), np_gap(29),
            np_static("The professor will check the"), np_gap(30),
            np_static("information in John's written report"),
        ],
    )


def cam10_t1_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "Uncommon:", "gene", word_limit=1, gapLead="Its colour comes from an uncommon",
                sectionTitle="THE SPIRIT BEAR"),
            gap(32, "Unusual:", "power", word_limit=1,
                gapLead="Local people believe that it has unusual"),
            gap(33, "Protect from:", "strangers", word_limit=1,
                gapLead="They protect the bear from"),
            gap(34, "Stop:", "erosion", word_limit=1,
                gapLead="Tree roots stop", gapTrail="along salmon streams"),
            gap(35, "Found on:", "islands", word_limit=1,
                gapLead="It is currently found on a small number of"),
            gap(36, "Construction of:", "roads", word_limit=1,
                gapLead="Habitat is being lost due to deforestation and construction of"),
            gap(37, "Unrestricted:", "fishing", word_limit=1,
                gapLead="Unrestricted", gapTrail="is affecting the salmon supply"),
            gap(38, "Low rate of:", "reproduction", word_limit=1,
                gapLead="The bears' existence is also threatened by their low rate of"),
            gap(39, "Improve:", "method", word_limit=1,
                gapLead="Logging companies must improve their", gapTrail="of logging"),
            gap(40, "Maintenance and:", "expansion", word_limit=1,
                gapLead="Maintenance and", gapTrail="of the spirit bears' territory is needed"),
        ],
        passageTitle="The Spirit Bear",
        notePassage=[
            np_section("General facts"),
            np_static("It is a white bear belonging to the black bear family"),
            np_static("Its colour comes from an uncommon"), np_gap(31),
            np_static("Local people believe that it has unusual"), np_gap(32),
            np_static("They protect the bear from"), np_gap(33),
            np_section("Habitat"),
            np_static("Tree roots stop"), np_gap(34), np_static("along salmon streams"),
            np_static("It is currently found on a small number of"), np_gap(35),
            np_section("Threats"),
            np_static("Habitat is being lost due to deforestation and construction of"), np_gap(36),
            np_static("Unrestricted"), np_gap(37), np_static("is affecting the salmon supply"),
            np_static("The bears' existence is also threatened by their low rate of"), np_gap(38),
            np_section("Going forward"),
            np_static("Logging companies must improve their"), np_gap(39), np_static("of logging"),
            np_static("Maintenance and"), np_gap(40), np_static("of the spirit bears' territory is needed"),
        ],
    )


# ── Cam10 Test 2 ─────────────────────────────────────────────────────────────

def cam10_t2_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Name:", "hardie", word_limit=1, gapLead="Name: Luisa",
                sectionTitle="Transport Survey"),
            gap(2, "Address number:", "19", word_limit=1, gapLead="Address:"),
            gap(3, "Postcode:", "gt82lc", word_limit=1),
            gap(4, "Occupation:", "hairdresser", word_limit=1),
            gap(5, "Visit town for:", "dentist", word_limit=1,
                gapLead="Reason for visit to town: to go to the"),
            gap(6, "Better:", "lighting", word_limit=1),
            gap(7, "More frequent:", "trains", word_limit=1),
            gap(8, "Parking:", "safe", word_limit=1,
                gapLead="having", gapTrail="parking places for bicycles"),
            gap(9, "Use a:", "shower", word_limit=1,
                gapLead="being able to use a", gapTrail="at work"),
            gap(10, "Cycling:", "training", word_limit=1,
                gapLead="the opportunity to have cycling", gapTrail="on busy roads"),
        ],
        passageTitle="Transport Survey",
        notePassageLayout="form",
        notePassage=[
            np_static("Example\nTravelled to town today: by bus"),
            np_static("Name: Luisa"), np_gap(1),
            np_static("Address:"), np_gap(2), np_static("White Stone Rd"),
            np_static("Postcode:"), np_gap(3),
            np_static("Occupation:"), np_gap(4),
            np_static("Reason for visit to town: to go to the"), np_gap(5),
            np_section("Suggestions for improvement"),
            np_static("better"), np_gap(6),
            np_static("have more footpaths"),
            np_static("more frequent"), np_gap(7),
            np_section("Things that would encourage cycling to work"),
            np_static("having"), np_gap(8), np_static("parking places for bicycles"),
            np_static("being able to use a"), np_gap(9), np_static("at work"),
            np_static("the opportunity to have cycling"), np_gap(10), np_static("on busy roads"),
        ],
    )


def cam10_t2_p2():
    feat_opts = [
        ("A", "ancient forts"), ("B", "waterways"), ("C", "ice and snow"),
        ("D", "jewels"), ("E", "local animals"), ("F", "mountains"),
        ("G", "music and film"), ("H", "space travel"), ("I", "volcanoes"),
    ]
    return part(
        2, 11, 20,
        "Questions 11–14: Choose A, B or C. Questions 15–20: Matching A–I.",
        [
            mc(11, "The idea for the two new developments in the city came from", [
                ("A", "local people"), ("B", "the City Council"), ("C", "the SWRDC"),
            ], "A", sectionRange="Questions 11 – 14",
               sectionInstruction="Choose the correct letter A, B or C.",
               sectionTitle="New city developments"),
            mc(12, "What is unusual about Brackenside pool?", [
                ("A", "its architectural style"), ("B", "its heating system"), ("C", "its method of water treatment"),
            ], "C"),
            mc(13, "Local newspapers have raised worries about", [
                ("A", "the late opening date"), ("B", "the cost of the project"), ("C", "the size of the facilities"),
            ], "C"),
            mc(14, "What decision has not yet been made about the pool?", [
                ("A", "whose statue will be at the door"), ("B", "the exact opening times"), ("C", "who will open it"),
            ], "A"),
            match(15, "Asia", list("ABCDEFGHI"), "E", labeled=feat_opts,
                  sectionRange="Questions 15 – 20",
                  sectionInstruction="Which feature is related to each area of the world? Choose SIX answers A–I.",
                  sectionTitle="Playground areas"),
            match(16, "Antarctica", list("ABCDEFGHI"), "F", labeled=feat_opts),
            match(17, "South America", list("ABCDEFGHI"), "G", labeled=feat_opts),
            match(18, "North America", list("ABCDEFGHI"), "H", labeled=feat_opts),
            match(19, "Europe", list("ABCDEFGHI"), "A", labeled=feat_opts),
            match(20, "Africa", list("ABCDEFGHI"), "B", labeled=feat_opts),
        ],
    )


def cam10_t2_p3():
    p = load_template_part("ielts-listening-p3-c3-template.json")
    patch_answers(p, {
        21: "B/C", 22: "B/C", 23: "B/E", 24: "B/E",
        25: "A", 26: "C", 27: "C", 28: "A", 29: "B", 30: "A",
    })
    for q in p["questions"]:
        if q["number"] in (21, 22):
            q["answer"] = "B/C"
        if q["number"] in (23, 24):
            q["answer"] = "B/E"
    return p


def cam10_t2_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "Greater:", "competition", word_limit=1,
                gapLead="greater", gapTrail="among companies", sectionTitle="THE FUTURE OF MANAGEMENT"),
            gap(32, "Large:", "global", word_limit=1,
                gapLead="increase in power of large", gapTrail="companies"),
            gap(33, "Rising:", "demand", word_limit=1, gapLead="rising", gapTrail="in certain countries"),
            gap(34, "Discussion with:", "customers", word_limit=1,
                gapLead="more discussion with", gapTrail="before making business decisions"),
            gap(35, "More:", "regulation", word_limit=1,
                gapLead="environmental concerns which may lead to more"),
            gap(36, "Particular:", "project", word_limit=1,
                gapLead="more teams will be formed to work on a particular"),
            gap(37, "Hours that are:", "flexible", word_limit=1,
                gapLead="businesses may need to offer hours that are"),
            gap(38, "Provide good:", "leadership", word_limit=1,
                gapLead="increasing need for managers to provide good"),
            gap(39, "Influenced by:", "women", word_limit=1,
                gapLead="changes influenced by", gapTrail="taking senior roles"),
            gap(40, "More:", "self-employed", word_limit=1,
                gapLead="more and more", gapTrail="workers"),
        ],
        passageTitle="The Future of Management",
        notePassage=[
            np_section("Business markets"),
            np_static("greater"), np_gap(31), np_static("among companies"),
            np_static("increase in power of large"), np_gap(32), np_static("companies"),
            np_static("rising"), np_gap(33), np_static("in certain countries"),
            np_section("External influences on businesses"),
            np_static("more discussion with"), np_gap(34), np_static("before making business decisions"),
            np_static("environmental concerns which may lead to more"), np_gap(35),
            np_section("Business structures"),
            np_static("more teams will be formed to work on a particular"), np_gap(36),
            np_static("businesses may need to offer hours that are"), np_gap(37),
            np_static(", or the chance to work remotely"),
            np_section("Management styles"),
            np_static("increasing need for managers to provide good"), np_gap(38),
            np_static("changes influenced by"), np_gap(39), np_static("taking senior roles"),
            np_section("Changes in the economy"),
            np_static("more and more"), np_gap(40), np_static("workers"),
        ],
    )


# ── Cam10 Test 3 ─────────────────────────────────────────────────────────────

def cam10_t3_p1():
    return part(
        1, 1, 10,
        "Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Age:", "4", word_limit=1, gapLead="Age:",
                sectionTitle="Early Learning Childcare Centre — Enrolment Form"),
            gap(2, "Address:", "46 wombat", word_limit=2, gapLead="Address:"),
            gap(3, "Days:", "thursday", word_limit=1, gapLead="Monday and"),
            gap(4, "Start time:", "8.30", word_limit=1),
            gap(5, "Group:", "red", word_limit=1, gapLead="the", gapTrail="group"),
            gap(6, "Meals:", "lunch", word_limit=1),
            gap(7, "Needs:", "glasses", word_limit=1, gapLead="needs"),
            gap(8, "Emergency contact:", "ball", word_limit=1, gapLead="Jenny"),
            gap(9, "Relationship:", "aunt", word_limit=1),
            gap(10, "Pay each:", "month", word_limit=1, gapLead="Will pay each"),
        ],
        notePassageLayout="form",
        notePassage=[
            np_static("Example\nParent or guardian: Carol …Smith…"),
            np_section("Personal Details"),
            np_static("Child's name: Kate"),
            np_static("Age:"), np_gap(1),
            np_static("Address:"), np_gap(2), np_static("Road, Woodside, 4032"),
            np_section("Childcare Information"),
            np_static("Days enrolled for: Monday and"), np_gap(3),
            np_static("Start time:"), np_gap(4), np_static("am"),
            np_static("Childcare group: the"), np_gap(5), np_static("group"),
            np_static("Which meal/s are required each day?"), np_gap(6),
            np_static("Medical conditions: needs"), np_gap(7),
            np_static("Emergency contact: Jenny"), np_gap(8), np_static("Phone: 3346 7523"),
            np_static("Relationship to child:"), np_gap(9),
            np_section("Fees"),
            np_static("Will pay each"), np_gap(10),
        ],
    )


def cam10_t3_p2():
    trust_opts = [
        ("A", "Children make up most of the membership"),
        ("B", "It's the country's largest conservation organisation"),
        ("C", "It helps finance campaigns for changes in fishing practices"),
        ("D", "It employs several dolphin experts full-time"),
        ("E", "Volunteers help in various ways"),
    ]
    dolphin_opts = [
        ("A", "Moondancer"), ("B", "Echo"), ("C", "Kiwi"), ("D", "Samson"),
    ]
    return part(
        2, 11, 20,
        "Questions 11–12: Choose TWO A–E. Questions 13–15: Choose A, B or C. "
        "Questions 16–20: Matching A–D.",
        [
            *choose_two(11, 12,
                        "Which TWO things does Alice say about the Dolphin Conservation Trust?",
                        trust_opts, "C/E", "Chiến dịch đánh bắt (C) và tình nguyện (E).",
                        sectionRange="Questions 11 – 12",
                        sectionInstruction="Choose TWO letters, A–E."),
            mc(13, "Why is Alice so pleased the Trust has won the Charity Commission award?", [
                ("A", "It has brought in extra money"),
                ("B", "It made the work of the trust better known"),
                ("C", "It has attracted more members"),
            ], "B", sectionRange="Questions 13 – 15",
               sectionInstruction="Choose the correct letter A, B or C."),
            mc(14, "Alice says oil exploration causes problems to dolphins because of", [
                ("A", "noise"), ("B", "oil leaks"), ("C", "movement of ships"),
            ], "A"),
            mc(15, "Alice became interested in dolphins when", [
                ("A", "she saw one swimming near her home"),
                ("B", "she heard a speaker at her school"),
                ("C", "she read a book about them"),
            ], "C"),
            match(16, "It has not been seen this year", list("ABCD"), "D", labeled=dolphin_opts,
                  sectionRange="Questions 16 – 20",
                  sectionInstruction="Which dolphin does Alice make each comment about? Write A–D.",
                  sectionTitle="Dolphins"),
            match(17, "It is photographed more than the others", list("ABCD"), "B", labeled=dolphin_opts),
            match(18, "It is always very energetic", list("ABCD"), "C", labeled=dolphin_opts),
            match(19, "It is the newest one in the scheme", list("ABCD"), "A", labeled=dolphin_opts),
            match(20, "It has an unusual shape", list("ABCD"), "C", labeled=dolphin_opts),
        ],
    )


def cam10_t3_p3():
    return patch_answers(load_template_part("ielts-listening-p3-c4-template.json"), {
        21: "C", 22: "A", 23: "A", 24: "B", 25: "B",
        26: "C", 27: "D", 28: "A", 29: "G", 30: "C",
    })


def cam10_t3_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "Focus on:", "achievement", word_limit=1,
                gapLead="Promotion goals focus on", sectionTitle="Self-regulatory focus theory and leadership"),
            gap(32, "Comes from one's:", "personality", word_limit=1,
                gapLead="comes from one's"),
            gap(33, "Factor:", "situational", word_limit=1),
            gap(34, "With a:", "friend", word_limit=1,
                gapLead="we are more likely to focus on promotion goals when with a"),
            gap(35, "Their:", "aspirations", word_limit=1,
                gapLead="People think about an ideal version of themselves, their"),
            gap(36, "Behaviour and:", "style", word_limit=1,
                gapLead="Leadership behaviour and", gapTrail="affects people's focus"),
            gap(37, "Special attention to the:", "development", word_limit=1,
                gapLead="pay special attention to the", gapTrail="of their followers"),
            gap(38, "Communicate a clear:", "vision", word_limit=1,
                gapLead="passionately communicate a clear"),
            gap(39, "Create:", "structures", word_limit=1,
                gapLead="Transactional Leaders: create", gapTrail="to make expectations clear"),
            gap(40, "Jobs requiring:", "innovation", word_limit=1,
                gapLead="Promotion Focus is good for jobs requiring"),
        ],
        passageTitle="Self-regulatory focus theory and leadership",
        notePassage=[
            np_section("Self-regulatory focus theory"),
            np_static("Promotion goals focus on"), np_gap(31),
            np_section("Factors that affect people's focus"),
            np_static("The Chronic Factor — comes from one's"), np_gap(32),
            np_static("The"), np_gap(33), np_static("Factor"),
            np_static("we are more likely to focus on promotion goals when with a"), np_gap(34),
            np_section("How people's focus affects them"),
            np_static("Promotion Focus: People think about an ideal version of themselves, their"),
            np_gap(35), np_static("and their gains"),
            np_section("Leaders"),
            np_static("Leadership behaviour and"), np_gap(36), np_static("affects people's focus"),
            np_static("Transformational Leaders: pay special attention to the"), np_gap(37),
            np_static("of their followers"),
            np_static("passionately communicate a clear"), np_gap(38),
            np_static("Transactional Leaders: create"), np_gap(39),
            np_static("to make expectations clear"),
            np_static("Promotion Focus is good for jobs requiring"), np_gap(40),
        ],
    )


# ── Cam10 Test 4 ─────────────────────────────────────────────────────────────

def cam10_t4_p1():
    return part(
        1, 1, 10,
        "Questions 1–6: Complete the notes below. Write ONE WORD ONLY for each answer. "
        "Questions 7–10: Complete the table below. Write ONE WORD ONLY for each answer.",
        [
            gap(1, "Name:", "pargetter", word_limit=1, gapLead="Name: Edith",
                sectionRange="Questions 1 – 6",
                sectionInstruction="Complete the notes below. Write ONE WORD ONLY for each answer.",
                sectionTitle="THORNDYKE'S BUILDERS"),
            gap(2, "Park Flats area:", "east", word_limit=1, gapLead="Flat 4,"),
            gap(3, "Behind the:", "library", word_limit=1, gapLead="Behind the"),
            gap(4, "Best time:", "mornings", word_limit=1, gapLead="during the"),
            gap(5, "Next to:", "postbox", word_limit=1,
                gapLead="opposite entrance next to the"),
            gap(6, "Show all:", "prices", word_limit=1,
                gapLead="Needs full quote showing all the jobs and the"),
            gap(7, "Replace:", "glass", word_limit=1,
                sectionRange="Questions 7 – 10",
                sectionInstruction="Complete the table below. Write ONE WORD ONLY for each answer."),
            gap(8, "Above the:", "cooker", word_limit=1, gapLead="Paint wall above the"),
            gap(9, "Approximately one:", "week", word_limit=1),
            gap(10, "Replace:", "fence", word_limit=1, gapLead="One", gapTrail="needs replacing (end of garden)"),
        ],
        notePassageSections=[{
            "gapNumbers": [1, 2, 3, 4, 5, 6],
            "instruction": "Questions 1 – 6\nComplete the notes below. Write ONE WORD ONLY for each answer.",
            "title": "THORNDYKE'S BUILDERS",
            "blocks": [
                np_static("Example\nCustomer heard about Thorndyke's from a friend"),
                np_static("Name: Edith"), np_gap(1),
                np_static("Address: Flat 4,"), np_gap(2), np_static("Park Flats"),
                np_static("(Behind the"), np_gap(3), np_static(")"),
                np_static("Best time to contact customer: during the"), np_gap(4),
                np_static("Where to park: opposite entrance next to the"), np_gap(5),
                np_static("Needs full quote showing all the jobs and the"), np_gap(6),
            ],
        }],
        notePassageLayout="form",
        noteTables=[{
            "gapNumbers": [7, 8, 9, 10],
            "instruction": "Questions 7 – 10\nComplete the table below. Write ONE WORD ONLY for each answer.",
            "headers": ["Area", "Work to be done", "Notes"],
            "rows": [
                {"cells": [
                    [tbl_static("Kitchen")],
                    [tbl_static("Replace the "), tbl_gap(7), tbl_static(" in the door")],
                    [tbl_static("Fix tomorrow")],
                ]},
                {"cells": [
                    [tbl_static("Kitchen")],
                    [tbl_static("Paint wall above the "), tbl_gap(8)],
                    [tbl_static("Strip paint and plaster approximately one "), tbl_gap(9),
                     tbl_static(" in advance")],
                ]},
                {"cells": [
                    [tbl_static("Garden")],
                    [tbl_static("One "), tbl_gap(10), tbl_static(" needs replacing (end of garden)")],
                    [tbl_static("")],
                ]},
            ],
        }],
    )


def cam10_t4_p2():
    return part(
        2, 11, 20,
        "Questions 11–15: Choose A, B or C. Questions 16–20: Complete the table. Write NO MORE THAN TWO WORDS for each answer.",
        [
            mc(11, "Why did a port originally develop at Manham?", [
                ("A", "It was safe from enemy attack"),
                ("B", "It was convenient for river transport"),
                ("C", "It had a good position on the sea coast"),
            ], "B", sectionRange="Questions 11 – 15",
               sectionInstruction="Choose the correct letter A, B or C.",
               sectionTitle="MANHAM PORT"),
            mc(12, "What caused Manham's sudden expansion during the Industrial Revolution?", [
                ("A", "the improvement in mining techniques"),
                ("B", "the increase in demand for metals"),
                ("C", "the discovery of tin in the area"),
            ], "B"),
            mc(13, "Why did rocks have to be sent away from Manham to be processed?", [
                ("A", "shortage of fuel"), ("B", "poor transport systems"), ("C", "lack of skills among local people"),
            ], "A"),
            mc(14, "What happened when the port declined in the twentieth century?", [
                ("A", "The workers went away"), ("B", "Traditional skills were lost"),
                ("C", "Buildings were used for new purposes"),
            ], "A"),
            mc(15, "What did the Manham Trust hope to do?", [
                ("A", "discover the location of the original port"),
                ("B", "provide jobs for the unemployed"),
                ("C", "rebuild the port complex"),
            ], "C"),
            gap(16, "Take visitors into:", "trains", word_limit=2,
                sectionRange="Questions 16 – 20",
                sectionInstruction="Complete the table below. Write NO MORE THAN TWO WORDS for each answer.",
                sectionTitle="Tourist attractions in Manham"),
            gap(17, "Mine is:", "dark", word_limit=1),
            gap(18, "Exhibition of:", "games", word_limit=1),
            gap(19, "Recommended:", "guided tour", word_limit=2),
            gap(20, "Children shouldn't use the:", "ladder", word_limit=1),
        ],
        notePassageLayout="table",
        noteTables=[{
            "gapNumbers": [16, 17, 18, 19, 20],
            "instruction": "Questions 16 – 20\nComplete the table below. Write NO MORE THAN TWO WORDS for each answer.",
            "headers": ["Place", "Features and activities", "Advice"],
            "rows": [
                {"cells": [
                    [tbl_static("Copper mine")],
                    [tbl_static("specially adapted miners' "), tbl_gap(16),
                     tbl_static(" take visitors into the mountain")],
                    [tbl_static("the mine is "), tbl_gap(17),
                     tbl_static(" and enclosed — unsuitable for children and animals")],
                ]},
                {"cells": [
                    [tbl_static("Village school")],
                    [tbl_static("classrooms and a special exhibition of "), tbl_gap(18)],
                    [tbl_static("a "), tbl_gap(19), tbl_static(" is recommended")],
                ]},
                {"cells": [
                    [tbl_static("The George (old sailing ship)")],
                    [tbl_static("the ship's wheel (was lost but has now been restored)")],
                    [tbl_static("children shouldn't use the "), tbl_gap(20)],
                ]},
            ],
        }],
    )


def cam10_t4_p3():
    p = load_template_part("ielts-listening-p3-c5-template.json")
    patch_answers(p, {
        21: "A/E", 22: "A/E", 23: "B/C", 24: "B/C",
        25: "D", 26: "F", 27: "G", 28: "B", 29: "E", 30: "C",
    })
    for q in p["questions"]:
        if q["number"] in (21, 22):
            q["answer"] = "A/E"
        if q["number"] in (23, 24):
            q["answer"] = "B/C"
    return p


def cam10_t4_p4():
    return part(
        4, 31, 40,
        "Questions 31–33: Choose A, B or C. Questions 34–40: Complete the notes. Write ONE WORD ONLY for each answer.",
        [
            mc(31, "One problem with nanotechnology is that", [
                ("A", "it could threaten our way of life"),
                ("B", "it could be used to spy on people"),
                ("C", "it is misunderstood by the public"),
            ], "C", sectionRange="Questions 31 – 33",
               sectionInstruction="Choose the correct letter A, B or C.",
               sectionTitle="Nanotechnology"),
            mc(32, "Some scientists believe that nano-particles", [
                ("A", "should be restricted to secure environments"),
                ("B", "should be used with more caution"),
                ("C", "should only be developed for essential products"),
            ], "B"),
            mc(33, "In the speaker's opinion, research into nanotechnology", [
                ("A", "has yet to win popular support"),
                ("B", "could be seen as unethical"),
                ("C", "ought to be continued"),
            ], "C"),
            gap(34, "Stronger:", "metal", word_limit=1,
                sectionRange="Questions 34 – 40",
                sectionInstruction="Complete the notes below. Write ONE WORD ONLY for each answer.",
                sectionTitle="Uses of Nanotechnology"),
            gap(35, "Travel:", "space", word_limit=1),
            gap(36, "Greater:", "memory", word_limit=1),
            gap(37, "Energy:", "solar", word_limit=1),
            gap(38, "Pollutants such as:", "oil", word_limit=1),
            gap(39, "No:", "waste", word_limit=1,
                gapLead="There will be no", gapTrail="from manufacturing"),
            gap(40, "Medical:", "tests", word_limit=1,
                gapLead="Analysis of medical"),
        ],
        passageTitle="Uses of Nanotechnology",
        notePassage=[
            np_section("Transport"),
            np_static("Nanotechnology could allow the development of stronger"), np_gap(34),
            np_static("35"), np_gap(35), np_static("travel will be made available to the masses"),
            np_section("Technology"),
            np_static("Computers will be even smaller, faster, and will have a greater"), np_gap(36),
            np_static("37"), np_gap(37), np_static("energy will become more affordable"),
            np_section("The Environment"),
            np_static("Pollutants such as"), np_gap(38), np_static("could be removed from water more easily"),
            np_static("There will be no"), np_gap(39), np_static("from manufacturing"),
            np_section("Health and Medicine"),
            np_static("Analysis of medical"), np_gap(40), np_static("will be speeded up"),
        ],
    )


# ── Test registry ────────────────────────────────────────────────────────────

TESTS = [
    {
        "folder": "Listening IELTS_Test3_Cam9",
        "cambridge": 9, "test": 3,
        "title": "IELTS Listening — Cambridge 9 Test 3",
        "parts": [
            {"partNumber": 1, "template": "p1-a2", "file": "exam_part1.json", "build": cam9_t3_p1},
            {"partNumber": 2, "template": "p2-a8", "file": "exam_part2.json", "build": cam9_t3_p2},
            {"partNumber": 3, "template": "p3-c2", "file": "exam_part3.json", "build": cam9_t3_p3},
            {"partNumber": 4, "template": "p4-d1", "file": "exam_part4.json", "build": cam9_t3_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test4_Cam9",
        "cambridge": 9, "test": 4,
        "title": "IELTS Listening — Cambridge 9 Test 4",
        "parts": [
            {"partNumber": 1, "template": "p1-a4", "file": "exam_part1.json", "build": cam9_t4_p1},
            {"partNumber": 2, "template": "p2-a9", "file": "exam_part2.json", "build": cam9_t4_p2},
            {"partNumber": 3, "template": "p3-c1", "file": "exam_part3.json", "build": cam9_t4_p3},
            {"partNumber": 4, "template": "p4-d1", "file": "exam_part4.json", "build": cam9_t4_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test1_Cam10",
        "cambridge": 10, "test": 1,
        "title": "IELTS Listening — Cambridge 10 Test 1",
        "parts": [
            {"partNumber": 1, "template": "p1-a2", "file": "exam_part1.json", "build": cam10_t1_p1},
            {"partNumber": 2, "template": "p2-a13", "file": "exam_part2.json", "build": cam10_t1_p2},
            {"partNumber": 3, "template": "p3-c4", "file": "exam_part3.json", "build": cam10_t1_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam10_t1_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test2_Cam10",
        "cambridge": 10, "test": 2,
        "title": "IELTS Listening — Cambridge 10 Test 2",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam10_t2_p1},
            {"partNumber": 2, "template": "p2-a11", "file": "exam_part2.json", "build": cam10_t2_p2},
            {"partNumber": 3, "template": "p3-c3", "file": "exam_part3.json", "build": cam10_t2_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam10_t2_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test3_Cam10",
        "cambridge": 10, "test": 3,
        "title": "IELTS Listening — Cambridge 10 Test 3",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam10_t3_p1},
            {"partNumber": 2, "template": "p2-a13", "file": "exam_part2.json", "build": cam10_t3_p2},
            {"partNumber": 3, "template": "p3-c4", "file": "exam_part3.json", "build": cam10_t3_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam10_t3_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test4_Cam10",
        "cambridge": 10, "test": 4,
        "title": "IELTS Listening — Cambridge 10 Test 4",
        "parts": [
            {"partNumber": 1, "template": "p1-a4", "file": "exam_part1.json", "build": cam10_t4_p1},
            {"partNumber": 2, "template": "p2-a8", "file": "exam_part2.json", "build": cam10_t4_p2},
            {"partNumber": 3, "template": "p3-c5", "file": "exam_part3.json", "build": cam10_t4_p3},
            {"partNumber": 4, "template": "p4-d1", "file": "exam_part4.json", "build": cam10_t4_p4},
        ],
    },
]


def main():
    print("Building IELTS Listening Cam9 T3/T4 + Cam10 T1–T4…\n")
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
    print(f"\nDone — {len(TESTS)} tests, {grand_total} question-slots written.")
    print("Next: pnpm ielts:validate / ielts:bundle for each folder.")


if __name__ == "__main__":
    main()