"use client";
import PromptSuggestionRow from "./components/PromptSuggestionRow";
import LoadingBubble from "./components/LoadingBubble";
import Bubble from "./components/Bubble";
import { SendHorizonal } from "lucide-react";
import { FormEvent, useState } from "react";

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userText, setUserText] = useState<string>("");

  const noMessages = !messages || messages.length === 0;

  const getAnswer = async (question: string) => {
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        content: question,
        role: "user",
      },
    ]);
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages,
            { role: "user", content: question, id: crypto.randomUUID() },
          ],
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              content: data.reply,
              role: "assistant",
            },
          ]);
        });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setIsLoading(false);
  };

  const onPromptClick = (promptText: string) => getAnswer(promptText);

  const handleSendQuestion = async (e: FormEvent) => {
    e.preventDefault();
    if (!userText) return;
    getAnswer(userText);
    setUserText("");
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
              UzTelecom telefon tariflari va xizmatlari haqida ma`lumot olish
              uchun
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
        onSubmit={handleSendQuestion}
        className="flex items-center px-4 py-3 bg-white border-t border-gray-200"
      >
        <input
          type="text"
          className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          placeholder="Savolingizni yozing..."
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
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
