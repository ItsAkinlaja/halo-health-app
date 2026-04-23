import { useLanguage } from '../context/LanguageContext';
import { t } from '../i18n';

export const useTranslation = () => {
  const { locale, changeLanguage } = useLanguage();

  return {
    t,
    locale,
    changeLanguage,
  };
};
