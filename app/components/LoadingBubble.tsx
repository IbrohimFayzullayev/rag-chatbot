const LoadingBubble = () => {
  return (
    <div className="w-full flex justify-start mb-3">
      <div className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl rounded-bl-none shadow-sm max-w-[80%]">
        <div className="flex space-x-1">
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
        </div>
      </div>
    </div>
  );
};

export default LoadingBubble;
