# Offline CEFR dictionary data

`offlineCefrA2C2.json` is a generated, independently distributed data pack. It combines:

- CEFR-J Vocabulary Profile 1.5 (A2-B2), Open Language Profiles. Commercial use is permitted with attribution.
- Octanove Vocabulary Profile C1/C2 1.0, licensed CC BY-SA 4.0.
- Free Vietnamese Dictionary Project / DictionaryForMIDs English-Vietnamese data, licensed GPL-2.0.

The generated pack was modified on 2026-07-13 by selecting 6,000 headwords, attaching CEFR/POS metadata and normalising whitespace. The original datasets and their notices are available from:

- https://github.com/openlanguageprofiles/olp-en-cefrj
- https://www.octanove.com/vocabulary-profile-c1c2
- https://dictionarymid.sourceforge.net/dictionaries/dictsVietnameese.html

The data pack is kept separate from application source code. See `scripts/build-offline-cefr-dictionary.mjs` for the reproducible transformation.
