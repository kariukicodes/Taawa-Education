import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MessageCircle, Search, Send, Video } from "lucide-react";

import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/format";
import { includesSearchTerm, sortByKey } from "@/lib/adminFilters";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { reportClientError } from "@/lib/reportClientError";
import { formatSessionReminder, formatSessionSchedule } from "@/lib/sessionSchedule";
import { toast } from "@/hooks/use-toast";

type TeacherMessageResponse = {
  threads: Array<{
    id: string;
    student: {
      id: string;
      full_name: string;
      grade: string | null;
      curriculum: string | null;
    } | null;
    counterpart: {
      full_name: string;
      phone: string | null;
      email: string | null;
    } | null;
    meeting: {
      meeting_provider: string | null;
      meeting_link: string | null;
      start_date: string | null;
      session_day_of_week: number | null;
      session_start_time: string | null;
      session_end_time: string | null;
      session_frequency: "weekly" | "biweekly";
      session_timezone: string | null;
      session_end_date: string | null;
      reminder_enabled: boolean;
      reminder_offset_minutes: number;
    } | null;
    unread_count: number;
    last_message_at: string;
    last_message_preview: string;
    messages: Array<{
      id: string;
      body: string;
      created_at: string;
      sender_role: "teacher" | "parent" | "admin";
    }>;
  }>;
};

export default function TeacherMessages() {
  const { user, roleOverride, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [threads, setThreads] = useState<TeacherMessageResponse["threads"]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);

  const requestedStudentId = searchParams.get("student");

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "teacher";

  const loadThreads = async (markReadThreadId?: string | null) => {
    if (isDemo) {
      setThreads([]);
      setLoading(false);
      return;
    }

    try {
      const data = await invokeSupabaseFunction<TeacherMessageResponse>(
        "get-teacher-messages",
        markReadThreadId ? { thread_id: markReadThreadId } : undefined,
      );

      const nextThreads = data.threads ?? [];
      setThreads(nextThreads);

      if (requestedStudentId) {
        const matchingThread = nextThreads.find(
          (thread) => thread.student?.id === requestedStudentId,
        );
        if (matchingThread) {
          setSelectedId(matchingThread.id);
          if (markReadThreadId !== matchingThread.id && matchingThread.unread_count > 0) {
            void loadThreads(matchingThread.id);
          }
          return;
        }
      }

      if (!selectedId && nextThreads[0]) {
        setSelectedId(nextThreads[0].id);
      }
    } catch (err) {
      reportClientError("TeacherMessages.loadThreads", err);
      const message = err instanceof Error ? err.message : String(err);
      setLoadError(message);
      toast({
        title: "Failed to load conversations",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;

    setLoading(true);
    setLoadError(null);
    void loadThreads();
  }, [authLoading, isDemo, user?.id, requestedStudentId]);

  const filteredThreads = useMemo(
    () =>
      sortByKey(
        threads.filter((thread) =>
          includesSearchTerm(
            [
              thread.student?.full_name,
              thread.student?.grade,
              thread.counterpart?.full_name,
              thread.counterpart?.email,
              thread.last_message_preview,
            ],
            search,
          ),
        ),
        (thread) => thread.last_message_at,
        "desc",
      ),
    [threads, search],
  );

  const selectedThread =
    filteredThreads.find((thread) => thread.id === selectedId) ??
    threads.find((thread) => thread.id === selectedId) ??
    null;

  useEffect(() => {
    if (!selectedThread) return;
    if (selectedThread.unread_count <= 0) return;
    void loadThreads(selectedThread.id);
  }, [selectedThread?.id]);

  const handleSend = async () => {
    const messageBody = draft.trim();
    if (!messageBody) return;

    try {
      setSending(true);
      const response = await invokeSupabaseFunction<{ thread_id: string }>(
        "send-teacher-message",
        selectedThread
          ? { thread_id: selectedThread.id, body: messageBody }
          : requestedStudentId
            ? { student_id: requestedStudentId, body: messageBody }
            : { body: messageBody },
      );

      setDraft("");
      const nextThreadId = response.thread_id;
      setSelectedId(nextThreadId);
      if (requestedStudentId) {
        setSearchParams((current) => {
          const next = new URLSearchParams(current);
          next.delete("student");
          return next;
        });
      }
      await loadThreads(nextThreadId);
    } catch (err) {
      reportClientError("TeacherMessages.handleSend", err);
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to send message",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Parent Messages</h2>
            <p className="text-sm text-muted-foreground">
              Keep conversations about lessons, schedules, and progress inside the portal.
            </p>
          </div>
        </div>

        {loading ? (
          <CardSkeleton count={3} />
        ) : loadError ? (
          <EmptyState title="Messages unavailable" description={loadError} icon={MessageCircle} />
        ) : threads.length === 0 && !requestedStudentId ? (
          <EmptyState
            title="No conversations yet"
            description="Open a student card and use In-App Chat to start the first parent conversation."
            icon={MessageCircle}
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search students or parents..."
                    className="w-full rounded-lg border border-border bg-muted py-2 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {filteredThreads.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  No conversations match this search.
                </div>
              ) : (
                <div className="max-h-[70vh] overflow-y-auto">
                  {filteredThreads.map((thread) => (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => setSelectedId(thread.id)}
                      className={`w-full border-b border-border px-4 py-4 text-left last:border-0 ${
                        selectedId === thread.id ? "bg-muted/60" : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {thread.student?.full_name ?? "Student"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Parent: {thread.counterpart?.full_name ?? "Unlinked"}
                          </p>
                        </div>
                        {thread.unread_count > 0 && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                            {thread.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                        {thread.last_message_preview || "No messages yet"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card">
              {selectedThread ? (
                <div className="flex h-full min-h-[70vh] flex-col">
                  <div className="border-b border-border p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {selectedThread.student?.full_name ?? "Student"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Parent: {selectedThread.counterpart?.full_name ?? "Unlinked"}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {selectedThread.meeting
                            ? formatSessionSchedule(selectedThread.meeting)
                            : "Schedule not set"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedThread.meeting
                            ? formatSessionReminder(selectedThread.meeting)
                            : "Add schedule details from Tutor Assignments."}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {selectedThread.meeting?.meeting_link && (
                          <a
                            href={selectedThread.meeting.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                          >
                            <Video className="h-3.5 w-3.5" />
                            Join Session
                          </a>
                        )}
                        <Link
                          to="/teacher/students"
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          View Student
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto p-5">
                    {selectedThread.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.sender_role === "teacher"
                            ? "ml-auto bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                        <p
                          className={`mt-2 text-[11px] ${
                            message.sender_role === "teacher"
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatDate(message.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border p-4">
                    <div className="flex gap-3">
                      <textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="Write a message to the parent..."
                        rows={3}
                        className="min-h-[96px] flex-1 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => void handleSend()}
                        disabled={sending}
                        className="inline-flex h-fit items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                      >
                        <Send className="h-4 w-4" />
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              ) : requestedStudentId ? (
                <div className="flex h-full min-h-[70vh] flex-col justify-between p-5">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Start a new conversation</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Send the first message for this student to open the parent thread inside the portal.
                    </p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex gap-3">
                      <textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="Write a message to the parent..."
                        rows={3}
                        className="min-h-[96px] flex-1 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => void handleSend()}
                        disabled={sending}
                        className="inline-flex h-fit items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                      >
                        <Send className="h-4 w-4" />
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[70vh] items-center justify-center">
                  <EmptyState
                    title="Select a conversation"
                    description="Choose a student thread on the left to view and reply."
                    icon={MessageCircle}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
