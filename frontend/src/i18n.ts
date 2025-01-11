import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationFR from '../public/locales/fr/translation.json';
import translationEN from '../public/locales/en/translation.json';

i18n
    .use(initReactI18next) // passe l'instance de i18next à react-i18next
    .init({
        resources: {
            en: { translation: translationEN },
            fr: { translation: translationFR }
        },
        lng: 'fr', // langue par défaut
        fallbackLng: 'fr', // langue de secours si une traduction manque
    });

export default i18n;
