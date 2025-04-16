// i18n.js
import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';

const resources = {
  en: {
    translation: {
      welcome: "Welcome to Nairobi City Services",
      motto: "Let's make Nairobi work using tech",
      login: "Login",
      register: "Register",
      language: "Language",
      no_account: "Don't have an account?",
      register_here: "Register here",
      have_account: "Already have an account?",
      login_here: "Login here",
      full_name: "Full Name",
      enter_name: "Enter your full name",
      enter_email: "Enter your email",
      password: "Password",
      enter_password: "Enter your password",
    },
  },
  sw: {
    translation: {
      welcome: "Karibu kwa Huduma za Jiji la Nairobi",
      motto: "Tufanye Nairobi ifanye kazi kwa kutumia teknolojia",
      login: "Ingia",
      register: "Jisajili",
      language: "Lugha",
      no_account: "Huna akaunti?",
      register_here: "Jisajili hapa",
      have_account: "Una akaunti tayari?",
      login_here: "Ingia hapa",
      full_name: "Jina kamili",
      enter_name: "Ingiza jina lako kamili",
      enter_email: "Ingiza barua pepe yako",
      password: "Neno la siri",
      enter_password: "Ingiza neno lako la siri",
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
  });

export { i18n };  // Named export

