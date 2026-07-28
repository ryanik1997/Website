"""Build fce-reading-test1.zip from Cambridge FCE B2 Sample Test 1 (D251/01)."""
import json
import zipfile
from pathlib import Path

SRC = Path(r"C:/Users/ADMIN/OneDrive/Desktop/Dethi/Reading FCE B2")
OUT_DIR = Path(r"C:/Users/ADMIN/OneDrive/Desktop/Dethi/Reading FCE B2/fce-reading-test1")
REPO_DIR = Path(r"D:/App-English-Ryan/Website/Tainguyen/fce-reading-test1")
ZIP_PATHS = [
    SRC.parent / "fce-reading-test1.zip",
    Path(r"D:/App-English-Ryan/Website/Tainguyen/fce-reading-test1.zip"),
]

LETTERS_4 = [{"id": c, "label": c} for c in "ABCD"]
LETTERS_7 = [{"id": c, "label": c} for c in "ABCDEFG"]


def mc(n, prompt, options, answer, explanation=""):
    return {
        "number": n,
        "type": "multiple-choice",
        "prompt": prompt,
        "options": options,
        "answer": answer.lower(),
        "explanation": explanation,
    }


def gap_q(n, answer, prompt=None, explanation=""):
    return {
        "number": n,
        "type": "gap-fill",
        "prompt": prompt or f"Gap ({n})",
        "answer": answer.lower(),
        "explanation": explanation,
    }


def match_q(n, prompt, answer, options, explanation=""):
    return {
        "number": n,
        "type": "matching-features",
        "prompt": prompt,
        "options": options,
        "answer": answer.lower(),
        "explanation": explanation,
    }


# --- Part 1: Multiple-choice cloze (Q1-8) ---
PART1_PASSAGE = [
    {"text": "What is genealogy?"},
    {
        "text": (
            "Genealogy is a (0) …..... of history. It concerns family history, (1) ........ than the national or world "
            "history studied at school. It doesn't merely involve drawing a family tree, however – tracing your "
            "family history can also (2) ........ in learning about your roots and your identity. The internet enables "
            "millions of people worldwide to (3) ........ information about their family history, without great (4) ........ ."
        )
    },
    {
        "text": (
            "People who research their family history often (5) ........ that it's a fascinating hobby which (6) ........ "
            "a lot about where they come from and whether they have famous ancestors. According to a survey "
            "involving 900 people who had researched their family history, the chances of discovering a celebrity in "
            "your past are one in ten. The survey also concluded that the (7) ........ back you follow your family "
            "line, the more likely you are to find a relation who was much wealthier than you are. However, the "
            "vast majority of people who (8) ........ in the survey discovered they were better off than their "
            "ancestors."
        )
    },
]

PART1_QUESTIONS = [
    mc(1, "Gap (1)", [
        {"id": "A", "label": "instead"}, {"id": "B", "label": "rather"},
        {"id": "C", "label": "except"}, {"id": "D", "label": "sooner"},
    ], "b", "rather than — hơn là."),
    mc(2, "Gap (2)", [
        {"id": "A", "label": "cause"}, {"id": "B", "label": "mean"},
        {"id": "C", "label": "result"}, {"id": "D", "label": "lead"},
    ], "c", "result in — dẫn đến."),
    mc(3, "Gap (3)", [
        {"id": "A", "label": "accomplish"}, {"id": "B", "label": "access"},
        {"id": "C", "label": "approach"}, {"id": "D", "label": "admit"},
    ], "b", "access information — truy cập thông tin."),
    mc(4, "Gap (4)", [
        {"id": "A", "label": "fee"}, {"id": "B", "label": "price"},
        {"id": "C", "label": "charge"}, {"id": "D", "label": "expense"},
    ], "d", "without great expense — không tốn kém nhiều."),
    mc(5, "Gap (5)", [
        {"id": "A", "label": "describe"}, {"id": "B", "label": "define"},
        {"id": "C", "label": "remark"}, {"id": "D", "label": "regard"},
    ], "c", "remark that — nhận xét rằng."),
    mc(6, "Gap (6)", [
        {"id": "A", "label": "reveals"}, {"id": "B", "label": "opens"},
        {"id": "C", "label": "begins"}, {"id": "D", "label": "arises"},
    ], "a", "reveals a lot — bộc lộ nhiều điều."),
    mc(7, "Gap (7)", [
        {"id": "A", "label": "older"}, {"id": "B", "label": "greater"},
        {"id": "C", "label": "higher"}, {"id": "D", "label": "further"},
    ], "d", "the further back — càng lùi xa quá khứ."),
    mc(8, "Gap (8)", [
        {"id": "A", "label": "attended"}, {"id": "B", "label": "participated"},
        {"id": "C", "label": "included"}, {"id": "D", "label": "associated"},
    ], "b", "participated in the survey — tham gia khảo sát."),
]

# --- Part 2: Open cloze (Q9-16) ---
PART2_PASSAGE = [
    {"text": "Motorbike stunt rider"},
    {
        "text": (
            "I work (0) .......... a motorbike stunt rider – that is, I do tricks on my motorbike at shows. The Le Mans "
            "race track in France was (9) ........ I first saw some guys doing motorbike stunts. I'd never seen "
            "anyone riding a motorbike using just the back wheel before and I was (10) ........ impressed I went "
            "straight home and taught (11) ........ to do the same. It wasn't very long before I began to earn my "
            "living at shows performing my own motorbike stunts."
        )
    },
    {
        "text": (
            "I have a degree (12) ........ mechanical engineering; this helps me to look at the physics (13) ........ "
            "lies behind each stunt. In addition to being responsible for design changes to the motorbike, I have to "
            "work (14) ........ every stunt I do. People often think that my work is very dangerous, but, apart "
            "from (15) ........ some minor mechanical problem happening occasionally during a stunt, nothing ever goes "
            "wrong. I never feel in (16) ........ kind of danger because I'm very experienced."
        )
    },
]

PART2_QUESTIONS = [
    gap_q(9, "where", "Gap (9)", "where I first saw — nơi tôi lần đầu thấy."),
    gap_q(10, "so", "Gap (10)", "so impressed — ấn tượng đến mức."),
    gap_q(11, "myself", "Gap (11)", "taught myself — tự học."),
    gap_q(12, "in", "Gap (12)", "degree in mechanical engineering."),
    gap_q(13, "which", "Gap (13)", "physics which/that lies behind."),
    gap_q(14, "out", "Gap (14)", "work out every stunt — tính toán mỗi pha."),
    gap_q(15, "from", "Gap (15)", "apart from — ngoài việc."),
    gap_q(16, "any", "Gap (16)", "in any kind of danger."),
]

# --- Part 3: Word formation (Q17-24) ---
PART3_PASSAGE = [
    {"text": "An incredible vegetable"},
    {
        "text": (
            "Garlic, a member of the Liliaceae family which also includes onions, is "
            "(0) …….... used in cooking all around the world. China is currently the "
            "largest (17) ........ of garlic, which is particularly associated with the "
            "dishes of northern Africa and southern Europe. It is native to central "
            "Asia and has long had a history as a health-giving food, used both to "
            "prevent and cure (18) ........ In Ancient Egypt, workers building the "
            "pyramids were given garlic to keep them strong, while Olympic "
            "athletes in Greece ate it to increase their resistance to infection."
        )
    },
    {
        "text": (
            "The forefather of antibiotic medicine, Louis Pasteur, claimed garlic "
            "was as (19) ........ as penicillin in treating infections. Modern-day "
            "(20) ........ have proved that garlic can indeed kill bacteria and even "
            "some viruses, so it can be very useful for people who have coughs "
            "and colds. In (21) ........ , some doctors believe that garlic can "
            "reduce blood (22) ........ ."
        )
    },
    {
        "text": (
            "The only (23) ........ to this truly amazing food is that the strong and "
            "rather (24) ........ smell of garlic is not the most pleasant!"
        )
    },
    {"text": "Word stems: COMMON · PRODUCT · ILL · EFFECT · SCIENCE · ADD · PRESS · ADVANTAGE · SPICE"},
]

PART3_QUESTIONS = [
    gap_q(17, "producer", "Gap (17) — PRODUCT", "producer — nhà sản xuất."),
    gap_q(18, "illness", "Gap (18) — ILL", "illness(es) — bệnh tật."),
    gap_q(19, "effective", "Gap (19) — EFFECT", "effective — hiệu quả."),
    gap_q(20, "scientists", "Gap (20) — SCIENCE", "scientists — các nhà khoa học."),
    gap_q(21, "addition", "Gap (21) — ADD", "in addition — thêm vào đó."),
    gap_q(22, "pressure", "Gap (22) — PRESS", "blood pressure — huyết áp."),
    gap_q(23, "disadvantage", "Gap (23) — ADVANTAGE", "disadvantage — bất lợi."),
    gap_q(24, "spicy", "Gap (24) — SPICE", "spicy smell — mùi cay/nồng."),
]

# --- Part 4: Key word transformation (Q25-30) ---
PART4_QUESTIONS = [
    gap_q(25, "a good idea to go", "Joan was in favour of visiting the museum. IDEA → Joan thought it would be … to the museum.", "a good idea to go"),
    gap_q(26, "talented that he", "Arthur has the talent to become a concert pianist. THAT → Arthur is so … could become a concert pianist.", "talented that he"),
    gap_q(27, "if she knew what", "Do you know when the match starts, Sally? IF → Mary asked Sally … time the match started.", "if she knew what / if he knew what"),
    gap_q(28, "spent a long time", "I knocked for ages at Ruth's door but I got no reply. LONG → I … knocking at Ruth's door but I got no reply.", "spent/took/was a long time"),
    gap_q(29, "is said to be", "Everyone says that the band is planning to go on a world tour next year. SAID → The band … planning to go on a world tour next year.", "is/are said to be"),
    gap_q(30, "not call off", "I'd prefer not to cancel the meeting. CALL → I'd rather … the meeting.", "not call off / didn't call off"),
]

# --- Part 5: Reading (Q31-36) ---
PART5_PASSAGE = [
    {"text": "Caitlin on Hale island"},
    {
        "text": (
            "We live on the island of Hale. It's about four kilometres long and two kilometres wide at its broadest "
            "point, and it's joined to the mainland by a causeway called the Stand - a narrow road built across the "
            "mouth of the river which separates us from the rest of the country. Most of the time you wouldn't know "
            "we're on an island because the river mouth between us and the mainland is just a vast stretch of tall "
            "grasses and brown mud. But when there's a high tide and the water rises a half a metre or so above "
            "the road and nothing can pass until the tide goes out again a few hours later, then you know it's an "
            "island."
        )
    },
    {
        "text": (
            "We were on our way back from the mainland. My older brother, Dominic, had just finished his first year "
            "at university in a town 150 km away. Dominic's train was due in at five and he'd asked for a lift back "
            "from the station. Now, Dad normally hates being disturbed when he's writing (which is just about all the "
            "time), and he also hates having to go anywhere, but despite the typical sighs and moans – why can't he "
            "get a taxi? what's wrong with the bus? – I could tell by the sparkle in his eyes that he was really looking "
            "forward to seeing Dominic."
        )
    },
    {
        "text": (
            "So, anyway, Dad and I had driven to the mainland and picked up Dominic from the station. He had "
            "been talking non-stop from the moment he'd slung his rucksack in the boot and got in the car. "
            "University this, university that, writers, books, parties, people, money, gigs. ... And when I say talking, I "
            "don't mean talking as in having a conversation, I mean talking as in jabbering like a mad thing. I didn't "
            "like it ... the way he spoke and waved his hands around as if he was some kind of intellectual or "
            "something. It was embarrassing. It made me feel uncomfortable – that kind of discomfort you feel when "
            "someone you like, someone close to you, suddenly starts acting like a complete idiot. And I didn't like "
            "the way he was ignoring me, either. For all the attention I was getting I might as well not have been "
            "there. I felt a stranger in my own car."
        )
    },
    {
        "text": (
            "As we approached the island on that Friday afternoon, the tide was low and the Stand welcomed us "
            "home, stretched out before us, clear and dry, beautifully hazy in the heat – a raised strip of grey "
            "concrete bound by white railings and a low footpath on either side, with rough cobbled banks leading "
            "down to the water. Beyond the railings, the water was glinting with that wonderful silver light we "
            "sometimes get here in the late afternoon which lazes through to the early evening."
        )
    },
    {
        "text": (
            "We were about halfway across when I saw the boy. My first thought was how odd it was to see "
            "someone walking on the Stand. You don't often see people walking around here. Between Hale and "
            "Moulton (the nearest town about thirty kilometres away on the mainland), there's nothing but small "
            "cottages, farmland, heathland and a couple of hills. So islanders don't walk because of that. If they're "
            "going to Moulton they tend to take the bus. So the only pedestrians you're likely to see around here are "
            "walkers or bird-watchers. But even from a distance I could tell that the figure ahead didn't fit into either "
            "of these categories. I wasn't sure how I knew, I just did."
        )
    },
    {
        "text": (
            "As we drew closer, he became clearer. He was actually a young man rather than a boy. Although he "
            "was on the small side, he wasn't as slight as I'd first thought. He wasn't exactly muscular, but he wasn't "
            "weedy-looking either. It's hard to explain. There was a sense of strength about him, a graceful strength "
            "that showed in his balance, the way he held himself, the way he walked...."
        )
    },
]

PART5_QUESTIONS = [
    mc(31, "In the first paragraph, what is Caitlin's main point about the island?", [
        {"id": "A", "label": "It can be dangerous to try to cross from the mainland."},
        {"id": "B", "label": "It is much smaller than it looks from the mainland."},
        {"id": "C", "label": "It is only completely cut off at certain times."},
        {"id": "D", "label": "It can be a difficult place for people to live in."},
    ], "c", "Chỉ bị cô lập hoàn toàn khi triều cao."),
    mc(32, "What does Caitlin suggest about her father?", [
        {"id": "A", "label": "His writing prevents him from doing things he wants to with his family."},
        {"id": "B", "label": "His initial reaction to his son's request is different from usual."},
        {"id": "C", "label": "His true feelings are easily hidden from his daughter."},
        {"id": "D", "label": "His son's arrival is one event he will take time off for."},
    ], "d", "Dad thực sự mong chờ gặp Dominic dù than phiền."),
    mc(33, "Caitlin emphasises her feelings of discomfort because she", [
        {"id": "A", "label": "is embarrassed that she doesn't understand what her brother is talking about."},
        {"id": "B", "label": "feels confused about why she can't relate to her brother any more."},
        {"id": "C", "label": "is upset by the unexpected change in her brother's behaviour."},
        {"id": "D", "label": "feels foolish that her brother's attention is so important to her."},
    ], "c", "Khó chịu vì Dominic đột ngột hành xử như kẻ ngốc."),
    mc(34, "In the fourth paragraph, what is Caitlin's purpose in describing the island?", [
        {"id": "A", "label": "to express her positive feelings about it"},
        {"id": "B", "label": "to explain how the road was built"},
        {"id": "C", "label": "to illustrate what kind of weather was usual"},
        {"id": "D", "label": "to describe her journey home"},
    ], "a", "Mô tả Stand đẹp, hazy — cảm xúc tích cực."),
    mc(35, "In 'because of that' in line 31, 'that' refers to the fact that", [
        {"id": "A", "label": "locals think it is odd to walk anywhere."},
        {"id": "B", "label": "it is easier for people to take the bus than walk."},
        {"id": "C", "label": "people have everything they need on the island."},
        {"id": "D", "label": "there is nowhere in particular to walk to from the island."},
    ], "d", "Không có điểm đến cụ thể để đi bộ từ đảo."),
    mc(36, "What do we learn about Caitlin's reactions to the boy?", [
        {"id": "A", "label": "She felt his air of confidence contrasted with his physical appearance."},
        {"id": "B", "label": "She was able to come up with a reason for him being there."},
        {"id": "C", "label": "She realised her first impression of him was inaccurate."},
        {"id": "D", "label": "She thought she had seen him somewhere before."},
    ], "a", "Graceful strength — tự tin trái với vẻ ngoài nhỏ con."),
]

# --- Part 6: Gapped text (Q37-42) ---
PART6_SENTENCES = [
    ("A", "Through endless tries at the usual exercises and frequent failures, ballet dancers develop the neural pathways in the brain necessary to control accurate, fast and smooth movement."),
    ("B", "The ballet shoe offers some support, but the real strength is in the muscles, built up through training."),
    ("C", "As technology takes away activity from the lives of many, perhaps the ballet dancer's physicality is ever more difficult for most people to imagine."),
    ("D", "Ballet technique is certainly extreme but it is not, in itself, dangerous."),
    ("E", "The principle is identical in the gym – pushing yourself to the limit, but not beyond, will eventually bring the desired result."),
    ("F", "No one avoids this: it is ballet's great democratiser, the well established members of the company working alongside the newest recruits."),
    ("G", "It takes at least a decade of high-quality, regular practice to become an expert in any physical discipline."),
]

PART6_PASSAGE = [
    {"text": "Good preparation leads to success in ballet dancing"},
    {"text": "A former classical ballet dancer explains what ballet training actually involves."},
    {
        "text": (
            "What we ballet dancers do is instinctive, but instinct learnt through a decade of training. A dancer's life "
            "is hard to understand, and easy to misinterpret. Many a poet and novelist has tried to do so, but even they "
            "have chosen to interpret all the hard work and physical discipline as obsessive. And so the idea persists that "
            "dancers spend every waking hour in pain, bodies at breaking point, their smiles a pretence."
        )
    },
    {"text": "As a former dancer in the Royal Ballet Company here in Britain, I would beg to question this."},
    {"text": "(37) ........"},
    {
        "text": (
            "With expert teaching and daily practice, its various demands are easily within the capacity of the healthy "
            "human body. Contrary to popular belief, there is no need to break bones or tear muscles to achieve ballet "
            "positions. It is simply a question of sufficient conditioning of the muscular system."
        )
    },
    {
        "text": (
            "Over the course of my dancing life I worked my way through at least 10,000 ballet classes. I took my first "
            "at a school of dance at the age of seven and my last 36 years later at the Royal Opera House in London. "
            "In the years between, ballet class was the first thing I did every day. It starts at an early age, this daily "
            "ritual, because it has to."
        )
    },
    {"text": "(38) ........"},
    {
        "text": (
            "But for a ballet dancer in particular, this lengthy period has to come before the effects of adolescence set "
            "in, while maximum flexibility can still be achieved."
        )
    },
    {
        "text": (
            "Those first classes I took were remarkably similar to the last. In fact, taking into account the occasional "
            "new idea, ballet classes have changed little since 1820, when the details of ballet technique were first "
            "written down, and are easily recognised in any country. Starting with the left hand on the barre, the routine "
            "unrolls over some 75 minutes."
        )
    },
    {"text": "(39) ........"},
    {"text": "Even the leading dancers have to do it."},
    {
        "text": (
            "These classes serve two distinct purposes: they are the way we warm our bodies and the mechanism by which "
            "we improve basic technique. In class after class, we prove the old saying that 'practice makes perfect'."
        )
    },
    {"text": "(40) ........"},
    {
        "text": (
            "And it is also this daily repetition which enables us to strengthen the muscles required in jumping, spinning "
            "or lifting our legs to angles impossible to the average person."
        )
    },
    {
        "text": (
            "The human body is designed to adapt to the demands we make of it, provided we make them carefully and "
            "over time."
        )
    },
    {"text": "(41) ........"},
    {
        "text": (
            "In the same way, all those years of classes add up to a fit-for-purpose dancing machine. This level of "
            "physical fluency doesn't hurt; it feels good."
        )
    },
    {"text": "(42) ........"},
    {
        "text": (
            "But they should not be misled: there is a difference between hard work and hardship. Dancers have an "
            "everyday familiarity with the first. Hardship it isn't."
        )
    },
    {"text": "Sentences"},
    *[{"label": letter, "text": text} for letter, text in PART6_SENTENCES],
]

PART6_QUESTIONS = [
    match_q(37, "Gap (37)", "d", LETTERS_7, "Ballet technique extreme but not dangerous."),
    match_q(38, "Gap (38)", "g", LETTERS_7, "Decade of practice to become expert."),
    match_q(39, "Gap (39)", "f", LETTERS_7, "Everyone does daily class — democratiser."),
    match_q(40, "Gap (40)", "a", LETTERS_7, "Neural pathways from endless practice."),
    match_q(41, "Gap (41)", "e", LETTERS_7, "Like gym — push to limit not beyond."),
    match_q(42, "Gap (42)", "c", LETTERS_7, "Technology makes dancer physicality hard to imagine."),
]

# --- Part 7: Multiple matching (Q43-52) ---
PART7_PASSAGE = [
    {"text": "Rising Star"},
    {"text": "Margaret Garelly goes to meet Duncan Williams, who plays for Chelsea Football Club."},
    {
        "label": "A",
        "text": (
            "It's my first time driving to Chelsea's training ground and I turn off slightly too early at the "
            "London University playing fields. Had he accepted football's rejections in his early "
            "teenage years, it is exactly the sort of ground Duncan Williams would have found himself "
            "running around on at weekends. At his current age of 18, he would have been a bright first-year "
            "undergraduate mixing his academic studies with a bit of football, rugby and cricket, given his "
            "early talent in all these sports. However, Duncan undoubtedly took the right path. Instead "
            "of studying, he is sitting with his father Gavin in one of the interview rooms at Chelsea's training "
            "base reflecting on Saturday's match against Manchester City. Such has been his rise to "
            "fame that it is with some disbelief that you listen to him describing how his career was nearly all "
            "over before it began."
        ),
    },
    {
        "label": "B",
        "text": (
            "Gavin, himself a fine footballer – a member of the national team in his time – and now a "
            "professional coach, sent Duncan to three professional clubs as a 14 year-old, but all three "
            "turned him down. 'I worked with him a lot when he was around 12, and it was clear he had "
            "fantastic technique and skill. But then the other boys shot up in height and he didn't. But I was "
            "still upset and surprised that no team seemed to want him, that they couldn't see what he might "
            "develop into in time. When Chelsea accepted him as a junior, it was made clear to him that "
            "this was more of a last chance than a new beginning. They told him he had a lot of hard "
            "work to do and wasn't part of their plans. Fortunately, that summer he just grew and grew, "
            "and got much stronger as well.'"
        ),
    },
    {
        "label": "C",
        "text": (
            "Duncan takes up the story: 'The first half of that season I played in the youth team. I got lucky – "
            "the first-team manager came to watch us play QPR, and though we lost 3-1, I had a really "
            "good game. I moved up to the first team after that performance.' Gavin points out that it can "
            "be beneficial to be smaller and weaker when you are developing – it forces you to learn how "
            "to keep the ball better, how to use 'quick feet' to get out of tight spaces. 'A couple of years ago, "
            "Duncan would run past an opponent as if he wasn't there but then the other guy would close "
            "in on him. I used to say to him, \"Look, if you can do that now, imagine what you'll be like when "
            "you're 17, 18 and you're big and quick and they won't be able to get near you.\" If you're a "
            "smaller player, you have to use your brain a lot more.'"
        ),
    },
    {
        "label": "D",
        "text": (
            "Not every kid gets advice from an ex-England player over dinner, nor their own private training "
            "sessions. Now Duncan is following in Gavin's footsteps. He has joined a national scheme "
            "where people like him give advice to ambitious young teenagers who are hoping to become "
            "professionals. He is an old head on young shoulders. Yet he's also like a young kid in his "
            "enthusiasm. And fame has clearly not gone to his head; it would be hard to meet a more "
            "likeable, humble young man. So will he get to play for the national team? 'One day I'd love to, "
            "but when that is, is for somebody else to decide.' The way he is playing, that won't be long."
        ),
    },
]

PART7_QUESTIONS = [
    match_q(43, "states how surprised the writer was at Duncan's early difficulties?", "a", LETTERS_4, "Para A — disbelief career nearly over."),
    match_q(44, "says that Duncan sometimes seems much more mature than he really is?", "d", LETTERS_4, "Para D — old head on young shoulders."),
    match_q(45, "describes the frustration felt by Duncan's father?", "b", LETTERS_4, "Para B — Gavin upset clubs rejected Duncan."),
    match_q(46, "says that Duncan is on course to reach a high point in his profession?", "d", LETTERS_4, "Para D — won't be long for national team."),
    match_q(47, "suggests that Duncan caught up with his team-mates in terms of physical development?", "b", LETTERS_4, "Para B — grew and grew that summer."),
    match_q(48, "explains how Duncan was a good all-round sportsperson?", "a", LETTERS_4, "Para A — football, rugby, cricket."),
    match_q(49, "gives an example of how Gavin reassured his son?", "c", LETTERS_4, "Para C — imagine when you're 17, 18..."),
    match_q(50, "mentions Duncan's current club's low opinion of him at one time?", "b", LETTERS_4, "Para B — Chelsea last chance, not in plans."),
    match_q(51, "mentions a personal success despite a failure for the team?", "c", LETTERS_4, "Para C — lost 3-1 but Duncan played well."),
    match_q(52, "explains how Duncan and his father are fulfilling a similar role?", "d", LETTERS_4, "Para D — both give advice to young players."),
]

exam = {
    "version": 1,
    "title": "FCE B2 Reading — Test 1",
    "durationMinutes": 75,
    "bandHint": "B2 First Reading & Use of English",
    "examTrack": "cambridge",
    "cambridgeLevel": "b2",
    "parts": [
        {
            "partNumber": 1,
            "rangeLabel": "Questions 1–8",
            "passageTitle": "Part 1 — What is genealogy?",
            "passage": PART1_PASSAGE,
            "questionGroups": [{
                "range": "Questions 1–8",
                "instruction": "For each question, choose the correct answer.",
                "type": "multiple-choice",
                "questions": PART1_QUESTIONS,
            }],
        },
        {
            "partNumber": 2,
            "rangeLabel": "Questions 9–16",
            "passageTitle": "Part 2 — Motorbike stunt rider",
            "passage": PART2_PASSAGE,
            "questionGroups": [{
                "range": "Questions 9–16",
                "instruction": "For each question, write the correct answer. Write ONE word for each gap.",
                "type": "gap-fill",
                "questions": PART2_QUESTIONS,
            }],
        },
        {
            "partNumber": 3,
            "rangeLabel": "Questions 17–24",
            "passageTitle": "Part 3 — An incredible vegetable",
            "passage": PART3_PASSAGE,
            "questionGroups": [{
                "range": "Questions 17–24",
                "instruction": "Use the word given in capitals to form a word that fits in the gap.",
                "type": "gap-fill",
                "questions": PART3_QUESTIONS,
            }],
        },
        {
            "partNumber": 4,
            "rangeLabel": "Questions 25–30",
            "passageTitle": "Part 4 — Key word transformation",
            "passage": [
                {"text": "Complete the second sentence using the word given. Use between two and five words, including the word given."},
            ],
            "questionGroups": [{
                "range": "Questions 25–30",
                "instruction": "Write only the missing words. Use between two and five words, including the word given.",
                "type": "gap-fill",
                "questions": PART4_QUESTIONS,
            }],
        },
        {
            "partNumber": 5,
            "rangeLabel": "Questions 31–36",
            "passageTitle": "Part 5 — Caitlin on Hale island",
            "passage": PART5_PASSAGE,
            "questionGroups": [{
                "range": "Questions 31–36",
                "instruction": "For each question, choose the correct answer.",
                "type": "multiple-choice",
                "questions": PART5_QUESTIONS,
            }],
        },
        {
            "partNumber": 6,
            "rangeLabel": "Questions 37–42",
            "passageTitle": "Part 6 — Ballet dancing",
            "passage": PART6_PASSAGE,
            "questionGroups": [{
                "range": "Questions 37–42",
                "instruction": "Six sentences have been removed. For each question, choose the correct answer. There is one extra sentence which you do not need to use.",
                "type": "matching-features",
                "features": [{"id": letter.lower(), "name": text} for letter, text in PART6_SENTENCES],
                "questions": PART6_QUESTIONS,
            }],
        },
        {
            "partNumber": 7,
            "rangeLabel": "Questions 43–52",
            "passageTitle": "Part 7 — Rising Star",
            "passage": PART7_PASSAGE,
            "questionGroups": [{
                "range": "Questions 43–52",
                "instruction": "For each question, choose from the sections (A–D). The sections may be chosen more than once.",
                "type": "matching-features",
                "features": [
                    {"id": "a", "name": "Section A"},
                    {"id": "b", "name": "Section B"},
                    {"id": "c", "name": "Section C"},
                    {"id": "d", "name": "Section D"},
                ],
                "questions": PART7_QUESTIONS,
            }],
        },
    ],
}


def build_bundle(out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "exam.json").write_text(
        json.dumps(exam, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


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