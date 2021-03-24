import i18n from "i18next";
import { initReactI18next, TFunction } from "react-i18next";

import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n.use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
      fallbackLng: "en-US",
      debug: false,

      keySeparator: ".",

      interpolation: {
        escapeValue: false, // react already safes from xss
      },

      backend: {
        loadPath: "/locales/{{lng}}.json",
      },
    });

i18n.on("loaded", () => {
  document.body.lang = i18n.language;
});

export default i18n;
