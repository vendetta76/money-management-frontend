import { useLanguage } from '@/context/LanguageContext';

const LangToggle = () => {
  const { language, toggleLanguage, setLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className="text-sm border rounded px-2 py-1"
    >
      <option value="en">English</option>
      <option value="id">Indonesia</option>
      <option value="es">Spanish</option>
      <option value="zh">Chinese</option>
    </select>
  );
};

export default LangToggle;
