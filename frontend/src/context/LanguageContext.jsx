import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext(null);
const LANGUAGE_KEY = "codepathLanguage";

function clearGoogleTranslationState() {
  // Google writes this cookie for both the current host and the parent
  // domain. Clear every common scope so returning to English restores the
  // original source text immediately instead of leaving mixed translations.
  ["", `domain=${window.location.hostname}`, `domain=.${window.location.hostname.replace(/^www\\./, "")}`]
    .forEach((domain) => {
      document.cookie = `googtrans=; Max-Age=0; path=/${domain ? `; ${domain}` : ""}`;
    });
  document.documentElement.style.removeProperty("top");
  document.body.style.removeProperty("top");
  document.body.classList.remove("translated-ltr", "translated-rtl");
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem(LANGUAGE_KEY) || "en");
  useEffect(() => {
    // Keep the document source language as English. Google Chrome shows its
    // own translation infobar whenever the root language is switched to hi;
    // our in-app switch already controls the translated DOM, so changing the
    // root lang only creates an unwanted browser bar.
    document.documentElement.lang = "en";
    if (language === "hi") {
      const targetCookie = "googtrans=/en/hi";
      if (!document.cookie.includes(targetCookie)) document.cookie = `${targetCookie};path=/`;
    } else {
      // English is the source document; remove all translator state so the
      // complete site renders directly without a reverse-translation pass.
      clearGoogleTranslationState();
    }
    // Load the translator only after Hindi is selected. English is the source
    // document and should never wait for or trigger Google UI initialization.
    if (language === "hi" && !window.google?.translate && !document.querySelector("script[data-codepath-google-translate]")) {
      window.googleTranslateElementInit = () => {
        if (window.google?.translate?.TranslateElement && document.getElementById("google_translate_element")) {
          new window.google.translate.TranslateElement({ pageLanguage: "en", includedLanguages: "en,hi", autoDisplay: false }, "google_translate_element");
        }
      };
      const script = document.createElement("script");
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.dataset.codepathGoogleTranslate = "true";
      document.body.appendChild(script);
    }
  }, [language]);
  function setLanguage(next) {
    const value = next === "hi" ? "hi" : "en";
    localStorage.setItem(LANGUAGE_KEY, value);
    if (value === "hi") document.cookie = "googtrans=/en/hi;path=/";
    else clearGoogleTranslationState();
    // English is the source language. Reload directly instead of waiting for
    // Google Translate to reverse every text node on a Hindi-rendered page.
    if (value === "en" && language === "hi") {
      window.location.reload();
      return;
    }
    setLanguageState(value);
    // Use the already-loaded translator immediately. Reload only as a fallback
    // for a very early click before its hidden language control is ready.
    const combo = document.querySelector(".goog-te-combo");
    if (combo && value !== language) {
      combo.value = value === "hi" ? "hi" : "";
      combo.dispatchEvent(new Event("change", { bubbles: true }));
    } else if (value !== language) {
      window.location.reload();
    }
  }
  const value = useMemo(() => ({ language, setLanguage, isHindi: language === "hi" }), [language]);
  return <LanguageContext.Provider value={value}><div id="google_translate_element" aria-hidden="true" className="codepath-google-translate" />{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
