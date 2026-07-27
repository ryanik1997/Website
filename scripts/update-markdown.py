"""Regenerate skills-inventory.md with Vietnamese descriptions."""

from pathlib import Path

# ── Core Vietnamese description generator (copy of add-descriptions logic) ──

VIET_DESC = {
    # Anthropic
    "anthropic-algorithmic-art": "Tạo nghệ thuật thuật toán (algorithmic art) với Claude",
    "anthropic-brand-guidelines": "Áp dụng nguyên tắc thương hiệu Anthropic vào thiết kế",
    "anthropic-canvas-design": "Thiết kế giao diện canvas với Claude, kèm thư viện font",
    "anthropic-claude-api": "Tra cứu và tích hợp Claude API — model, streaming, tool use, caching",
    "anthropic-doc-coauthoring": "Soạn thảo văn bản cộng tác với Claude",
    "anthropic-docx": "Tạo và chỉnh sửa file Word (.docx) với Claude",
    "anthropic-frontend-design": "Thiết kế giao diện frontend với Claude",
    "anthropic-internal-comms": "Soạn thảo truyền thông nội bộ với Claude",
    "anthropic-mcp-builder": "Xây dựng MCP server với Claude",
    "anthropic-pdf": "Tạo và xử lý file PDF với Claude",
    "anthropic-pptx": "Tạo và chỉnh sửa file PowerPoint với Claude",
    "anthropic-skill-creator": "Tạo skill mới cho Claude Code",
    "anthropic-slack-gif-creator": "Tạo GIF động cho Slack với Claude",
    "anthropic-theme-factory": "Tạo theme màu sắc cho Claude Code",
    "anthropic-web-artifacts-builder": "Xây dựng web artifact (HTML/CSS/JS) với Claude",
    "anthropic-webapp-testing": "Kiểm thử ứng dụng web với Claude",
    "anthropic-xlsx": "Tạo và chỉnh sửa file Excel với Claude, dùng openpyxl",
    # Document
    "awesome-docx": "Công cụ mạnh mẽ tạo file Word với Claude",
    "awesome-pdf": "Công cụ mạnh mẽ tạo file PDF với Claude",
    "awesome-pptx": "Công cụ mạnh mẽ tạo file PowerPoint với Claude",
    "awesome-xlsx": "Công cụ mạnh mẽ tạo file Excel với Claude",
    "artifacts-builder": "Tạo artifact HTML/React để xem trước trong Claude",
    # Brand / Design
    "brand-guidelines": "Áp dụng nguyên tắc thương hiệu vào thiết kế",
    "brandkit": "Quản lý bộ nhận diện thương hiệu (logo, màu, font)",
    "brutalist-skill": "Thiết kế giao diện theo phong cách Brutalist",
    "canvas-design": "Thiết kế canvas với Claude",
    "redesign-skill": "Thiết kế lại giao diện có sẵn",
    "theme-factory": "Tạo theme màu sắc tùy chỉnh",
    # Content / Marketing
    "changelog-generator": "Tự động tạo changelog từ git commit",
    "clone-website": "Clone và phân tích cấu trúc website",
    "competitive-ads-extractor": "Trích xuất và phân tích quảng cáo đối thủ",
    "content-research-writer": "Nghiên cứu và viết nội dung chuyên sâu",
    "image-enhancer": "Nâng cao chất lượng ảnh",
    "image-to-code-skill": "Chuyển ảnh thiết kế thành code",
    "imagegen-frontend-mobile": "Tạo ảnh giao diện mobile bằng AI",
    "imagegen-frontend-web": "Tạo ảnh giao diện web bằng AI",
    "internal-comms": "Soạn thảo thông báo và truyền thông nội bộ",
    "lead-research-assistant": "Nghiên cứu khách hàng tiềm năng",
    "meeting-insights-analyzer": "Phân tích nội dung cuộc họp",
    "raffle-winner-picker": "Chọn người trúng thưởng ngẫu nhiên",
    "tailored-resume-generator": "Tạo CV tùy chỉnh theo yêu cầu",
    "twitter-algorithm-optimizer": "Tối ưu nội dung cho thuật toán Twitter",
    # Connect
    "connect": "Kết nối và đồng bộ dữ liệu giữa các dịch vụ",
    "connect-apps": "Kết nối ứng dụng bên thứ ba",
    # Dev / Growth
    "developer-growth-analysis": "Phân tích lộ trình phát triển của lập trình viên",
    "domain-name-brainstormer": "Gợi ý tên miền cho dự án",
    "file-organizer": "Sắp xếp và phân loại file tự động",
    "gpt-tasteskill": "Skill đánh giá chất lượng (taste) cho GPT",
    "invoice-organizer": "Quản lý và sắp xếp hóa đơn",
    "langsmith-fetch": "Lấy và phân tích dữ liệu từ LangSmith",
    # Output Style
    "i-have-adhd": "Định dạng output cho người ADHD: ngắn gọn, hành động trước, đánh số bước",
    "minimalist-skill": "Định dạng output tối giản, súc tích",
    "output-skill": "Tùy chỉnh định dạng output của Claude",
    "soft-skill": "Định dạng output nhẹ nhàng, thân thiện",
    # Matt Pocock
    "matt-ask-matt": "Hỏi Matt Pocock về chuyên môn qua skill",
    "matt-batch-grill-me": "Kiểm tra batch nhiều file cùng lúc",
    "matt-claude-handoff": "Bàn giao công việc giữa Claude và người dùng",
    "matt-code-review": "Review code với Matt Pocock",
    "matt-codebase-design": "Thiết kế kiến trúc codebase",
    "matt-design-an-interface": "Thiết kế giao diện người dùng",
    "matt-diagnosing-bugs": "Chẩn đoán và sửa lỗi",
    "matt-domain-modeling": "Mô hình hóa domain (DDD)",
    "matt-edit-article": "Chỉnh sửa bài viết kỹ thuật",
    "matt-git-guardrails-claude-code": "Ràng buộc git an toàn cho Claude Code",
    "matt-grill-me": "Kiểm tra kiến thức chuyên sâu",
    "matt-grill-with-docs": "Kiểm tra kiến thức dựa trên tài liệu",
    "matt-grilling": "Kiểm tra chất lượng code liên tục",
    "matt-handoff": "Bàn giao công việc giữa các agent",
    "matt-implement": "Triển khai code từ spec",
    "matt-improve-codebase-architecture": "Cải thiện kiến trúc codebase",
    "matt-loop-me": "Chạy loop kiểm tra liên tục",
    "matt-migrate-to-shoehorn": "Di chuyển codebase sang Shoehorn pattern",
    "matt-obsidian-vault": "Quản lý vault Obsidian",
    "matt-prototype": "Tạo prototype nhanh",
    "matt-qa": "Kiểm tra chất lượng và QA",
    "matt-request-refactor-plan": "Lên kế hoạch refactor code",
    "matt-research": "Nghiên cứu kỹ thuật chuyên sâu",
    "matt-resolving-merge-conflicts": "Giải quyết xung đột merge",
    "matt-scaffold-exercises": "Tạo bài tập lập trình",
    "matt-setup-matt-pocock-skills": "Thiết lập toàn bộ Matt Pocock skills",
    "matt-setup-pre-commit": "Thiết lập pre-commit hooks",
    "matt-setup-ts-deep-modules": "Cấu hình TypeScript deep modules",
    "matt-tdd": "Phát triển theo TDD (Test-Driven Development)",
    "matt-teach": "Giảng dạy kiến thức lập trình",
    "matt-to-questionnaire": "Chuyển đổi yêu cầu thành câu hỏi khảo sát",
    "matt-to-spec": "Chuyển đổi yêu cầu thành spec kỹ thuật",
    "matt-to-tickets": "Chuyển đổi yêu cầu thành ticket",
    "matt-triage": "Phân loại và ưu tiên issue",
    "matt-ubiquitous-language": "Xây dựng ngôn ngữ chung (ubiquitous language)",
    "matt-wayfinder": "Định hướng kiến trúc cho dự án",
    "matt-wizard": "Hướng dẫn từng bước theo phong cách wizard",
    "matt-writing-beats": "Viết kịch bản theo cấu trúc beats",
    "matt-writing-fragments": "Viết đoạn văn ngắn, súc tích",
    "matt-writing-great-skills": "Viết skill Claude chất lượng cao",
    "matt-writing-shape": "Định hình cấu trúc bài viết",
    # MCP Builder
    "mcp-builder": "Xây dựng MCP (Model Context Protocol) server",
    # Ponytail
    "ponytail": "Hỗ trợ ghi chú và quản lý kiến thức",
    "ponytail-audit": "Kiểm toán ghi chú Ponytail",
    "ponytail-debt": "Quản lý nợ kỹ thuật trong ghi chú",
    "ponytail-gain": "Tối ưu giá trị ghi chú",
    "ponytail-help": "Trợ giúp sử dụng Ponytail",
    "ponytail-review": "Review ghi chú Ponytail",
    # Skill Mgmt
    "skill-creator": "Tạo skill mới cho Claude Code",
    "skill-share": "Chia sẻ skill với cộng đồng",
    "template-skill": "Template để tạo skill mới",
    # Slack
    "slack-gif-creator": "Tạo GIF động gửi Slack",
    # Stitch
    "stitch-build-react-components": "Xây dựng React components với Google Stitch",
    "stitch-build-react-native": "Xây dựng React Native app với Stitch",
    "stitch-build-react-vite-dashboard": "Xây dựng dashboard React + Vite với Stitch",
    "stitch-build-remotion": "Xây dựng video với Remotion + Stitch",
    "stitch-build-shadcn-ui": "Xây dựng UI với shadcn/ui + Stitch",
    "stitch-design-code-to-design": "Chuyển code thành design spec cho Stitch",
    "stitch-design-extract-design-md": "Trích xuất design system thành file DESIGN.md",
    "stitch-design-extract-static-html": "Trích xuất thiết kế từ HTML tĩnh",
    "stitch-design-generate-design": "Tạo design system với Stitch",
    "stitch-design-manage-design-system": "Quản lý design system với Stitch",
    "stitch-design-upload-to-stitch": "Upload thiết kế lên Google Stitch",
    "stitch-skill": "Tích hợp Google Stitch tổng hợp",
    "stitch-utilities-design-md": "Tiện ích xử lý file DESIGN.md cho Stitch",
    "stitch-utilities-enhance-prompt": "Nâng cao prompt cho Stitch",
    "stitch-utilities-stitch-loop": "Vòng lặp tinh chỉnh thiết kế với Stitch",
    "stitch-utilities-taste-design": "Đánh giá chất lượng thiết kế Stitch",
    # Taste
    "taste-skill": "Đánh giá và cải thiện chất lượng code",
    "taste-skill-v1": "Phiên bản 1 của skill đánh giá chất lượng",
    # Media
    "turnstile-spin": "Tạo spinner/xoay vòng nội dung",
    "video-downloader": "Tải video từ URL",
    # Web Testing
    "webapp-testing": "Kiểm thử ứng dụng web tự động",
}

def vietnamese_desc(name):
    if name in VIET_DESC:
        return VIET_DESC[name]
    if name.startswith("composio-"):
        service = name.replace("composio-", "").replace("-automation", "").replace("_", " ")
        if name.startswith("composio--"):
            service = name.replace("composio--", "").replace("-automation", "").replace("_", " ")
        service = service.replace("-", " ").title().strip()
        return f"Tự động hóa {service} qua tích hợp Composio MCP"
    return name.replace("-", " ").title().strip()

MD_PATH = Path("D:/App-English-Ryan/Website/skills-inventory.md")

# ── Data: skill lists by category (same as original .md) ──

anthropic_official = [
    "anthropic-algorithmic-art", "anthropic-brand-guidelines", "anthropic-canvas-design",
    "anthropic-claude-api", "anthropic-doc-coauthoring", "anthropic-docx",
    "anthropic-frontend-design", "anthropic-internal-comms", "anthropic-mcp-builder",
    "anthropic-pdf", "anthropic-pptx", "anthropic-skill-creator",
    "anthropic-slack-gif-creator", "anthropic-theme-factory",
    "anthropic-web-artifacts-builder", "anthropic-webapp-testing", "anthropic-xlsx",
]

doc_office = ["artifacts-builder", "awesome-docx", "awesome-pdf", "awesome-pptx", "awesome-xlsx"]

brand_design = ["brand-guidelines", "brandkit", "brutalist-skill", "canvas-design", "redesign-skill", "theme-factory"]

content_marketing = [
    "changelog-generator", "clone-website", "competitive-ads-extractor",
    "content-research-writer", "image-enhancer", "image-to-code-skill",
    "imagegen-frontend-mobile", "imagegen-frontend-web", "internal-comms",
    "lead-research-assistant", "meeting-insights-analyzer", "raffle-winner-picker",
    "tailored-resume-generator", "twitter-algorithm-optimizer",
]

connect_skills = ["connect", "connect-apps"]

dev_growth = [
    "developer-growth-analysis", "domain-name-brainstormer", "file-organizer",
    "gpt-tasteskill", "invoice-organizer", "langsmith-fetch",
]

output_style = ["i-have-adhd", "minimalist-skill", "output-skill", "soft-skill"]

matt_skills = [
    "matt-ask-matt", "matt-batch-grill-me", "matt-claude-handoff", "matt-code-review",
    "matt-codebase-design", "matt-design-an-interface", "matt-diagnosing-bugs",
    "matt-domain-modeling", "matt-edit-article", "matt-git-guardrails-claude-code",
    "matt-grill-me", "matt-grill-with-docs", "matt-grilling", "matt-handoff",
    "matt-implement", "matt-improve-codebase-architecture", "matt-loop-me",
    "matt-migrate-to-shoehorn", "matt-obsidian-vault", "matt-prototype", "matt-qa",
    "matt-request-refactor-plan", "matt-research", "matt-resolving-merge-conflicts",
    "matt-scaffold-exercises", "matt-setup-matt-pocock-skills", "matt-setup-pre-commit",
    "matt-setup-ts-deep-modules", "matt-tdd", "matt-teach", "matt-to-questionnaire",
    "matt-to-spec", "matt-to-tickets", "matt-triage", "matt-ubiquitous-language",
    "matt-wayfinder", "matt-wizard", "matt-writing-beats", "matt-writing-fragments",
    "matt-writing-great-skills", "matt-writing-shape",
]

mcp_builder_skills = ["mcp-builder"]

ponytail = ["ponytail", "ponytail-audit", "ponytail-debt", "ponytail-gain", "ponytail-help", "ponytail-review"]

skill_mgmt = ["skill-creator", "skill-share", "template-skill"]

slack_skills = ["slack-gif-creator"]

stitch_skills = [
    "stitch-build-react-components", "stitch-build-react-native",
    "stitch-build-react-vite-dashboard", "stitch-build-remotion", "stitch-build-shadcn-ui",
    "stitch-design-code-to-design", "stitch-design-extract-design-md",
    "stitch-design-extract-static-html", "stitch-design-generate-design",
    "stitch-design-manage-design-system", "stitch-design-upload-to-stitch",
    "stitch-skill", "stitch-utilities-design-md", "stitch-utilities-enhance-prompt",
    "stitch-utilities-stitch-loop", "stitch-utilities-taste-design",
]

taste_skills = ["taste-skill", "taste-skill-v1"]
media_skills = ["turnstile-spin", "video-downloader"]
web_testing = ["webapp-testing"]

# Composio list (full)
composio_skills = """
composio--21risk-automation, composio--2chat-automation, composio-ably-automation,
composio-abstract-automation, composio-abuselpdb-automation, composio-abyssale-automation,
composio-accelo-automation, composio-accredible-certificates-automation,
composio-acculynx-automation, composio-active-campaign-automation,
composio-addresszen-automation, composio-adobe-automation, composio-adrapid-automation,
composio-adyntel-automation, composio-aero-workflow-automation, composio-aeroleads-automation,
composio-affinda-automation, composio-affinity-automation, composio-agencyzoom-automation,
composio-agent-mail-automation, composio-agentql-automation, composio-agenty-automation,
composio-agiled-automation, composio-agility-cms-automation, composio-ahrefs-automation,
composio-ai-ml-api-automation, composio-aivoov-automation, composio-alchemy-automation,
composio-algodocs-automation, composio-algolia-automation, composio-all-images-ai-automation,
composio-alpha-vantage-automation, composio-altoviz-automation, composio-alttext-ai-automation,
composio-amara-automation, composio-amazon-automation, composio-ambee-automation,
composio-ambient-weather-automation, composio-amcards-automation,
composio-anchor-browser-automation, composio-anonyflow-automation,
composio-anthropic-administrator-automation, composio-anthropic_administrator-automation,
composio-apaleo-automation, composio-apex27-automation, composio-api-bible-automation,
composio-api-labz-automation, composio-api-ninjas-automation, composio-api-sports-automation,
composio-api2pdf-automation, composio-apiflash-automation, composio-apify-automation,
composio-apilio-automation, composio-apipie-ai-automation, composio-apitemplate-io-automation,
composio-apiverve-automation, composio-apollo-automation, composio-appcircle-automation,
composio-appdrag-automation, composio-appointo-automation, composio-appsflyer-automation,
composio-appveyor-automation, composio-aryn-automation, composio-ascora-automation,
composio-ashby-automation, composio-asin-data-api-automation, composio-astica-ai-automation,
composio-async-interview-automation, composio-atlassian-automation, composio-attio-automation,
composio-auth0-automation, composio-autobound-automation, composio-autom-automation,
composio-axonaut-automation, composio-ayrshare-automation, composio-backendless-automation,
composio-bannerbear-automation, composio-bart-automation, composio-baselinker-automation,
composio-baserow-automation, composio-basin-automation, composio-battlenet-automation,
composio-beaconchain-automation, composio-beaconstac-automation, composio-beamer-automation,
composio-beeminder-automation, composio-bench-automation, composio-benchmark-email-automation,
composio-benzinga-automation, composio-bestbuy-automation, composio-better-proposals-automation,
composio-better-stack-automation, composio-bidsketch-automation,
composio-big-data-cloud-automation, composio-bigmailer-automation, composio-bigml-automation,
composio-bigpicture-io-automation, composio-bitquery-automation, composio-bitwarden-automation,
composio-blackbaud-automation, composio-blackboard-automation, composio-blocknative-automation,
composio-boldsign-automation, composio-bolna-automation, composio-boloforms-automation,
composio-bolt-iot-automation, composio-bonsai-automation, composio-bookingmood-automation,
composio-booqable-automation, composio-borneo-automation, composio-botbaba-automation,
composio-botpress-automation, composio-botsonic-automation, composio-botstar-automation,
composio-bouncer-automation, composio-boxhero-automation, composio-braintree-automation,
composio-brandfetch-automation, composio-breeze-automation, composio-breezy-hr-automation,
composio-brex-automation, composio-brex-staging-automation, composio-brightdata-automation,
composio-brightpearl-automation, composio-brilliant-directories-automation,
composio-browseai-automation, composio-browser-tool-automation,
composio-browserbase-tool-automation, composio-browserhub-automation,
composio-browserless-automation, composio-btcpay-server-automation, composio-bubble-automation,
composio-bugbug-automation, composio-bugherd-automation, composio-bugsnag-automation,
composio-buildkite-automation, composio-builtwith-automation, composio-bunnycdn-automation,
composio-byteforms-automation, composio-cabinpanda-automation, composio-cal-automation,
composio-calendarhero-automation, composio-callerapi-automation, composio-callingly-automation,
composio-callpage-automation, composio-campaign-cleaner-automation, composio-campayn-automation,
composio-canny-automation, composio-canvas-automation, composio-capsule-crm-automation,
composio-capsule_crm-automation, composio-carbone-automation, composio-cardly-automation,
composio-castingwords-automation, composio-cats-automation, composio-cdr-platform-automation,
composio-census-bureau-automation, composio-centralstationcrm-automation,
composio-certifier-automation, composio-chaser-automation, composio-chatbotkit-automation,
composio-chatfai-automation, composio-chatwork-automation, composio-chmeetings-automation,
composio-cincopa-automation, composio-claid-ai-automation, composio-classmarker-automation,
composio-clearout-automation, composio-clickmeeting-automation, composio-clockify-automation,
composio-cloudcart-automation, composio-cloudconvert-automation,
composio-cloudflare-api-key-automation, composio-cloudflare-automation,
composio-cloudflare-browser-rendering-automation, composio-cloudinary-automation,
composio-cloudlayer-automation, composio-cloudpress-automation, composio-coassemble-automation,
composio-codacy-automation, composio-codeinterpreter-automation, composio-codereadr-automation,
composio-coinbase-automation, composio-coinmarketcal-automation, composio-coinmarketcap-automation,
composio-coinranking-automation, composio-college-football-data-automation,
composio-composio-automation, composio-composio-search-automation, composio-connecteam-automation,
composio-contentful-automation, composio-contentful-graphql-automation, composio-control-d-automation,
composio-conversion-tools-automation, composio-convertapi-automation, composio-conveyor-automation,
composio-convolo-ai-automation, composio-corrently-automation, composio-countdown-api-automation,
composio-coupa-automation, composio-craftmypdf-automation, composio-crowdin-automation,
composio-crustdata-automation, composio-cults-automation, composio-curated-automation,
composio-currents-api-automation, composio-customerio-automation, composio-customgpt-automation,
composio-customjs-automation, composio-cutt-ly-automation, composio-d2lbrightspace-automation,
composio-dadata-ru-automation, composio-daffy-automation, composio-dailybot-automation,
composio-datagma-automation, composio-datarobot-automation, composio-deadline-funnel-automation,
composio-deel-automation, composio-deepgram-automation, composio-demio-automation,
composio-desktime-automation, composio-detrack-automation, composio-dialmycalls-automation,
composio-dialpad-automation, composio-dictionary-api-automation, composio-diffbot-automation,
composio-digicert-automation, composio-digital-ocean-automation, composio-discordbot-automation,
composio-dnsfilter-automation, composio-dock-certs-automation, composio-docker-hub-automation,
composio-docker_hub-automation, composio-docmosis-automation, composio-docnify-automation,
composio-docsbot-ai-automation, composio-docsumo-automation, composio-docugenerate-automation,
composio-documenso-automation, composio-documint-automation, composio-docupilot-automation,
composio-docupost-automation, composio-docuseal-automation,
composio-doppler-marketing-automation-automation, composio-doppler-secretops-automation,
composio-dotsimple-automation, composio-dovetail-automation, composio-dpd2-automation,
composio-draftable-automation, composio-dreamstudio-automation, composio-drip-jobs-automation,
composio-dripcel-automation, composio-dromo-automation, composio-dropbox-sign-automation,
composio-dropcontact-automation, composio-dungeon-fighter-online-automation,
composio-dynamics365-automation, composio-echtpost-automation, composio-elevenlabs-automation,
composio-elorus-automation, composio-emailable-automation, composio-emaillistverify-automation,
composio-emailoctopus-automation, composio-emelia-automation, composio-encodian-automation,
composio-endorsal-automation, composio-enginemailer-automation, composio-enigma-automation,
composio-entelligence-automation, composio-eodhd-apis-automation, composio-epic-games-automation,
composio-esignatures-io-automation, composio-espocrm-automation, composio-esputnik-automation,
composio-etermin-automation, composio-evenium-automation, composio-eventbrite-automation,
composio-eventee-automation, composio-eventzilla-automation, composio-everhour-automation,
composio-eversign-automation, composio-exa-automation, composio-excel-automation,
composio-exist-automation, composio-expofp-automation, composio-extracta-ai-automation,
composio-facebook-automation, composio-faceup-automation, composio-factorial-automation,
composio-feathery-automation, composio-felt-automation, composio-fibery-automation,
composio-fidel-api-automation, composio-files-com-automation, composio-fillout-forms-automation,
composio-fillout_forms-automation, composio-finage-automation, composio-findymail-automation,
composio-finerworks-automation, composio-fingertip-automation, composio-finmei-automation,
composio-fireberry-automation, composio-firecrawl-automation, composio-fireflies-automation,
composio-firmao-automation, composio-fitbit-automation, composio-fixer-automation,
composio-fixer-io-automation, composio-flexisign-automation, composio-flowiseai-automation,
composio-flutterwave-automation, composio-fluxguard-automation, composio-folk-automation,
composio-fomo-automation, composio-forcemanager-automation, composio-formbricks-automation,
composio-formcarry-automation, composio-formdesk-automation, composio-formsite-automation,
composio-foursquare-automation, composio-fraudlabs-pro-automation, composio-freshbooks-automation,
composio-front-automation, composio-fullenrich-automation, composio-gagelist-automation,
composio-gamma-automation, composio-gan-ai-automation, composio-gatherup-automation,
composio-gemini-automation, composio-gender-api-automation, composio-genderapi-io-automation,
composio-genderize-automation, composio-geoapify-automation, composio-geocodio-automation,
composio-geokeo-automation, composio-getform-automation, composio-gift-up-automation,
composio-gigasheet-automation, composio-giphy-automation, composio-gist-automation,
composio-givebutter-automation, composio-gladia-automation, composio-gleap-automation,
composio-globalping-automation, composio-go-to-webinar-automation, composio-godial-automation,
composio-gong-automation, composio-goodbits-automation, composio-goody-automation,
composio-google-address-validation-automation, composio-google-admin-automation,
composio-google-classroom-automation, composio-google-cloud-vision-automation,
composio-google-maps-automation, composio-google-search-console-automation,
composio-google_admin-automation, composio-google_classroom-automation,
composio-google_maps-automation, composio-google_search_console-automation,
composio-googleads-automation, composio-googlebigquery-automation, composio-googlecalendar-automation,
composio-googledocs-automation, composio-googledrive-automation, composio-googlemeet-automation,
composio-googlephotos-automation, composio-googleslides-automation, composio-googlesuper-automation,
composio-googletasks-automation, composio-gorgias-automation, composio-gosquared-automation,
composio-grafbase-automation, composio-graphhopper-automation, composio-griptape-automation,
composio-grist-automation, composio-groqcloud-automation, composio-gumroad-automation,
composio-habitica-automation, composio-hackernews-automation, composio-happy-scribe-automation,
composio-harvest-automation, composio-hashnode-automation, composio-helcim-automation,
composio-helloleads-automation, composio-helpwise-automation, composio-here-automation,
composio-heygen-automation, composio-heyreach-automation, composio-heyzine-automation,
composio-highergov-automation, composio-highlevel-automation, composio-honeybadger-automation,
composio-honeyhive-automation, composio-hookdeck-automation, composio-hotspotsystem-automation,
composio-html-to-image-automation, composio-humanitix-automation, composio-humanloop-automation,
composio-hunter-automation, composio-hypeauditor-automation, composio-hyperbrowser-automation,
composio-hyperise-automation, composio-hystruct-automation, composio-icims-talent-cloud-automation,
composio-icypeas-automation, composio-idea-scale-automation, composio-identitycheck-automation,
composio-ignisign-automation, composio-imagekit-io-automation, composio-imgbb-automation,
composio-imgix-automation, composio-influxdb-cloud-automation, composio-insighto-ai-automation,
composio-instacart-automation, composio-instantly-automation, composio-intelliprint-automation,
composio-interzoid-automation, composio-ip2location-automation, composio-ip2location-io-automation,
composio-ip2proxy-automation, composio-ip2whois-automation, composio-ipdata-co-automation,
composio-ipinfo-io-automation, composio-iqair-airvisual-automation, composio-jigsawstack-automation,
composio-jobnimbus-automation, composio-jotform-automation, composio-jumpcloud-automation,
composio-junglescout-automation, composio-kadoa-automation, composio-kaggle-automation,
composio-kaleido-automation, composio-keap-automation, composio-keen-io-automation,
composio-kickbox-automation, composio-kit-automation, composio-klipfolio-automation,
composio-ko-fi-automation, composio-kommo-automation, composio-kontent-ai-automation,
composio-kraken-io-automation, composio-l2s-automation, composio-labs64-netlicensing-automation,
composio-landbot-automation, composio-langbase-automation, composio-lastpass-automation,
composio-launch-darkly-automation, composio-launch_darkly-automation, composio-leadfeeder-automation,
composio-leadoku-automation, composio-leiga-automation, composio-lemlist-automation,
composio-lemon-squeezy-automation, composio-lemon_squeezy-automation, composio-lessonspace-automation,
composio-lever-automation, composio-lever-sandbox-automation, composio-leverly-automation,
composio-lexoffice-automation, composio-linguapop-automation, composio-linkhut-automation,
composio-linkup-automation, composio-listclean-automation, composio-listennotes-automation,
composio-livesession-automation, composio-lmnt-automation, composio-lodgify-automation,
composio-logo-dev-automation, composio-loomio-automation, composio-loyverse-automation,
composio-magnetic-automation, composio-mailbluster-automation, composio-mailboxlayer-automation,
composio-mailcheck-automation, composio-mailcoach-automation, composio-mailerlite-automation,
composio-mailersend-automation, composio-mails-so-automation, composio-mailsoftly-automation,
composio-maintainx-automation, composio-many-chat-automation, composio-many_chat-automation,
composio-mapbox-automation, composio-mapulus-automation, composio-mboum-automation,
composio-melo-automation, composio-mem-automation, composio-mem0-automation,
composio-memberspot-automation, composio-memberstack-automation, composio-membervault-automation,
composio-metaads-automation, composio-metaphor-automation, composio-mezmo-automation,
composio-microsoft-clarity-automation, composio-microsoft-tenant-automation,
composio-microsoft_clarity-automation, composio-minerstat-automation, composio-missive-automation,
composio-mistral-ai-automation, composio-mistral_ai-automation, composio-mocean-automation,
composio-moco-automation, composio-modelry-automation, composio-moneybird-automation,
composio-moonclerk-automation, composio-moosend-automation, composio-mopinion-automation,
composio-more-trees-automation, composio-moxie-automation, composio-moz-automation,
composio-msg91-automation, composio-mural-automation, composio-mx-technologies-automation,
composio-mx-toolbox-automation, composio-nango-automation, composio-nano-nets-automation,
composio-nasa-automation, composio-nasdaq-automation, composio-ncscale-automation,
composio-needle-automation, composio-neon-automation, composio-netsuite-automation,
composio-neuronwriter-automation, composio-neutrino-automation, composio-neverbounce-automation,
composio-new-relic-automation, composio-new_relic-automation, composio-news-api-automation,
composio-nextdns-automation, composio-ngrok-automation, composio-ninox-automation,
composio-nocrm-io-automation, composio-npm-automation, composio-ocr-web-service-automation,
composio-ocrspace-automation, composio-omnisend-automation, composio-oncehub-automation,
composio-onedesk-automation, composio-onepage-automation, composio-onesignal-rest-api-automation,
composio-onesignal-user-auth-automation, composio-onesignal_rest_api-automation,
composio-open-sea-automation, composio-openai-automation, composio-opencage-automation,
composio-opengraph-io-automation, composio-openperplex-automation, composio-openrouter-automation,
composio-openweather-api-automation, composio-optimoroute-automation, composio-owl-protocol-automation,
composio-page-x-automation, composio-pandadoc-automation, composio-paradym-automation,
composio-parallel-automation, composio-parma-automation, composio-parsehub-automation,
composio-parsera-automation, composio-parseur-automation, composio-passcreator-automation,
composio-passslot-automation, composio-payhip-automation, composio-pdf-api-io-automation,
composio-pdf-co-automation, composio-pdf4me-automation, composio-pdfless-automation,
composio-pdfmonkey-automation, composio-peopledatalabs-automation, composio-perigon-automation,
composio-perplexityai-automation, composio-persistiq-automation, composio-pexels-automation,
composio-phantombuster-automation, composio-piggy-automation, composio-piloterr-automation,
composio-pilvio-automation, composio-pingdom-automation, composio-pipeline-crm-automation,
composio-placekey-automation, composio-placid-automation, composio-plain-automation,
composio-plasmic-automation, composio-platerecognizer-automation, composio-plisio-automation,
composio-polygon-automation, composio-polygon-io-automation, composio-poptin-automation,
composio-postgrid-automation, composio-postgrid-verify-automation, composio-precoro-automation,
composio-prerender-automation, composio-printautopilot-automation, composio-prisma-automation,
composio-prismic-automation, composio-process-street-automation, composio-procfu-automation,
composio-productboard-automation, composio-productlane-automation, composio-project-bubble-automation,
composio-proofly-automation, composio-proxiedmail-automation, composio-pushbullet-automation,
composio-pushover-automation, composio-quaderno-automation, composio-qualaroo-automation,
composio-quickbooks-automation, composio-radar-automation, composio-rafflys-automation,
composio-ragic-automation, composio-raisely-automation, composio-ramp-automation,
composio-ravenseotools-automation, composio-re-amaze-automation, composio-realphonevalidation-automation,
composio-recallai-automation, composio-recruitee-automation, composio-refiner-automation,
composio-remarkety-automation, composio-remote-retrieval-automation, composio-remove-bg-automation,
composio-renderform-automation, composio-repairshopr-automation, composio-replicate-automation,
composio-reply-automation, composio-reply-io-automation, composio-resend-automation,
composio-respond-io-automation, composio-retailed-automation, composio-retellai-automation,
composio-retently-automation, composio-rev-ai-automation, composio-revolt-automation,
composio-ring-central-automation, composio-ring_central-automation, composio-rippling-automation,
composio-ritekit-automation, composio-rkvst-automation, composio-rocketlane-automation,
composio-rootly-automation, composio-rosette-text-analytics-automation, composio-route4me-automation,
composio-safetyculture-automation, composio-sage-automation,
composio-salesforce-marketing-cloud-automation, composio-salesforce-service-cloud-automation,
composio-salesmate-automation, composio-sap-successfactors-automation, composio-satismeter-automation,
composio-scrape-do-automation, composio-scrapegraph-ai-automation, composio-scrapfly-automation,
composio-scrapingant-automation, composio-scrapingbee-automation, composio-screenshot-fyi-automation,
composio-screenshotone-automation, composio-seat-geek-automation, composio-securitytrails-automation,
composio-segmetrics-automation, composio-seismic-automation, composio-semanticscholar-automation,
composio-semrush-automation, composio-sendbird-ai-chabot-automation, composio-sendbird-automation,
composio-sendfox-automation, composio-sendlane-automation, composio-sendloop-automation,
composio-sendspark-automation, composio-sensibo-automation, composio-seqera-automation,
composio-serpapi-automation, composio-serpdog-automation, composio-serply-automation,
composio-servicem8-automation, composio-sevdesk-automation, composio-share-point-automation,
composio-share_point-automation, composio-shipengine-automation, composio-short-io-automation,
composio-short-menu-automation, composio-shortcut-automation, composio-shorten-rest-automation,
composio-shortpixel-automation, composio-shotstack-automation, composio-sidetracker-automation,
composio-signaturely-automation, composio-signpath-automation, composio-signwell-automation,
composio-similarweb-digitalrank-api-automation, composio-similarweb_digitalrank_api-automation,
composio-simla-com-automation, composio-simple-analytics-automation, composio-simplesat-automation,
composio-sitespeakai-automation, composio-skyfire-automation, composio-slackbot-automation,
composio-smartproxy-automation, composio-smartrecruiters-automation, composio-sms-alert-automation,
composio-smtp2go-automation, composio-smugmug-automation, composio-snowflake-automation,
composio-sourcegraph-automation, composio-splitwise-automation, composio-spoki-automation,
composio-spondyr-automation, composio-spotify-automation, composio-spotlightr-automation,
composio-sslmate-cert-spotter-api-automation, composio-stack-exchange-automation,
composio-stannp-automation, composio-starton-automation, composio-statuscake-automation,
composio-storeganise-automation, composio-storerocket-automation, composio-stormglass-io-automation,
composio-strava-automation, composio-streamtime-automation, composio-supadata-automation,
composio-superchat-automation, composio-supportbee-automation, composio-supportivekoala-automation,
composio-survey-monkey-automation, composio-survey_monkey-automation, composio-svix-automation,
composio-sympla-automation, composio-synthflow-ai-automation, composio-taggun-automation,
composio-talenthr-automation, composio-tally-automation, composio-tapfiliate-automation,
composio-tapform-automation, composio-tavily-automation, composio-taxjar-automation,
composio-teamcamp-automation, composio-telnyx-automation, composio-teltel-automation,
composio-templated-automation, composio-test-app-automation, composio-text-to-pdf-automation,
composio-textcortex-automation, composio-textit-automation, composio-textrazor-automation,
composio-thanks-io-automation, composio-the-odds-api-automation, composio-ticketmaster-automation,
composio-ticktick-automation, composio-timecamp-automation, composio-timekit-automation,
composio-timelinesai-automation, composio-timelink-automation, composio-timely-automation,
composio-tinyurl-automation, composio-tisane-automation, composio-toggl-automation,
composio-token-metrics-automation, composio-tomba-automation, composio-tomtom-automation,
composio-toneden-automation, composio-tpscheck-automation, composio-triggercmd-automation,
composio-tripadvisor-content-api-automation, composio-turbot-pipes-automation, composio-turso-automation,
composio-twelve-data-automation, composio-twitch-automation, composio-twocaptcha-automation,
composio-typefully-automation, composio-typless-automation, composio-u301-automation,
composio-unione-automation, composio-updown-io-automation, composio-uploadcare-automation,
composio-uptimerobot-automation, composio-userlist-automation, composio-v0-automation,
composio-venly-automation, composio-veo-automation, composio-verifiedemail-automation,
composio-veriphone-automation, composio-vero-automation, composio-vestaboard-automation,
composio-virustotal-automation, composio-visme-automation, composio-waboxapp-automation,
composio-wachete-automation, composio-waiverfile-automation, composio-wakatime-automation,
composio-wati-automation, composio-wave-accounting-automation, composio-wave_accounting-automation,
composio-weathermap-automation, composio-webex-automation, composio-webscraping-ai-automation,
composio-webvizio-automation, composio-whautomate-automation, composio-winston-ai-automation,
composio-wit-ai-automation, composio-wiz-automation, composio-wolfram-alpha-api-automation,
composio-woodpecker-co-automation, composio-workable-automation, composio-workday-automation,
composio-workiom-automation, composio-worksnaps-automation, composio-writer-automation,
composio-xero-automation, composio-y-gy-automation, composio-yandex-automation, composio-yelp-automation,
composio-ynab-automation, composio-yousearch-automation, composio-zenrows-automation,
composio-zenserp-automation, composio-zeplin-automation, composio-zerobounce-automation,
composio-zoho-automation, composio-zoho-bigin-automation, composio-zoho-books-automation,
composio-zoho-desk-automation, composio-zoho-inventory-automation, composio-zoho-invoice-automation,
composio-zoho-mail-automation, composio-zoho_bigin-automation, composio-zoho_books-automation,
composio-zoho_desk-automation, composio-zoho_inventory-automation, composio-zoho_invoice-automation,
composio-zoho_mail-automation, composio-zoominfo-automation, composio-zylvie-automation,
composio-zyte-api-automation
"""

# Parse composio
composio_list = [s.strip() for s in composio_skills.replace("\n", "").split(",") if s.strip()]

# ── Regenerate markdown ──
lines = []
lines.append("# Skills Inventory")
lines.append("")
lines.append("**Generated:** 2026-07-27")
lines.append("**Source:** `.claude/skills/` (960 skills) & `.codex/skills/` (945 skills)")
lines.append("Mỗi skill có mô tả tiếng Việt kèm theo.")
lines.append("")
lines.append("---")
lines.append("")
lines.append("## 1. .claude/skills/ — All 960 skills")

def write_category(title, skill_list, indent=False):
    lines.append("")
    lines.append(f"### {title}")
    lines.append("")
    for s in skill_list:
        desc = vietnamese_desc(s)
        if indent:
            lines.append(f"  - **{s}**: {desc}")
        else:
            lines.append(f"- **{s}**: {desc}")

write_category("Anthropic Official", anthropic_official)
write_category("Document / Office", doc_office)
write_category("Brand / Design", brand_design)
write_category("Content / Marketing", content_marketing)
write_category("Connect", connect_skills)
write_category("Development / Growth", dev_growth)
write_category("Output Style", output_style)
write_category("Matt Pocock Skills", matt_skills)
write_category("MCP Builder", mcp_builder_skills)
write_category("Ponytail Suite", ponytail)
write_category("Skill Management", skill_mgmt)
write_category("Slack", slack_skills)
write_category("Stitch Skills", stitch_skills)
write_category("Taste", taste_skills)
write_category("Media", media_skills)
write_category("Web App Testing", web_testing)
write_category(f"Composio Automations ({len(composio_list)} skills)", composio_list)

lines.append("")
lines.append("---")
lines.append("")
lines.append("## 2. .codex/skills/ — 945 skills")
lines.append("")
lines.append("Codex skills là subset của .claude skills. Xem danh sách đầy đủ ở mục 1.")
lines.append("Codex `.config.toml` chỉ định nghĩa MCP servers, không có skill riêng.")
lines.append("")
lines.append("### 15 skills chỉ có trong .claude, không có trong .codex:")
lines.append("")

claude_only = [
    "brandkit", "brutalist-skill", "clone-website", "gpt-tasteskill",
    "imagegen-frontend-mobile", "imagegen-frontend-web", "image-to-code-skill",
    "minimalist-skill", "output-skill", "soft-skill", "stitch-skill",
    "taste-skill", "taste-skill-v1", "turnstile-spin", "video-downloader",
]
for s in claude_only:
    desc = vietnamese_desc(s)
    lines.append(f"1. **{s}**: {desc}")

lines.append("")
lines.append("---")
lines.append("")
lines.append("## 3. Built-in Bot Skills (Claude Code Harness)")
lines.append("")

builtin = [
    ("anthropic-skills:consolidate-memory", "Hợp nhất và tối ưu bộ nhớ Claude trong session"),
    ("anthropic-skills:docx", "Tạo và chỉnh sửa file Microsoft Word (.docx)"),
    ("anthropic-skills:frontend-design", "Thiết kế giao diện frontend với Claude"),
    ("anthropic-skills:pdf", "Tạo và xử lý file PDF"),
    ("anthropic-skills:pdf-reading", "Đọc và trích xuất nội dung từ PDF"),
    ("anthropic-skills:pptx", "Tạo và chỉnh sửa file PowerPoint (.pptx)"),
    ("anthropic-skills:schedule", "Lên lịch và quản lý tác vụ định kỳ"),
    ("anthropic-skills:setup-cowork", "Thiết lập môi trường làm việc cộng tác"),
    ("anthropic-skills:xlsx", "Tạo và chỉnh sửa file Excel (.xlsx)"),
    ("claude-api", "Tra cứu tài liệu Claude API — model, pricing, streaming, tool use, caching"),
    ("dataviz", "Tạo biểu đồ, dashboard, trực quan hóa dữ liệu chuyên nghiệp"),
    ("fewer-permission-prompts", "Giảm số lần xin phép bằng allowlist trong settings"),
    ("init", "Khởi tạo và cấu hình dự án mới"),
    ("keybindings-help", "Hướng dẫn tùy chỉnh phím tắt Claude Code"),
    ("loop", "Chạy lặp prompt hoặc slash command theo chu kỳ"),
    ("review", "Review code thay đổi theo standards và spec"),
    ("run", "Chạy ứng dụng để kiểm tra thay đổi"),
    ("security-review", "Review bảo mật cho toàn bộ codebase"),
    ("simplify", "Tối giản code — giảm phức tạp, tăng tái sử dụng"),
    ("update-config", "Cấu hình Claude Code harness (settings.json)"),
]
for name, desc in builtin:
    lines.append(f"- **{name}**: {desc}")

lines.append("")
lines.append("---")
lines.append("")
lines.append("**Grand total:** 960 (.claude) + 0 unique (.codex) + 20 built-in = **980 unique skill entries**.")
lines.append("")

MD_PATH.write_text("\n".join(lines), encoding="utf-8")
print("Done! Updated markdown:", MD_PATH)
