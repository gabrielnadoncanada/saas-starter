"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getConversationMessagesAction,
  releaseConversationAction,
  resolveConversationAction,
  sendHumanReplyAction,
  takeOverConversationAction,
} from "@/features/agents/actions/agent.actions";
import { createCorrectionAction } from "@/features/agents/actions/correction.actions";

type ConversationSummary = {
  id: string;
  status: string;
  visitorId: string;
  lastMessageAt: string;
  lead: { id: string; contactEmail: string | null; contactName: string | null } | null;
  assignedUser: { id: string; name: string | null; email: string } | null;
};

type MessageView = {
  id: string;
  role: string;
  text: string;
  sender: string | null;
};

function statusBadgeClass(status: string): string {
  switch (status) {
    case "HUMAN":
      return "bg-blue-600 text-white";
    case "WAITING_HUMAN":
      return "bg-amber-500 text-white";
    case "RESOLVED":
      return "bg-emerald-600 text-white";
    case "ABANDONED":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function AgentInboxPanel({
  agentId: _agentId,
  conversations,
}: {
  agentId: string;
  conversations: ConversationSummary[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(
    conversations[0]?.id ?? null,
  );
  const [messages, setMessages] = useState<MessageView[]>([]);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState("");

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  const loadMessages = useCallback(
    async (conversationId: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getConversationMessagesAction({ conversationId });
        setMessages(result.messages);
        setLiveStatus(result.status);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load messages");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      setLiveStatus(null);
      return;
    }
    loadMessages(selectedId);
    const interval = setInterval(() => loadMessages(selectedId), 5_000);
    return () => clearInterval(interval);
  }, [selectedId, loadMessages]);

  function takeOver() {
    if (!selectedId) return;
    startTransition(async () => {
      try {
        await takeOverConversationAction({ conversationId: selectedId });
        await loadMessages(selectedId);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to take over");
      }
    });
  }

  function release() {
    if (!selectedId) return;
    startTransition(async () => {
      await releaseConversationAction({ conversationId: selectedId });
      await loadMessages(selectedId);
      router.refresh();
    });
  }

  function resolve() {
    if (!selectedId) return;
    startTransition(async () => {
      await resolveConversationAction({ conversationId: selectedId });
      await loadMessages(selectedId);
      router.refresh();
    });
  }

  function send() {
    if (!selectedId || !reply.trim()) return;
    const text = reply.trim();
    startTransition(async () => {
      try {
        await sendHumanReplyAction({
          conversationId: selectedId,
          message: text,
        });
        setReply("");
        await loadMessages(selectedId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to send");
      }
    });
  }

  function startEdit(m: MessageView) {
    setEditingId(m.id);
    setEditedText(m.text);
  }

  function saveCorrection() {
    if (!selectedId || !editingId || !editedText.trim()) return;
    const messageId = editingId;
    const corrected = editedText.trim();
    startTransition(async () => {
      try {
        await createCorrectionAction({
          conversationId: selectedId,
          messageId,
          correctedMessage: corrected,
          useAsExample: true,
        });
        setEditingId(null);
        setEditedText("");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save correction");
      }
    });
  }

  const effectiveStatus = liveStatus ?? selected?.status ?? "BOT";

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-[320px_1fr]">
      <aside className="rounded-md border">
        <div className="border-b p-3 text-xs font-semibold">
          Conversations ({conversations.length})
        </div>
        <ul className="max-h-[70vh] overflow-auto">
          {conversations.map((c) => {
            const active = c.id === selectedId;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full border-b p-3 text-left text-sm transition hover:bg-muted ${
                    active ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">
                      {c.lead?.contactName ??
                        c.lead?.contactEmail ??
                        c.visitorId.slice(0, 10)}
                    </span>
                    <span
                      className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] ${statusBadgeClass(
                        c.status,
                      )}`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    {new Date(c.lastMessageAt).toLocaleString()}
                  </div>
                  {c.assignedUser ? (
                    <div className="text-muted-foreground text-[11px]">
                      → {c.assignedUser.name ?? c.assignedUser.email}
                    </div>
                  ) : null}
                </button>
              </li>
            );
          })}
          {conversations.length === 0 ? (
            <li className="text-muted-foreground p-4 text-xs">
              No conversations yet.
            </li>
          ) : null}
        </ul>
      </aside>

      <section className="rounded-md border">
        {!selected ? (
          <div className="text-muted-foreground p-6 text-center text-sm">
            Select a conversation to view the transcript.
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
              <div>
                <div className="text-sm font-semibold">
                  {selected.lead?.contactName ??
                    selected.lead?.contactEmail ??
                    selected.visitorId}
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] ${statusBadgeClass(
                      effectiveStatus,
                    )}`}
                  >
                    {effectiveStatus}
                  </span>
                  {selected.lead?.contactEmail ? (
                    <span>{selected.lead.contactEmail}</span>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {effectiveStatus !== "HUMAN" ? (
                  <Button size="sm" onClick={takeOver} disabled={pending}>
                    Take over
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={release}
                    disabled={pending}
                  >
                    Hand back to bot
                  </Button>
                )}
                {effectiveStatus !== "RESOLVED" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={resolve}
                    disabled={pending}
                  >
                    Mark resolved
                  </Button>
                ) : null}
              </div>
            </header>

            <div className="max-h-[55vh] flex-1 space-y-3 overflow-auto p-3">
              {loading && messages.length === 0 ? (
                <p className="text-muted-foreground text-xs">Loading…</p>
              ) : null}
              {messages.map((m) => {
                const isUser = m.role === "user";
                const isHuman = m.sender === "human";
                const bubbleClass = isUser
                  ? "ml-auto bg-primary text-primary-foreground"
                  : isHuman
                    ? "bg-cyan-600 text-white"
                    : "bg-muted";
                return (
                  <div key={m.id} className={`max-w-[80%] space-y-1`}>
                    <div
                      className={`rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${bubbleClass}`}
                    >
                      <div className="text-[10px] opacity-70">
                        {isUser
                          ? "Visitor"
                          : isHuman
                            ? "Human agent"
                            : "Bot"}
                      </div>
                      {editingId === m.id ? (
                        <div className="mt-2 space-y-2">
                          <Textarea
                            rows={3}
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={saveCorrection}
                              disabled={pending || !editedText.trim()}
                            >
                              Save as correction
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(null);
                                setEditedText("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p>{m.text}</p>
                      )}
                    </div>
                    {m.role === "assistant" && !isHuman && editingId !== m.id ? (
                      <button
                        type="button"
                        onClick={() => startEdit(m)}
                        className="text-muted-foreground text-[10px] underline underline-offset-2 hover:text-foreground"
                      >
                        Correct this reply
                      </button>
                    ) : null}
                  </div>
                );
              })}
              {!loading && messages.length === 0 ? (
                <p className="text-muted-foreground text-xs">No messages.</p>
              ) : null}
            </div>

            <footer className="border-t p-3">
              {error ? (
                <p className="mb-2 text-xs text-destructive">{error}</p>
              ) : null}
              <div className="flex gap-2">
                <Textarea
                  rows={2}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={
                    effectiveStatus === "HUMAN"
                      ? "Reply as human…"
                      : "Take over first to send a human reply"
                  }
                  disabled={effectiveStatus !== "HUMAN" || pending}
                />
                <Button
                  onClick={send}
                  disabled={
                    pending || !reply.trim() || effectiveStatus !== "HUMAN"
                  }
                >
                  Send
                </Button>
              </div>
            </footer>
          </div>
        )}
      </section>
    </div>
  );
}
