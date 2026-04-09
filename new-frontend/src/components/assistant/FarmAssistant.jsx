import React, { useState, useRef, useEffect, useMemo } from "react";
import { usePlan } from "../../context/PlanProvider";
import { sendChatMessage } from "../../service/apiService";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function FarmAssistant() {
  const { plan, loading: planLoading } = usePlan();
  const isPremium = plan?.plan === "FARM";

  const [isOpen, setIsOpen] = useState(false);
  const [showLockedHint, setShowLockedHint] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const chatId = useMemo(() => crypto.randomUUID(), []);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 80) + "px";
  }, [input]);

  const open = () => {
    setIsOpen(true);
    setShowLockedHint(false);
  };

  const close = () => setIsOpen(false);

  const handleFabClick = () => {
    if (planLoading) return;
    if (!isPremium) {
      setShowLockedHint((v) => !v);
      return;
    }
    open();
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendChatMessage(text, chatId);
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const toggleVoice = () => {
    if (!SpeechRecognition) return;

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = navigator.language;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  if (planLoading) return null;

  return (
    <>
      {/* Chat window — full screen on mobile, floating panel on desktop */}
      {isOpen && isPremium && (
        <div className="
          fixed inset-0 z-50 flex flex-col bg-white
          sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[340px] sm:h-[500px]
          sm:rounded-2xl sm:shadow-2xl sm:border sm:border-gray-100
        ">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#3a6647] sm:rounded-t-2xl flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              <span className="text-white font-medium text-sm tracking-wide">Farm Assistant</span>
            </div>
            <button
              onClick={close}
              className="text-white/70 hover:text-white transition-colors p-1"
              title="Close"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
            {messages.length === 0 && (
              <p className="text-gray-400 text-sm text-center mt-10 leading-relaxed">
                Ask me anything about your harvest data, crops, or fields.
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`rounded-2xl px-3.5 py-2.5 text-sm max-w-[82%] leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[#3a6647] text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-800 rounded-bl-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3.5">
                  <div className="flex gap-1 items-center">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="px-3 py-3 border-t border-gray-100 flex items-end gap-2 flex-shrink-0">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask your assistant…"
              className="flex-1 resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-[#2e5239] leading-relaxed focus:outline-none focus:border-[#3a6647] transition-colors placeholder:text-gray-400"
            />
            {SpeechRecognition && (
              <button
                onClick={toggleVoice}
                title={listening ? "Stop listening" : "Speak"}
                className="flex-shrink-0 p-2 transition-colors"
              >
                {listening ? <MicActiveIcon /> : <MicIcon />}
              </button>
            )}
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 p-2 rounded-xl bg-[#3a6647] text-white transition-colors hover:bg-[#2e5239] disabled:opacity-40"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}

      {/* Floating action button — hidden when chat is open on mobile */}
      <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 ${isOpen ? "hidden sm:flex" : "flex"}`}>
        {/* Premium locked hint */}
        {showLockedHint && !isPremium && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 w-56 text-sm">
            <p className="font-semibold text-gray-900 mb-1">FARM Plan Feature</p>
            <p className="text-gray-500 leading-relaxed">
              Upgrade to the FARM plan to chat with your personal farm assistant.
            </p>
          </div>
        )}

        <button
          onClick={handleFabClick}
          title="Farm Assistant"
          className="w-14 h-14 rounded-full bg-[#3a6647] text-white shadow-lg hover:bg-[#2e5239] hover:shadow-xl transition-all flex items-center justify-center"
        >
          <LeafIcon />
        </button>
      </div>
    </>
  );
}

function LeafIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 2C8.5 2 4 5.5 4 11c0 3.5 2 6.5 5 8 .5-2 1.5-4 3-6 1.5 2 2.5 4 3 6 3-1.5 5-4.5 5-8 0-5.5-4.5-9-8-9z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v3M9 22h6" />
    </svg>
  );
}

function MicActiveIcon() {
  return (
    <span className="relative flex items-center justify-center w-5 h-5">
      <span className="absolute inline-flex w-full h-full rounded-full bg-red-400 opacity-60 animate-ping" />
      <svg className="relative w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="9" y="2" width="6" height="11" rx="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v3M9 22h6" />
      </svg>
    </span>
  );
}

function SendIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}
