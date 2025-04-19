interface PromptSuggestionButtonProps {
  text: string;
  onClick: () => void;
}

const PromptSuggestionButton = ({
  text,
  onClick,
}: PromptSuggestionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-blue-50 hover:border-blue-400 transition text-sm text-gray-700"
    >
      {text}
    </button>
  );
};

export default PromptSuggestionButton;
