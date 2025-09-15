Turn any article into a quick comprehension quiz — right in your browser.

AI Article Quizzer is a Manifest V3 Chrome extension that grabs the main content of the page you’re reading, summarizes it, and generates a short quiz to check understanding.


Readable content only. Uses Readability-style extraction to ignore nav/ads.

Handles long reads. Sentence-aware truncation so long articles still work.

Answer review. Shows a score summary and (optionally) brief explanations.

Privacy-first. Processes only what you ask it to; stores settings locally.

MV3-native. Modern extension architecture with a service worker background.


How It Works

Capture content. A content script runs on demand to extract the main article text (Readability-style parsing) and remove boilerplate.
Pre-process. Cleans up whitespace, drops tiny fragments, and normalizes headings.
Truncate (if needed). Uses a sentence-aware window so long articles still fit model limits without cutting in the middle of ideas.
Generate questions. Sends the processed text to the LLM to produce objective questions (MCQ/true-false/short answer).
Quiz UI. Renders a lightweight quiz in the popup, records your selections, and shows a score summary. Optional explanations can be displayed when implemented for a given question type.
Local settings. Your preferences (model, number of questions, hotkeys, etc.) are stored via chrome.storage.local.

Example of extension in use: ![screenshotforextension](https://github.com/user-attachments/assets/be5d37b2-6a0e-445c-8d0b-cd9da9e75ccb)

Installation (via Chrome Webstore)

Follow this link to the page of the extension: https://chromewebstore.google.com/detail/article-quiz-generator/hmolnbldhapcmomnneomchfodlfnbecm?authuser=0&hl=en
Download & upload API key (instructions outlined in GitHub installation)

Installation (via GitHub files)

Requires Chrome/Edge or any Chromium browser with extension developer mode.
1) Load Unpacked (local dev)


Open chrome://extensions in your browser.
Turn on Developer mode (top right).
Click Load unpacked and select the extension/ folder (the one containing manifest.json).
You should now see AI Article Quizzer in your extension list.

Optional: If you have a build step or TypeScript, run it first (e.g., npm i && npm run build) and load the dist/ folder instead.

2) Configure your API key

Click the extension icon → Options (or right-click the icon → Options).

Paste your OpenAI API key (or your proxy URL + key if you use a server).

Choose defaults (number of questions, enable explanations, etc.).

Save.


Usage

Navigate to an article (news post, blog post, documentation page).

Click the AI Article Quizzer icon, or press your hotkey (see below).

Choose Quiz me.

Answer questions; submit to see your score and optional explanations.

Click Retake for a fresh set or adjust settings for difficulty/length.


Permissions
The extension keeps permissions minimal:
activeTab — interact with the current tab when you click the extension.
scripting — inject the content script only when needed.
storage — save your preferences locally.
(optional) contextMenus — if you enable right-click “Quiz this page.”
(optional) host permissions — if you want automatic parsing on specific domains.


Settings
Open the Options page to configure:
API key / proxy (recommended for public use)
Number of questions (3–10)
Enable explanations (experimental)
Quiz style (multiple choice / mixed)
Model & max tokens (advanced)
Extraction mode (main article vs. full page vs. selection only)


Development

Project layout (example):

extension/
├─ manifest.json
├─ background.js            # MV3 service worker
├─ content.js               # injected on demand to extract article text
├─ popup.html
├─ popup.js
├─ styles.css
├─ vendor/
│  └─ readability.js
└─ img/
   ├─ icon128.png
   └─ screenshot-popup.png


Local scripts (optional)

# if you add a build/lint toolchain
npm i
npm run dev     # watch + rebuild (if bundling)
npm run lint    # code style
npm run format  # prettier


Notes

Uses Manifest V3; background is a service worker.

Settings stored via chrome.storage.local.

Content scripts only run when you click the extension or use a hotkey.

Troubleshooting

“Nothing happens when I click Quiz me.”
Make sure the page is an actual article (not a PDF or a Chrome internal page). Try selecting a paragraph and using Alt+Shift+W.

“Model error / quota exceeded.”
Check your API key/billing. You can also lower question count or disable explanations.

“Page looks parsed incorrectly.”
Try Selection-only mode from settings, or toggle Extraction mode to “full page,” then re-quiz.

“Hotkeys don’t work.”
Set them in chrome://extensions/shortcuts and ensure they don’t conflict with system/global shortcuts.

FAQ

Why do I need an API key?
Question generation uses an LLM. Your key lets the extension call the model on your behalf.

Is my key safe?
For personal use, storing in chrome.storage.local is fine. For public distribution, use a proxy (never ship your key inside the extension).

Does it work on paywalled pages?
Only if the content is visible in your browser tab. It won’t bypass paywalls.

Will it grade short answers?
By default quizzes are multiple choice for reliable scoring. Short-answer grading is experimental and may require manual review.

Roadmap

Better explanations with citations to article sentences

Tunable difficulty (“easier,” “exam-style”)

Short-answer grading improvements

Per-site extraction tweaks

Export results (CSV/JSON)

Web demo (paste a URL/text → quiz without installing)

Contributing

PRs and issues are welcome! A good first PR could be:

Improving truncation heuristics for long articles

New quiz types (matching, ordering)

Better UI/UX in the popup (accessibility, keyboard nav)

Additional hotkeys and context-menu actions

Please run linters/tests (if configured) before opening a PR.

Security

If you discover a vulnerability (e.g., XSS in rendered quiz content or key handling), please open a private issue or contact the maintainer directly so we can patch quickly. Do not post public PoCs that expose API keys.


Initial README:
For this to work, you need your own API credits (which you CAN get for free)

You'll be prompted to link you API key, which can be found here: https://platform.openai.com/account/api-keys



This extension is mostly for personal use, and rarely works on pdf documents, incredibly long articles, or any paywall remover bypasses (eg archive, removepaywalls.com, etc)

View your current/remaining API credits here: https://platform.openai.com/usage
Also able to buy new credits there ^^


