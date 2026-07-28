"""Build pet-reading-test1.zip bundle from Cambridge PET B1 Sample Test."""
import json
import shutil
import zipfile
from pathlib import Path

SRC = Path(r"C:/Users/ADMIN/OneDrive/Desktop/Dethi/Reading PET B1")
OUT_DIR = Path(r"C:/Users/ADMIN/OneDrive/Desktop/Dethi/Reading PET B1/pet-reading-test1")
REPO_DIR = Path(r"D:/App-English-Ryan/Website/Tainguyen/pet-reading-test1")
ZIP_PATHS = [
    SRC.parent / "pet-reading-test1.zip",
    Path(r"D:/App-English-Ryan/Website/Tainguyen/pet-reading-test1.zip"),
]

LETTERS_8 = [{"id": c, "label": c} for c in "ABCDEFGH"]
LETTERS_4 = [{"id": c, "label": c} for c in "ABCD"]


def mc(n, prompt, options, answer, explanation=""):
    return {
        "number": n,
        "type": "multiple-choice",
        "prompt": prompt,
        "options": options,
        "answer": answer.lower(),
        "explanation": explanation,
    }


def match_q(n, prompt, answer, explanation=""):
    return {
        "number": n,
        "type": "matching-features",
        "prompt": prompt,
        "options": LETTERS_8,
        "answer": answer.lower(),
        "explanation": explanation,
    }


def gap_q(n, answer, explanation=""):
    return {
        "number": n,
        "type": "gap-fill",
        "prompt": f"Gap ({n})",
        "answer": answer.lower(),
        "explanation": explanation,
    }


MARKETS = [
    ("A", "Beckfield Market", (
        "This market's world-famous for second-hand camera equipment and books on photography. "
        "As well as an amazing range of cameras, we have old pictures of local places of interest for you to buy, "
        "and of course the stall owners are happy to give you advice for free! Don't miss our hot soup stall in cold weather."
    )),
    ("B", "Rosewell Hill", (
        "Our market's in an amazing building that's hundreds of years old. Visitors find our late-night opening hours "
        "convenient, and there are always performers entertaining the crowds. We've recently opened more stalls "
        "specializing in pictures both from well-known artists and also those beginning their careers."
    )),
    ("C", "Camberwall Market", (
        "There's lots to see in this interesting indoor market, so it's open from morning until late, in a fantastic "
        "modern setting. Find everything from rare gold and silver jewellery to designer clothes – although the prices "
        "aren't cheap, the quality's excellent. After shopping, enjoy a meal in a nearby restaurant."
    )),
    ("D", "Cobbledown Road", (
        "A small market that's open in all weathers. Come and find something really fantastic – treat yourself or someone "
        "special! We have a wide selection of jewellery and musical instruments, produced locally by highly-skilled people, "
        "and home-made cakes to enjoy."
    )),
    ("E", "Oldford Lane", (
        "Situated in the historic city centre, you'll find a wide range of jewellery and clothes. Arrive early to avoid "
        "disappointment – bargains are found in the morning, and the stalls pack up after lunch. If the weather's good, "
        "enjoy watching the world go by, although it gets very busy in the tourist season."
    )),
    ("F", "Purford Market", (
        "Close to museums and art galleries, this is the place to buy something for lunch, as well as fresh fruit and "
        "special breads. Try the region's famous cheese – the producers are there with advice on different types. Eat on the "
        "seats situated around the market, watching the colourful scene and enjoying music from local bands."
    )),
    ("G", "Teddingley Market", (
        "Situated under historic city walls, in this busy market you'll find a huge selection of great-value new and "
        "second-hand clothes. There are also stalls offering unusual albums by international singers, often hard to find "
        "in shops. Our world-food area allows you to taste food from abroad, cooked in front of you by international chefs."
    )),
    ("H", "Frome Place", (
        "Stalls open during normal daytime shopping hours so, depending on the weather, there's plenty to entertain you "
        "the whole day. Try our sandwich bar if you're hungry, and look for an old copy of something by a favourite author. "
        "We also have gifts from all over the world."
    )),
]

PART4_SENTENCES = [
    ("A", "That's why I knew it was a terrible plan."),
    ("B", "I had trained in icy water in the UK so the crystal clear warm water felt amazing."),
    ("C", "They always ask lots of questions."),
    ("D", "I work far harder than I used to."),
    ("E", "I began joking to friends about sending in an application."),
    ("F", "Afterwards, some people were surprised by my decision but I wasn't too worried."),
    ("G", "I decided I needed a break."),
    ("H", "I needed to explain that first."),
]

exam = {
    "version": 1,
    "title": "PET B1 Reading — Test 1",
    "durationMinutes": 45,
    "bandHint": "B1 Preliminary Reading",
    "examTrack": "cambridge",
    "cambridgeLevel": "b1",
    "parts": [
        {
            "partNumber": 1,
            "rangeLabel": "Questions 1–5",
            "passageTitle": "Part 1 — Signs and messages",
            "passage": [{"imageFile": f"part1-q{i}.jpg"} for i in range(1, 6)],
            "questionGroups": [{
                "range": "Questions 1–5",
                "instruction": "For each question, choose the correct answer.",
                "type": "multiple-choice",
                "questions": [
                    mc(1, "Question 1", [
                        {"id": "A", "label": "The competition is open to people over a certain age."},
                        {"id": "B", "label": "There is a maximum age limit for this competition."},
                        {"id": "C", "label": "Only eighteen-year-olds are allowed to enter this competition."},
                    ], "a", "Đáp án A — mở cho người trên một độ tuổi nhất định."),
                    mc(2, "Adam is telling Rachel to", [
                        {"id": "A", "label": "post something for him."},
                        {"id": "B", "label": "find out how to do something."},
                        {"id": "C", "label": "give him something he needs."},
                    ], "c", "Adam cần Rachel đưa/cho anh ấy thứ anh ấy cần."),
                    mc(3, "Question 3", [
                        {"id": "A", "label": "Members of staff must be accompanied if they wish to pass this point."},
                        {"id": "B", "label": "Members of the public can't go through unless they are visiting someone working here."},
                        {"id": "C", "label": "Members of the public may go further if a company employee goes with them."},
                    ], "c", "Công chúng được đi tiếp nếu có nhân viên đi cùng."),
                    mc(4, "Question 4", [
                        {"id": "A", "label": "Tom wants to persuade Jane to take him to college tomorrow morning."},
                        {"id": "B", "label": "Tom would like Jane to do him a favour tomorrow morning."},
                        {"id": "C", "label": "Tom is reminding Jane they have to get up early tomorrow morning."},
                    ], "b", "Tom muốn Jane giúp một việc sáng mai."),
                    mc(5, "Question 5", [
                        {"id": "A", "label": "The Careers Centre will give you a copy of any advertisement on this board."},
                        {"id": "B", "label": "This board is used to advertise the work done by the Careers Centre."},
                        {"id": "C", "label": "If you ask the Careers Centre, you can advertise for free on this board."},
                    ], "a", "Careers Centre sẽ cho bản sao quảng cáo trên bảng."),
                ],
            }],
        },
        {
            "partNumber": 2,
            "rangeLabel": "Questions 6–10",
            "passageTitle": "Part 2 — City markets",
            "passage": [
                {"text": "The people below all want to visit a city market. Decide which market would be the most suitable for the people below."},
                *[{"label": letter, "text": f"{name} — {text}"} for letter, name, text in MARKETS],
            ],
            "questionGroups": [{
                "range": "Questions 6–10",
                "instruction": "For each question, choose the correct answer.",
                "type": "matching-features",
                "features": [{"id": letter.lower(), "name": name} for letter, name, _text in MARKETS],
                "questions": [
                    match_q(6, "Jenny wants to buy locally-produced food traditional to the area. She needs somewhere convenient to eat, and as she's sightseeing in the city, the market shouldn't be far from local attractions.", "f"),
                    match_q(7, "Matt wants a market where he can get something to wear at reasonable prices, and something hot to eat. He's also keen on music, and likes finding rare recordings by different bands.", "g"),
                    match_q(8, "Sammie wants to visit a market after spending the day in the city. He would like to photograph a historic place, and buy a painting by someone unknown.", "b"),
                    match_q(9, "Alexia is looking for a really special necklace for her grandmother's birthday. She'd like to spend the whole day at the market, and wants to avoid the cold by staying inside.", "c"),
                    match_q(10, "Ella is looking for objects from other countries for her friends. She'd like to choose a second-hand book to read on the journey home, and wants a snack at the market, too.", "h"),
                ],
            }],
        },
        {
            "partNumber": 3,
            "rangeLabel": "Questions 11–15",
            "passageTitle": "Part 3 — Artist Peter Fuller",
            "passage": [
                {"text": "Artist Peter Fuller talks about his hobby"},
                {"text": "There's a popular idea that artists are not supposed to be into sport, but mountain biking is a huge part of my life. It gets me out of my studio, and into the countryside. But more importantly, racing along as fast as you can leaves you no time to worry about anything that's going on in your life. You're too busy concentrating on not crashing. The only things you pay attention to are the pain in your legs and the rocks on the path in front of you."},
                {"text": "I'm in my sixties now, but I started cycling when I was a kid. In the summer my friends and I would ride our bikes into the woods and see who was brave enough to go down steep hills, or do big jumps. The bikes we had then weren't built for that, and often broke, so I used to draw pictures of bikes with big thick tyres that would be strong enough for what we were doing. They looked just like modern mountain bikes. However, it wasn't until many years later that someone actually invented one. By the 1980s, they were everywhere."},
                {"text": "At that time I was into skateboarding. I did that for a decade until falling off on to hard surfaces started to hurt too much. Mountain biking seemed a fairly safe way to keep fit, so I took that up instead. I made a lot of friends, and got involved in racing, which gave me a reason to train hard. I wanted to find out just how fit and fast I could get, which turned out to be fairly quick. I even won a couple of local races."},
                {"text": "In the end I stopped racing, mainly because I knew what it could mean to my career if I had a bad crash. But I still like to do a three-hour mountain bike ride every week. And if I'm out cycling in the hills and see a rider ahead, I have to beat them to the top. As I go past I imagine how surprised they would be if they knew how old I am."},
            ],
            "questionGroups": [{
                "range": "Questions 11–15",
                "instruction": "For each question, choose the correct answer.",
                "type": "multiple-choice",
                "questions": [
                    mc(11, "Peter enjoys mountain biking because", [
                        {"id": "A", "label": "it gives him the opportunity to enjoy the views."},
                        {"id": "B", "label": "he can use the time to plan his work."},
                        {"id": "C", "label": "he is able to stop thinking about his problems."},
                        {"id": "D", "label": "it helps him to concentrate better."},
                    ], "c", "Đạp xe nhanh giúp anh ấy không còn lo lắng về cuộc sống."),
                    mc(12, "What does Peter say about cycling during his childhood?", [
                        {"id": "A", "label": "He is sorry he didn't take more care of his bike."},
                        {"id": "B", "label": "His friends always had better quality bikes than he did."},
                        {"id": "C", "label": "His bike wasn't suitable for the activities he was doing."},
                        {"id": "D", "label": "He was more interested in designing bikes than riding them."},
                    ], "c", "Xe lúc đó không phù hợp với trò chơi của bọn trẻ."),
                    mc(13, "Peter says he returned to cycling after several years", [
                        {"id": "A", "label": "because he had become unfit."},
                        {"id": "B", "label": "so that he could enter races."},
                        {"id": "C", "label": "in order to meet new people."},
                        {"id": "D", "label": "to replace an activity he had given up."},
                    ], "d", "Thay thế skateboarding vì đau khi ngã."),
                    mc(14, "How does Peter feel about cycling now?", [
                        {"id": "A", "label": "He is proud that he is still so fast."},
                        {"id": "B", "label": "He is keen to do less now that he is older."},
                        {"id": "C", "label": "He regrets the fact that he can no longer compete."},
                        {"id": "D", "label": "He wishes more people were involved in the sport."},
                    ], "a", "Vẫn tự hào vì còn nhanh — cố vượt người khác trên đồi."),
                    mc(15, "What would be a good introduction to this article?", [
                        {"id": "A", "label": "For Peter Fuller, nothing matters more than mountain biking, not even his career. Here, in his own words, he tells us why."},
                        {"id": "B", "label": "Artist Peter Fuller takes mountain biking pretty seriously. Here he describes how it all began and what he gets out of it."},
                        {"id": "C", "label": "In this article, Peter Fuller explains how he became an artist only as a result of his interest in mountain biking."},
                        {"id": "D", "label": "After discovering mountain biking late in life, Peter Fuller gave up art for a while to concentrate on getting as good as possible."},
                    ], "b", "Giới thiệu nghệ sĩ và đam mê mountain biking."),
                ],
            }],
        },
        {
            "partNumber": 4,
            "rangeLabel": "Questions 16–20",
            "passageTitle": "Part 4 — A new life",
            "passage": [
                {"text": "A new life"},
                {"text": (
                    "I used to work as a college lecturer in the north of England, running photography courses. It wasn't a "
                    "bad job and I really liked my students, but I began to feel tired of doing the same thing every day. "
                    "(16) ........"
                )},
                {"text": (
                    "I'd always loved travelling, so one weekend I typed 'international volunteering' into an internet search "
                    "engine. At the top of the results page was the opportunity to go and stay on an island in the Indian Ocean, "
                    "thousands of miles away, and help to protect the beaches and the sea life. (17) ........ I had some diving "
                    "experience, and the more I talked about it, the more I wanted to do it. So I contacted the organisation. "
                    "One week later they offered to send me to the island and I accepted. (18) ........ After all, the volunteer "
                    "job was only for two months during the summer holidays. I thought after I'd finished, I'd come home."
                )},
                {"text": (
                    "As soon as I got to the island, I was sure I'd done the right thing. My first dive was incredible. "
                    "(19) ........ I felt so lucky to be able to experience that every day."
                )},
                {"text": (
                    "In fact I loved it so much that I never came home! I've now been on the island for ten years and I have "
                    "a permanent job. I'm working as a marine educator, teaching volunteers about the sea life and taking them "
                    "snorkelling and diving. My desk is a picnic table 10 metres from the best beach on the island. Of course "
                    "not everything about my new life is perfect. (20) ........ However, I can't imagine going back to my old life."
                )},
                {"text": "Sentences"},
                *[{"label": letter, "text": text} for letter, text in PART4_SENTENCES],
            ],
            "questionGroups": [{
                "range": "Questions 16–20",
                "instruction": "Five sentences have been removed. For each question, choose the correct answer. There are three extra sentences which you do not need to use.",
                "type": "matching-features",
                "features": [{"id": letter.lower(), "name": text} for letter, text in PART4_SENTENCES],
                "questions": [
                    match_q(16, "Gap (16)", "g", "I decided I needed a break."),
                    match_q(17, "Gap (17)", "e", "Began joking to friends about sending an application."),
                    match_q(18, "Gap (18)", "f", "Some people surprised but wasn't worried."),
                    match_q(19, "Gap (19)", "b", "Trained in icy UK water — warm water felt amazing."),
                    match_q(20, "Gap (20)", "d", "Works far harder than before."),
                ],
            }],
        },
        {
            "partNumber": 5,
            "rangeLabel": "Questions 21–26",
            "passageTitle": "Part 5 — The Coconut Tree",
            "passage": [
                {"text": "The Coconut Tree"},
                {"text": (
                    "The coconut tree is thought to be one of the most valuable trees in the world. It is mostly found by the "
                    "sea where there is a hot and wet (21) ........ It is mostly found by the sea where there is a hot and wet "
                    "(21) ........ . The coconuts often fall into the sea and float on the water until they (22) ........ another "
                    "beach, where more trees then begin to grow."
                )},
            ],
            "questionGroups": [],
        },
    ],
}

# Fix part 5 passage - I made an error duplicating text. Let me fix in the script before writing.
exam["parts"][4]["passage"] = [
    {"text": "The Coconut Tree"},
    {"text": (
        "The coconut tree is thought to be one of the most valuable trees in the world. It is mostly found by the "
        "sea where there is a hot and wet (21) ........ The coconuts often fall into the sea and float on the water "
        "until they (22) ........ another beach, where more trees then begin to grow."
    )},
    {"text": (
        "Holiday makers often see the coconut tree as no more than an attractive sun umbrella that "
        "provides (23) ........ However, this amazing tree has hundreds of (24) ........ and more are still being discovered."
    )},
    {"text": (
        "People have made houses, boats and baskets from the coconut tree's wood and leaves for centuries. "
        "Even today, if you take a (25) ........ in your cupboards, you will find coconut oil in products as "
        "(26) ........ as medicine and desserts."
    )},
]

exam["parts"][4]["questionGroups"] = [{
    "range": "Questions 21–26",
    "instruction": "For each question, choose the correct answer.",
    "type": "multiple-choice",
    "questions": [
        mc(21, "Gap (21)", [
            {"id": "A", "label": "temperature"}, {"id": "B", "label": "condition"},
            {"id": "C", "label": "climate"}, {"id": "D", "label": "weather"},
        ], "c", "climate — khí hậu nóng ẩm ven biển."),
        mc(22, "Gap (22)", [
            {"id": "A", "label": "reach"}, {"id": "B", "label": "go"},
            {"id": "C", "label": "travel"}, {"id": "D", "label": "arrive"},
        ], "a", "reach another beach."),
        mc(23, "Gap (23)", [
            {"id": "A", "label": "cloud"}, {"id": "B", "label": "shade"},
            {"id": "C", "label": "dark"}, {"id": "D", "label": "cold"},
        ], "b", "shade — bóng mát."),
        mc(24, "Gap (24)", [
            {"id": "A", "label": "uses"}, {"id": "B", "label": "jobs"},
            {"id": "C", "label": "roles"}, {"id": "D", "label": "things"},
        ], "a", "hundreds of uses."),
        mc(25, "Gap (25)", [
            {"id": "A", "label": "scene"}, {"id": "B", "label": "sight"},
            {"id": "C", "label": "look"}, {"id": "D", "label": "view"},
        ], "c", "take a look in your cupboards."),
        mc(26, "Gap (26)", [
            {"id": "A", "label": "opposite"}, {"id": "B", "label": "separate"},
            {"id": "C", "label": "strange"}, {"id": "D", "label": "different"},
        ], "d", "as different as medicine and desserts."),
    ],
}]

exam["parts"].append({
    "partNumber": 6,
    "rangeLabel": "Questions 27–32",
    "passageTitle": "Part 6 — The Natural History Museum",
    "passage": [
        {"text": "The Natural History Museum"},
        {"text": (
            "This is one of my favourite places to visit. I've learned a huge amount about animals and plants "
            "(27) ........ time I've visited. I've even seen bits of rock from the moon!"
        )},
        {"text": (
            "The building's really beautiful and it's easy to find your way around. There are hundreds of interesting "
            "things on display, but (28) ........ you like dinosaurs the best time (29) ........ see them is during "
            "term-time. I've been twice in the school holidays and the queue was (30) ........ long that I wasn't "
            "able to visit that part (31) ........ the museum."
        )},
        {"text": (
            "You'll probably want something to eat while you're there. You can take (32) ........ own picnic and "
            "eat in the museum garden, or try one of the two museum cafés."
        )},
    ],
    "questionGroups": [{
        "range": "Questions 27–32",
        "instruction": "Write ONE word for each gap.",
        "type": "gap-fill",
        "questions": [
            gap_q(27, "every", "every/each time I've visited."),
            gap_q(28, "if", "If you like dinosaurs..."),
            gap_q(29, "to", "best time to see them."),
            gap_q(30, "so", "so long that..."),
            gap_q(31, "of", "that part of the museum."),
            gap_q(32, "your", "take your own picnic."),
        ],
    }],
})


def build_bundle(out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "exam.json").write_text(
        json.dumps(exam, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    for i in range(1, 6):
        src_img = SRC / f"part1-q{i}.jpg"
        if src_img.exists():
            shutil.copy2(src_img, out_dir / f"part1-q{i}.jpg")


def make_zip(folder: Path, zip_path: Path):
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in sorted(folder.iterdir()):
            if f.is_file():
                zf.write(f, f.name)


if __name__ == "__main__":
    build_bundle(OUT_DIR)
    build_bundle(REPO_DIR)
    for zp in ZIP_PATHS:
        make_zip(OUT_DIR, zp)
        print("zip", zp)
    q = sum(len(g["questions"]) for p in exam["parts"] for g in p["questionGroups"])
    print("parts", len(exam["parts"]), "questions", q)
    print("out", OUT_DIR)