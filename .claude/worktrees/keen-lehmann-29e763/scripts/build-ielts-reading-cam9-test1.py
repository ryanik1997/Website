#!/usr/bin/env python3
"""Build exam_passage*.json for Cambridge 9 Reading Test 1 from HTM + answer key."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "Tainguyen" / "IELTS" / "Reading IELTS_Test1_Cam9"
HTM = OUT / "Test1_Cam9_Reading.htm"

TFNG_OPTS = [
    {"id": "true", "label": "TRUE"},
    {"id": "false", "label": "FALSE"},
    {"id": "not-given", "label": "NOT GIVEN"},
]
YNNG_OPTS = [
    {"id": "yes", "label": "YES"},
    {"id": "no", "label": "NO"},
    {"id": "not-given", "label": "NOT GIVEN"},
]


def strip_html(raw: str) -> str:
    text = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", raw, flags=re.S | re.I)
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = re.sub(r"</p>", "\n", text, flags=re.I)
    text = re.sub(r"</div>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    text = text.replace("&nbsp;", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def para(text: str) -> dict:
    return {"text": re.sub(r"\s+", " ", text).strip()}


def labeled(label: str, text: str) -> dict:
    return {"label": label, "text": re.sub(r"\s+", " ", text).strip()}


def tfng(n: int, prompt: str, answer: str, explanation: str) -> dict:
    return {
        "number": n,
        "type": "true-false-not-given",
        "prompt": prompt,
        "options": TFNG_OPTS,
        "answer": answer,
        "explanation": explanation,
    }


def ynng(n: int, prompt: str, answer: str, explanation: str) -> dict:
    return {
        "number": n,
        "type": "yes-no-not-given",
        "prompt": prompt,
        "options": YNNG_OPTS,
        "answer": answer,
        "explanation": explanation,
    }


def gap(n: int, prompt: str, answer: str, explanation: str) -> dict:
    return {
        "number": n,
        "type": "gap-fill",
        "prompt": prompt,
        "options": [],
        "answer": answer,
        "explanation": explanation,
    }


def heading_q(n: int, para_label: str, answer: str, explanation: str) -> dict:
    return {
        "number": n,
        "type": "matching-headings",
        "prompt": f"Paragraph {para_label}",
        "options": [],
        "answer": answer,
        "explanation": explanation,
    }


def mc(n: int, prompt: str, options: list[dict], answer: str, explanation: str) -> dict:
    return {
        "number": n,
        "type": "multiple-choice",
        "prompt": prompt,
        "options": options,
        "answer": answer,
        "explanation": explanation,
    }


def build_p1() -> dict:
    return {
        "partNumber": 1,
        "rangeLabel": "Read the text and answer questions 1–13.",
        "passageTitle": "William Henry Perkin",
        "passageSubtitle": "The man who invented synthetic dyes",
        "passage": [
            para(
                "William Henry Perkin was born on March 12, 1838, in London. As a boy, Perkin's curiosity prompted early interests in the arts, sciences, photography, and engineering. But it was a chance stumbling upon a run-down, yet functional, laboratory in his late grandfather's home that solidified the young man's enthusiasm for chemistry."
            ),
            para(
                "As a student at the City of London School, Perkin became immersed in the study of chemistry. His talent and devotion to the subject were perceived by his teacher, Thomas Hall, who encouraged him to attend a series of lectures given by the eminent scientist Michael Faraday at the Royal Institution. Those speeches fired the young chemist's enthusiasm further, and he later went on to attend the Royal College of Chemistry, which he succeeded in entering in 1853, at the age of 15."
            ),
            para(
                "At the time of Perkin's enrollment, the Royal College of Chemistry was headed by the noted German chemist August Wilhelm Hofmann. Perkin's scientific gifts soon caught Hofmann's attention and within two years, he became Hofmann's youngest assistant. Not long after that, Perkin made the scientific breakthrough that would bring him both fame and fortune."
            ),
            para(
                "At the time, quinine was the only viable medical treatment for malaria. The drug is derived from the bark of the cinchona tree, native to South America and by 1856 demand for the drug was surpassing the available supply. Thus, when Hofmann made some passing comments about the desirability of a synthetic substitute for quinine, it was unsurprising that his star pupil was moved to take up the challenge."
            ),
            para(
                "During his vacation in 1856, Perkin spent his time in the laboratory on the top floor of his family's house. He was attempting to manufacture quinine from aniline, an inexpensive and readily available coal tar waste product. Despite his best efforts, however, he did not end up with quinine. Instead, he produced a mysterious dark sludge. Luckily, Perkin's scientific training and nature prompted him to investigate the substance further. Incorporating potassium dichromate and alcohol into the aniline at various stages of the experimental process, he finally produced a deep purple solution. And, proving the truth of the famous scientist Louis Pasteur's words \"chance favors only the prepared mind\", Perkin saw the potential of his unexpected find."
            ),
            para(
                "Historically, textile dyes were made from such natural sources as plants and animal excretions. Some of these, such as the glandular mucus of snails, were difficult to obtain and outrageously expensive. Indeed, the purple colour extracted from a snail was once so costly that in society at the time only the rich could afford it. Further, natural dyes tended to be muddy in hue and fade quickly. It was against this backdrop that Perkin's discovery was made."
            ),
            para(
                "Perkin quickly grasped that his purple solution could be used to colour fabric, thus making it the world's first synthetic dye. Realising the importance of this breakthrough, he lost no time in patenting it. But perhaps the most fascinating of all Perkin's reactions to his find was his nearly instant recognition that the new dye had commercial possibilities."
            ),
            para(
                "Perkin originally named his dye Tyrian Purple, but it later became commonly known as mauve (from the French for the plant used to make the colour violet). He asked advice of Scottish dye works owner Robert Pullar, who assured him that manufacturing the dye would be well worth it if the colour remained fast (i.e. would not fade) and the cost was relatively low. So, over the fierce objections of his mentor Hofmann, he left college to give birth to the modern chemical industry."
            ),
            para(
                "With the help of his father and brother, Perkin set up a factory not far from London. Utilizing the cheap and plentiful coal tar that was an almost unlimited byproduct of London's gas street lighting, the dye works began producing the world's first synthetically dyed material in 1857. The company received a commercial boost from Eugénie de Montijo of France, when she decided the new color flattered her. Very soon, mauve was the necessary shade for all the fashionable ladies in that country. Not to be outdone, Queen Victoria also appeared in public wearing a mauve gown, thus making it all the rage in England as well. The dye was bold and fast, and the public clamoured for more. Perkin went back to the drawing board."
            ),
            para(
                "Although Perkin's fame was achieved and fortune assured by his first discovery, the chemist continued his research. Among other dyes he developed and introduced were aniline red (1859) and aniline black (1863) and in the late 1860s, Perkin's green. It is important to note that Perkin's synthetic dye discoveries had outcomes far beyond the merely decorative. The dyes also became vital to medical research in many ways. For instance, they were used to stain previously invisible microbes and bacteria, allowing researchers to identify such bacilli as tuberculosis, cholera, and anthrax. Artificial dyes continue to play a crucial role today. And, in what would have been particularly pleasing to Perkin, their current use is in the search for a vaccine against malaria."
            ),
        ],
        "questionGroups": [
            {
                "range": "Questions 1–7",
                "instruction": "Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.",
                "type": "tfng",
                "questions": [
                    tfng(
                        1,
                        "Michael Faraday suggested Perkin should enrol in the Royal College of Chemistry.",
                        "false",
                        "Thomas Hall khuyến khích Perkin, không phải Faraday trực tiếp đề nghị nhập học.",
                    ),
                    tfng(
                        2,
                        "Perkin employed August Wilhelm Hofmann as his assistant.",
                        "false",
                        "Hofmann là thầy và chủ phòng thí nghiệm; Perkin là trợ lý của Hofmann.",
                    ),
                    tfng(
                        3,
                        "Perkin was still young when he made the discovery that made him rich and famous.",
                        "true",
                        "Ông mới 18 tuổi khi phát hiện thuốc nhuộm tím năm 1856.",
                    ),
                    tfng(
                        4,
                        "The trees from which quinine is derived grow only in South America.",
                        "true",
                        "Passage nêu cinchona tree native to South America.",
                    ),
                    tfng(
                        5,
                        "Perkin hoped to manufacture a drug from a coal tar waste product.",
                        "true",
                        "Ông cố sản xuất quinine từ aniline — phế phẩm than đá.",
                    ),
                    tfng(
                        6,
                        "Perkin was inspired by the discoveries of the famous scientist Louis Pasteur.",
                        "not-given",
                        "Passage trích lời Pasteur nhưng không nói Perkin bị truyền cảm hứng từ các khám phá của ông.",
                    ),
                    tfng(
                        7,
                        "Perkin's discovery led to the birth of the modern chemical industry.",
                        "true",
                        "Ông bỏ học để thành lập xưởng nhuộm — mở ra ngành công nghiệp hóa học hiện đại.",
                    ),
                ],
            },
            {
                "range": "Questions 8–13",
                "instruction": "Answer the questions below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
                "type": "gap-fill",
                "questions": [
                    gap(
                        8,
                        "Before Perkin's discovery, with what group in society was the colour purple associated?",
                        "the rich|rich|only rich",
                        "Màu tím từ ốc sên đắt đến mức chỉ người giàu mới dùng được.",
                    ),
                    gap(
                        9,
                        "What potential did Perkin immediately understand that his new dye had?",
                        "commercial|commercial possibilities",
                        "Ông nhận ra khả năng thương mại của thuốc nhuộm.",
                    ),
                    gap(10, "What was the name finally used to refer to the first colour Perkin invented?", "mauve", "Tên phổ biến là mauve."),
                    gap(
                        11,
                        "What was the name of the person Perkin consulted before setting up his own dye works?",
                        "robert pullar|pullar",
                        "Robert Pullar — chủ xưởng nhuộm Scotland.",
                    ),
                    gap(
                        12,
                        "In what country did Perkin's newly invented colour first become fashionable?",
                        "france|in france",
                        "Eugénie de Montijo ở Pháp làm màu mauve thịnh hành trước.",
                    ),
                    gap(
                        13,
                        "According to the passage, which disease is now being targeted by researchers using synthetic dyes?",
                        "malaria",
                        "Thuốc nhuộm nhân tạo hỗ trợ tìm vaccine chống malaria.",
                    ),
                ],
            },
        ],
    }


def build_p2() -> dict:
    intro = (
        "The question of whether we are alone in the Universe has haunted humanity for centuries, but we may now stand poised on the brink of the answer to that question, as we search for radio signals from other intelligent civilisations. This search, often known by the acronym SETI [search for extra-terrestrial intelligence], is a difficult one. Although groups around the world have been searching intermittently for three decades, it is only now that we have reached the level of technology where we can make a determined attempt to search all nearby stars for any sign of life."
    )
    a = (
        "The primary reason for the search is basic curiosity – the same curiosity about the natural world that drives all pure science. We want to know whether we are alone in the Universe. We want to know whether life evolves naturally if given the right conditions, or whether there is something very special about the Earth to have fostered the variety of life forms that we see around us on the planet. The simple detection of a radio signal will be sufficient to answer this most basic of all questions. In this sense, SETI is another cog in the machinery of pure science which is continually pushing out the horizon of our knowledge. However, there are other reasons for being interested in whether life exists elsewhere. For example, we have had civilization on Earth for perhaps only a few thousand years, and the threats of nuclear war and pollution over the last few decades have told us that our survival may be tenuous. Will we last another two thousand years or will we wipe ourselves out? Since the lifetime of a planet like ours is several billion years, we can expect that if other civilizations do survive in our galaxy, their ages will range from zero to several billion years. Thus any other civilization that we hear from is likely to be far older on average than ourselves. The mere existence of such a civilization will tell us that long-term survival is possible, and gives us some cause for optimism. It is even possible that the older civilization may pass on the benefits of their experience in dealing with threats to survival such as nuclear war and global pollution, and other threats that we haven't yet discovered."
    )
    b = (
        "In discussing whether we are alone, most SETI scientists adopt two ground rules. First, UFOs [Unidentified Flying Objects] are generally ignored since most scientists don't consider the evidence for them to be strong enough to bear serious consideration (although it is also important to keep an open mind in case any really convincing evidence emerges in the future). Second, we make a very conservative assumption that we are looking for a life form that is pretty well like us, since if it differs radically from us we may well not recognize it as a life form, quite apart from whether we are able to communicate with it. In other words, the life form we are looking for may well have two green heads and seven fingers, but it will nevertheless resemble us in that it should communicate with its fellows, be interested in the Universe, live on a planet orbiting a star like our Sun, and perhaps most restrictively have chemistry, like us, based on carbon and water."
    )
    c = (
        "Even when we make these assumptions, our understanding of other life forms is still severely limited. We do not even know, for example, how many stars have planets, and we certainly do not know how likely it is that life will arise naturally, given the right conditions. However, when we look at the 100 billion stars in our galaxy [the Milky Way], and 100 billion galaxies in the observable Universe, it seems inconceivable that at least one of these planets does not have a life form on it; in fact, the best educated guess we can make using the little that we do know about the conditions for carbon-based life, leads us to estimate that perhaps one in 100,000 stars might have a life-bearing planet orbiting it. That means that our nearest neighbors are perhaps 1000 light years away, which is almost next door in astronomical terms."
    )
    d = (
        "An alien civilization could choose many different ways of sending information across the galaxy, but many of these either require too much energy, or else are severely attenuated while traversing the vast distances across the galaxy. It turns out that, for a given amount of transmitted power, radio waves in the frequency range 1000 to 3000 MHz travel the greatest distance, and so all searches to date have concentrated on looking for radio waves in this frequency range. So far there have been a number of searches by various groups around the world, including Australian searches using the radio telescope at Parkes, New South Wales. Until now there have not been any detections from the few hundred stars which have been searched. The scale of the searches has been increased dramatically since 1992, when the US Congress voted NASA $10 million per year for ten years to conduct a thorough search for extra-terrestrial life. Much of the money in this project is being spent on developing the special hardware needed to search many frequencies at once. The project has two parts. One part is a targeted search using the world's largest radio telescopes, the American-operated telescope in Arecibo, Puerto Rico and the French telescope in Nancy in France. This part of the project is searching the nearest 1000 likely stars with a high sensibility for signals in the frequency range 1000 to 3000 MHz. The other part of the project is an undirected search which is monitoring all of the space with a lower sensitivity using the smaller antennas of NASA's Deep Space Network."
    )
    e = (
        "There is considerable debate over how we should react if we detect a signal from an alien civilization. Everybody agrees that we should not reply immediately. Quite apart from the impracticality of sending a reply over such large distances at short notice, it raises a host of ethical questions that would have to be addressed by the global community before any reply could be sent. Would the human race face the culture shock if faced with a superior and much older civilization? Luckily, there is no urgency about this. The stars being searched are hundreds of light years away, so it takes hundreds of years for their signal to reach us, and a further few hundred years for our reply to reach them. It is not important, then, if there's a delay of a few years, or decades, while the human race debates the question of whether to reply and perhaps carefully drafts a reply."
    )

    headings = [
        {"id": "i", "label": "Seeking the transmission of radio signals from planets"},
        {"id": "ii", "label": "Appropriate responses to signals from other civilisations"},
        {"id": "iii", "label": "Vast distances to Earth's closest neighbours"},
        {"id": "iv", "label": "Assumptions underlying the search for extra-terrestrial intelligence"},
        {"id": "v", "label": "Reasons for the search for extra-terrestrial intelligence"},
        {"id": "vi", "label": "Knowledge of extra-terrestrial life forms"},
        {"id": "vii", "label": "Likelihood of life on other planets"},
    ]

    return {
        "partNumber": 2,
        "rangeLabel": "Read the text and answer questions 14–26.",
        "passageTitle": "Is there anybody out there?",
        "passage": [para(intro), labeled("A", a), labeled("B", b), labeled("C", c), labeled("D", d), labeled("E", e)],
        "questionGroups": [
            {
                "range": "Questions 14–17",
                "instruction": "Reading Passage 2 has five paragraphs, A–E. Choose the correct heading for paragraphs B–E from the list of headings below.",
                "note": "Example: Paragraph A → v. There are more headings than paragraphs.",
                "type": "matching-headings",
                "headings": headings,
                "questions": [
                    heading_q(14, "B", "iv", "Đoạn B nêu hai quy tắc cơ bản — giả định khi tìm kiếm."),
                    heading_q(15, "C", "vii", "Đoạn C ước tính khả năng có sự sống trên hành tinh khác."),
                    heading_q(16, "D", "i", "Đoạn D tập trung tìm sóng vô tuyến từ các hành tinh."),
                    heading_q(17, "E", "ii", "Đoạn E thảo luận cách phản hồi tín hiệu ngoài hành tinh."),
                ],
            },
            {
                "range": "Questions 18–20",
                "instruction": "Answer the questions below. Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage for each answer.",
                "type": "gap-fill",
                "questions": [
                    gap(
                        18,
                        "What is the life expectancy of Earth?",
                        "several billion years|billion years",
                        "Lifetime of a planet like ours is several billion years.",
                    ),
                    gap(
                        19,
                        "What kind of signals from other intelligent civilisations are SETI scientists searching for?",
                        "radio|radio waves|radio signals",
                        "SETI tìm sóng vô tuyến 1000–3000 MHz.",
                    ),
                    gap(
                        20,
                        "How many stars are the world's most powerful radio telescopes searching?",
                        "1000|1000 stars",
                        "Targeted search quét 1000 ngôi sao gần nhất.",
                    ),
                ],
            },
            {
                "range": "Questions 21–26",
                "instruction": "Do the following statements agree with the views of the writer in Reading Passage 2? Write YES, NO or NOT GIVEN.",
                "type": "ynng",
                "questions": [
                    ynng(
                        21,
                        "Alien civilisations may be able to help the human race to overcome serious problems.",
                        "yes",
                        "Tác giả cho rằng nền văn minh già hơn có thể chia sẻ kinh nghiệm sống sót.",
                    ),
                    ynng(
                        22,
                        "SETI scientists are trying to find a life form that resembles humans in many ways.",
                        "yes",
                        "Họ giả định tìm dạng sống khá giống con người.",
                    ),
                    ynng(
                        23,
                        "The Americans and Australians have co-operated on joint research projects.",
                        "not-given",
                        "Passage nhắc Australia và Mỹ riêng, không nói hợp tác chung.",
                    ),
                    ynng(
                        24,
                        "So far SETI scientists have picked up radio signals from several stars.",
                        "no",
                        "Until now there have not been any detections.",
                    ),
                    ynng(
                        25,
                        "The NASA project attracted criticism from some members of Congress.",
                        "not-given",
                        "Congress cấp ngân sách nhưng không nhắc chỉ trích.",
                    ),
                    ynng(
                        26,
                        "If a signal from outer space is received, it will be important to respond promptly.",
                        "no",
                        "Everybody agrees we should not reply immediately.",
                    ),
                ],
            },
        ],
    }


def build_p3() -> dict:
    passages = [
        para(
            "If you go back far enough, everything lived in the sea. At various points in evolutionary history, enterprising individuals within many different animal groups moved out onto the land, sometimes even to the most parched deserts, taking their own private seawater with them in blood and cellular fluids. In addition to the reptiles, birds, mammals and insects which we see all around us, other groups that have succeeded out of water include scorpions, snails, crustaceans such as woodlice and land crabs, millipedes and centipedes, spiders and various worms. And we mustn't forget the plants, without whose prior invasion of the land none of the other migrations could have happened."
        ),
        para(
            "Moving from water to land involved a major redesign of every aspect of life, including breathing and reproduction. Nevertheless, a good number of thoroughgoing land animals later turned around, abandoned their hard-earned terrestrial re-tooling, and returned to the water. Seals have only gone part way back. They show us what the intermediates might have been like, on the way to extreme cases such as whales and dugongs. Whales (including the small whales we call dolphins) and dugongs, with their close cousins the manatees, ceased to be land creatures altogether and reverted to the full marine habits of their remote ancestors. They don't even come ashore to breed. They do, however, still breathe air, having never developed anything equivalent to the gills of their earlier marine incarnation. Turtles went back to the sea a very long time ago and, like all vertebrate returnees to the water, they breathe air. However, they are, in one respect, less fully given back to the water than whales or dugongs, for turtles still lay their eggs on beaches."
        ),
        para(
            "There is evidence that all modern turtles are descended from a terrestrial ancestor which lived before most of the dinosaurs. There are two key fossils called Progaochelys quenstedti and Palaeochersis talampayensis dating from early dinosaur times, which appear to be close to the ancestry of all modern turtles and tortoises. You might wonder how we can tell whether fossil animals lived on land or in water, especially if only fragments are found. Sometimes it's obvious. Ichthyosaurs were reptilian contemporaries of the dinosaurs, with fins and streamlined bodies. The fossils look like dolphins and they surely lived like dolphins, in the water. With turtles it is a little less obvious. One way to tell is by measuring the bones of their forelimbs."
        ),
        para(
            "Walter Joyce and Jacques Gauthier, at Yale University, obtained three measurements in these particular bones of 71 species of living turtles and tortoises. They used a kind of triangular graph paper to plot the three measurements against one another. All the land tortoise species formed a tight cluster of points in the upper part of the triangle; all the water turtles cluster in the lower part of the triangular graph. There was no overlap, except when they added some species that spend time both in water and on land. Sure enough, these amphibious species show up on the triangular graph approximately half way between the 'wet cluster' of sea turtles and the 'dry cluster' of land tortoises. The next step was to determine where the fossil fell. The bones of P. quenstedti and P. talampayensis leave us in no doubt. Their points on the graph are right in the thick of the dry cluster. Both these fossils were dry-land tortoises. They come from the era before our turtles returned to the water."
        ),
        para(
            "You might think, therefore, that modern land tortoises have probably stayed on land ever since those early terrestrial times, as most mammals did after a few of them went back to the sea. But apparently not. If you draw out the family tree of all modern turtles and tortoises, nearly all the branches are aquatic. Today's land tortoises constitute a single branch, deeply nested among branches consisting of aquatic turtles. This suggests that modern land tortoises have not stayed on land continuously since the time of P. quenstedti and P. talampayensis. Rather, their ancestors were among those who went back to the water, and they then re-emerged back onto the land in (relatively) more recent times."
        ),
        para(
            "Tortoises therefore represent a remarkable double return. In common with all mammals, reptiles and birds, their remote ancestors were marine fish and before that various more or less worm-like creatures stretching back, still in the sea, to the primeval bacteria. Later ancestors lived on land and stayed there for a very large number of generations. Later ancestors still evolved back into the water and became sea turtles. And finally, they returned yet again to the land as tortoises, some of which now live in the driest of deserts."
        ),
        {"imageFile": "part2-page.jpg"},
    ]

    mc_opts = [
        {"id": "a", "label": "they are able to adapt to life in extremely dry environments."},
        {"id": "b", "label": "their original life form was a kind of primeval bacteria."},
        {"id": "c", "label": "they have so much in common with sea turtles."},
        {"id": "d", "label": "they have made the transition from sea to land more than once."},
    ]

    return {
        "partNumber": 3,
        "rangeLabel": "Read the text and answer questions 27–40.",
        "passageTitle": "The history of the tortoise",
        "passage": passages,
        "questionGroups": [
            {
                "range": "Questions 27–30",
                "instruction": "Answer the questions below. Choose NO MORE THAN THREE WORDS from the passage for each answer.",
                "type": "gap-fill",
                "questions": [
                    gap(
                        27,
                        "What had to transfer from sea to land before any animals could migrate?",
                        "plants",
                        "Plants phải lên cạn trước thì động vật mới có thể theo.",
                    ),
                    gap(
                        28,
                        "Which TWO processes are mentioned as those in which animals had to make big changes as they moved onto land?",
                        "breathing reproduction",
                        "Passage nêu breathing and reproduction — gõ cả hai từ.",
                    ),
                    gap(
                        29,
                        "Which physical feature, possessed by their ancestors, do whales lack?",
                        "gills",
                        "Cá voi không phát triển mang như tổ tiên biển.",
                    ),
                    gap(
                        30,
                        "Which animals might ichthyosaurs have resembled?",
                        "dolphins",
                        "Fossil ichthyosaurs trông và sống giống dolphins.",
                    ),
                ],
            },
            {
                "range": "Questions 31–33",
                "instruction": "Do the following statements agree with the information given in Reading Passage 3? Write TRUE, FALSE or NOT GIVEN.",
                "type": "tfng",
                "questions": [
                    tfng(
                        31,
                        "Turtles were among the first group of animals to migrate back to the sea.",
                        "not-given",
                        "Passage nói turtles quay lại biển từ lâu nhưng không so sánh nhóm đầu tiên.",
                    ),
                    tfng(
                        32,
                        "It is always difficult to determine where an animal lived when its fossilised remains are incomplete.",
                        "false",
                        "Passage: Sometimes it's obvious — không phải lúc nào cũng khó.",
                    ),
                    tfng(
                        33,
                        "The habitat of ichthyosaurs can be determined by the appearance of their fossilised remains.",
                        "true",
                        "Ichthyosaurs — fossils look like dolphins, lived in water.",
                    ),
                ],
            },
            {
                "range": "Questions 34–39",
                "instruction": "Complete the flow-chart below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.",
                "type": "gap-fill",
                "questions": [
                    gap(
                        34,
                        "71 species of living turtles and tortoises were examined and a total of ___ were taken from the bones of their forelimbs.",
                        "3 measurements|three measurements",
                        "Yale đo 3 measurements trên xương chi trước.",
                    ),
                    gap(
                        35,
                        "The data was recorded on a ___ (necessary for comparing the information).",
                        "triangular graph|graph",
                        "Dùng triangular graph paper để vẽ.",
                    ),
                    gap(
                        36,
                        "Outcome: Land tortoises were represented by a dense ___ of points towards the top.",
                        "cluster",
                        "Land tortoises tạo tight cluster phía trên.",
                    ),
                    gap(
                        37,
                        "The same data was collected from some living ___ species and added to the other results.",
                        "amphibious",
                        "Species vừa nước vừa cạn — amphibious.",
                    ),
                    gap(
                        38,
                        "Outcome: The points for these species turned out to be positioned about ___ up the triangle between the land tortoises and the sea turtles.",
                        "half way|halfway",
                        "Amphibious species nằm khoảng half way giữa hai cụm.",
                    ),
                    gap(
                        39,
                        "Outcome: The position of the points indicated that both these ancient creatures were ___",
                        "dry-land tortoises|dry land tortoises",
                        "P. quenstedti và P. talampayensis là dry-land tortoises.",
                    ),
                ],
            },
            {
                "range": "Question 40",
                "instruction": "Choose the correct letter, A, B, C or D.",
                "type": "multiple-choice",
                "questions": [
                    mc(
                        40,
                        "According to the writer, the most significant thing about tortoises is that they",
                        mc_opts,
                        "d",
                        "Đoạn cuối: tortoises represent a remarkable double return.",
                    ),
                ],
            },
        ],
    }


ANSWER_KEY = """1 FALSE
2 FALSE
3 TRUE
4 TRUE
5 TRUE
6 NOT GIVEN
7 TRUE
8 (the) rich
9 commercial (possibilities)
10 mauve
11 (Robert) Pullar
12 (in) France
13 malaria
14 iv
15 vii
16 i
17 ii
18 several billion years
19 radio (waves/signals)
20 1000 (stars)
21 YES
22 YES
23 NOT GIVEN
24 NO
25 NOT GIVEN
26 NO
27 plants
28 breathing AND reproduction (either order)
29 gills
30 dolphins
31 NOT GIVEN
32 FALSE
33 TRUE
34 3 measurements
35 (triangular) graph
36 cluster
37 amphibious
38 half way
39 dry-land tortoises
40 D
"""


def main() -> None:
    p1 = build_p1()
    p2 = build_p2()
    p3 = build_p3()

    for name, data in [
        ("exam_passage1.json", p1),
        ("exam_passage2.json", p2),
        ("exam_passage3.json", p3),
    ]:
        path = OUT / name
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"✓ {name}")

    (OUT / "answer-key.txt").write_text(ANSWER_KEY.strip() + "\n", encoding="utf-8")
    print("✓ answer-key.txt")

    meta_path = OUT / "meta.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    meta["passages"] = [
        {**meta["passages"][0], "template": "r1g", "note": "Q1–7 TFNG + Q8–13 gap"},
        {**meta["passages"][1], "template": "r2h", "note": "Q14–17 headings + Q18–20 gap + Q21–26 YNNG"},
        {**meta["passages"][2], "template": "r3f", "note": "Q27–30 gap + Q31–33 TFNG + Q34–39 flow + Q40 MC"},
    ]
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("✓ meta.json")


if __name__ == "__main__":
    main()