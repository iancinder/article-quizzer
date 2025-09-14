document.addEventListener("DOMContentLoaded", () => {
  // Tab switching
  const quizTab = document.getElementById("quiz-tab");
  const settingsTab = document.getElementById("settings-tab");
  const tabQuizBtn = document.getElementById("tab-quiz");
  const tabSettingsBtn = document.getElementById("tab-settings");

  tabQuizBtn.addEventListener("click", () => {
    quizTab.style.display = "block";
    settingsTab.style.display = "none";
    tabQuizBtn.classList.add("active");
    tabSettingsBtn.classList.remove("active");
  });

  tabSettingsBtn.addEventListener("click", () => {
    quizTab.style.display = "none";
    settingsTab.style.display = "block";
    tabSettingsBtn.classList.add("active");
    tabQuizBtn.classList.remove("active");
  });

  // Reset key button
  document.getElementById("reset-key").addEventListener("click", () => {
    localStorage.removeItem("openai_api_key");
    location.reload();
  });

  // Save key
  document.getElementById("save-key").addEventListener("click", () => {
    const key = document.getElementById("apikey-input").value.trim();
    if (key) {
      localStorage.setItem("openai_api_key", key);
      document.getElementById("apikey-prompt").style.display = "none";
      quizTab.style.display = "block";
      tabQuizBtn.classList.add("active");
      tabSettingsBtn.classList.remove("active");
    }
  });

  // Show quiz tab if key exists
  const savedKey = localStorage.getItem("openai_api_key");
  if (savedKey) {
    document.getElementById("apikey-prompt").style.display = "none";
    quizTab.style.display = "block";
    tabQuizBtn.classList.add("active");
  }
});



document.getElementById("generate").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      // Remove known paywall extension content (removepaywalls.com injected elements)
      const suspiciousTextNodes = document.querySelectorAll('body *');
      suspiciousTextNodes.forEach(el => {
        if (
          el.innerText?.toLowerCase().includes("removepaywalls.com") ||
          el.innerText?.toLowerCase().includes("remove paywalls instantly") ||
          el.innerText?.toLowerCase().includes("unblock content") ||
          el.innerText?.toLowerCase().includes("extension for chrome or firefox")
        ) {
          el.remove();
        }
      });

      // Prefer actual <article> element
      const article = document.querySelector("article");
      if (article) return article.innerText;

      // Fall back to large paragraphs
      const paragraphs = Array.from(document.querySelectorAll("p"))
        .map(p => p.innerText.trim())
        .filter(p => p.length > 50);

      return paragraphs.join("\n\n") || document.body.innerText;
    }
  }, async (results) => {
    const pageText = results[0].result;
    const quiz = await generateQuiz(pageText);
    displayQuiz(quiz);
  });
});

// Placeholder for OpenAI API call
async function generateQuiz(text) {
  const prompt = `
Create exactly 5 multiple-choice quiz questions based on the article below.

Each question must include:
- A question numbered 1–5
- Four answer options labeled A–D
- The correct answer placed randomly among A–D
- A line that says: Answer: [correct letter] (e.g., Answer: C)

Each answer should be placed randomly in A–D.
After each question, include: Answer: [A, B, C, or D] on its own line.
Make sure the correct answer matches the answer option letter.

Example format:
1. What is the capital of France?
A. Berlin
B. Madrid
C. Paris
D. Rome
Answer: C

Ensure the correct answer is listed exactly as: Answer: A (on its own line).

Now generate the quiz based on this article:
${text.slice(0, 3000)}


`;


  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("openai_api_key")}`,

        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorJson = JSON.parse(errorText);
      console.error("❌ OpenAI API Error:", response.status, errorJson);
      document.getElementById("output").innerText =
        `Error ${response.status}: ${errorJson.error?.message || "Unknown error"}`;
      return "API request failed.";
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No quiz returned.";
  } catch (err) {
    console.error("❌ Unexpected Error:", err);
    document.getElementById("output").innerText = "Unexpected error occurred.";
    return "Unexpected error.";
  }
}

function displayQuiz(rawText) {
  let score = 0;
  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  const questions = parseQuizText(rawText);
  console.log("🧠 Raw quiz text:\n", rawText);

  if (questions.length === 0) {
  container.innerText += "\n\nGPT raw output:\n" + rawText;
    container.innerText = "Could not parse quiz.";
    return;
  }

  let current = 0;
  showQuestion(current);

  function showQuestion(index) {
    container.innerHTML = "";
    
    const q = questions[index];
    console.log("▶ Question:", q.question);
    console.log("▶ Correct letter:", q.correctLetter);
    console.log("▶ Choices:", q.choices);

    const questionEl = document.createElement("p");
    questionEl.innerText = `Q${index + 1}: ${q.question}`;
    container.appendChild(questionEl);

    q.choices.forEach((choice, i) => {
      const btn = document.createElement("button");
      btn.innerText = choice;
      btn.style.display = "block";
      btn.style.margin = "0.25em 0";
      btn.onclick = () => {
  const allButtons = container.querySelectorAll("button");
  allButtons.forEach(b => b.disabled = true);

  const correctIndex = "ABCD".indexOf((q.correctLetter || "").toUpperCase());

 console.log("Clicked:", i, "Correct Index:", correctIndex, "Is correct?", i === correctIndex);

  if (i === correctIndex) {
  btn.style.backgroundColor = "#4CAF50"; // green
  score++; }
    else {
    btn.style.backgroundColor = "#f44336"; // red
    if (correctIndex !== -1) {
      allButtons[correctIndex].style.backgroundColor = "#4CAF50";
    }
  }

  setTimeout(() => {
    if (index + 1 < questions.length) {
      showQuestion(index + 1);
    } else {
      container.innerHTML = "<p> Quiz complete!</p>";
      document.getElementById("quiz-results").innerText = `Score: ${score}/${questions.length} correct`;
    }
  }, 1000);
};


      container.appendChild(btn);
    });
  }
}


function parseQuizText(raw) {
  console.log("🧪 Starting parseQuizText with raw input:\n", raw);
  const lines = raw.split("\n").filter(line => line.trim() !== "");
  const questions = [];
  let current = null;

  lines.forEach(rawLine => {
    const line = rawLine.trim();

    if (/^\d+\./.test(line)) {
      if (current) questions.push(current);
      current = { question: line.replace(/^\d+\.\s*/, ""), choices: [], correctLetter: null };
    } else if (/^[A-D]\./.test(line)) {
      const text = line.replace(/^[A-D]\.\s*/, "").trim();
      current?.choices.push(text);
    } else if (/^Answer:\s*[A-D]$/i.test(line)) {
      const letter = line.split(":")[1].trim().toUpperCase();
      if (current && letter) current.correctLetter = letter;
      console.log("✔ Parsed correct letter:", current.correctLetter);
    }
  });

  if (current) questions.push(current);
  return questions;
}
