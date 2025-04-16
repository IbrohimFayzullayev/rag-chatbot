import PromptSuggestionButton from "./PromptSuggestionButton";

const PromptSuggestionRow = ({ onPromptClick }) => {
  const prompts = [
    "O'zbekiston qayerda joylashgan?",
    "O'zbekiston poytaxti qayer?",
    "O'zbekistonning eng katta shahri qaysi?",
    "O'zbekistonning rasmiy tili qaysi?",
    "O'zbekistonning eng mashhur taomlari qaysi?",
    "O'zbekistonning tarixiy joylari qaysi?",
  ];

  return (
    <div className="prompt-suggestion-row">
      {prompts.map((prompt, index) => (
        <PromptSuggestionButton
          key={`suggestion-${index}`}
          text={prompt}
          onClick={() => onPromptClick(prompt)}
        />
      ))}
    </div>
  );
};

export default PromptSuggestionRow;
