"""Build ket-listening-test1.zip from Cambridge KET A2 Sample Test 1 Listening."""
import json
import shutil
import zipfile
from pathlib import Path

SRC = Path(r"C:/Users/ADMIN/OneDrive/Desktop/Dethi/Listening KET A2")
OUT_DIR = Path(r"C:/Users/ADMIN/OneDrive/Desktop/Dethi/Listening KET A2/ket-listening-test1")
REPO_DIR = Path(r"D:/App-English-Ryan/Website/Tainguyen/ket-listening-test1")
ZIP_PATHS = [
    SRC.parent / "ket-listening-test1.zip",
    Path(r"D:/App-English-Ryan/Website/Tainguyen/ket-listening-test1.zip"),
]

AUDIO_SRC = SRC / "Audio Listening.mp3"
AUDIO_NAME = "listening.mp3"

LETTERS_3 = [{"id": c, "label": c} for c in "ABC"]
FOOD_OPTIONS = [
    {"id": "A", "label": "bread"},
    {"id": "B", "label": "cake"},
    {"id": "C", "label": "cheese"},
    {"id": "D", "label": "chicken"},
    {"id": "E", "label": "fish"},
    {"id": "F", "label": "fruit"},
    {"id": "G", "label": "ice cream"},
    {"id": "H", "label": "salad"},
]


def picture_mc(n, prompt, options, answer, explanation=""):
    return {
        "number": n,
        "type": "picture-mc",
        "prompt": prompt,
        "options": options,
        "answer": answer.upper(),
        "explanation": explanation,
    }


def mc(n, prompt, options, answer, explanation=""):
    return {
        "number": n,
        "type": "multiple-choice",
        "prompt": prompt,
        "options": options,
        "answer": answer.upper(),
        "explanation": explanation,
    }


def gap_q(n, prompt, answer, explanation=""):
    return {
        "number": n,
        "type": "gap-fill",
        "prompt": prompt,
        "answer": answer.lower(),
        "wordLimit": 3,
        "explanation": explanation,
    }


def match_q(n, prompt, answer, explanation=""):
    return {
        "number": n,
        "type": "matching",
        "prompt": prompt,
        "options": FOOD_OPTIONS,
        "answer": answer.upper(),
        "explanation": explanation,
    }


PART2_INSTRUCTION = (
    "You will hear a teacher talking to a group of students about summer jobs.\n\n"
    "Jobs for students with Sunshine Holidays\n"
    "Work in: Children's summer camps\n"
    "Dates of jobs: 15th June – 20th …\n"
    "Staff must be: … years old\n"
    "Staff must be able to: …\n"
    "Staff will earn: £ …\n"
    "Send a letter and: …"
)

PART3_INSTRUCTION = "You will hear Robert talking to his friend, Laura, about a trip to Dublin."
PART5_INSTRUCTION = (
    "You will hear Simon talking to Maria about a party.\n"
    "What will each person bring to the party?\n\n"
    "Food: A bread · B cake · C cheese · D chicken · E fish · F fruit · G ice cream · H salad"
)

EXAM = {
    "version": 1,
    "title": "KET A2 Listening — Test 1",
    "durationMinutes": 35,
    "bandHint": "A2 Key Listening · 5 parts · 25 câu",
    "examType": "ket",
    "examMode": "practice",
    "parts": [
        {
            "partNumber": 1,
            "rangeLabel": "Questions 1–5",
            "instruction": "For each question, choose the correct answer.",
            "audioFile": AUDIO_NAME,
            "questions": [
                picture_mc(
                    1,
                    "Where will Claire meet Alex?",
                    [
                        {"id": "A", "label": "Picture A", "imageFile": "q1-a.jpg"},
                        {"id": "B", "label": "Picture B", "imageFile": "q1-b.jpg"},
                        {"id": "C", "label": "Picture C", "imageFile": "q1-c.jpg"},
                    ],
                    "A",
                    "Claire will meet Alex at the place shown in picture A.",
                ),
                picture_mc(
                    2,
                    "What time should the man telephone again?",
                    [
                        {"id": "A", "label": "9 o'clock", "imageFile": "q2-a.jpg"},
                        {"id": "B", "label": "10 o'clock", "imageFile": "q2-b.jpg"},
                        {"id": "C", "label": "11 o'clock", "imageFile": "q2-c.jpg"},
                    ],
                    "C",
                    "He should call again at eleven o'clock.",
                ),
                picture_mc(
                    3,
                    "When are they going to have the party?",
                    [
                        {"id": "A", "label": "July 11", "imageFile": "q3-a.jpg"},
                        {"id": "B", "label": "July 18", "imageFile": "q3-b.jpg"},
                        {"id": "C", "label": "July 25", "imageFile": "q3-c.jpg"},
                    ],
                    "C",
                    "The party is on July 25.",
                ),
                picture_mc(
                    4,
                    "What was the weather like on the picnic?",
                    [
                        {"id": "A", "label": "Sunny", "imageFile": "q4-a.jpg"},
                        {"id": "B", "label": "Rainy", "imageFile": "q4-b.jpg"},
                        {"id": "C", "label": "Windy", "imageFile": "q4-c.jpg"},
                    ],
                    "A",
                    "The weather was sunny during the picnic.",
                ),
                picture_mc(
                    5,
                    "How much are the shorts?",
                    [
                        {"id": "A", "label": "£5", "imageFile": "q5-a.jpg"},
                        {"id": "B", "label": "£15", "imageFile": "q5-b.jpg"},
                        {"id": "C", "label": "£20", "imageFile": "q5-c.jpg"},
                    ],
                    "A",
                    "The shorts cost five pounds.",
                ),
            ],
        },
        {
            "partNumber": 2,
            "rangeLabel": "Questions 6–10",
            "instruction": PART2_INSTRUCTION,
            "audioFile": AUDIO_NAME,
            "questions": [
                gap_q(6, "Dates of jobs: 15th June – 20th …", "August", "Jobs run until 20th August."),
                gap_q(7, "Staff must be: … years old", "19", "Staff must be 19 years old."),
                gap_q(8, "Staff must be able to: …", "drive", "They must be able to drive."),
                gap_q(9, "Staff will earn: £ …", "65", "Pay is sixty-five pounds."),
                gap_q(10, "Send a letter and: …", "photograph", "Send a letter and a photograph."),
            ],
        },
        {
            "partNumber": 3,
            "rangeLabel": "Questions 11–15",
            "instruction": PART3_INSTRUCTION,
            "audioFile": AUDIO_NAME,
            "questions": [
                mc(11, "Who has already decided to go with Robert?", [
                    {"id": "A", "label": "family members"},
                    {"id": "B", "label": "colleagues"},
                    {"id": "C", "label": "tennis partners"},
                ], "B", "His colleagues are going with him."),
                mc(12, "They'll stay in", [
                    {"id": "A", "label": "a university."},
                    {"id": "B", "label": "a guest house."},
                    {"id": "C", "label": "a hotel."},
                ], "A", "They will stay at a university."),
                mc(13, "Laura must remember to take", [
                    {"id": "A", "label": "a map."},
                    {"id": "B", "label": "a camera."},
                    {"id": "C", "label": "a coat."},
                ], "C", "She should take a coat."),
                mc(14, "Why does Laura like Dublin?", [
                    {"id": "A", "label": "The people are friendly."},
                    {"id": "B", "label": "The buildings are interesting."},
                    {"id": "C", "label": "The shops are beautiful."},
                ], "B", "She likes the interesting buildings."),
                mc(15, "Robert's excited about the trip to Dublin because", [
                    {"id": "A", "label": "he can't wait to go to the music festival."},
                    {"id": "B", "label": "he loves the food there."},
                    {"id": "C", "label": "he wants to go to a new art exhibition."},
                ], "B", "He loves the food in Dublin."),
            ],
        },
        {
            "partNumber": 4,
            "rangeLabel": "Questions 16–20",
            "instruction": "For each question, choose the correct answer.",
            "audioFile": AUDIO_NAME,
            "questions": [
                mc(16, "Why did she buy the motorbike?", [
                    {"id": "A", "label": "It's fast."},
                    {"id": "B", "label": "It was cheap."},
                    {"id": "C", "label": "It'll be easy to repair."},
                ], "A", "She bought it because it is fast."),
                mc(17, "What subject is the man going to study?", [
                    {"id": "A", "label": "history"},
                    {"id": "B", "label": "geography"},
                    {"id": "C", "label": "chemistry"},
                ], "B", "He will study geography."),
                mc(18, "What's the photograph of?", [
                    {"id": "A", "label": "a sports stadium"},
                    {"id": "B", "label": "a zoo"},
                    {"id": "C", "label": "a school playground"},
                ], "C", "The photo shows a school playground."),
                mc(19, "Why's she upset?", [
                    {"id": "A", "label": "Her train was delayed."},
                    {"id": "B", "label": "She's lost her wallet."},
                    {"id": "C", "label": "She's broken her glasses."},
                ], "B", "She has lost her wallet."),
                mc(20, "What has she bought?", [
                    {"id": "A", "label": "some clothes"},
                    {"id": "B", "label": "some food"},
                    {"id": "C", "label": "some games"},
                ], "A", "She bought some clothes."),
            ],
        },
        {
            "partNumber": 5,
            "rangeLabel": "Questions 21–25",
            "instruction": PART5_INSTRUCTION,
            "audioFile": AUDIO_NAME,
            "questions": [
                match_q(21, "Barbara will bring", "F", "Barbara will bring fruit."),
                match_q(22, "Simon will bring", "C", "Simon will bring cheese."),
                match_q(23, "Anita will bring", "A", "Anita will bring bread."),
                match_q(24, "Peter will bring", "D", "Peter will bring chicken."),
                match_q(25, "Michael will bring", "H", "Michael will bring salad."),
            ],
        },
    ],
}


def main():
    if not AUDIO_SRC.exists():
        raise SystemExit(f"Missing audio: {AUDIO_SRC}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    REPO_DIR.mkdir(parents=True, exist_ok=True)

    exam_path = OUT_DIR / "exam.json"
    exam_path.write_text(json.dumps(EXAM, ensure_ascii=False, indent=2), encoding="utf-8")

    shutil.copy2(AUDIO_SRC, OUT_DIR / AUDIO_NAME)
    shutil.copy2(exam_path, REPO_DIR / "exam.json")
    shutil.copy2(OUT_DIR / AUDIO_NAME, REPO_DIR / AUDIO_NAME)

    for zip_path in ZIP_PATHS:
        zip_path.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.write(exam_path, "exam.json")
            zf.write(OUT_DIR / AUDIO_NAME, AUDIO_NAME)
        print(f"Wrote {zip_path} ({zip_path.stat().st_size // 1024} KB)")

    print(f"Questions: {sum(len(p['questions']) for p in EXAM['parts'])}")


if __name__ == "__main__":
    main()