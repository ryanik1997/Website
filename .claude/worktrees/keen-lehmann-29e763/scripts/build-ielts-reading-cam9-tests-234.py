#!/usr/bin/env python3
"""Build exam_passage*.json for Cambridge 9 Reading Tests 2, 3, 4."""
from __future__ import annotations

import re

from ielts_reading_cam9_lib import (
    TFNG_OPTS,
    YNNG_OPTS,
    gap,
    heading_q,
    load_plain,
    match_feat,
    match_para,
    mc,
    parse_labeled_blocks,
    parse_paragraphs,
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


def t2_p1() -> dict:
    t = load_plain("cam9-t2-reading-plain.txt")
    passage = parse_labeled_blocks(split_passage_chunks(t)[0], "A-I")
    return {
        "partNumber": 1,
        "rangeLabel": "Read the text and answer questions 1–13.",
        "passageTitle": "Children with auditory function deficit",
        "passage": passage,
        "questionGroups": [
            {
                "range": "Questions 1–6",
                "instruction": "Reading Passage 1 has nine sections, A–I. Which section contains the following information?",
                "note": "NB You may use any letter more than once.",
                "type": "matching-paragraph",
                "paragraphLetters": list("ABCDEFGHI"),
                "questions": [
                    match_para(1, "an account of a national policy initiative", "h", "Objective 3 NZ Disability Strategy."),
                    match_para(2, "a description of a global team effort", "c", "I-INCE international working party."),
                    match_para(3, "a hypothesis as to one reason behind the growth in classroom noise", "b", "Collaborative learning trends raise noise."),
                    match_para(4, "a demand for suitable worldwide regulations", "i", "Appropriate international standards."),
                    match_para(5, "a list of medical conditions which place some children more at risk from noise than others", "d", "Hearing impairment, ASD, ADD/ADHD."),
                    match_para(6, "the estimated proportion of children in New Zealand with auditory problems", "a", "6–10% affected by hearing loss."),
                ],
            },
            {
                "range": "Questions 7–10",
                "instruction": "Answer the questions below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.",
                "type": "gap-fill",
                "questions": [
                    gap(7, "For what period of time has hearing loss in schoolchildren been studied in New Zealand?", "two decades", "Research over two decades."),
                    gap(8, "In addition to machinery noise, what other type of noise can upset children with autism?", "crowd noise", "Autistic children find crowd noise painful."),
                    gap(9, "What term is used to describe the hearing problems of schoolchildren which have not been diagnosed?", "invisible", "Undiagnosed invisible disabilities."),
                    gap(10, "What part of the New Zealand Disability Strategy aims to give schoolchildren equal opportunity?", "objective 3", "Objective 3 — best education."),
                ],
            },
            {
                "range": "Questions 11–12",
                "instruction": "Which TWO of the following factors contributing to classroom noise are mentioned? Choose TWO letters, A–F.",
                "type": "multiple-choice",
                "questions": [
                    mc(11, "Factor mentioned (first letter)", [{"id": "a", "label": "A current teaching methods"}, {"id": "b", "label": "B echoing corridors"}, {"id": "c", "label": "C cooling systems"}, {"id": "d", "label": "D large class sizes"}, {"id": "e", "label": "E loud-voiced teachers"}, {"id": "f", "label": "F playground games"}], "a", "Modern teaching practices."),
                    mc(12, "Factor mentioned (second letter)", [{"id": "a", "label": "A current teaching methods"}, {"id": "b", "label": "B echoing corridors"}, {"id": "c", "label": "C cooling systems"}, {"id": "d", "label": "D large class sizes"}, {"id": "e", "label": "E loud-voiced teachers"}, {"id": "f", "label": "F playground games"}], "c", "Air-conditioning / mechanical ventilation."),
                ],
            },
            {
                "range": "Question 13",
                "instruction": "Choose the correct letter, A, B, C or D.",
                "type": "multiple-choice",
                "questions": [
                    mc(
                        13,
                        "What is the writer's overall purpose in writing this article?",
                        [
                            {"id": "a", "label": "to compare different methods of dealing with auditory problems"},
                            {"id": "b", "label": "to provide solutions for overly noisy learning environments"},
                            {"id": "c", "label": "to increase awareness of the situation of children with auditory problems"},
                            {"id": "d", "label": "to promote New Zealand as a model for other countries to follow"},
                        ],
                        "c",
                        "Tăng nhận thức về trẻ có vấn đề thính giác.",
                    ),
                ],
            },
        ],
    }


def t2_p2() -> dict:
    t = load_plain("cam9-t2-reading-plain.txt")
    passage = parse_labeled_blocks(split_passage_chunks(t)[1], "A-G")
    return {
        "partNumber": 2,
        "rangeLabel": "Read the text and answer questions 14–26.",
        "passageTitle": "Venus in transit",
        "passageSubtitle": "June 2004 saw the first passage of Venus across the face of the Sun in 122 years.",
        "passage": passage,
        "questionGroups": [
            {
                "range": "Questions 14–17",
                "instruction": "Reading Passage 2 has seven paragraphs, A–G. Which paragraph contains the following information?",
                "note": "NB You may use any letter more than once.",
                "type": "matching-paragraph",
                "paragraphLetters": list("ABCDEFG"),
                "questions": [
                    match_para(14, "examples of different ways in which the parallax principle has been applied", "f", "AU value + distances to stars."),
                    match_para(15, "a description of an event which prevented a transit observation", "d", "Le Gentil — clouds / ship pitching."),
                    match_para(16, "a statement about potential future discoveries leading on from transit observations", "g", "Detecting Earth-sized exoplanets."),
                    match_para(17, "a description of physical states connected with Venus which early instruments failed to overcome", "e", "Black drop effect and halo."),
                ],
            },
            {
                "range": "Questions 18–21",
                "instruction": "Look at the following statements and the list of people below. Match each statement with the correct person, A–D.",
                "type": "matching-features",
                "features": [
                    {"id": "a", "name": "Edmond Halley"},
                    {"id": "b", "name": "Johannes Kepler"},
                    {"id": "c", "name": "Guillaume Le Gentil"},
                    {"id": "d", "name": "Johann Franz Encke"},
                ],
                "questions": [
                    match_feat(18, "He calculated the distance of the Sun from the Earth based on observations of Venus with a fair degree of accuracy.", "d", "Encke determined AU."),
                    match_feat(19, "He understood that the distance of the Sun from the Earth could be worked out by comparing observations of a transit.", "a", "Halley proposed parallax method."),
                    match_feat(20, "He realised that the time taken by a planet to go around the Sun depends on its distance from the Sun.", "b", "Kepler — orbital speeds."),
                    match_feat(21, "He witnessed a Venus transit but was unable to make any calculations.", "c", "Le Gentil on ship."),
                ],
            },
            {
                "range": "Questions 22–26",
                "instruction": "Do the following statements agree with the information given in Reading Passage 2? Write TRUE, FALSE or NOT GIVEN.",
                "type": "tfng",
                "questions": [
                    tfng(22, "Halley observed one transit of the planet Venus.", "false", "Halley observed Mercury transit, predicted Venus."),
                    tfng(23, "Le Gentil managed to observe a second Venus transit.", "false", "View clouded out in Philippines."),
                    tfng(24, "The shape of Venus appears distorted when it starts to pass in front of the Sun.", "true", "Black drop — looks smeared."),
                    tfng(25, "Early astronomers suspected that the atmosphere on Venus was toxic.", "not-given", "Atmosphere mentioned but not toxic."),
                    tfng(26, "The parallax principle allows astronomers to work out how far away distant stars are from the Earth.", "true", "Extended to measure star distances."),
                ],
            },
        ],
    }


def t2_p3() -> dict:
    t = load_plain("cam9-t2-reading-plain.txt")
    passage = parse_paragraphs(split_passage_chunks(t)[2], min_len=60)
    endings = [
        {"id": "a", "name": "requires both perceptual and social intelligence skills."},
        {"id": "b", "name": "focuses on how groups decide on an action."},
        {"id": "c", "name": "works in many fields, both artistic and scientific."},
        {"id": "d", "name": "leaves one open to criticism and rejection."},
        {"id": "e", "name": "involves understanding how organisations manage people."},
    ]
    return {
        "partNumber": 3,
        "rangeLabel": "Read the text and answer questions 27–40.",
        "passageTitle": "A neuroscientist reveals how to think differently",
        "passage": passage,
        "questionGroups": [
            {
                "range": "Questions 27–31",
                "instruction": "Choose the correct letter, A, B, C or D.",
                "type": "multiple-choice",
                "questions": [
                    mc(27, "Neuroeconomics is a field of study which seeks to", [{"id": "a", "label": "cause a change in how scientists understand brain chemistry."}, {"id": "b", "label": "understand how good decisions are made in the brain."}, {"id": "c", "label": "understand how the brain is linked to achievement in competitive fields."}, {"id": "d", "label": "trace the specific firing patterns of neurons in different areas of the brain."}], "c", "Brain secrets to success in economic environment."),
                    mc(28, "According to the writer, iconoclasts are distinctive because", [{"id": "a", "label": "they create unusual brain circuits."}, {"id": "b", "label": "their brains function differently."}, {"id": "c", "label": "their personalities are distinctive."}, {"id": "d", "label": "they make decisions easily."}], "b", "Brains differ in perception, fear, social intelligence."),
                    mc(29, "According to the writer, the brain works efficiently because", [{"id": "a", "label": "it uses the eyes quickly."}, {"id": "b", "label": "it interprets data logically."}, {"id": "c", "label": "it generates its own energy."}, {"id": "d", "label": "it relies on previous events."}], "d", "Draws on past experience."),
                    mc(30, "The writer says that perception is", [{"id": "a", "label": "a combination of photons and sound waves."}, {"id": "b", "label": "a reliable product of what your senses transmit."}, {"id": "c", "label": "a result of brain processes."}, {"id": "d", "label": "a process we are usually conscious of."}], "c", "Product of the brain."),
                    mc(31, "According to the writer, an iconoclastic thinker", [{"id": "a", "label": "centralises perceptual thinking in one part of the brain."}, {"id": "b", "label": "avoids cognitive traps."}, {"id": "c", "label": "has a brain that is hardwired for learning."}, {"id": "d", "label": "has more opportunities than the average person."}], "b", "Works around perceptual shortcuts."),
                ],
            },
            {
                "range": "Questions 32–37",
                "instruction": "Do the following statements agree with the claims of the writer in Reading Passage 3? Write YES, NO or NOT GIVEN.",
                "type": "ynng",
                "questions": [
                    ynng(32, "Exposure to different events forces the brain to think differently.", "yes", "Novelty forces new judgments."),
                    ynng(33, "Iconoclasts are unusually receptive to new experiences.", "yes", "Willingness to be exposed to fresh ideas."),
                    ynng(34, "Most people are too shy to try different things.", "not-given", "People avoid different things — shyness not stated."),
                    ynng(35, "If you think in an iconoclastic way, you can easily overcome fear.", "no", "Fear impedes iconoclastic thinking."),
                    ynng(36, "When concern about embarrassment matters less, other fears become irrelevant.", "not-given", "Not discussed."),
                    ynng(37, "Fear of public speaking is a psychological illness.", "no", "Too common to be mental disorder."),
                ],
            },
            {
                "range": "Questions 38–40",
                "instruction": "Complete each sentence with the correct ending, A–E, below.",
                "type": "matching-features",
                "features": endings,
                "questions": [
                    match_feat(38, "Thinking like a successful iconoclast is demanding because it", "a", "Needs perceptual + social intelligence."),
                    match_feat(39, "The concept of the social brain is useful to iconoclasts because it", "b", "Groups coordinate decision making."),
                    match_feat(40, "Iconoclasts are generally an asset because their way of thinking", "c", "Works in many fields."),
                ],
            },
        ],
    }


def t3_p1() -> dict:
    t = load_plain("cam9-t3-reading-plain.txt")
    passage = parse_paragraphs(split_passage_chunks(t)[0], min_len=100)
    bank = [
        {"id": "a", "label": "descriptivists"},
        {"id": "b", "label": "language experts"},
        {"id": "c", "label": "popular speech"},
        {"id": "d", "label": "formal language"},
        {"id": "e", "label": "evaluation"},
        {"id": "f", "label": "rules"},
        {"id": "g", "label": "modern linguists"},
        {"id": "h", "label": "prescriptivists"},
        {"id": "i", "label": "change"},
    ]
    return {
        "partNumber": 1,
        "rangeLabel": "Read the text and answer questions 1–13.",
        "passageTitle": "Attitudes to language",
        "passage": passage,
        "questionGroups": [
            {
                "range": "Questions 1–8",
                "instruction": "Do the following statements agree with the claims of the writer in Reading Passage 1? Write YES, NO or NOT GIVEN.",
                "type": "ynng",
                "questions": [
                    ynng(1, "There are understandable reasons why arguments occur about language.", "yes", "Language belongs to everyone."),
                    ynng(2, "People feel more strongly about language education than about small differences in language usage.", "no", "Arguments over minor points too."),
                    ynng(3, "Our assessment of a person's intelligence is affected by the way he or she uses language.", "yes", "Linguistic factors influence judgment."),
                    ynng(4, "Prescriptive grammar books cost a lot of money to buy in the 18th century.", "not-given", "Not mentioned."),
                    ynng(5, "Prescriptivism still exists today.", "yes", "These attitudes are still with us."),
                    ynng(6, "According to descriptivists, it is pointless to try to stop language change.", "yes", "Halt language change = impossible."),
                    ynng(7, "Descriptivism only appeared after the 18th century.", "no", "Advocates in second half of 18th century."),
                    ynng(8, "Both descriptivists and prescriptivists have been misrepresented.", "yes", "Both sides paint unreal pictures."),
                ],
            },
            {
                "range": "Questions 9–12",
                "instruction": "Complete the summary using the list of words, A–I, below.",
                "type": "summary-completion",
                "wordBank": bank,
                "questions": [
                    summary_q(9, "According to ___, there is only one correct form of language.", "h", "Prescriptivists."),
                    summary_q(10, "Linguists who take this approach place great importance on grammatical ___.", "f", "Rules."),
                    summary_q(11, "Conversely, the view of ___, such as Joseph Priestley, is that grammar should be based on…", "a", "Descriptivists."),
                    summary_q(12, "…grammar should be based on ___.", "c", "Custom of speaking / popular speech."),
                ],
            },
            {
                "range": "Question 13",
                "instruction": "Choose the correct letter, A, B, C or D.",
                "type": "multiple-choice",
                "questions": [
                    mc(13, "What is the writer's purpose in Reading Passage 1?", [{"id": "a", "label": "to argue in favour of a particular approach to writing dictionaries and grammar books"}, {"id": "b", "label": "to present a historical account of differing views of language"}, {"id": "c", "label": "to describe the differences between spoken and written language"}, {"id": "d", "label": "to show how a certain view of language has been discredited"}], "b", "Historical account of views."),
                ],
            },
        ],
    }


def t3_p2() -> dict:
    t = load_plain("cam9-t3-reading-plain.txt")
    passage = parse_labeled_blocks(split_passage_chunks(t)[1], "A-F")
    claims = [
        ("A", "It is a more reliable source of energy than wind power."),
        ("B", "It would replace all other forms of energy in Britain."),
        ("C", "Its introduction has come as a result of public pressure."),
        ("D", "It would cut down on air pollution."),
        ("E", "It could contribute to the closure of many existing power stations in Britain."),
        ("F", "It could be a means of increasing national income."),
        ("G", "It could face a lot of resistance from other fuel industries."),
        ("H", "It could be sold more cheaply than any other type of fuel."),
        ("I", "It could compensate for the shortage of inland sites for energy production."),
        ("J", "It is best produced in the vicinity of coastlines with particular features."),
    ]
    return {
        "partNumber": 2,
        "rangeLabel": "Read the text and answer questions 14–26.",
        "passageTitle": "Tidal power",
        "passage": passage,
        "questionGroups": [
            {
                "range": "Questions 14–17",
                "instruction": "Reading Passage 2 has six paragraphs, A–F. Which paragraph contains the following information?",
                "note": "NB You may use any letter more than once.",
                "type": "matching-paragraph",
                "paragraphLetters": list("ABCDEF"),
                "questions": [
                    match_para(14, "the location of the first test site", "c", "Lynmouth in Devon."),
                    match_para(15, "the way of bringing the power produced on one site back into Britain", "e", "Re-imported via Channel cable."),
                    match_para(16, "a reference to a previous attempt by Britain to find an alternative source of energy", "a", "Wind power abandoned 20 years."),
                    match_para(17, "mention of the possibility of applying technology from another industry", "c", "North Sea oil industry."),
                ],
            },
            {
                "range": "Questions 18–22",
                "instruction": "Which FIVE of the following claims about tidal power are made by the writer? Choose FIVE letters, A–J.",
                "type": "multiple-choice",
                "questions": [
                    mc(18, "Claim made by the writer (1 of 5)", [{"id": x[0].lower(), "label": f"{x[0]} {x[1]}"} for x in claims], "a", "More reliable than wind."),
                    mc(19, "Claim made by the writer (2 of 5)", [{"id": x[0].lower(), "label": f"{x[0]} {x[1]}"} for x in claims], "d", "Reduce CO2 emissions."),
                    mc(20, "Claim made by the writer (3 of 5)", [{"id": x[0].lower(), "label": f"{x[0]} {x[1]}"} for x in claims], "e", "Close gas/coal/nuclear plants."),
                    mc(21, "Claim made by the writer (4 of 5)", [{"id": x[0].lower(), "label": f"{x[0]} {x[1]}"} for x in claims], "f", "Export earner."),
                    mc(22, "Claim made by the writer (5 of 5)", [{"id": x[0].lower(), "label": f"{x[0]} {x[1]}"} for x in claims], "j", "Best at indented coasts."),
                ],
            },
            {
                "range": "Questions 23–26",
                "instruction": "Label the diagram below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
                "type": "gap-fill",
                "questions": [
                    gap(23, "Whole tower can be raised for ___ and the extraction of seaweed from the blades.", "maintenance", "Lifted for maintenance."),
                    gap(24, "Sea life not in danger due to the fact that blades are comparatively ___.", "slow-turning", "Relatively slow-turning blades."),
                    gap(25, "Air bubbles result from the ___ behind blades.", "low pressure", "Low pressure causes bubbles."),
                    gap(26, "This is known as ___.", "cavitation", "Technical term cavitation."),
                ],
            },
        ],
    }


def t3_p3() -> dict:
    t = load_plain("cam9-t3-reading-plain.txt")
    passage = parse_labeled_blocks(split_passage_chunks(t)[2], "A-F")
    return {
        "partNumber": 3,
        "rangeLabel": "Read the text and answer questions 27–40.",
        "passageTitle": "Information theory — the big data",
        "passage": passage,
        "questionGroups": [
            {
                "range": "Questions 27–32",
                "instruction": "Reading Passage 3 has six paragraphs, A–F. Which paragraph contains the following information?",
                "note": "NB You may use any letter more than once.",
                "type": "matching-paragraph",
                "paragraphLetters": list("ABCDEF"),
                "questions": [
                    match_para(27, "an explanation of the factors affecting the transmission of information", "d", "Noise limits rate."),
                    match_para(28, "an example of how unnecessary information can be omitted", "f", "Strip redundant bits."),
                    match_para(29, "a reference to Shannon's attitude to fame", "b", "Shunned acclaim."),
                    match_para(30, "details of a machine capable of interpreting incomplete information", "e", "Bar code scanners."),
                    match_para(31, "a detailed account of an incident involving information theory", "a", "Voyager I repair."),
                    match_para(32, "a reference to what Shannon initially intended to achieve in his research", "c", "Pin down meaning of information."),
                ],
            },
            {
                "range": "Questions 33–37",
                "instruction": "Complete the notes below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
                "type": "gap-fill",
                "questions": [
                    gap(33, "The probe transmitted pictures of both ___ and ___.", "jupiter|saturn", "Jupiter and Saturn images."),
                    gap(34, "The probe then left the ___.", "solar system", "Soared out of the Solar System."),
                    gap(35, "Scientists feared that both the ___ and ___ were about to stop working.", "sensors|circuits", "Sensors and circuits failing."),
                    gap(36, "The only hope was to tell the probe to replace them with ___.", "spares", "Use spares."),
                    gap(37, "A ___ was used to transmit the message at the speed of light.", "radio dish", "NASA Deep Space Network dish."),
                ],
            },
            {
                "range": "Questions 38–40",
                "instruction": "Do the following statements agree with the information given in Reading Passage 3? Write TRUE, FALSE or NOT GIVEN.",
                "type": "tfng",
                "questions": [
                    tfng(38, "The concept of describing something as true or false was the starting point for Shannon in his attempts to send messages over distances.", "true", "Binary bit true/false."),
                    tfng(39, "The amount of information that can be sent in a given time period is determined with reference to the signal strength and noise level.", "true", "Rate depends on signal vs noise."),
                    tfng(40, "Products have now been developed which can convey more information than Shannon had anticipated as possible.", "false", "Turbo codes approach but do not exceed limit."),
                ],
            },
        ],
    }


def t4_p1() -> dict:
    t = load_plain("cam9-t4-reading-plain.txt")
    passage = parse_paragraphs(split_passage_chunks(t)[0], min_len=80)
    return {
        "partNumber": 1,
        "rangeLabel": "Read the text and answer questions 1–13.",
        "passageTitle": "The life and work of Marie Curie",
        "passage": passage,
        "questionGroups": [
            {
                "range": "Questions 1–6",
                "instruction": "Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.",
                "type": "tfng",
                "questions": [
                    tfng(1, "Marie Curie's husband was a joint winner of both Marie's Nobel Prizes.", "false", "Shared 1903 only; 1911 sole winner."),
                    tfng(2, "Marie became interested in science when she was a child.", "not-given", "Prodigious memory — science interest not stated."),
                    tfng(3, "Marie was able to attend the Sorbonne because of her sister's financial contribution.", "true", "Bronia helped after promise."),
                    tfng(4, "Marie stopped doing research for several years when her children were born.", "false", "Births failed to interrupt work."),
                    tfng(5, "Marie took over the teaching position her husband had held.", "true", "Appointed to Pierre's professorship."),
                    tfng(6, "Marie's sister Bronia studied the medical uses of radioactivity.", "not-given", "Bronia studied medicine."),
                ],
            },
            {
                "range": "Questions 7–13",
                "instruction": "Complete the notes below. Choose ONE WORD from the passage for each answer.",
                "type": "gap-fill",
                "questions": [
                    gap(7, "When uranium was discovered to be radioactive, Marie Curie found that the element called ___ had the same property.", "thorium", "Also radioactive."),
                    gap(8, "Marie and Pierre Curie's research into the radioactivity of the mineral known as ___ led to the discovery of two new elements.", "pitchblende", "Led to polonium and radium."),
                    gap(9, "In 1911, Marie Curie received recognition for her work on the element ___.", "radium", "Nobel Chemistry for radium."),
                    gap(10, "Marie and Irene Curie developed X-radiography which was used as a medical technique for ___.", "soldiers", "Treatment of wounded soldiers."),
                    gap(11, "Marie Curie saw the importance of collecting radioactive material both for research and for cases of ___.", "illness", "Treat illness."),
                    gap(12, "The radioactive material stocked in Paris contributed to the discoveries in the 1930s of the ___ and of artificial radioactivity.", "neutron", "Chadwick's neutron."),
                    gap(13, "During her research, Marie Curie was exposed to radiation and as a result she suffered from ___.", "leukaemia", "Died of leukaemia."),
                ],
            },
        ],
    }


def t4_p2() -> dict:
    t = load_plain("cam9-t4-reading-plain.txt")
    passage = parse_labeled_blocks(split_passage_chunks(t)[1], "A-H")
    return {
        "partNumber": 2,
        "rangeLabel": "Read the text and answer questions 14–26.",
        "passageTitle": "Young children's sense of identity",
        "passage": passage,
        "questionGroups": [
            {
                "range": "Questions 14–19",
                "instruction": "Reading Passage 2 has eight paragraphs, A–H. Which paragraph contains the following information?",
                "note": "NB You may use any letter more than once.",
                "type": "matching-paragraph",
                "paragraphLetters": list("ABCDEFGH"),
                "questions": [
                    match_para(14, "an account of the method used by researchers in a particular study", "g", "Red powder mirror experiment."),
                    match_para(15, "the role of imitation in developing a sense of identity", "c", "Others mimic infants."),
                    match_para(16, "the age at which children can usually identify a static image of themselves", "g", "Around second birthday."),
                    match_para(17, "a reason for the limitations of scientific research into 'self-as-subject'", "d", "Difficulties of communication."),
                    match_para(18, "reference to a possible link between culture and a particular form of behaviour", "h", "Ownership in Western societies."),
                    match_para(19, "examples of the wide range of features that contribute to the sense of 'self-as-object'", "e", "Social roles and characteristics."),
                ],
            },
            {
                "range": "Questions 20–23",
                "instruction": "Look at the following findings and the list of researchers below. Match each finding with the correct researcher, A–E.",
                "type": "matching-features",
                "features": [
                    {"id": "a", "name": "James"},
                    {"id": "b", "name": "Cooley"},
                    {"id": "c", "name": "Lewis and Brooks-Gunn"},
                    {"id": "d", "name": "Mead"},
                    {"id": "e", "name": "Bronson"},
                ],
                "questions": [
                    match_feat(20, "A sense of identity can never be formed without relationships with other people.", "d", "Mead — social experience."),
                    match_feat(21, "A child's awareness of self is related to a sense of mastery over things and people.", "b", "Cooley — control objects."),
                    match_feat(22, "At a certain age, children's sense of identity leads to aggressive behaviour.", "e", "Bronson — frustration/anger."),
                    match_feat(23, "Observing their own reflection contributes to children's self awareness.", "c", "Mirror movements contingent."),
                ],
            },
            {
                "range": "Questions 24–26",
                "instruction": "Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.",
                "type": "gap-fill",
                "questions": [
                    gap(24, "First, children come to realise that they can have an effect on the world around them, for example by causing the image to move when they face a ___.", "mirror", "Mirror movements."),
                    gap(25, "This aspect of self-awareness is difficult to research directly, because of ___ problems.", "communication", "Difficulties of communication."),
                    gap(26, "In Western societies, the development of self awareness is often linked to a sense of ___, and can lead to disputes.", "ownership", "Link between self and ownership."),
                ],
            },
        ],
    }


def t4_p3() -> dict:
    t = load_plain("cam9-t4-reading-plain.txt")
    chunk = split_passage_chunks(t)[2]
    q_split = re.split(r"(The Development of\s+Museums)", chunk, flags=re.I)
    passage_chunk = chunk
    if len(q_split) >= 3:
        idx = next((i for i, p in enumerate(q_split) if re.search(r"Development of\s+Museums", p, re.I)), -1)
        if idx >= 0:
            passage_chunk = "".join(q_split[idx:])
    passage = parse_labeled_blocks(passage_chunk, "A-F")
    headings = [
        {"id": "i", "label": "Commercial pressures on people in charge"},
        {"id": "ii", "label": "Mixed views on current changes to museums"},
        {"id": "iii", "label": "Interpreting the facts to meet visitor expectations"},
        {"id": "iv", "label": "The international dimension"},
        {"id": "v", "label": "Collections of factual evidence"},
        {"id": "vi", "label": "Fewer differences between public attractions"},
        {"id": "vii", "label": "Current reviews and suggestions"},
    ]
    return {
        "partNumber": 3,
        "rangeLabel": "Read the text and answer questions 27–40.",
        "passageTitle": "The development of museums",
        "passage": passage,
        "questionGroups": [
            {
                "range": "Questions 27–30",
                "instruction": "Reading Passage 3 has six paragraphs, A–F. Choose the correct heading for paragraphs B–E from the list of headings below.",
                "note": "Example: Paragraph A → v. There are more headings than paragraphs.",
                "type": "matching-headings",
                "headings": headings,
                "questions": [
                    heading_q(27, "B", "ii", "Mixed views on museum changes."),
                    heading_q(28, "C", "vi", "Museums and theme parks less distinct."),
                    heading_q(29, "D", "i", "Commercial pressures on interpreters."),
                    heading_q(30, "E", "iii", "Interpret to avoid visitor bias."),
                ],
            },
            {
                "range": "Questions 31–36",
                "instruction": "Choose the correct letter, A, B, C or D.",
                "type": "multiple-choice",
                "questions": [
                    mc(31, "Compared with today's museums, those of the past", [{"id": "a", "label": "did not present history in a detailed way."}, {"id": "b", "label": "were not primarily intended for the public."}, {"id": "c", "label": "were more clearly organised."}, {"id": "d", "label": "preserved items with greater care."}], "b", "Like storage rooms for scholars."),
                    mc(32, "According to the writer, current trends in the heritage industry", [{"id": "a", "label": "emphasise personal involvement."}, {"id": "b", "label": "have their origins in York and London."}, {"id": "c", "label": "rely on computer images."}, {"id": "d", "label": "reflect minority tastes."}], "a", "Virtual reality — act as part of environment."),
                    mc(33, "The writer says that museums, heritage sites and theme parks", [{"id": "a", "label": "often work in close partnership."}, {"id": "b", "label": "try to preserve separate identities."}, {"id": "c", "label": "have similar exhibits."}, {"id": "d", "label": "are less easy to distinguish than before."}], "d", "Distinction evaporating."),
                    mc(34, "The writer says that in preparing exhibits for museums, experts", [{"id": "a", "label": "should pursue a single objective."}, {"id": "b", "label": "have to do a certain amount of language translation."}, {"id": "c", "label": "should be free from commercial constraints."}, {"id": "d", "label": "have to balance conflicting priorities."}], "d", "Evidence vs attractiveness."),
                    mc(35, "In paragraph E, the writer suggests that some museum exhibits", [{"id": "a", "label": "fail to match visitor expectations."}, {"id": "b", "label": "are based on the false assumptions of professionals."}, {"id": "c", "label": "reveal more about present beliefs than about the past."}, {"id": "d", "label": "allow visitors to make more use of their imagination."}], "c", "Contemporary perceptions."),
                    mc(36, "The passage ends by noting that our view of history is biased because", [{"id": "a", "label": "we fail to use our imagination."}, {"id": "b", "label": "only very durable objects remain from the past."}, {"id": "c", "label": "we tend to ignore things that displease us."}, {"id": "d", "label": "museum exhibits focus too much on the local area."}], "b", "Not everything survives."),
                ],
            },
            {
                "range": "Questions 37–40",
                "instruction": "Do the following statements agree with the information given in Reading Passage 3? Write TRUE, FALSE or NOT GIVEN.",
                "type": "tfng",
                "questions": [
                    tfng(37, "Consumers prefer theme parks which avoid serious issues.", "false", "Theme parks present more serious issues."),
                    tfng(38, "More people visit museums than theme parks.", "not-given", "Not compared."),
                    tfng(39, "The boundaries of Leyden have changed little since the seventeenth century.", "false", "Modern Leyden five times larger."),
                    tfng(40, "Museums can give a false impression of how life used to be.", "true", "Bias in representation."),
                ],
            },
        ],
    }


KEYS = {
    2: """1 H
2 C
3 B
4 I
5 D
6 A
7 two decades
8 crowd noise
9 invisible
10 Objective 3
11 A
12 C
13 C
14 F
15 D
16 G
17 E
18 D
19 A
20 B
21 C
22 FALSE
23 FALSE
24 TRUE
25 NOT GIVEN
26 TRUE
27 C
28 B
29 D
30 C
31 B
32 YES
33 YES
34 NOT GIVEN
35 NO
36 NOT GIVEN
37 NO
38 A
39 B
40 C""",
    3: """1 YES
2 NO
3 YES
4 NOT GIVEN
5 YES
6 YES
7 NO
8 YES
9 H
10 F
11 A
12 C
13 B
14 C
15 E
16 A
17 C
18 A
19 D
20 E
21 F
22 J
23 maintenance
24 slow-turning
25 low pressure
26 cavitation
27 D
28 F
29 B
30 E
31 A
32 C
33 Jupiter Saturn Solar System
34 Solar System
35 sensors circuits
36 spares
37 radio dish
38 TRUE
39 TRUE
40 FALSE""",
    4: """1 FALSE
2 NOT GIVEN
3 TRUE
4 FALSE
5 TRUE
6 NOT GIVEN
7 thorium
8 pitchblende
9 radium
10 soldiers
11 illness
12 neutron
13 leukaemia
14 G
15 C
16 G
17 D
18 H
19 E
20 D
21 B
22 E
23 C
24 mirror
25 communication
26 ownership
27 ii
28 vi
29 i
30 iii
31 B
32 A
33 D
34 D
35 C
36 B
37 FALSE
38 NOT GIVEN
39 FALSE
40 TRUE""",
}

META = {
    2: (["match-gap-mc", "r2t", "mc-ynng-endings"], ["Q1–6 match + Q7–10 gap + Q11–12 TWO + MC", "Q14–17 match + Q18–21 people + TFNG", "MC + YNNG + sentence endings"]),
    3: (["ynng-summary-mc", "r2g", "match-gap-tfng"], ["YNNG + summary + MC", "Match + choose FIVE + diagram", "Match + notes + TFNG"]),
    4: (["r1g", "r2h", "headings-mc-tfng"], ["TFNG + gap notes", "Match para + researchers + summary", "Headings + MC + TFNG"]),
}


def main() -> None:
    builders = {
        2: [t2_p1, t2_p2, t2_p3],
        3: [t3_p1, t3_p2, t3_p3],
        4: [t4_p1, t4_p2, t4_p3],
    }
    for test, fns in builders.items():
        print(f"\n📦 Cambridge 9 Reading Test {test}")
        parts = [fn() for fn in fns]
        tpl, notes = META[test]
        write_test(test, parts, KEYS[test], tpl, notes)


if __name__ == "__main__":
    main()