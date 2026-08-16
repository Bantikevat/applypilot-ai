"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Bot,
  Send,
  User,
  Zap,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  FileText,
  HelpCircle,
  Compass,
} from "lucide-react";

interface Message {
  sender: "USER" | "AI";
  text: string;
  suggestedNextSteps?: string[];
  timestamp: string;
}

interface PromptChip {
  id: string;
  topic: string;
  title: string;
  prompt: string;
}

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "AI",
      text: "Greetings! I am your **ApplyPilot AI Career Advisor**. I am connected to your Master Profile (M02), Skill Studio (M07), and Candidate ATS (M10).\n\nHow can I guide your career path today?",
      suggestedNextSteps: [
        "Optimize ATS Resume Keywords",
        "Mock Interview Questions",
        "SSC CGL Exam Strategy",
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("GENERAL_CAREER");
  const [loading, setLoading] = useState(false);
  const [promptChips, setPromptChips] = useState<PromptChip[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPromptChips();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const fetchPromptChips = async () => {
    try {
      const res = await fetch("/api/v1/advisor/prompts");
      const data = await res.json();
      if (res.ok && data.success) {
        setPromptChips(data.data.promptChips);
      }
    } catch {
      console.error("Failed to fetch prompt chips");
    }
  };

  const handleSendMessage = async (promptToSend?: string, topicOverride?: string) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim()) return;

    const userMsg: Message = {
      sender: "USER",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptToSend) setInputPrompt("");
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/v1/advisor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          topic: topicOverride || selectedTopic,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const aiMsg: Message = {
          sender: "AI",
          text: data.data.response.reply,
          suggestedNextSteps: data.data.response.suggestedNextSteps,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setErrorMsg(data.error?.message || "Failed to process prompt.");
      }
    } catch {
      setErrorMsg("Network error sending message to AI Advisor.");
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chip: PromptChip) => {
    setSelectedTopic(chip.topic);
    handleSendMessage(chip.prompt, chip.topic);
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-md glass-panel glass-panel-hover text-text-muted hover:text-text-main">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>AI Career Agent & Personal Advisor</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-full">
          <Zap className="w-3.5 h-3.5" />
          <span>Context Fusion Active (M02 + M07 + M10)</span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col space-y-6">
        {errorMsg && (
          <div className="flex items-center gap-3 p-4 rounded-md bg-accent-danger/10 border border-accent-danger/30 text-accent-danger text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Prompt Chips Bar */}
        {promptChips.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-accent-warning" />
              <span>Recommended Starter Prompts</span>
            </span>

            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {promptChips.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => handleChipClick(chip)}
                  disabled={loading}
                  className="px-3 py-2 rounded-md glass-panel glass-panel-hover border border-white/10 text-xs text-text-main font-semibold flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                >
                  <Bot className="w-3.5 h-3.5 text-primary" />
                  <span>{chip.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Log Window */}
        <div className="flex-1 glass-panel p-6 rounded-lg border border-white/10 shadow-luxury overflow-y-auto space-y-6 max-h-[550px]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "AI" && (
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-2xl rounded-lg p-4 text-xs space-y-3 ${
                msg.sender === "USER"
                  ? "bg-primary text-white ml-12"
                  : "bg-surface-1/90 border border-white/10 text-text-main"
              }`}>
                <div className="whitespace-pre-line leading-relaxed font-sans">{msg.text}</div>

                {msg.suggestedNextSteps && msg.suggestedNextSteps.length > 0 && (
                  <div className="pt-3 border-t border-white/10 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Suggested Next Actions</span>
                    <ul className="space-y-1">
                      {msg.suggestedNextSteps.map((step, sIdx) => (
                        <li key={sIdx} className="flex items-center gap-1.5 text-[11px] text-text-muted">
                          <CheckCircle2 className="w-3 h-3 text-accent-success" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className={`text-[10px] text-right ${msg.sender === "USER" ? "text-white/70" : "text-text-subtle"}`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === "USER" && (
                <div className="w-8 h-8 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center text-secondary flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 items-center text-xs text-text-subtle animate-pulse">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Bot className="w-4 h-4" />
              </div>
              <span>ApplyPilot AI is evaluating your Master Profile & generating strategy...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-3">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask AI Advisor about resume keywords, mock interviews, or government exam roadmaps..."
            disabled={loading}
            className="flex-1 px-4 py-3.5 rounded-lg bg-surface-1 border border-white/10 text-text-main text-xs font-medium focus:border-primary shadow-luxury"
          />

          <button
            type="submit"
            disabled={loading || !inputPrompt.trim()}
            className="btn-glow px-6 py-3.5 rounded-lg text-white font-bold text-xs shadow-luxury disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </main>
    </div>
  );
}
