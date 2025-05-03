import PromptSuggestionButton from "./PromptSuggestionButton";

interface PromptSuggestionRowProps {
  onPromptClick: (text: string) => void;
}

const PromptSuggestionRow = ({ onPromptClick }: PromptSuggestionRowProps) => {
  const prompts = [
    "Sen kimsan?",
    "UzTelecom haqida ma'lumot ber",
    "UzTelecom xizmatlari haqida ma'lumot ber",
    "UzTelecom tariflari haqida ma'lumot ber",
    "UzTelecom tariflariga qanday qilib ulanish mumkin",
    "UzTelecomda telefon uchun eng arzon tarif reja qaysi",
    "UzTelecomda internet xizmatlari haqida ma'lumot ber",
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center mt-6">
      {prompts.map((prompt, index) => (
        <PromptSuggestionButton
          key={index}
          text={prompt}
          onClick={() => onPromptClick(prompt)}
        />
      ))}
    </div>
  );
};

export default PromptSuggestionRow;
