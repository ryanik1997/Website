# Inspera CEQ Player — Page Topology (B2 First Reading & UoE)

Nguồn: `https://ceq.inspera.com/player/?assessmentRunId=160272655&context=exam`
Player release: **3.51.0** — `https://d2snzxottmona5.cloudfront.net/releases/3.51.0/player.css` (588 KB, đã tải về cạnh file này)
Theme body class: `ceq-theme` · html: `notranslate js-focus-visible` · zoom: `zoom-small`

## 1. App shell (viewport 1440×900)

```
div.App__app___3nDjL.zoom-small                    0,0 1440×900
└ div.App__mainScreen___3HaXz                      0,0 1440×900
  └ div.App__mainScreenContent___1tXox             0,0 1440×900
    └ div.App__contentContainer___2Nu-R            0,72 1423×758
      └ div.DisplayTypeContainer__displayTypeContainer___3B6yh .has-section-level-dynamic-rubric
        └ div.DisplayTypeContainer__sectionContent___2HSJ0
          └ div.QuestionDisplay__questionDisplayWrapper___1n_b0 .question-wrapper.current
            └ [role=main] .QuestionDisplay__mainQuestionWrapper___3P0CZ
              └ .QuestionDisplay__questionBody___ZOMJ7 > .QTIAssessmentItem__QTIAssessmentItem___cfGlV
```

3 vùng cố định, không scroll cùng nhau:

| Vùng | Element | Rect | Ghi chú |
|---|---|---|---|
| Header | `header.header__header___3v_A5` | 0,0 1423×72 | `--header--height: 3.5em`, bg `#fff` |
| Content | `App__contentContainer` | 0,72 1423×758 | vùng scroll duy nhất |
| Footer | `footer.footer__footer___1NlzQ` | 0,830 1423×53 | bg `#fff` |

`--header-footer--box-shadow: 0 0 45px rgba(0,0,0,0.15)` áp cho cả header và footer.

## 2. Header (72px)

```
header__header
├ img.header__logo___3xoBS            16,14 168×43   (Cambridge English lockup)
├ div.header__name___1Cw2x            200,0 146×72   "Candidate ID" — Arial 16/700
└ div.header__centralBar___3GpJy
  ├ div.header__connectionStatusContainer___3YItW   icon fa-wifi, sr-only "Connected"
  ├ button.header__messagesButton___2Texb   1243,0 56×72   fa-bell-o 24px #333
  ├ button.header__optionsButton___1BF6Z    1299,0 53×72   fa-bars   24px #333
  └ button.header__optionsButton___1BF6Z    1351,0 56×72   fa-pencil-square-o (Show notes)
```

Nút header: `display:flex; align-items:center; height:72px; border:none; cursor:pointer;`
`transition: background-color 0.1s linear`. Icon wrapper `header__icon` margin `0 16px`.

## 3. Footer (53px)

```
footer__footer                                     0,830 1423×53
├ nav "Previous / next question" .footer__navButtons___Gtvxu     1291,756 117×56
│  ├ button.footer__previousBtn___3pfYh   56×56  fa-arrow-left   bg --footer-nav--background #666
│  └ button.footer__promotedNextBtn___Qf9LU 56×56 fa-arrow-right bg --footer-nav--next-background #2a6c96
└ nav "Questions"
   ├ tablist Part 1 (đang mở)   1,833 100×50  + 8 nút số 20×26 mỗi nút, x bước 20px
   ├ tablist Part 2..7          mỗi tab 177×50, bước 179px, hiển thị "Part N" + "0 of 8"
   └ button "Review your answers" 1346,830 77×53  fa-check
```

Part tab đang mở **bung ra** thành `Part N` + dãy nút số câu (`footer__questionNo___3WNct`);
các tab khác thu gọn thành `Part N` + đếm `attemptedCount`. Đây là **accordion ngang**, không phải tab thường.

Trạng thái nút số câu:
- mặc định: bg `--footer--question-background #efefef`, color `--footer--color #535353`
- hover: bg `--footer--question-no-hover-bg #C8E2F5`
- selected: bg `--footer--selected-question-no-bg #2a6c96`, color `#fff`
- đã trả lời: border `--footer--question-wrapper-attempted-border-color #2a6c96`
- flagged: `--footer--flag-color #878787`

## 4. Bảy part — kiểu tương tác

| Part | Nội dung | Interaction class | Modifier trên `.question-wrapper` | Bố cục |
|---|---|---|---|---|
| 1 | MC cloze (Q1–8) | `inlineChoiceInteraction` `presentation-horizontalPopup` | `wide-and-left-align` + `extraLineSpacing` | 1 cột, gap inline |
| 2 | Open cloze (Q9–16) | `textEntry__textEntryInteraction` + `input.textEntryInteractionValue` | `double-line-spacing` `inlineTextEntry` | 1 cột |
| 3 | Word formation (Q17–24) | textEntry | `double-line-spacing` `extendedMarginStyleForWF` | 1 cột + cột từ CAPITALS phải |
| 4 | Key word transformation (Q25–30) | textEntry | `double-line-spacing` `leftMargin` | 1 cột |
| 5 | Reading MC (Q31–36) | `choiceInteraction` `vertical` `accordionChoice` | `wide-and-left-align` | **2 cột**: bài đọc trái, câu hỏi phải x=739 w=628 |
| 6 | Gapped text (Q37–42) | `gapMatchInteraction` (kéo–thả) | `split-question-view` `split-5050` `tokens-right` | **2 cột 50/50**: 667px mỗi bên |
| 7 | Multiple matching (Q43–52) | `choiceInteraction` `vertical` | `wide-and-left-align` | **2 cột**: bài đọc trái, câu hỏi phải x=739 w=628 |

### Part 1 — gap + horizontal popup (đã trích đầy đủ)

Gap đóng (`inlineChoiceInteraction__inlineChoiceInteractionWrapper___253ts > button`):
```
min-width: 144px;  padding: 1px 6px;  margin: 0.8px 4px -1.6px;
border-radius: 3px;  display: inline-block;  text-align: center;
font: 700 16px Arial;  line-height (wrapper): 48px   /* --question--extra-line-height: 2.5em */
```

Gap đang mở — `inlineChoiceInteraction__inlineChoiceInteractionActive___3lGzG`:
```
background: rgb(39,39,39);   color: #fff;
border: 0.8px solid rgb(65,142,200);
box-shadow: 0 0 0 1px rgb(65,142,200);
z-index: 1;  transition: border 0.1s linear;
```

Popup `inlineChoiceInteraction__collapsedMenu___1AaB4` — **mở LÊN TRÊN gap**:
```
position: absolute;  top: -26.6px;   /* nằm trên, không phải dưới */
display: flex;  flex-direction: row;  height: 22.4px;
border: 1.6px solid rgb(65,142,200);  margin: 0 0 1px;
```
Mỗi lựa chọn là `<option>` flex item:
```
padding: 1px 6px;  min-height: 19.2px;  white-space: nowrap;
display: flex; align-items: center; text-align: center;
color: #fff;  background: rgb(64,64,64);          /* mặc định */
background: rgb(42,108,150);                       /* hover = --buttons--main-bg */
```
Option đầu tiên là nút **✕ xoá đáp án** (rỗng, width 25px).

**INTERACTION MODEL: click-to-open, popup ngang, mở lên trên.** Không phải `<select>` gốc.

## 5. Design tokens

Toàn bộ ~280 biến trong `global-tokens.json`. Nhóm quan trọng:

```css
--app--background: #f2f2f2;          /* body thực tế: rgb(247,250,250) */
--app--font-color: black;
--app--font-size-medium: 21px;  --app--font-size-large: 26px;

/* primary */
--buttons--main-bg: #2a6c96;   --buttons--main-bg-hover: #19445f;
--buttons--highlighted-background-hover: #14364b;
--app--link-color: #2a6c96;

/* header / footer */
--header--background: #fff;      --header-border-color: #c1c1c1;
--header--height: 3.5em;         --header--icon-color: #333;
--footer--background: #fff;      --footer--color: #535353;
--footer--question-background: #efefef;
--footer--selected-bg: #aed7ff;  --footer--selected-question-no-bg: #2a6c96;
--footer-nav--background: #666666;  --footer-nav--background-disabled: #dddddd;
--header-footer--box-shadow: 0 0 45px rgba(0,0,0,0.15);

/* question */
--question--input-border: #949494;   --question--input-border-focus: #4B90C5;
--question--input-border-active: #418ec8;   --question--input-height: 2.2em;
--question--input-padding: 0 0.75em 0;
--question--extra-line-height: 2.5em;
--question--gap-margin: 1px 10px;
--question--interaction-checked-bg: #bbd8f0;
--alternative-background-hover-bg-color: #e4e4e4;
--question--student-highlight-color: 0 1em 0 rgba(255,202,0,0.36863) inset;
--focus--border-color: #007AF5;
```

Font: **Arial, sans-serif** duy nhất (16px/400 body, 700 cho nhấn mạnh, 24px/700 tiêu đề).
Icon: **FontAwesome 4** (`fa fa-bars`, `fa-bell-o`, `fa-arrow-left/right`, `fa-check`, `fa-bookmark-o`, `fa-wifi`, `fa-pencil-square-o`).

## 6. Điểm khác biệt đáng chú ý so với UI hiện tại của repo

1. Popup lựa chọn Part 1 **mở lên trên**, nằm ngang, nền tối — không phải dropdown dọc.
2. Footer là **accordion ngang**: chỉ part đang mở mới hiện dãy số câu.
3. Parts 5/6/7 chia **2 cột cố định** (bài đọc trái / câu hỏi phải), không phải cuộn dọc chung.
4. `extraLineSpacing` / `double-line-spacing` — line-height 48px cho đoạn có gap, để chừa chỗ popup.
5. Chỉ một vùng cuộn duy nhất là `App__contentContainer`; header/footer fixed.
