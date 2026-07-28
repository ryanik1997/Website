# Báo cáo bổ sung guide_html — TID Writing Bank

Ngày tạo: 2026-07-16
Nguồn: apps/web/public/catalog/writing/tid/tasks.json (sinh bởi scripts/import-tid-writing.mjs)

## Trạng thái sau khi bổ sung

- Đã tạo guide tĩnh + bài mẫu cho **120/120 đề Task 2** trước đây còn thiếu.
- Không gọi AI/API; guide được sinh bằng template cố định theo genre trong `scripts/fill-tid-task2-guides.mjs`.
- Kiểm tra: **356/356 đề có guide_html**, Task 1 không bị thay đổi.

## Tổng quan ban đầu
- Tổng số đề trong ngân hàng: 356
- Có guide: 236
- CHƯA có guide: 120

## Phân bố đề thiếu guide theo task/genre
- task2/opinion: 46
- task2/discussion: 45
- task2/problem_solution: 13
- task2/advantages_disadvantages: 12
- task2/other: 2
- task2/two_part: 2

## Danh sách chi tiết

| # | ID | Task | Genre | Title |
|---|----|------|-------|-------|
| 1 | tid-task2-102 | task2 | discussion | Regulating Genetic Research and Cloning |
| 2 | tid-task2-101 | task2 | discussion | Funding Space Exploration vs Earth |
| 3 | tid-task2-103 | task2 | opinion | Affordability of Medical Treatments |
| 4 | tid-task2-106 | task2 | discussion | Government vs Private Science Funding |
| 5 | tid-task2-104 | task2 | opinion | Choosing Babies Genes in the Future |
| 6 | tid-task2-107 | task2 | discussion | Learning Music for Children |
| 7 | tid-task2-105 | task2 | opinion | Dangers of Scientific Discoveries |
| 8 | tid-task2-111 | task2 | problem_solution | Popularity of Extreme Sports |
| 9 | tid-task2-112 | task2 | opinion | Cooking as a Popular Hobby |
| 10 | tid-task2-110 | task2 | discussion | Art as Essential School Subject |
| 11 | tid-task2-109 | task2 | discussion | Celebrity Support for Charities |
| 12 | tid-task2-108 | task2 | discussion | Competitive Sport in Education |
| 13 | tid-task2-115 | task2 | problem_solution | Causes and Solutions for Traffic Congestion |
| 14 | tid-task2-113 | task2 | discussion | Professional Athletes as Role Models |
| 15 | tid-task2-114 | task2 | discussion | Government Funding for Public Art |
| 16 | tid-task2-120 | task2 | advantages_disadvantages | Cycling to Work or School Trend |
| 17 | tid-task2-119 | task2 | discussion | Building Roads to Solve Traffic |
| 18 | tid-task2-118 | task2 | discussion | Charging Fees to Drive in Cities |
| 19 | tid-task2-116 | task2 | problem_solution | Rapid Population Growth in Cities |
| 20 | tid-task2-117 | task2 | opinion | Future of Driverless Cars |
| 21 | tid-task2-051 | task2 | discussion | Funding Healthcare and Education |
| 22 | tid-task2-055 | task2 | problem_solution | Global Crisis of Childhood Obesity |
| 23 | tid-task2-056 | task2 | problem_solution | Mental Health Problems in Youth |
| 24 | tid-task2-057 | task2 | discussion | Diet vs Physical Activity for Health |
| 25 | tid-task2-059 | task2 | discussion | Benefits and Costs of Keeping Pets |
| 26 | tid-task2-060 | task2 | other | Vegetarian and Vegan Diet Trends |
| 27 | tid-task2-061 | task2 | opinion | Subsidising Sports Facilities Costs |
| 28 | tid-task2-062 | task2 | discussion | Professional Athletes High Salaries |
| 29 | tid-task2-063 | task2 | problem_solution | Causes and Solutions for Modern Stress |
| 30 | tid-task2-064 | task2 | discussion | Job Satisfaction vs High Salary |
| 31 | tid-task2-052 | task2 | opinion | Compulsory Voting by Law |
| 32 | tid-task2-053 | task2 | discussion | International Sporting Events Value |
| 33 | tid-task2-054 | task2 | advantages_disadvantages | Benefits and Problems of Ageing Population |
| 34 | tid-task2-058 | task2 | opinion | Fast Food vs Home-Cooked Meals |
| 35 | tid-task2-067 | task2 | advantages_disadvantages | Pros and Cons of Online Shopping |
| 36 | tid-task2-066 | task2 | advantages_disadvantages | Advantages of Flexible Working Hours |
| 37 | tid-task2-065 | task2 | advantages_disadvantages | Self-Employment Trend and Disadvantages |
| 38 | tid-task2-075 | task2 | discussion | Freedom vs Control of the Media |
| 39 | tid-task2-074 | task2 | opinion | Impact of Multinational Companies |
| 40 | tid-task2-073 | task2 | opinion | Increasing Minimum Legal Driving Age |
| 41 | tid-task2-072 | task2 | opinion | Future of Working from Home |
| 42 | tid-task2-071 | task2 | opinion | Employer Provided Fitness Facilities |
| 43 | tid-task2-070 | task2 | problem_solution | Renewable Energy vs Fossil Fuels |
| 44 | tid-task2-069 | task2 | opinion | 24/7 Business Operations Trend |
| 45 | tid-task2-068 | task2 | opinion | Free Public Transport Feasibility |
| 46 | tid-task2-077 | task2 | discussion | Newspapers vs Digital News Sources |
| 47 | tid-task2-076 | task2 | opinion | Social Media and Youth Mental Health |
| 48 | tid-task2-078 | task2 | opinion | Power and Influence of Advertising |
| 49 | tid-task2-082 | task2 | discussion | Internet Information and Misinformation |
| 50 | tid-task2-079 | task2 | opinion | Influence of Celebrities on Youth |
| 51 | tid-task2-081 | task2 | opinion | Television Influence on Culture |
| 52 | tid-task2-085 | task2 | discussion | Punishment vs Rehabilitation in Prisons |
| 53 | tid-task2-080 | task2 | discussion | Traditional Books vs Digital E-books |
| 54 | tid-task2-084 | task2 | discussion | Longer Prison Sentences for Crime |
| 55 | tid-task2-083 | task2 | opinion | Supervised Internet Use for Children |
| 56 | tid-task2-094 | task2 | opinion | Responsibility for Climate Change Combat |
| 57 | tid-task2-093 | task2 | discussion | English as a Global Language |
| 58 | tid-task2-088 | task2 | opinion | Compulsory Military Service for Citizens |
| 59 | tid-task2-087 | task2 | two_part | Addressing Criminal Reoffending Rates |
| 60 | tid-task2-086 | task2 | other | Preventing Teenage Crime Growth |
| 61 | tid-task2-092 | task2 | opinion | International Tourism and Local Culture |
| 62 | tid-task2-090 | task2 | discussion | Death Penalty as Crime Deterrent |
| 63 | tid-task2-091 | task2 | advantages_disadvantages | Community Service vs Prison Sentences |
| 64 | tid-task2-089 | task2 | discussion | Surveillance Cameras and Privacy |
| 65 | tid-task2-100 | task2 | discussion | International Aid to Developing Countries |
| 66 | tid-task2-099 | task2 | opinion | English for International Business |
| 67 | tid-task2-098 | task2 | discussion | Keeping Animals in Zoos |
| 68 | tid-task2-096 | task2 | opinion | Working Abroad in Foreign Countries |
| 69 | tid-task2-097 | task2 | opinion | Charging Foreign Visitors More |
| 70 | tid-task2-095 | task2 | problem_solution | Benefits of Globalisation Evaluated |
| 71 | tid-task2-003 | task2 | discussion | High Salaries and Income Inequality |
| 72 | tid-task2-001 | task2 | discussion | University Education Purpose |
| 73 | tid-task2-002 | task2 | discussion | School Vacation Lengths |
| 74 | tid-task2-004 | task2 | advantages_disadvantages | Replacing Textbooks with Laptops |
| 75 | tid-task2-005 | task2 | opinion | Early Education vs Playing |
| 76 | tid-task2-006 | task2 | advantages_disadvantages | Gap Year Before University |
| 77 | tid-task2-007 | task2 | discussion | University Subject Choices |
| 78 | tid-task2-008 | task2 | opinion | Teaching Citizenship in Schools |
| 79 | tid-task2-009 | task2 | advantages_disadvantages | Living Away from Family at University |
| 80 | tid-task2-010 | task2 | discussion | Growing Up City vs Countryside |
| 81 | tid-task2-011 | task2 | advantages_disadvantages | Homeschooling Advantages and Disadvantages |
| 82 | tid-task2-012 | task2 | opinion | Formal Qualifications vs Experience |
| 83 | tid-task2-013 | task2 | discussion | Technology Making Life Complex or Simple |
| 84 | tid-task2-014 | task2 | opinion | Using the Internet for Information |
| 85 | tid-task2-015 | task2 | two_part | Technology and Human Relationships |
| 86 | tid-task2-016 | task2 | discussion | Smartphones and Social Isolation |
| 87 | tid-task2-017 | task2 | opinion | Computers More Intelligent Than Humans |
| 88 | tid-task2-018 | task2 | opinion | AI Replacing Human Workers |
| 89 | tid-task2-020 | task2 | discussion | Technology vs Behaviour for Environment |
| 90 | tid-task2-019 | task2 | advantages_disadvantages | Online vs Face-to-Face Communication |
| 91 | tid-task2-021 | task2 | opinion | Robots and AI in Industry |
| 92 | tid-task2-022 | task2 | opinion | Sharing Personal Info on Social Media |
| 93 | tid-task2-023 | task2 | discussion | Solving Environmental Problems Globally |
| 94 | tid-task2-027 | task2 | opinion | Online Shopping Effects on Shops |
| 95 | tid-task2-024 | task2 | problem_solution | Animal Extinction and Human Activities |
| 96 | tid-task2-025 | task2 | problem_solution | Increasing Household Waste |
| 97 | tid-task2-026 | task2 | opinion | Vegetarian Diet for the Environment |
| 98 | tid-task2-029 | task2 | opinion | Planting Trees vs Building Housing |
| 99 | tid-task2-028 | task2 | opinion | Seriousness of Global Climate Change |
| 100 | tid-task2-030 | task2 | discussion | Responsibility to Protect the Environment |
| 101 | tid-task2-032 | task2 | opinion | Taxing Air Travel for Environment |
| 102 | tid-task2-031 | task2 | advantages_disadvantages | Nuclear Energy Benefits and Risks |
| 103 | tid-task2-033 | task2 | opinion | Increasing Ageing Population in Society |
| 104 | tid-task2-039 | task2 | opinion | Growing Food at Home |
| 105 | tid-task2-040 | task2 | opinion | Purpose of Newspapers and Media |
| 106 | tid-task2-041 | task2 | discussion | Innate Talent vs Taught Skills |
| 107 | tid-task2-042 | task2 | opinion | Gender Equality in University Education |
| 108 | tid-task2-043 | task2 | discussion | Improving vs Resting Mind in Leisure |
| 109 | tid-task2-034 | task2 | discussion | Competition vs Cooperation in Children |
| 110 | tid-task2-035 | task2 | opinion | Future of Museums and Art Galleries |
| 111 | tid-task2-036 | task2 | problem_solution | Changing Traditional Role of Family |
| 112 | tid-task2-037 | task2 | discussion | Effects of Immigration on a Country |
| 113 | tid-task2-038 | task2 | problem_solution | Trend of Having Fewer Children |
| 114 | tid-task2-044 | task2 | problem_solution | Migration to Cities for Work |
| 115 | tid-task2-045 | task2 | discussion | Responsibility for Public Health |
| 116 | tid-task2-046 | task2 | opinion | Economic Development vs Environmental Protection |
| 117 | tid-task2-047 | task2 | discussion | Government Interference in Lifestyle Choices |
| 118 | tid-task2-048 | task2 | opinion | Government Spending on the Arts |
| 119 | tid-task2-050 | task2 | opinion | Government Spending on Railways vs Roads |
| 120 | tid-task2-049 | task2 | discussion | Banning Dangerous Sports |
