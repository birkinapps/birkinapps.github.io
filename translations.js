// Available languages
const languages = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
  pt: "Português",
  es: "Español",
  tr: "Türkçe",
};

// Get user's preferred language from browser
function getUserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split("-")[0];
  return languages[langCode] ? langCode : "en";
}

// Load translations from JSON file
async function loadTranslations() {
  try {
    const response = await fetch("translations.json");
    return await response.json();
  } catch (error) {
    console.error("Error loading translations:", error);
    return null;
  }
}

// Determine which page we're on and get the appropriate translations
function getPageTranslations(translations) {
  const path = window.location.pathname;
  if (path.includes("privacy-policy")) {
    return translations.privacy_policy;
  } else if (path.includes("terms-and-conditions")) {
    return translations.terms_and_conditions;
  } else if (path === "/" || path.includes("index")) {
    return translations.index;
  }
  return null;
}

// Update content based on selected language
function updateContent(translations, lang) {
  const pageTranslations = getPageTranslations(translations);
  if (!pageTranslations || !pageTranslations[lang]) return;

  const content = pageTranslations[lang];
  if (!content) return;

  // Update title
  document.title = `${content.title} - Daily Flare`;

  // Update all elements with data-translate attribute
  document.querySelectorAll("[data-translate]").forEach((element) => {
    const key = element.getAttribute("data-translate");
    const keys = key.split(".");
    let value = content;

    // Navigate through the nested object structure
    for (const k of keys) {
      value = value[k];
      if (!value) break;
    }

    if (value) {
      if (Array.isArray(value)) {
        // Handle lists
        element.innerHTML = value.map((item) => `<li>${item}</li>`).join("");
      } else if (
        element.querySelector("a") ||
        element.querySelector("strong")
      ) {
        // If element contains links or strong tags, preserve HTML
        const links = Array.from(element.getElementsByTagName("a"));
        const strongs = Array.from(element.getElementsByTagName("strong"));
        element.innerHTML = value;

        // Restore links
        links.forEach((link) => {
          const newLink = element.querySelector(
            `a[href="${link.getAttribute("href")}"]`
          );
          if (newLink) {
            newLink.href = link.href;
          }
        });

        // Restore strong tags
        strongs.forEach((strong, index) => {
          const newStrong = element.getElementsByTagName("strong")[index];
          if (newStrong) {
            newStrong.textContent = strong.textContent;
          }
        });
      } else {
        // Handle regular text content
        element.textContent = value;
      }
    }
  });
}

// Create language selector
function createLanguageSelector() {
  const selector = document.createElement("select");
  selector.id = "language-selector";
  selector.style.cssText =
    "position: fixed; top: 20px; right: 20px; padding: 5px; border-radius: 4px; border: 1px solid #ccc;";

  Object.entries(languages).forEach(([code, name]) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = name;
    selector.appendChild(option);
  });

  document.body.appendChild(selector);

  // Add event listener for language change
  selector.addEventListener("change", async (e) => {
    const translations = await loadTranslations();
    if (translations) {
      updateContent(translations, e.target.value);
    }
  });
}

// Initialize
async function init() {
  const translations = await loadTranslations();
  if (translations) {
    createLanguageSelector();
    const userLang = getUserLanguage();
    updateContent(translations, userLang);
  }
}

// Start when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
