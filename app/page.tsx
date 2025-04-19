"use client";
import { useChat } from "@ai-sdk/react";
import { Message } from "ai";
import PromptSuggestionRow from "./components/PromptSuggestionRow";
import LoadingBubble from "./components/LoadingBubble";
import Bubble from "./components/Bubble";
import { SendHorizonal } from "lucide-react";

const Home = () => {
  const {
    append,
    isLoading,
    messages,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat();

  const noMessages = !messages || messages.length === 0;

  const onPromptClick = (promptText: string) => {
    const msg: Message = {
      id: crypto.randomUUID(),
      content: promptText,
      role: "user",
    };
    append(msg);
  };

  return (
    <main className="flex flex-col h-screen bg-gradient-to-br from-[#f0f4ff] to-[#e8f0fa]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {noMessages ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-3xl font-bold text-[#003366] mb-4">
              Assalomu alaykum!
            </h1>
            <p className="text-gray-600 text-lg">
              Sizga O‘zbekiston haqida har qanday ma`lumot kerakmi?
              <br />
              Quyidagi tavsiyalarni bosib ko‘rishingiz mumkin.
            </p>
            <div className="mt-6">
              <PromptSuggestionRow onPromptClick={onPromptClick} />
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <Bubble key={`message-${index}`} message={message} />
            ))}
            {isLoading && <LoadingBubble />}
          </>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center px-4 py-3 bg-white border-t border-gray-200"
      >
        <input
          type="text"
          className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          placeholder="Savolingizni yozing..."
          value={input}
          onChange={handleInputChange}
        />
        <button
          type="submit"
          className="ml-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          <SendHorizonal size={20} />
        </button>
      </form>
    </main>
  );
};

export default Home;
