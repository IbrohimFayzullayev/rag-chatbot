import { Message } from "ai";
import clsx from "clsx";

interface BubbleProps {
  message: Message;
}

const Bubble = ({ message }: BubbleProps) => {
  const isUser = message.role === "user";

  return (
    <div
      className={clsx(
        "w-full flex mb-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={clsx(
          "max-w-[80%] px-4 py-3 rounded-xl shadow-sm text-sm whitespace-pre-wrap",
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-100 text-gray-900 rounded-bl-none"
        )}
      >
        {message.content}
      </div>
    </div>
  );
};

export default Bubble;
