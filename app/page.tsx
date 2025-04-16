"use client";
import Image from "next/image";
import f1GptLogo from "./assets/logo.jpg";
import { useChat } from "@ai-sdk/react";
import { Message } from "ai";
import PromptSuggestionRow from "./components/PromptSuggestionRow";
import LoadingBubble from "./components/LoadingBubble";
import Bubble from "./components/Bubble";

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
    <main className="main">
      {/* Logo */}
      <Image
        src={f1GptLogo}
        width="200"
        height="200"
        alt="F1GPT Logo"
        className=""
      />

      <section className={noMessages ? "" : "populated"}>
        {noMessages ? (
          <>
            <p className="starter-text">
              O`zbekiston <br />
              O`zbekiston Respublikasi <br />
            </p>
            <br />
            <PromptSuggestionRow onPromptClick={onPromptClick} />
          </>
        ) : (
          <>
            {messages.map((message, index) => (
              <Bubble key={`message-${index}`} message={message} />
            ))}
            {isLoading && <LoadingBubble />}
          </>
        )}
      </section>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name=""
          id=""
          className="question-box"
          onChange={handleInputChange}
          value={input}
          placeholder="Ask me something..."
        />
        <input type="submit" value="Send" />
      </form>
    </main>
  );
};

export default Home;
