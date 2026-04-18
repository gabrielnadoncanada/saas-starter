"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteKnowledgeDocumentAction,
  reingestKnowledgeDocumentAction,
  uploadKnowledgeDocumentAction,
} from "@/features/knowledge/actions/document.actions";

type DocumentSummary = {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  storedFile: { fileName: string; sizeBytes: number; contentType: string } | null;
  _count: { chunks: number };
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AgentKnowledgePanel({
  agentId,
  documents,
}: {
  agentId: string;
  documents: DocumentSummary[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function upload() {
    if (!file || !title.trim()) {
      setError("File and title are required");
      return;
    }
    setError(null);
    const form = new FormData();
    form.append("file", file);
    form.append("title", title.trim());
    form.append("agentId", agentId);
    startTransition(async () => {
      try {
        await uploadKnowledgeDocumentAction(form);
        setTitle("");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    });
  }

  function remove(documentId: string) {
    if (!confirm("Delete this document and its embeddings?")) return;
    startTransition(async () => {
      await deleteKnowledgeDocumentAction({ documentId });
      router.refresh();
    });
  }

  function reingest(documentId: string) {
    startTransition(async () => {
      await reingestKnowledgeDocumentAction({ documentId });
      router.refresh();
    });
  }

  return (
    <div className="mt-4 space-y-6">
      <section className="rounded-md border p-4">
        <h3 className="mb-3 text-sm font-semibold">Upload a document</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Product catalog Q1"
            />
          </div>
          <div>
            <Label>File</Label>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.json,.csv,.html,text/plain,text/markdown,application/json,text/csv,text/html"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          Accepts .txt, .md, .json, .csv, .html — max 10 MB.
        </p>
        {error ? (
          <p className="mt-2 text-xs text-destructive">{error}</p>
        ) : null}
        <div className="mt-3">
          <Button
            onClick={upload}
            disabled={pending || !file || !title.trim()}
          >
            {pending ? "Uploading…" : "Upload & ingest"}
          </Button>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold">Documents</h3>
        {documents.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No documents yet. Upload one above to give the agent grounded
            answers.
          </p>
        ) : (
          <ul className="space-y-2">
            {documents.map((d) => (
              <li key={d.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium">{d.title}</div>
                    <div className="text-muted-foreground truncate text-xs">
                      {d.storedFile
                        ? `${d.storedFile.fileName} · ${formatBytes(
                            d.storedFile.sizeBytes,
                          )}`
                        : "No file"}
                    </div>
                    <div className="text-muted-foreground mt-1 text-xs">
                      {new Date(d.createdAt).toLocaleString()} ·{" "}
                      {d._count.chunks} chunks
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        d.status === "READY"
                          ? "bg-green-600 text-white"
                          : d.status === "FAILED"
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {d.status}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => reingest(d.id)}
                      disabled={pending}
                    >
                      Re-ingest
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => remove(d.id)}
                      disabled={pending}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
