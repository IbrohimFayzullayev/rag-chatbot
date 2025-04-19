import PromptSuggestionButton from "./PromptSuggestionButton";

interface PromptSuggestionRowProps {
  onPromptClick: (text: string) => void;
}

const PromptSuggestionRow = ({ onPromptClick }: PromptSuggestionRowProps) => {
  const prompts = [
    "O'zbekiston qayerda joylashgan?",
    "O'zbekiston poytaxti qayer?",
    "O'zbekistonning eng katta shahri qaysi?",
    "O'zbekistonning rasmiy tili qaysi?",
    "O'zbekistonning eng mashhur taomlari qaysi?",
    "O'zbekistonning tarixiy joylari qaysi?",
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
