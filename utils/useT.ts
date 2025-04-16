// utils/useT.ts
import { useLanguage } from '../components/LanguageProvider';

export const useT = () => {
  const { t } = useLanguage();
  return t;
};
