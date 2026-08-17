import { useState, useRef, useEffect } from "react"
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Message {
  sender: "user" | "bot"
  text: string
}

const quickPrompts = [
  "Any discount promo coupons?",
  "How do I track my order?",
  "What is your return policy?",
  "Supported payment methods?",
]

export default function ChatBot() {
  const [open, setOpen] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hello! I am your ShopSphere Assistant. Ask me about products, order tracking, discounts, or policies.",
    },
  ])
  const [userInput, setUserInput] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const chatRef = useRef<HTMLDivElement | null>(null)

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || userInput
    if (!textToSend.trim() || loading) return

    const newMessages: Message[] = [...messages, { sender: "user", text: textToSend }]
    setMessages(newMessages)
    setUserInput("")
    setLoading(true)

    const API_BASE = import.meta.env.VITE_API_BASE_URL

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      })

      const data = await res.json()
      setMessages([
        ...newMessages,
        { sender: "bot", text: data.reply || "I am here to assist you." },
      ])
    } catch {
      setMessages([
        ...newMessages,
        {
          sender: "bot",
          text: "You can use coupon code **SHOPSHERE10** for an instant 10% discount at checkout! Feel free to ask about orders or products.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      chatRef.current?.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages, open])

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 p-3.5 rounded-full bg-primary text-primary-foreground shadow-2xl hover:scale-108 active:scale-95 transition-all duration-200 flex items-center justify-center group"
        aria-label="Open AI Assistant"
      >
        {open ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary-foreground rounded-full animate-ping" />
          </div>
        )}
      </button>

      {/* Modern Responsive Chat Window */}
      {open && (
        <div className="fixed bottom-0 right-0 sm:bottom-24 sm:right-6 w-full sm:w-96 h-[85vh] sm:h-[520px] max-h-[90vh] bg-card border sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-primary p-3.5 sm:p-4 text-primary-foreground flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm leading-tight flex items-center gap-1.5">
                  ShopSphere AI <Sparkles className="w-3.5 h-3.5" />
                </h3>
                <span className="text-[10px] text-white/80">Always Online</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setMessages([
                    {
                      sender: "bot",
                      text: "Chat cleared. How can I assist you now?",
                    },
                  ])
                }
                className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition"
                title="Clear Chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 bg-muted/20 text-xs sm:text-sm"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "bot" && (
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-1 shrink-0">
                    <Bot className="w-3 h-3" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[80%] px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none shadow-xs"
                      : "bg-card border text-foreground rounded-bl-none shadow-xs"
                  }`}
                >
                  {msg.text}
                </div>

                {msg.sender === "user" && (
                  <div className="w-5 h-5 rounded-full bg-muted text-foreground flex items-center justify-center mt-1 shrink-0">
                    <User className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse p-2">
                <Bot className="w-4 h-4 text-primary" />
                <span>Assistant is typing...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 border-t bg-card/60 flex gap-1.5 overflow-x-auto scrollbar-hidden">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="whitespace-nowrap text-[10px] sm:text-[11px] font-medium px-2.5 py-1 rounded-full border bg-muted/50 hover:bg-primary/10 hover:text-primary transition shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="p-2.5 sm:p-3 border-t bg-card flex items-center gap-2 pb-safe"
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask about products, orders, coupons..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!userInput.trim() || loading}
              className="rounded-xl shadow-xs h-9 px-3"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}
    </>
  )
}
