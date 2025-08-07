import { useState, useRef, useEffect } from "react";
import { FaRobot, FaUser, FaPaperPlane, FaComments } from "react-icons/fa";

// 👇 Define message type
interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function ChatBot() {
  const [open, setOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const chatRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessages: Message[] = [...messages, { sender: "user", text: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setLoading(true);

    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await res.json();
      setMessages([...newMessages, { sender: "bot", text: data.reply }]);
    } catch {
      setMessages([
        ...newMessages,
        { sender: "bot", text: "⚠️ Unable to reach the assistant." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <>
    {/* Floating Button with Icon */}
<button
  onClick={() => setOpen(!open)}
  className="fixed bottom-6 right-6 z-50 bg-black dark:bg-white text-white dark:text-black w-14 h-14 rounded-full shadow-md hover:scale-105 transition-all flex items-center justify-center"
>
  <FaComments className="text-white dark:text-black" size={20} />
</button>


      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-[500px] bg-white text-black shadow-2xl rounded-xl flex flex-col border border-gray-200 overflow-hidden animate-fade-in z-50">
          <div className="bg-black text-white p-3 text-center font-semibold">
            🛍️ Shopshere Assistant
          </div>

          {/* Chat Messages */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-3 space-y-3 text-sm bg-gray-50"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "bot" && <FaRobot className="text-gray-500 mt-1" />}
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
                    msg.sender === "user"
                      ? "bg-black text-white rounded-br-none"
                      : "bg-white text-black border border-gray-300 rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.sender === "user" && <FaUser className="text-gray-600 mt-1" />}
              </div>
            ))}
            {loading && (
              <div className="text-gray-400 text-xs animate-pulse">
                Assistant is typing...
              </div>
            )}
          </div>

          {/* Input Section */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="relative flex items-center rounded-full bg-gray-100 border border-gray-200 shadow-inner focus-within:ring-2 focus-within:ring-black transition-all">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-transparent border-none text-black placeholder-gray-500 focus:outline-none rounded-full"
              />
              <button
                onClick={sendMessage}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-black text-white p-2 rounded-full hover:bg-gray-900 hover:scale-110 transition-all"
                aria-label="Send"
              >
                <FaPaperPlane   size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
