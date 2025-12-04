import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKeyInput = document.getElementById("apiKey");
const themeInput = document.getElementById("themeInput");
const generateBtn = document.getElementById("generateBtn");
// const loader = document.getElementById("loader");
const resultContainer = document.getElementById("resultContainer");
const mainOutput = document.getElementById("mainOutput");
const extraOutputs = document.getElementById("extraOutputs");
const checkNumbers = document.getElementById("checkNumbers");
const checkTitles = document.getElementById("checkTitles");
const saveKeyCheck = document.getElementById("saveKeyCheck");

const titles = [
  "Mr",
  "Ms",
  "Dr",
  "The",
  "Captain",
  "Lord",
  "Lady",
  "Sir",
  "Pro",
  "iAm",
];

// Load API Key on start
window.addEventListener("DOMContentLoaded", () => {
  const savedKey = localStorage.getItem("gemini_api_key");
  if (savedKey) {
    apiKeyInput.value = savedKey;
    saveKeyCheck.checked = true;
  }
});

generateBtn.addEventListener("click", async () => {
  const apiKey = apiKeyInput.value.trim();
  const theme = themeInput.value.trim();

  if (!apiKey) {
    apiKeyInput.focus();
    return;
  }
  if (!theme) {
    themeInput.focus();
    return;
  }

  // Save Key Logic
  if (saveKeyCheck.checked) {
    localStorage.setItem("gemini_api_key", apiKey);
  } else {
    localStorage.removeItem("gemini_api_key");
  }

  generateBtn.disabled = true;
  generateBtn.innerText = "Thinking...";
  // loader.classList.remove("hidden");
  resultContainer.classList.add("hidden");
  extraOutputs.innerHTML = "";

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
            Act as a gamertag generator. 
            Theme: "${theme}".
            Task: Generate 4 unique, creative usernames based on the theme.
            
            Strict Constraints:
            1. Maximum 2 words per username.
            2. Use PascalCase (e.g. CyberBanana, IronWolf).
            3. Do NOT include spaces.
            4. Do NOT include numbers or special characters yet.
            5. Provide ONLY the 4 names separated by commas.
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let names = text.split(",").map((n) => n.trim().replace(/\s/g, ""));

    if (names.length < 1) throw new Error("AI returned no names");

    names = names.map((name) => applyModifiers(name));
    displayResults(names);
  } catch (error) {
    console.error(error);
    alert("Error: " + error.message);
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerText = "Generate";
    // loader.classList.add("hidden");
  }
});

function applyModifiers(baseName) {
  let finalName = baseName;

  if (checkTitles.checked) {
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    finalName = `${randomTitle}${finalName}`;
  }

  if (checkNumbers.checked) {
    const randomNum = Math.floor(Math.random() * 999);
    finalName = `${finalName}${randomNum}`;
  }

  return finalName;
}

function displayResults(names) {
  resultContainer.classList.remove("hidden");

  mainOutput.innerText = names[0];

  for (let i = 1; i < names.length && i < 4; i++) {
    const div = document.createElement("div");
    div.className = "result-box";
    div.innerHTML = `
            <span id="extra-${i}">${names[i]}</span>
            <button class="copy-btn" onclick="copyText('extra-${i}')">Copy</button>
        `;
    extraOutputs.appendChild(div);
  }
}

