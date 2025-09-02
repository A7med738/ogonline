import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, X, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

export const FloatingChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);
  const handleNewChat = useCallback(() => {
    setMessages([]);
    setInputValue("");
  }, []);

  const canSend = useMemo(() => inputValue.trim().length > 0 && !isSending, [inputValue, isSending]);

  const generateId = () => {
    try {
      if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
      }
    } catch {}
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  };

  const appendMessage = useCallback((message: Omit<ChatMessage, "id" | "timestamp">) => {
    setMessages(prev => [
      ...prev,
      { id: generateId(), timestamp: Date.now(), ...message },
    ]);
  }, []);

  const mockAssistantReply = useCallback(async (prompt: string) => {
    try {
      // Ensure we have a valid access token and attach it explicitly to avoid 401s
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        toast({
          title: "تسجيل الدخول مطلوب",
          description: "انتهت الجلسة. يرجى تسجيل الدخول مجددًا.",
          action: (
            <Button onClick={() => (window.location.href = "/auth")} size="sm">
              تسجيل الدخول
            </Button>
          ),
        });
        throw Object.assign(new Error("No session"), { status: 401 });
      }

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          prompt,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (error) throw error as any;
      const reply: string = (data as any)?.answer || "";
      appendMessage({ role: "assistant", content: reply || "" });
    } catch (e: any) {
      if (e?.status === 401) {
        toast({
          title: "تسجيل الدخول مطلوب",
          description: "يرجى تسجيل الدخول لاستخدام المساعد الذكي.",
          action: (
            <Button onClick={() => (window.location.href = "/auth")} size="sm">
              تسجيل الدخول
            </Button>
          ),
        });
      }
      appendMessage({ role: "assistant", content: "حدث خطأ أثناء معالجة سؤالك. حاول لاحقًا." });
    }
  }, [appendMessage, messages, toast]);

  const handleSend = useCallback(async () => {
    if (!canSend) return;
    const text = inputValue.trim();
    setInputValue("");
    setIsSending(true);
    appendMessage({ role: "user", content: text });
    try {
      await mockAssistantReply(text);
    } finally {
      setIsSending(false);
      // Scroll to bottom after message appended
      queueMicrotask(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  }, [appendMessage, canSend, inputValue, mockAssistantReply]);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => {
            if (!user) {
              toast({
                title: "تسجيل الدخول مطلوب",
                description: "يرجى تسجيل الدخول لاستخدام المساعد الذكي.",
                action: (
                  <Button onClick={() => (window.location.href = "/auth")} size="sm">
                    تسجيل الدخول
                  </Button>
                ),
              });
              return;
            }
            handleOpen();
          }}
          size="lg"
          className="h-14 w-14 aspect-square p-0 rounded-full shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus-visible:ring-2 focus-visible:ring-green-400"
          aria-label="Open AI assistant"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <DialogHeader className="p-0">
              <DialogTitle className="flex items-center gap-2 text-base">
                <Bot className="h-5 w-5" />
                AI Assistant
              </DialogTitle>
              <DialogDescription className="sr-only">Chat with the AI assistant about city services and news</DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleNewChat} aria-label="Start new chat">
                <RotateCcw className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close chat">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col h-[70vh]">
            <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef as any}>
              <div className="space-y-3">
                {messages.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    Ask anything about October Gardens city services, news, and more.
                  </div>
                )}
                {messages.map(m => (
                  <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                    <div className={
                      "max-w-[80%] rounded-2xl px-3 py-2 text-sm " +
                      (m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")
                    }>
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-3">
              <div className="flex gap-2">
                <Textarea
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Type your question..."
                  className="min-h-[44px] max-h-32"
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button onClick={handleSend} disabled={!canSend} className="self-end">
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingChat;


