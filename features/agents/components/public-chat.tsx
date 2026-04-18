"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";

import type { AgentPublicView } from "@/features/agents/types";

type PublicChatProps = {
  orgSlug: string;
  agentSlug: string;
  agent: AgentPublicView;
};

const CONVERSATION_STORAGE_KEY_PREFIX = "pc:conv:";

function conversationStorageKey(orgSlug: string, agentSlug: string) {
  return `${CONVERSATION_STORAGE_KEY_PREFIX}${orgSlug}:${agentSlug}`;
}

function getMessageText(m: UIMessage): string {
  return (m.parts ?? [])
    .filter((p) => p.type === "text")
    .map((p) => ("text" in p ? p.text : ""))
    .join("");
}

function isHumanMessage(m: UIMessage): boolean {
  const meta = m.metadata as { sender?: string } | undefined;
  return meta?.sender === "human";
}

export function PublicChat({ orgSlug, agentSlug, agent }: PublicChatProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 1 | -1>>({});
  const [postedError, setPostedError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(
        conversationStorageKey(orgSlug, agentSlug),
      );
      if (stored) {
        setConversationId(stored);
        conversationIdRef.current = stored;
      }
    } catch {
      // localStorage may be blocked in private mode — ignore.
    }
  }, [orgSlug, agentSlug]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: `/api/public-chat/${encodeURIComponent(orgSlug)}/${encodeURIComponent(agentSlug)}`,
        credentials: "include",
        prepareSendMessagesRequest: async ({ messages, body }) => ({
          body: {
            ...body,
            messages,
            conversationId: conversationIdRef.current ?? undefined,
            pageUrl:
              typeof window !== "undefined" && window.parent !== window
                ? document.referrer || undefined
                : window.location.href,
            referrer: document.referrer || undefined,
            locale: agent.locale,
          },
        }),
      }),
    [orgSlug, agentSlug, agent.locale],
  );

  const welcomeMessage = useMemo<UIMessage | null>(() => {
    if (!agent.welcomeMessage) return null;
    return {
      id: "welcome",
      role: "assistant",
      parts: [{ type: "text", text: agent.welcomeMessage }],
    } as UIMessage;
  }, [agent.welcomeMessage]);

  const { messages, sendMessage, status, error } = useChat<UIMessage>({
    transport,
    onFinish: (payload) => {
      const res = payload as { response?: Response };
      const cid = res.response?.headers.get("x-conversation-id");
      if (cid && cid !== conversationIdRef.current) {
        conversationIdRef.current = cid;
        setConversationId(cid);
        try {
          window.localStorage.setItem(
            conversationStorageKey(orgSlug, agentSlug),
            cid,
          );
        } catch {
          // ignore storage error
        }
      }
    },
    onError: (err) => {
      setPostedError(err?.message ?? "Something went wrong.");
    },
  });

  const [input, setInput] = useState("");

  const combined = useMemo<UIMessage[]>(() => {
    if (!welcomeMessage || messages.length > 0) return messages;
    return [welcomeMessage, ...messages];
  }, [messages, welcomeMessage]);

  const busy = status === "submitted" || status === "streaming";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setPostedError(null);
    await sendMessage({ text });
  }

  async function submitFeedback(messageId: string, rating: 1 | -1) {
    if (!conversationIdRef.current) return;
    if (feedbackGiven[messageId]) return;
    setFeedbackGiven((prev) => ({ ...prev, [messageId]: rating }));
    try {
      await fetch(
        `/api/public-chat/${encodeURIComponent(orgSlug)}/${encodeURIComponent(agentSlug)}/feedback`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: conversationIdRef.current,
            messageId,
            rating,
          }),
        },
      );
    } catch {
      // Non-blocking — UI already shows rated state.
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#ffffff",
        color: "#111827",
        fontSize: 14,
      }}
    >
      <header
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #e5e7eb",
          fontWeight: 600,
        }}
      >
        {agent.name}
        {agent.description ? (
          <div style={{ fontWeight: 400, fontSize: 12, color: "#6b7280" }}>
            {agent.description}
          </div>
        ) : null}
      </header>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {combined.map((m) => {
          const isUser = m.role === "user";
          const text = getMessageText(m);
          const human = isHumanMessage(m);
          return (
            <div
              key={m.id}
              style={{
                alignSelf: isUser ? "flex-end" : "flex-start",
                maxWidth: "80%",
              }}
            >
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: isUser
                    ? "#111827"
                    : human
                      ? "#ecfeff"
                      : "#f3f4f6",
                  color: isUser ? "#ffffff" : "#111827",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {text}
              </div>
              {!isUser && m.id !== "welcome" && !human ? (
                <div style={{ marginTop: 4, display: "flex", gap: 6 }}>
                  <FeedbackButton
                    active={feedbackGiven[m.id] === 1}
                    disabled={!conversationIdRef.current}
                    onClick={() => submitFeedback(m.id, 1)}
                    label="👍"
                  />
                  <FeedbackButton
                    active={feedbackGiven[m.id] === -1}
                    disabled={!conversationIdRef.current}
                    onClick={() => submitFeedback(m.id, -1)}
                    label="👎"
                  />
                </div>
              ) : null}
              {human ? (
                <div style={{ fontSize: 11, color: "#0891b2", marginTop: 2 }}>
                  Human agent
                </div>
              ) : null}
            </div>
          );
        })}
        {busy ? (
          <div style={{ color: "#6b7280", fontStyle: "italic" }}>Typing…</div>
        ) : null}
        {error || postedError ? (
          <div style={{ color: "#b91c1c", fontSize: 12 }}>
            {postedError ?? error?.message}
          </div>
        ) : null}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          borderTop: "1px solid #e5e7eb",
          padding: 12,
          display: "flex",
          gap: 8,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message…"
          disabled={busy}
          style={{
            flex: 1,
            padding: "8px 10px",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            outline: "none",
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          style={{
            padding: "8px 12px",
            background: "#111827",
            color: "#ffffff",
            border: 0,
            borderRadius: 8,
            cursor: busy ? "wait" : "pointer",
            opacity: busy || !input.trim() ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </form>
      {/* Suppress unused var warning when conversationId is only mirrored via ref */}
      <span style={{ display: "none" }}>{conversationId}</span>
    </div>
  );
}

function FeedbackButton({
  active,
  disabled,
  onClick,
  label,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || active}
      style={{
        border: "1px solid #e5e7eb",
        background: active ? "#dcfce7" : "#ffffff",
        borderRadius: 6,
        padding: "2px 6px",
        fontSize: 12,
        cursor: active || disabled ? "default" : "pointer",
      }}
    >
      {label}
    </button>
  );
}
