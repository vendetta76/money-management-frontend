import { useLanguage } from "@/context/LanguageContext";

const LangToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button onClick={toggleLanguage} className="text-sm text-gray-500 underline">
      🌐 {language === "id" ? "Indonesia" : "English"}
    </button>
  );
};

export default LangToggle;
