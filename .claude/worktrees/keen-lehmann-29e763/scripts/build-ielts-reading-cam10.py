#!/usr/bin/env python3
"""Build exam_passage*.json + answer-key.txt for Cambridge 10 Reading Tests 1–4."""
from __future__ import annotations

import re
from pathlib import Path

from ielts_reading_cam9_lib import (
    ROOT,
    gap,
    heading_q,
    labeled,
    match_feat,
    match_para,
    mc,
    parse_labeled_blocks,
    parse_paragraphs,
    passage_body,
    split_passage_chunks,
    summary_q,
    tfng,
    write_test,
    ynng,
)

MC_ABCD = [
    {"id": "a", "label": "A"},
    {"id": "b", "label": "B"},
    {"id": "c", "label": "C"},
    {"id": "d", "label": "D"},
]


def load_cam10(test: int) -> str:
    return (ROOT / "scripts" / f"cam10-t{test}-reading-plain.txt").read_text(encoding="utf-8")


def load_plain(name: str) -> str:
    """Wrapper — cam10 plain files use load_cam10(test) instead."""
    return (ROOT / "scripts" / name).read_text(encoding="utf-8")


def passage_for(chunk: str, letters: str | None = None, min_len: int = 60) -> list[dict]:
    if letters:
        lb = parse_labeled_blocks(chunk, letters)
        if sum(len(x.get("text", "")) for x in lb) > 500:
            return lb
    return parse_paragraphs(chunk, min_len=min_len)


def _fix_t1_p2(passage: list[dict], chunk: str) -> list[dict]:
    if len(passage) == 8:
        m = re.search(
            r"The third approach, which is not new.+?people and goods \.",
            passage_body(chunk),
            re.S,
        )
        if m:
            passage.append(labeled("I", m.group(0)))
    return passage


def _gifted_children_passage(chunk: str) -> list[dict]:
    body = passage_body(chunk)
    body = re.sub(r"^[ABC]\s*\n", "", body, flags=re.M)
    body = re.sub(r"^c\s+", "", body)
    body = re.sub(r"^Gifted children and learning\s*", "", body)
    body = re.sub(r"\n~ E\s*\n\d+\s*\n", " ", body)
    body = re.sub(r"\n(?=[a-z])", " ", body)
    text = re.sub(r"\s+", " ", body).strip()
    markers = [
        "Excellence does not emerge",
        "High achievers have been found",
        "Yet in order to learn",
        "But scientific progress",
        "To sum up, learning",
    ]
    parts: list[str] = []
    start = 0
    for marker in markers:
        idx = text.find(marker)
        parts.append(text[start:idx].strip())
        start = idx
    parts.append(text[start:].strip())
    return [labeled(chr(65 + i), p) for i, p in enumerate(parts)]


def _second_nature_passage(chunk: str) -> list[dict]:
    body = passage_body(chunk)
    body = re.sub(r"\bO Suzanne", "D Suzanne", body)
    letters = list("ABCDEFGH")
    blocks: list[dict] = []
    for i, letter in enumerate(letters):
        pat = rf"(?:^|\n){letter}\s+"
        ms = list(re.finditer(pat, body))
        if not ms:
            continue
        start = ms[0].end()
        nxt: int | None = None
        for nl in letters[i + 1 :]:
            m2 = re.search(rf"(?:^|\n){nl}\s+", body[start:])
            if m2:
                nxt = start + m2.start()
                break
        end = nxt if nxt else len(body)
        txt = re.sub(r"\s+", " ", body[start:end]).strip()
        blocks.append(labeled(letter, txt))
    return blocks


# ── Test 1 ──────────────────────────────────────────────────────────────────────

T1_P1_STEPWELLS_TABLE = {
    "headers": ["Stepwells", "Date", "Features", "Other notes"],
    "gapNumbers": [9, 10, 11, 12, 13],
    "rows": [
        {
            "cells": [
                [{"type": "static", "text": "Rani Ki Vav"}],
                [{"type": "static", "text": "Late 11th century"}],
                [{"type": "static", "text": "As many as 500 sculptures decorate the monument"}],
                [
                    {"type": "static", "text": "Restored in the 1990s"},
                    {"type": "break"},
                    {"type": "static", "text": "Excellent condition, despite the "},
                    {"type": "gap", "number": 9},
                    {"type": "static", "text": " of 2001."},
                ],
            ],
        },
        {
            "cells": [
                [{"type": "static", "text": "Surya Kund"}],
                [{"type": "static", "text": "1026"}],
                [
                    {"type": "static", "text": "Steps on the "},
                    {"type": "gap", "number": 10},
                    {"type": "static", "text": " produce a geometric pattern"},
                    {"type": "break"},
                    {"type": "static", "text": "Carved shrines."},
                ],
                [
                    {"type": "static", "text": "Looks more like a "},
                    {"type": "gap", "number": 11},
                    {"type": "static", "text": " than a well."},
                ],
            ],
        },
        {
            "cells": [
                [{"type": "static", "text": "Raniji Ki Baori"}],
                [{"type": "static", "text": "1699"}],
                [{"type": "static", "text": "Intricately carved monument"}],
                [{"type": "static", "text": "One of 21 baoris in the area commissioned by Queen Nathavatji"}],
            ],
        },
        {
            "cells": [
                [{"type": "static", "text": "Chand Baori"}],
                [{"type": "static", "text": "850 AD"}],
                [{"type": "static", "text": "Steps take you down 11 storeys to the bottom"}],
                [
                    {"type": "static", "text": "Old, deep and very dramatic"},
                    {"type": "break"},
                    {"type": "static", "text": "Has "},
                    {"type": "gap", "number": 12},
                    {"type": "static", "text": " which provide a view of the steps."},
                ],
            ],
        },
        {
            "cells": [
                [{"type": "static", "text": "Neemrana Ki Baori"}],
                [{"type": "static", "text": "1700"}],
                [
                    {"type": "static", "text": "Has two "},
                    {"type": "gap", "number": 13},
                    {"type": "static", "text": " levels."},
                ],
                [{"type": "static", "text": "Used by public today"}],
            ],
        },
    ],
}


def t1_p1() -> dict:
    chunk = split_passage_chunks(load_cam10(1))[0]
    return {
        "partNumber": 1,
        "rangeLabel": "Read the text and answer questions 1–13.",
        "passageTitle": "Stepwells",
        "passageSubtitle": "A millennium ago, stepwells were fundamental to life in the driest parts of India.",
        "passage": passage_for(chunk),
        "questionGroups": [
            {
                "range": "Questions 1–5",
                "instruction": "Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.",
                "type": "tfng",
                "questions": [
                    tfng(1, "Examples of ancient stepwells can be found all over the world.", "false", "Chỉ tìm thấy chủ yếu ở Gujarat, Rajasthan và vài giếng ở Delhi."),
                    tfng(2, "Stepwells had a range of functions, in addition to those related to water collection.", "true", "Là nơi sinh hoạt, nghỉ ngơi và thờ cúng."),
                    tfng(3, "The few existing stepwells in Delhi are more attractive than those found elsewhere.", "not-given", "Passage không so sánh độ đẹp giữa Delhi và nơi khác."),
                    tfng(4, "It took workers many years to build the stone steps characteristic of stepwells.", "not-given", "Không nêu thời gian xây dựng các bậc đá."),
                    tfng(5, "The number of steps above the water level in a stepwell altered during the course of a year.", "true", "Mực nước thay đổi theo mùa nên số bậc cần đi cũng thay đổi."),
                ],
            },
            {
                "range": "Questions 6–8",
                "instruction": "Answer the questions below. Choose ONE WORD ONLY from the passage for each answer.",
                "type": "gap-fill",
                "questions": [
                    gap(6, "Which part of some stepwells provided shade for people?", "pavilions", "Pavilions che nắng cho du khách."),
                    gap(7, "What type of serious climatic event, which took place in southern Rajasthan, is mentioned?", "drought", "Hạn hán 8 năm 1996–2004."),
                    gap(8, "Who are frequent visitors to stepwells nowadays?", "tourists", "Du khách đến chiêm ngưỡng các công trình cổ."),
                ],
            },
            {
                "range": "Questions 9–13",
                "instruction": "Complete the table below. Choose ONE WORD AND/OR A NUMBER from the passage for each answer.",
                "type": "gap-fill",
                "noteTable": T1_P1_STEPWELLS_TABLE,
                "questions": [
                    gap(9, "Gap (9)", "earthquake", "Sống sót sau động đất 7.6 Richter năm 2001."),
                    gap(10, "Gap (10)", "4 sides|four sides", "Bốn cạnh bậc thang tạo hình học."),
                    gap(11, "Gap (11)", "tank", "Giống hồ chứa (kund) hơn giếng."),
                    gap(12, "Gap (12)", "verandas", "Hành lang verandas nhìn xuống bậc."),
                    gap(13, "Gap (13)", "underwater", "Hai tầng dưới nước."),
                ],
            },
        ],
    }


def t1_p2() -> dict:
    chunk = split_passage_chunks(load_cam10(1))[1]
    passage = _fix_t1_p2(passage_for(chunk, "A-I"), chunk)
    headings = [
        {"id": "i", "label": "A fresh and important long-term goal"},
        {"id": "ii", "label": "Charging for roads and improving other transport methods"},
        {"id": "iii", "label": "Changes affecting the distances goods may be transported"},
        {"id": "iv", "label": "Taking all the steps necessary to change transport patterns"},
        {"id": "v", "label": "The environmental costs of road transport"},
        {"id": "vi", "label": "The escalating cost of rail transport"},
        {"id": "vii", "label": "The need to achieve transport rebalance"},
        {"id": "viii", "label": "The rapid growth of private transport"},
        {"id": "ix", "label": "Plans to develop major road networks"},
        {"id": "x", "label": "Restricting road use through charging policies alone"},
        {"id": "xi", "label": "Transport trends in countries awaiting EU admission"},
    ]
    return {
        "partNumber": 2,
        "rangeLabel": "Read the text and answer questions 14–26.",
        "passageTitle": "European transport systems 1990–2010",
        "passageSubtitle": "What have been the trends and what are the prospects for European transport systems?",
        "passage": passage,
        "questionGroups": [
            {
                "range": "Questions 14–21",
                "instruction": "Reading Passage 2 has nine paragraphs, A–I. Choose the correct heading for paragraphs A–E and G–I.",
                "note": "Example: Paragraph F → vii. There are more headings than paragraphs.",
                "type": "matching-headings",
                "headings": headings,
                "questions": [
                    heading_q(14, "A", "viii", "Đoạn A: tăng trưởng nhanh của ô tô."),
                    heading_q(15, "B", "iii", "Đoạn B: thay đổi khoảng cách vận chuyển hàng hóa."),
                    heading_q(16, "C", "xi", "Đoạn C: xu hướng vận tải ở nước chờ gia nhập EU."),
                    heading_q(17, "D", "i", "Đoạn D: mục tiêu dài hạn — phát triển bền vững."),
                    heading_q(18, "E", "v", "Đoạn E: chi phí môi trường của vận tải đường bộ."),
                    heading_q(19, "G", "x", "Đoạn G: chỉ dùng chính sách thu phí đường."),
                    heading_q(20, "H", "ii", "Đoạn H: thu phí kèm cải thiện phương thức khác."),
                    heading_q(21, "I", "iv", "Đoạn I: tiếp cận tích hợp — mọi bước cần thiết."),
                ],
            },
            {
                "range": "Questions 22–26",
                "instruction": "Do the following statements agree with the information given in Reading Passage 2? Write TRUE, FALSE or NOT GIVEN.",
                "type": "tfng",
                "questions": [
                    tfng(22, "The need for transport is growing, despite technological developments.", "true", "Nhu cầu vận tải vẫn tăng dù có công nghệ thông tin."),
                    tfng(23, "To reduce production costs, some industries have been moved closer to their relevant consumers.", "false", "Di dời xa hàng nghìn km, không gần người tiêu dùng."),
                    tfng(24, "Cars are prohibitively expensive in some EU candidate countries.", "not-given", "Không nhắc giá ô tô ở các nước ứng viên."),
                    tfng(25, "The Gothenburg European Council was set up 30 years ago.", "not-given", "Hội nghị Gothenburg được nhắc nhưng không nói thành lập 30 năm trước."),
                    tfng(26, "By the end of this decade, CO₂ emissions from transport are predicted to reach 739 billion tonnes.", "false", "739 tỷ tấn là mức 1990; 2020 dự báo ~1113 tỷ tấn."),
                ],
            },
        ],
    }


def t1_p3() -> dict:
    chunk = split_passage_chunks(load_cam10(1))[2]
    endings = [
        {"id": "a", "name": "take chances."},
        {"id": "b", "name": "share their ideas."},
        {"id": "c", "name": "become competitive."},
        {"id": "d", "name": "get promotion."},
        {"id": "e", "name": "avoid risk."},
        {"id": "f", "name": "ignore their duties."},
        {"id": "g", "name": "remain in their jobs."},
    ]
    return {
        "partNumber": 3,
        "rangeLabel": "Read the text and answer questions 27–40.",
        "passageTitle": "The psychology of innovation",
        "passageSubtitle": "Why are so few companies truly innovative?",
        "passage": passage_for(chunk, min_len=60),
        "questionGroups": [
            {
                "range": "Questions 27–30",
                "instruction": "Choose the correct letter, A, B, C or D.",
                "type": "multiple-choice",
                "questions": [
                    mc(
                        27,
                        "The example of the 'million-dollar quartet' underlines the writer's point about",
                        [
                            {"id": "a", "label": "recognising talent."},
                            {"id": "b", "label": "working as a team."},
                            {"id": "c", "label": "having a shared objective."},
                            {"id": "d", "label": "being an effective leader."},
                        ],
                        "c",
                        "Roy Orbison thiếu mục tiêu chung nên không thành công như nhóm.",
                    ),
                    mc(
                        28,
                        "James Watson suggests that he and Francis Crick won the race to discover the DNA code because they",
                        [
                            {"id": "a", "label": "were conscious of their own limitations."},
                            {"id": "b", "label": "brought complementary skills to their partnership."},
                            {"id": "c", "label": "were determined to outperform their brighter rivals."},
                            {"id": "d", "label": "encouraged each other to realise their joint ambition."},
                        ],
                        "a",
                        "Họ biết mình không thông minh nhất và tìm lời khuyên.",
                    ),
                    mc(
                        29,
                        "The writer mentions competitions on breakfast cereal packets as an example of how to",
                        [
                            {"id": "a", "label": "inspire creative thinking."},
                            {"id": "b", "label": "generate concise writing."},
                            {"id": "c", "label": "promote loyalty to a group."},
                            {"id": "d", "label": "strengthen commitment to an idea."},
                        ],
                        "d",
                        "Việc viết ra giúp tin tưởng hơn vào ý tưởng của mình.",
                    ),
                    mc(
                        30,
                        "In the last paragraph, the writer suggests that it is important for employees to",
                        [
                            {"id": "a", "label": "be aware of their company's goals."},
                            {"id": "b", "label": "feel that their contributions are valued."},
                            {"id": "c", "label": "have respect for their co-workers' achievements."},
                            {"id": "d", "label": "understand why certain management decisions are made."},
                        ],
                        "b",
                        "Lãnh đạo cần đảm bảo mọi đề xuất được xem xét đầy đủ.",
                    ),
                ],
            },
            {
                "range": "Questions 31–35",
                "instruction": "Complete each sentence with the correct ending, A–G, below.",
                "type": "matching-features",
                "features": endings,
                "questions": [
                    match_feat(31, "Employees whose values match those of their employers are more likely to", "g", "Giá trị phù hợp → ở lại công ty lâu hơn."),
                    match_feat(32, "At times of change, people tend to", "e", "Khi thay đổi, con người thiên về an toàn."),
                    match_feat(33, "If people are aware of what they might lose, they will often", "a", "Đe dọa mất mát khiến người ta chấp nhận rủi ro."),
                    match_feat(34, "People working under a dominant boss are liable to", "f", "Captainitis — bỏ trách nhiệm nhóm."),
                    match_feat(35, "Employees working in organisations with few rules are more likely to", "b", "Memphis collective — trao đổi ý tưởng tự do."),
                ],
            },
            {
                "range": "Questions 36–40",
                "instruction": "Do the following statements agree with the claims of the writer in Reading Passage 3? Write YES, NO or NOT GIVEN.",
                "type": "ynng",
                "questions": [
                    ynng(36, "The physical surroundings in which a person works play a key role in determining their creativity.", "no", "Có người trong trung tâm hiện đại vẫn không sáng tạo."),
                    ynng(37, "Most people have the potential to be creative.", "yes", "Hầu hết mọi người có thể sáng tạo trong hoàn cảnh phù hợp."),
                    ynng(38, "Teams work best when their members are of equally matched intelligence.", "not-given", "Ba người giải quyết tốt hơn một người thông minh nhất — không nói trí bằng nhau."),
                    ynng(39, "It is easier for smaller companies to be innovative.", "not-given", "Nhắc công ty không có ngân sách vẫn đổi mới — không so sánh quy mô."),
                    ynng(40, "A manager's approval of an idea is more persuasive than that of a colleague.", "no", "Sức mạnh đồng nghiệp (peer power) mạnh hơn lời sếp."),
                ],
            },
        ],
    }


# ── Test 2 ──────────────────────────────────────────────────────────────────────

T2_P1_HEADINGS = [
    {"id": "i", "label": "The search for the reasons for an increase in population"},
    {"id": "ii", "label": "Industrialisation and the fear of unemployment"},
    {"id": "iii", "label": "The development of cities in Japan"},
    {"id": "iv", "label": "The time and place of the Industrial Revolution"},
    {"id": "v", "label": "The cases of Holland, France and China"},
    {"id": "vi", "label": "Changes in drinking habits in Britain"},
    {"id": "vii", "label": "Two keys to Britain's industrial revolution"},
    {"id": "viii", "label": "Conditions required for industrialisation"},
    {"id": "ix", "label": "Comparisons with Japan lead to the answer"},
]


def t2_p1() -> dict:
    chunk = split_passage_chunks(load_cam10(2))[0]
    return {
        "partNumber": 1,
        "rangeLabel": "Read the text and answer questions 1–13.",
        "passageTitle": "Tea and the Industrial Revolution",
        "passageSubtitle": "A Cambridge professor says that a change in drinking habits was the reason for the Industrial Revolution in Britain.",
        "passage": passage_for(chunk, "A-G"),
        "questionGroups": [
            {
                "range": "Questions 1–7",
                "instruction": "Reading Passage 1 has seven paragraphs, A–G. Choose the correct heading for each paragraph.",
                "type": "matching-headings",
                "headings": T2_P1_HEADINGS,
                "questions": [
                    heading_q(1, "A", "iv", "Đoạn A: câu hỏi khi nào/ở đâu Cách mạng Công nghiệp."),
                    heading_q(2, "B", "viii", "Đoạn B: các điều kiện cần cho công nghiệp hóa."),
                    heading_q(3, "C", "vii", "Đoạn C: trà và bia — hai chìa khóa."),
                    heading_q(4, "D", "i", "Đoạn D: tìm lý do bùng nổ dân số."),
                    heading_q(5, "E", "vi", "Đoạn E: thay đổi thói quen uống ở Anh."),
                    heading_q(6, "F", "ix", "Đoạn F: so sánh với Nhật Bản."),
                    heading_q(7, "G", "ii", "Đoạn G: Nhật sợ thất nghiệp, từ bỏ bánh xe."),
                ],
            },
            {
                "range": "Questions 8–13",
                "instruction": "Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.",
                "type": "tfng",
                "questions": [
                    tfng(8, "China's transport system was not suitable for industry in the 18th century.", "not-given", "Nhắc Trung Quốc có nhiều yếu tố nhưng không nói hệ thống vận tải."),
                    tfng(9, "Tea and beer both helped to prevent dysentery in Britain.", "true", "Trà và bia (hops) khử trùng, giảm bệnh đường ruột."),
                    tfng(10, "Roy Porter disagrees with Professor Macfarlane's findings.", "false", "Roy Porter viết đánh giá tích cực."),
                    tfng(11, "After 1740, there was a reduction in population in Britain.", "false", "Tỷ lệ tử vong trẻ em giảm — dân số tăng."),
                    tfng(12, "People in Britain used to make beer at home.", "not-given", "Nhắc uống bia nhưng không nói tự nấu tại nhà."),
                    tfng(13, "The tax on malt indirectly caused a rise in the death rate.", "true", "Thuế malt → người nghèo uống nước/gin → tử vong tăng."),
                ],
            },
        ],
    }


def t2_p2() -> dict:
    chunk = split_passage_chunks(load_cam10(2))[1]
    return {
        "partNumber": 2,
        "rangeLabel": "Read the text and answer questions 14–26.",
        "passageTitle": "Gifted children and learning",
        "passage": _gifted_children_passage(chunk),
        "questionGroups": [
            {
                "range": "Questions 14–17",
                "instruction": "Reading Passage 2 has six paragraphs, A–F. Which paragraph contains the following information?",
                "note": "NB You may use any letter more than once.",
                "type": "matching-paragraph",
                "paragraphLetters": list("ABCDEF"),
                "questions": [
                    match_para(14, "a reference to the influence of the domestic background on the gifted child", "a", "Freeman 2010 — môi trường gia đình và IQ."),
                    match_para(15, "reference to what can be lost if learners are given too much guidance", "d", "Spoon-feeding → mất tự chủ."),
                    match_para(16, "a reference to the damaging effects of anxiety", "f", "Cảm xúc tiêu cực ức chế học tập — Fear."),
                    match_para(17, "examples of classroom techniques which favour socially-disadvantaged children", "d", "Child-initiated learning, peer tutoring cho trẻ vùng khó khăn."),
                ],
            },
            {
                "range": "Questions 18–22",
                "instruction": "Look at the following statements and the list of people below. Match each statement with the correct person, A–E.",
                "type": "matching-features",
                "features": [
                    {"id": "a", "name": "Freeman"},
                    {"id": "b", "name": "Shore and Kanevsky"},
                    {"id": "c", "name": "Elshout"},
                    {"id": "d", "name": "Simonton"},
                    {"id": "e", "name": "Boekaerts"},
                ],
                "questions": [
                    match_feat(18, "Less time can be spent on exercises with gifted pupils who produce accurate work.", "b", "Shore & Kanevsky — dạy nhanh hơn nếu chỉ nghĩ nhanh."),
                    match_feat(19, "Self-reliance is a valuable tool that helps gifted students reach their goals.", "d", "Simonton — độc lập quan trọng ở trình độ cao."),
                    match_feat(20, "Gifted children know how to channel their feelings to assist their learning.", "e", "Boekaerts — kiểm soát cảm xúc, tò mò."),
                    match_feat(21, "The very gifted child benefits from appropriate support from close relatives.", "a", "Freeman — hỗ trợ giáo dục từ cha mẹ."),
                    match_feat(22, "Really successful students have learnt a considerable amount about their subject.", "c", "Elshout — kiến thức chuyên sâu."),
                ],
            },
            {
                "range": "Questions 23–26",
                "instruction": "Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
                "type": "gap-fill",
                "questions": [
                    gap(23, "One study found a strong connection between children's IQ and the availability of ___ and ___ at home.", "books|activities", "Sách và hoạt động trong nhà."),
                    gap(24, "Children of average ability seem to need more direction from teachers because they do not have ___.", "internal regulation", "Thiếu tự điều chỉnh nội tâm."),
                    gap(25, "Metacognition involves children understanding their own learning strategies, as well as developing ___.", "emotional awareness", "Nhận thức cảm xúc là phần metacognition."),
                    gap(26, "Teachers who rely on what is known as ___ often produce sets of impressive grades in class tests.", "spoon-feeding", "Spoon-feeding cho điểm cao nhưng hạn chế thành công lâu dài."),
                ],
            },
        ],
    }


T2_P3_SUMMARY_NOTE = (
    "The value attached to original works of art\n\n"
    "People go to art museums because they accept the value of seeing an original work of art. "
    "But they do not go to museums to read original manuscripts of novels, perhaps because the availability "
    "of novels has depended on 27________ for so long, and also because with novels, the 28________ "
    "are the most important thing.\n\n"
    "However, in historical times artists such as Leonardo were happy to instruct 29________ to produce "
    "copies of their work and these days new methods of reproduction allow excellent replication of "
    "surface relief features as well as colour and 30________\n\n"
    "It is regrettable that museums still promote the superiority of original works of art, since this "
    "may not be in the interests of the 31________"
)


def t2_p3() -> dict:
    chunk = split_passage_chunks(load_cam10(2))[2]
    bank = [
        {"id": "a", "label": "institution"},
        {"id": "b", "label": "mass production"},
        {"id": "c", "label": "mechanical processes"},
        {"id": "d", "label": "public"},
        {"id": "e", "label": "paints"},
        {"id": "f", "label": "artist"},
        {"id": "g", "label": "size"},
        {"id": "h", "label": "underlying ideas"},
        {"id": "i", "label": "basic technology"},
        {"id": "j", "label": "readers"},
        {"id": "k", "label": "picture frames"},
        {"id": "l", "label": "assistants"},
    ]
    return {
        "partNumber": 3,
        "rangeLabel": "Read the text and answer questions 27–40.",
        "passageTitle": "Museums of fine art and their public",
        "passage": passage_for(chunk, min_len=60),
        "questionGroups": [
            {
                "range": "Questions 27–31",
                "instruction": "Complete the summary using the list of phrases, A–L, below.",
                "type": "summary-completion",
                "note": T2_P3_SUMMARY_NOTE,
                "wordBank": bank,
                "questions": [
                    summary_q(27, "Gap (27)", "b", "Tiểu thuyết nhờ sản xuất hàng loạt (in ấn)."),
                    summary_q(28, "Gap (28)", "h", "Ý nghĩa từ ngữ quan trọng hơn hình thức in."),
                    summary_q(29, "Gap (29)", "l", "Học viên xưởng sao chép tác phẩm."),
                    summary_q(30, "Gap (30)", "g", "Sao chép cả kích thước (scale)."),
                    summary_q(31, "Gap (31)", "d", "Không có lợi cho công chúng."),
                ],
            },
            {
                "range": "Questions 32–35",
                "instruction": "Choose the correct letter, A, B, C or D.",
                "type": "multiple-choice",
                "questions": [
                    mc(
                        32,
                        "The writer mentions London's National Gallery to illustrate",
                        [
                            {"id": "a", "label": "the undesirable cost to a nation of maintaining a huge collection of art."},
                            {"id": "b", "label": "the conflict that may arise in society between financial and artistic values."},
                            {"id": "c", "label": "the negative effect a museum can have on visitors' opinions of themselves."},
                            {"id": "d", "label": "the need to put individual well-being above large-scale artistic schemes."},
                        ],
                        "c",
                        "Cảm giác 'vô giá trị' trước tác phẩm đắt tiền.",
                    ),
                    mc(
                        33,
                        "The writer says that today, viewers may be unwilling to criticise a work because",
                        [
                            {"id": "a", "label": "they lack the knowledge needed to support an opinion."},
                            {"id": "b", "label": "they fear it may have financial implications."},
                            {"id": "c", "label": "they have no real concept of the work's value."},
                            {"id": "d", "label": "they feel their personal reaction is of no significance."},
                        ],
                        "d",
                        "Giá trị tiền tệ do người quyền lực gán — ý kiến khách thăm không thay đổi được.",
                    ),
                    mc(
                        34,
                        "According to the writer, the 'displacement effect' on the visitor is caused by",
                        [
                            {"id": "a", "label": "the variety of works on display and the way they are arranged."},
                            {"id": "b", "label": "the impossibility of viewing particular works of art over a long period."},
                            {"id": "c", "label": "the similar nature of the paintings and the lack of great works."},
                            {"id": "d", "label": "the inappropriate nature of the individual works selected for exhibition."},
                        ],
                        "a",
                        "Tác phẩm bị đưa ra khỏi bối cảnh gốc, số lượng khổng lồ.",
                    ),
                    mc(
                        35,
                        "The writer says that unlike other forms of art, a painting does not",
                        [
                            {"id": "a", "label": "involve direct contact with an audience."},
                            {"id": "b", "label": "require a specific location for a performance."},
                            {"id": "c", "label": "need the involvement of other professionals."},
                            {"id": "d", "label": "have a specific beginning or end."},
                        ],
                        "d",
                        "Tranh không có thời điểm bắt đầu/kết thúc xem cố định.",
                    ),
                ],
            },
            {
                "range": "Questions 36–40",
                "instruction": "Do the following statements agree with the views of the writer in Reading Passage 3? Write YES, NO or NOT GIVEN.",
                "type": "ynng",
                "questions": [
                    ynng(36, "Art history should focus on discovering the meaning of art using a range of media.", "not-given", "Phê bình ngẫu hứng ít ở mỹ thuật — không nói dùng nhiều phương tiện."),
                    ynng(37, "The approach of art historians conflicts with that of art museums.", "no", "Cách sử học nghệ thuật hài hòa với chức năng bảo tàng."),
                    ynng(38, "People should be encouraged to give their opinions openly on works of art.", "yes", "Khán giả trải nghiệm tốt hơn khi được bày tỏ quan điểm."),
                    ynng(39, "Reproductions of fine art should only be sold to the public if they are of high quality.", "not-given", "Đề xuất bản sao chất lượng cao nhưng không nói điều kiện bán."),
                    ynng(40, "In the future, those with power are likely to encourage more people to enjoy art.", "no", "Giới quyền lực có thể không muốn công chúng bớt kính sợ."),
                ],
            },
        ],
    }


# ── Test 3 ──────────────────────────────────────────────────────────────────────

T3_P1_HEADINGS = [
    {"id": "i", "label": "Economic and social significance of tourism"},
    {"id": "ii", "label": "The development of mass tourism"},
    {"id": "iii", "label": "Travel for the wealthy"},
    {"id": "iv", "label": "Earning foreign exchange through tourism"},
    {"id": "v", "label": "Difficulty in recognising the economic effects of tourism"},
    {"id": "vi", "label": "The contribution of air travel to tourism"},
    {"id": "vii", "label": "The world impact of tourism"},
    {"id": "viii", "label": "The history of travel"},
]


def t3_p1() -> dict:
    chunk = split_passage_chunks(load_cam10(3))[0]
    return {
        "partNumber": 1,
        "rangeLabel": "Read the text and answer questions 1–13.",
        "passageTitle": "The context, meaning and scope of tourism",
        "passage": passage_for(chunk, "A-E"),
        "questionGroups": [
            {
                "range": "Questions 1–4",
                "instruction": "Reading Passage 1 has five paragraphs, A–E. Choose the correct heading for paragraphs B–E.",
                "note": "Example: Paragraph A → viii.",
                "type": "matching-headings",
                "headings": T3_P1_HEADINGS,
                "questions": [
                    heading_q(1, "B", "ii", "Đoạn B: du lịch đại chúng thế kỷ 20."),
                    heading_q(2, "C", "i", "Đoạn C: tầm quan trọng kinh tế-xã hội."),
                    heading_q(3, "D", "v", "Đoạn D: khó đo lường tác động kinh tế."),
                    heading_q(4, "E", "vii", "Đoạn E: tác động toàn cầu, khó thống kê chính xác."),
                ],
            },
            {
                "range": "Questions 5–10",
                "instruction": "Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.",
                "type": "tfng",
                "questions": [
                    tfng(5, "The largest employment figures in the world are found in the travel and tourism industry.", "true", "Ngành employer lớn nhất thế giới ~130 triệu việc làm."),
                    tfng(6, "Tourism contributes over six per cent of the Australian gross national product.", "not-given", "6% GNP thế giới — không nói Australia."),
                    tfng(7, "Tourism has a social impact because it promotes recreation.", "not-given", "Tác động xã hội qua giáo dục và việc làm — không nhắc recreation."),
                    tfng(8, "Two main features of the travel and tourism industry make its economic significance difficult to ascertain.", "true", "Đa dạng, phân mảnh và khái niệm mơ hồ."),
                    tfng(9, "Visitor spending is always greater than the spending of residents in tourist areas.", "not-given", "Chi tiêu du khách dễ bị bỏ sót — không nói luôn lớn hơn."),
                    tfng(10, "It is easy to show statistically how tourism affects individual economies.", "false", "Không thể cung cấp dữ liệu chính xác, đáng tin."),
                ],
            },
            {
                "range": "Questions 11–13",
                "instruction": "Complete the sentences below. Choose NO MORE THAN THREE WORDS from the passage for each answer.",
                "type": "gap-fill",
                "questions": [
                    gap(11, "In Greece, tourism is the most important ___.", "source of income", "Nguồn thu chính ở Hy Lạp."),
                    gap(12, "The travel and tourism industry in Jamaica is the major ___.", "employer", "Nhà tuyển dụng lớn nhất Jamaica."),
                    gap(13, "Problems measuring international tourism are often reflected in the measurement of ___.", "domestic tourism", "Khó đo cả du lịch nội địa."),
                ],
            },
        ],
    }


def t3_p2() -> dict:
    chunk = split_passage_chunks(load_cam10(3))[1]
    return {
        "partNumber": 2,
        "rangeLabel": "Read the text and answer questions 14–26.",
        "passageTitle": "Autumn leaves",
        "passageSubtitle": "Canadian writer Jay Ingram investigates the mystery of why leaves turn red in the fall.",
        "passage": passage_for(chunk, "A-I"),
        "questionGroups": [
            {
                "range": "Questions 14–18",
                "instruction": "Reading Passage 2 has nine paragraphs, A–I. Which paragraph contains the following information?",
                "note": "NB You may use any letter more than once.",
                "type": "matching-paragraph",
                "paragraphLetters": list("ABCDEFGHI"),
                "questions": [
                    match_para(14, "a description of the substance responsible for the red colouration of leaves", "c", "Anthocyanins tạo màu đỏ."),
                    match_para(15, "the reason why trees drop their leaves in autumn", "b", "Bỏ lá khi giảm quang hợp — tiết kiệm nitrogen."),
                    match_para(16, "some evidence to confirm a theory about the purpose of the red leaves", "h", "Lá đỏ nhất hướng nhiều nắng — bằng chứng light screen."),
                    match_para(17, "an explanation of the function of chlorophyll", "e", "Đoạn E thảo luận cây khỏe mạnh — chlorophyll được nhắc ở B/G; đáp án E theo key."),
                    match_para(18, "a suggestion that the red colouration in leaves could serve as a warning signal", "e", "Cây khỏe mạnh để côn trùng không đẻ trứng."),
                ],
            },
            {
                "range": "Questions 19–22",
                "instruction": "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.",
                "type": "gap-fill",
                "questions": [
                    gap(19, "The most vividly coloured red leaves are found on the side of the tree facing the ___.", "sunlight", "Mặt hướng nhiều nắng nhất."),
                    gap(20, "The ___ surfaces of leaves contain the most red pigment.", "upper", "Mặt trên lá đỏ hơn."),
                    gap(21, "Red leaves are most abundant when daytime weather conditions are ___ and sunny.", "dry", "Ngày khô, nắng, đêm mát."),
                    gap(22, "The intensity of the red colour of leaves increases as you go further ___.", "north", "Càng về Bắc càng đỏ."),
                ],
            },
            {
                "range": "Questions 23–25",
                "instruction": "Do the following statements agree with the information given in Reading Passage 2? Write TRUE, FALSE or NOT GIVEN.",
                "type": "tfng",
                "questions": [
                    tfng(23, "It is likely that the red pigments help to protect the leaf from freezing temperatures.", "false", "Lý thuyết chống đông bị bác — thời gian đỏ quá ngắn."),
                    tfng(24, "The 'light screen' hypothesis would initially seem to contradict what is known about chlorophyll.", "true", "Nghe nghịch lý — bảo vệ chất đang bị tháo dỡ."),
                    tfng(25, "Leaves which turn colours other than red are more likely to be damaged by sunlight.", "not-given", "Cây khác không làm anthocyanins — không nói hư hại nhiều hơn."),
                ],
            },
            {
                "range": "Question 26",
                "instruction": "Choose the correct letter, A, B, C or D.",
                "type": "multiple-choice",
                "questions": [
                    mc(
                        26,
                        "For which of the following questions does the writer offer an explanation?",
                        [
                            {"id": "a", "label": "why conifers remain green in winter"},
                            {"id": "b", "label": "how leaves turn orange and yellow in autumn"},
                            {"id": "c", "label": "how herbivorous insects choose which trees to lay their eggs in"},
                            {"id": "d", "label": "why anthocyanins are restricted to certain trees"},
                        ],
                        "b",
                        "Giải thích vàng/cam khi chlorophyll mất — anthocyanins không giải thích được.",
                    ),
                ],
            },
        ],
    }


def t3_p3() -> dict:
    chunk = split_passage_chunks(load_cam10(3))[2]
    bank = [
        {"id": "a", "label": "proof"},
        {"id": "b", "label": "plantation"},
        {"id": "c", "label": "harbour"},
        {"id": "d", "label": "bones"},
        {"id": "e", "label": "data"},
        {"id": "f", "label": "archaeological discovery"},
        {"id": "g", "label": "burial urn"},
        {"id": "h", "label": "source"},
        {"id": "i", "label": "animals"},
        {"id": "j", "label": "maps"},
    ]
    return {
        "partNumber": 3,
        "rangeLabel": "Read the text and answer questions 27–40.",
        "passageTitle": "Beyond the blue horizon",
        "passageSubtitle": "Ancient voyagers who settled the far-flung islands of the Pacific Ocean.",
        "passage": passage_for(chunk, min_len=60),
        "questionGroups": [
            {
                "range": "Questions 27–31",
                "instruction": "Complete the summary using the list of words and phrases, A–J, below.",
                "type": "summary-completion",
                "wordBank": bank,
                "questions": [
                    summary_q(27, "A 3,000-year-old burial ground … found on an abandoned ___ on Efate.", "b", "Plantation bỏ hoang."),
                    summary_q(28, "The cemetery, which is a significant ___, was uncovered accidentally.", "f", "Phát hiện khảo cổ quan trọng."),
                    summary_q(29, "They took many things with them including ___ and tools.", "i", "Gia súc và hạt giống."),
                    summary_q(30, "Spriggs believes the ___ found at the site is very important.", "g", "Burial urn xác nhận di hài Lapita."),
                    summary_q(31, "It confirms that the ___ found inside are Lapita.", "d", "Xương (bones) trong urn."),
                ],
            },
            {
                "range": "Questions 32–35",
                "instruction": "Choose the correct letter, A, B, C or D.",
                "type": "multiple-choice",
                "questions": [
                    mc(
                        32,
                        "According to the writer, there are difficulties explaining how the Lapita accomplished their journeys because",
                        [
                            {"id": "a", "label": "the canoes that have been discovered offer relatively few clues."},
                            {"id": "b", "label": "archaeologists have shown limited interest in this area of research."},
                            {"id": "c", "label": "little information relating to this period can be relied upon for accuracy."},
                            {"id": "d", "label": "technological advances have altered the way such achievements are viewed."},
                        ],
                        "c",
                        "Không tìm thấy thuyền, rigging; truyền thuyết đã thành thần thoại.",
                    ),
                    mc(
                        33,
                        "According to the sixth paragraph, what was extraordinary about the Lapita?",
                        [
                            {"id": "a", "label": "They sailed beyond the point where land was visible."},
                            {"id": "b", "label": "Their cultural heritage discouraged the expression of fear."},
                            {"id": "c", "label": "They were able to build canoes that withstood ocean voyages."},
                            {"id": "d", "label": "Their navigational skills were passed on from one generation to the next."},
                        ],
                        "a",
                        "Ra khơi khi không còn nhìn thấy đất — như đổ bộ lên Mặt Trăng.",
                    ),
                    mc(
                        34,
                        "What does 'This' refer to in the seventh paragraph?",
                        [
                            {"id": "a", "label": "the Lapita's seafaring talent"},
                            {"id": "b", "label": "the Lapita's ability to detect signs of land"},
                            {"id": "c", "label": "the Lapita's extensive knowledge of the region"},
                            {"id": "d", "label": "the Lapita's belief they would be able to return home"},
                        ],
                        "d",
                        "Gió ngược giúp quay về nhà trên trade winds.",
                    ),
                    mc(
                        35,
                        "According to the eighth paragraph, how was the geography of the region significant?",
                        [
                            {"id": "a", "label": "It played an important role in Lapita culture."},
                            {"id": "b", "label": "It meant there were relatively few storms at sea."},
                            {"id": "c", "label": "It provided a navigational aid for the Lapita."},
                            {"id": "d", "label": "It made a large number of islands habitable."},
                        ],
                        "c",
                        "Quần đảo dài tạo 'backstop' cho hải trình về nhà.",
                    ),
                ],
            },
            {
                "range": "Questions 36–40",
                "instruction": "Do the following statements agree with the views of the writer in Reading Passage 3? Write YES, NO or NOT GIVEN.",
                "type": "ynng",
                "questions": [
                    ynng(36, "It is now clear that the Lapita could sail into a prevailing wind.", "no", "Anderson: không có bằng chứng họ lướt ngược gió."),
                    ynng(37, "Extreme climate conditions may have played a role in Lapita migration.", "yes", "El Niño có thể đẩy họ đi xa không chủ đích."),
                    ynng(38, "The Lapita learnt to predict the duration of El Niños.", "not-given", "El Niño được nhắc nhưng không nói dự báo."),
                    ynng(39, "It remains unclear why the Lapita halted their expansion across the Pacific.", "yes", "Dừng ở Fiji — lý do không rõ."),
                    ynng(40, "It is likely that the majority of Lapita settled on Fiji.", "not-given", "Gặp hàng trăm đảo kể cả Fiji — không nói đa số định cư ở Fiji."),
                ],
            },
        ],
    }


# ── Test 4 ──────────────────────────────────────────────────────────────────────

T4_P1_WILDFIRES_NOTE_PASSAGE = [
    {
        "type": "section",
        "text": "• Characteristics of wildfires and wildfire conditions today compared to the past:",
    },
    {"type": "static", "text": "– occurrence: more frequent"},
    {"type": "static", "text": "– temperature: hotter"},
    {"type": "static", "text": "– speed: faster"},
    {"type": "static", "text": "– movement: "},
    {"type": "gap", "number": 1},
    {"type": "static", "text": " more unpredictable"},
    {"type": "static", "text": "– size of fires: "},
    {"type": "gap", "number": 2},
    {"type": "static", "text": " greater on average than two decades ago"},
    {
        "type": "section",
        "text": "• Reasons wildfires cause more damage today compared to the past:",
    },
    {"type": "static", "text": "– rainfall: "},
    {"type": "gap", "number": 3},
    {"type": "static", "text": " average"},
    {"type": "static", "text": "– more brush to act as "},
    {"type": "gap", "number": 4},
    {"type": "static", "text": "– increase in yearly temperature"},
    {"type": "static", "text": "– extended fire "},
    {"type": "gap", "number": 5},
    {"type": "static", "text": "– more building of "},
    {"type": "gap", "number": 6},
    {"type": "static", "text": " in vulnerable places"},
]


def t4_p1() -> dict:
    chunk = split_passage_chunks(load_cam10(4))[0]
    return {
        "partNumber": 1,
        "rangeLabel": "Read the text and answer questions 1–13.",
        "passageTitle": "The megafires of California",
        "passageSubtitle": "Drought, housing expansion, and oversupply of tinder make for bigger, hotter fires in the western United States.",
        "passage": passage_for(chunk),
        "questionGroups": [
            {
                "range": "Questions 1–6",
                "instruction": "Complete the notes below. Choose ONE WORD AND/OR A NUMBER from the passage for each answer.",
                "type": "gap-fill",
                "notesTitle": "Wildfires",
                "notePassage": T4_P1_WILDFIRES_NOTE_PASSAGE,
                "questions": [
                    gap(1, "Gap (1)", "spread", "Cháy lan không ổn định hơn (spread more erratically)."),
                    gap(2, "Gap (2)", "10 times|ten times", "Megafire gấp 10 lần cháy rừng trung bình 20 năm trước."),
                    gap(3, "Gap (3)", "below", "Lượng mưa dưới mức bình thường."),
                    gap(4, "Gap (4)", "fuel", "Underbrush là nhiên liệu chính."),
                    gap(5, "Gap (5)", "seasons", "Mùa cháy dài hơn 78 ngày."),
                    gap(6, "Gap (6)", "homes", "Xây nhà trong vùng dễ cháy."),
                ],
            },
            {
                "range": "Questions 7–13",
                "instruction": "Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.",
                "type": "tfng",
                "questions": [
                    tfng(7, "The amount of open space in California has diminished over the last ten years.", "true", "Đất trống thành nhà ở — tăng >600.000/người/năm."),
                    tfng(8, "Many experts believe California has made little progress in readying itself to fight fires.", "false", "Nhiều chuyên gia đánh giá cao tiến bộ chuẩn bị."),
                    tfng(9, "Personnel in the past have been criticised for mishandling fire containment.", "true", "Từng bị chỉ trích vì để cháy lan."),
                    tfng(10, "California has replaced a range of firefighting tools.", "true", "Cung cấp máy, xe, trực thăng mới hơn."),
                    tfng(11, "More firefighters have been hired to improve fire-fighting capacity.", "not-given", "Tăng ngân sách — không nói tuyển thêm lính cứu hỏa."),
                    tfng(12, "Citizens and government groups disapprove of the efforts of different states and agencies working together.", "false", "Phối hợp liên bang hiệu quả hơn trước."),
                    tfng(13, "Randy Jacobs believes that loss of life from fires will continue at the same levels, despite changes made.", "false", "Ông tin sẽ không còn mất mạng như trước."),
                ],
            },
        ],
    }


T4_P2_SUMMARY_NOTE = (
    "Psychologists have traditionally believed that a personality 14________ was impossible and that by a 15________ "
    "a person's character tends to be fixed. This is not true according to positive psychologists, who say that our "
    "personal qualities can be seen as habitual behaviour. One of the easiest qualities to acquire is 16________. "
    "However, regardless of the quality, it is necessary to learn a wide variety of different 17________ in order "
    "for a new quality to develop; for example, a person must understand and feel some 18________ in order to "
    "increase their happiness."
)


def t4_p2() -> dict:
    chunk = split_passage_chunks(load_cam10(4))[1]
    return {
        "partNumber": 2,
        "rangeLabel": "Read the text and answer questions 14–26.",
        "passageTitle": "Second nature",
        "passageSubtitle": "Your personality isn't necessarily set in stone.",
        "passage": _second_nature_passage(chunk),
        "questionGroups": [
            {
                "range": "Questions 14–18",
                "instruction": "Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
                "type": "gap-fill",
                "note": T4_P2_SUMMARY_NOTE,
                "questions": [
                    gap(14, "Gap (14)", "transformation", "Tính cách không thể thay đổi có ý nghĩa."),
                    gap(15, "Gap (15)", "young age", "Đặc điểm hình thành từ rất sớm."),
                    gap(16, "Gap (16)", "optimism", "Lạc quan dễ phát triển hơn."),
                    gap(17, "Gap (17)", "skills", "Cần nhiều kỹ năng đa dạng."),
                    gap(18, "Gap (18)", "negative emotions", "Phải chấp nhận cảm xúc tiêu cực để có niềm vui."),
                ],
            },
            {
                "range": "Questions 19–22",
                "instruction": "Look at the following statements and the list of people below. Match each statement with the correct person, A–G.",
                "type": "matching-features",
                "features": [
                    {"id": "a", "name": "Christopher Peterson"},
                    {"id": "b", "name": "David Fajgenbaum"},
                    {"id": "c", "name": "Suzanne Segerstrom"},
                    {"id": "d", "name": "Tanya Streeter"},
                    {"id": "e", "name": "Todd Kashdan"},
                    {"id": "f", "name": "Kenneth Pedeleose"},
                    {"id": "g", "name": "Cynthia Pury"},
                ],
                "questions": [
                    match_feat(19, "People must accept that they do not know much when first trying something new.", "e", "Kashdan — chấp nhận ngu dốt khi bắt đầu."),
                    match_feat(20, "It is important for people to actively notice when good things happen.", "c", "Segerstrom — ghi 3 điều tích cực mỗi ngày."),
                    match_feat(21, "Courage can be learned once its origins in a sense of responsibility are understood.", "g", "Pury — can đảm từ nghĩa vụ đạo đức."),
                    match_feat(22, "It is possible to overcome shyness when faced with the need to speak in public.", "a", "Peterson — học hướng ngoại cho giảng dạy."),
                ],
            },
            {
                "range": "Questions 23–26",
                "instruction": "Reading Passage 2 has eight sections, A–H. Which section contains the following information?",
                "type": "matching-paragraph",
                "paragraphLetters": list("ABCDEFGH"),
                "questions": [
                    match_para(23, "a mention of how rational thinking enabled someone to achieve physical goals", "d", "Streeter tách nỗi sợ khỏi phán đoán thể chất."),
                    match_para(24, "an account of how someone overcame a sad experience", "b", "Fajgenbaum vượt qua tai nạn, trầm cảm."),
                    match_para(25, "a description of how someone decided to rethink their academic career path", "g", "Zappaterra đổi lab, học healing."),
                    match_para(26, "an example of how someone risked his career out of a sense of duty", "f", "Pedeleose tố cáo sếp dù mất việc."),
                ],
            },
        ],
    }


def t4_p3() -> dict:
    chunk = split_passage_chunks(load_cam10(4))[2]
    endings = [
        {"id": "a", "name": "the question of how certain long-lost traits could reappear."},
        {"id": "b", "name": "the occurrence of a particular feature in different species."},
        {"id": "c", "name": "parallels drawn between behaviour and appearance."},
        {"id": "d", "name": "the continued existence of certain genetic information."},
        {"id": "e", "name": "the doubts felt about evolutionary throwbacks."},
        {"id": "f", "name": "the possibility of evolution being reversible."},
        {"id": "g", "name": "Dollo's findings and the convictions held by Lombroso."},
    ]
    return {
        "partNumber": 3,
        "rangeLabel": "Read the text and answer questions 27–40.",
        "passageTitle": "When evolution runs backwards",
        "passageSubtitle": "Evolution isn't supposed to run backwards — yet an increasing number of examples show that it does.",
        "passage": passage_for(chunk, min_len=60),
        "questionGroups": [
            {
                "range": "Questions 27–31",
                "instruction": "Choose the correct letter, A, B, C or D.",
                "type": "multiple-choice",
                "questions": [
                    mc(
                        27,
                        "When discussing the theory developed by Louis Dollo, the writer says that",
                        [
                            {"id": "a", "label": "it was immediately referred to as Dollo's law."},
                            {"id": "b", "label": "it supported the possibility of evolutionary throwbacks."},
                            {"id": "c", "label": "it was modified by biologists in the early twentieth century."},
                            {"id": "d", "label": "it was based on many years of research."},
                        ],
                        "c",
                        "Sinh học đầu TK20 bổ sung/điều chỉnh nguyên lý của Dollo.",
                    ),
                    mc(
                        28,
                        "The humpback whale caught off Vancouver Island is mentioned because of",
                        [
                            {"id": "a", "label": "the exceptional size of its body."},
                            {"id": "b", "label": "the way it exemplifies Dollo's law."},
                            {"id": "c", "label": "the amount of local controversy it caused."},
                            {"id": "d", "label": "the reason given for its unusual features."},
                        ],
                        "d",
                        "Andrews giải thích là throwback về tổ tiên trên cạn.",
                    ),
                    mc(
                        29,
                        "What is said about 'silent genes'?",
                        [
                            {"id": "a", "label": "Their numbers vary according to species."},
                            {"id": "b", "label": "Raff disagreed with the use of the term."},
                            {"id": "c", "label": "They could lead to the re-emergence of certain characteristics."},
                            {"id": "d", "label": "They can have an unlimited life span."},
                        ],
                        "c",
                        "Bật lại gene tắt có thể làm đặc điểm cũ tái xuất.",
                    ),
                    mc(
                        30,
                        "The writer mentions the mole salamander because",
                        [
                            {"id": "a", "label": "it exemplifies what happens in the development of most amphibians."},
                            {"id": "b", "label": "it suggests that Raff's theory is correct."},
                            {"id": "c", "label": "it has lost and regained more than one ability."},
                            {"id": "d", "label": "its ancestors have become the subject of extensive research."},
                        ],
                        "b",
                        "Metamorphosis là atavism — khớp khung 10 triệu năm của Raff.",
                    ),
                    mc(
                        31,
                        "Which of the following does Wagner claim?",
                        [
                            {"id": "a", "label": "Members of the Bachia lizard family have lost and regained certain features several times."},
                            {"id": "b", "label": "Evidence shows that the evolution of the Bachia lizard is due to the environment."},
                            {"id": "c", "label": "His research into South American lizards supports Raff's assertions."},
                            {"id": "d", "label": "His findings will apply to other species of South American lizards."},
                        ],
                        "a",
                        "Bachia mất và mọc lại ngón chân nhiều lần.",
                    ),
                ],
            },
            {
                "range": "Questions 32–36",
                "instruction": "Complete each sentence with the correct ending, A–G, below.",
                "type": "matching-features",
                "features": endings,
                "questions": [
                    match_feat(32, "For a long time biologists rejected", "f", "Từ chối khả năng tiến hóa đảo ngược."),
                    match_feat(33, "Opposing views on evolutionary throwbacks are represented by", "g", "Dollo vs Lombroso."),
                    match_feat(34, "Examples of evolutionary throwbacks have led to", "a", "Câu hỏi làm sao đặc điểm cũ tái xuất."),
                    match_feat(35, "The shark and killer whale are mentioned to exemplify", "b", "Đặc điểm tương tự ở loài không liên quan."),
                    match_feat(36, "One explanation for the findings of Wagner's research is", "d", "Thông tin di truyền tồn tại hàng chục triệu năm."),
                ],
            },
            {
                "range": "Questions 37–40",
                "instruction": "Do the following statements agree with the claims of the writer in Reading Passage 3? Write YES, NO or NOT GIVEN.",
                "type": "ynng",
                "questions": [
                    ynng(37, "Wagner was the first person to do research on South American lizards.", "not-given", "Wagner nghiên cứu Bachia — không nói là người đầu tiên."),
                    ynng(38, "Wagner believes that Bachia lizards with toes had toeless ancestors.", "yes", "Toed species tiến hóa lại từ tổ tiên không ngón."),
                    ynng(39, "The temporary occurrence of long-lost traits in embryos is rare.", "not-given", "Phôi nhiều loài có tính trạng tổ tiên — không nói hiếm."),
                    ynng(40, "Evolutionary throwbacks might be caused by developmental problems in the womb.", "yes", "Chương trình phát triển không 'mất chân' → atavism."),
                ],
            },
        ],
    }


# ── Answer keys & meta ──────────────────────────────────────────────────────────

KEYS: dict[int, str] = {
    1: """1 FALSE
2 TRUE
3 NOT GIVEN
4 NOT GIVEN
5 TRUE
6 pavilions
7 drought
8 tourists
9 earthquake
10 4 sides
11 tank
12 verandas
13 underwater
14 viii
15 iii
16 xi
17 i
18 v
19 x
20 ii
21 iv
22 TRUE
23 FALSE
24 NOT GIVEN
25 NOT GIVEN
26 FALSE
27 C
28 A
29 D
30 B
31 G
32 E
33 A
34 F
35 B
36 NO
37 YES
38 NOT GIVEN
39 NOT GIVEN
40 NO""",
    2: """1 iv
2 viii
3 vii
4 i
5 vi
6 ix
7 ii
8 NOT GIVEN
9 TRUE
10 FALSE
11 FALSE
12 NOT GIVEN
13 TRUE
14 A
15 D
16 F
17 D
18 B
19 D
20 E
21 A
22 C
23 books AND activities
24 internal regulation
25 emotional awareness
26 spoon-feeding
27 B
28 H
29 L
30 G
31 D
32 C
33 D
34 A
35 D
36 NOT GIVEN
37 NO
38 YES
39 NOT GIVEN
40 NO""",
    3: """1 ii
2 i
3 v
4 vii
5 TRUE
6 NOT GIVEN
7 NOT GIVEN
8 TRUE
9 NOT GIVEN
10 FALSE
11 source of income
12 employer
13 domestic tourism
14 C
15 B
16 H
17 E
18 E
19 sunlight
20 upper
21 dry
22 north
23 FALSE
24 TRUE
25 NOT GIVEN
26 B
27 B
28 F
29 I
30 G
31 D
32 C
33 A
34 D
35 C
36 NO
37 YES
38 NOT GIVEN
39 YES
40 NOT GIVEN""",
    4: """1 spread
2 10 times
3 below
4 fuel
5 seasons
6 homes
7 TRUE
8 FALSE
9 TRUE
10 TRUE
11 NOT GIVEN
12 FALSE
13 FALSE
14 transformation
15 young age
16 optimism
17 skills
18 negative emotions
19 E
20 C
21 G
22 A
23 D
24 B
25 G
26 F
27 C
28 D
29 C
30 B
31 A
32 F
33 G
34 A
35 B
36 D
37 NOT GIVEN
38 YES
39 NOT GIVEN
40 YES""",
}

META: dict[int, tuple[list[str], list[str]]] = {
    1: (
        ["r1t", "r2-headings-tfng", "r3-mc-ynng-endings"],
        [
            "Q1–5 TFNG + Q6–8 gap + Q9–13 table",
            "Q14–21 headings + Q22–26 TFNG",
            "Q27–30 MC + Q31–35 endings + Q36–40 YNNG",
        ],
    ),
    2: (
        ["r1-headings-tfng", "r2h", "r3-summary-mc-ynng"],
        [
            "Q1–7 headings + Q8–13 TFNG",
            "Q14–17 match para + Q18–22 people + Q23–26 gap",
            "Q27–31 summary + Q32–35 MC + Q36–40 YNNG",
        ],
    ),
    3: (
        ["r1-headings-tfng", "r2-match-gap-mc", "r3-summary-mc-ynng"],
        [
            "Q1–4 headings + Q5–10 TFNG + Q11–13 gap",
            "Q14–18 match + Q19–22 notes + Q23–25 TFNG + Q26 MC",
            "Q27–31 summary + Q32–35 MC + Q36–40 YNNG",
        ],
    ),
    4: (
        ["r1n", "r2-gap-match", "r3-mc-endings-ynng"],
        [
            "Q1–6 notes (notePassage) + Q7–13 TFNG",
            "Q14–18 summary (note) + Q19–22 people + Q23–26 match para",
            "Q27–31 MC + Q32–36 endings + Q37–40 YNNG",
        ],
    ),
}

BUILDERS: dict[int, list] = {
    1: [t1_p1, t1_p2, t1_p3],
    2: [t2_p1, t2_p2, t2_p3],
    3: [t3_p1, t3_p2, t3_p3],
    4: [t4_p1, t4_p2, t4_p3],
}


def main() -> None:
    for test in range(1, 5):
        print(f"\n📦 Cambridge 10 Reading Test {test}")
        parts = [fn() for fn in BUILDERS[test]]
        templates, notes = META[test]
        write_test(test, parts, KEYS[test], templates, notes, cambridge=10)


if __name__ == "__main__":
    main()