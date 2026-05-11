"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/app/components/AppShell";
import RequireAuth from "@/app/components/RequireAuth";
import {
  Application,
  Note,
  addNote,
  deleteNote,
  getApplication,
  getNotes,
  updateNote,
  uploadResume,
} from "@/app/lib/api";

const formatDate = (value?: string | null) => {
  if (!value) {
    return "";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toISOString().slice(0, 10);
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const applicationId = useMemo(() => {
    const id = params?.id;
    return Array.isArray(id) ? id[0] : id;
  }, [params]);

  const [application, setApplication] = useState<Application | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!applicationId) {
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [applicationData, noteData] = await Promise.all([
          getApplication(applicationId),
          getNotes(applicationId),
        ]);
        setApplication(applicationData);
        setNotes(noteData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load application."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [applicationId]);

  const handleAddNote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!applicationId || !noteText.trim()) {
      return;
    }
    setError("");
    setStatus("");
    try {
      const created = await addNote(applicationId, noteText.trim());
      setNotes((prev) => [created, ...prev]);
      setNoteText("");
      setStatus("Note added.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add note.");
    }
  };

  const handleUpdateNote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingNoteId) {
      return;
    }
    const cleanedNote = editingNoteText.trim();
    if (!cleanedNote) {
      setError("Note content is required.");
      return;
    }
    setError("");
    setStatus("");
    try {
      const updated = await updateNote(editingNoteId, cleanedNote);
      setNotes((prev) =>
        prev.map((note) => (note.id === updated.id ? updated : note))
      );
      setEditingNoteId(null);
      setEditingNoteText("");
      setStatus("Note updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update note.");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const confirmed = window.confirm("Delete this note?");
    if (!confirmed) {
      return;
    }
    setError("");
    setStatus("");
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      setStatus("Note deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete note.");
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!applicationId || !resumeFile) {
      return;
    }
    setError("");
    setStatus("");
    try {
      const result = await uploadResume(applicationId, resumeFile);
      setApplication(result.application);
      setResumeFile(null);
      setStatus(result.msg || "Resume uploaded.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to upload resume."
      );
    }
  };

  return (
    <RequireAuth>
      <AppShell>
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-semibold">Application details</h1>
          {loading ? <p className="text-sm">Loading...</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {status ? <p className="text-sm text-green-700">{status}</p> : null}

          {application ? (
            <section className="rounded-md border border-zinc-200 p-4">
              <div className="text-sm font-semibold">
                {application.job_title}
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                Stage: {application.stage_id}
              </div>
              {application.applied_at ? (
                <div className="text-sm text-zinc-600">
                  Applied: {formatDate(application.applied_at)}
                </div>
              ) : null}
              {application.job_url ? (
                <div className="text-sm text-zinc-600">
                  Job URL: {application.job_url}
                </div>
              ) : null}
              {application.resume_path ? (
                <div className="text-sm text-zinc-600">
                  Resume: {application.resume_path}
                </div>
              ) : null}
            </section>
          ) : null}

          <section className="rounded-md border border-zinc-200 p-4">
            <h2 className="text-sm font-semibold">Upload resume</h2>
            <form className="mt-3 flex flex-col gap-3" onSubmit={handleUpload}>
              <label className="text-sm text-zinc-700">
                Resume file
                <input
                  className="mt-1 block"
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={(event) =>
                    setResumeFile(event.target.files?.[0] ?? null)
                  }
                />
              </label>
              <button
                type="submit"
                className="w-fit rounded-md border border-zinc-300 px-3 py-2 text-sm"
              >
                Upload resume
              </button>
            </form>
          </section>

          <section className="rounded-md border border-zinc-200 p-4">
            <h2 className="text-sm font-semibold">Notes</h2>
            <form className="mt-3 flex flex-col gap-3" onSubmit={handleAddNote}>
              <textarea
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                rows={3}
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                placeholder="Add a note"
              />
              <button
                type="submit"
                className="w-fit rounded-md border border-zinc-300 px-3 py-2 text-sm"
              >
                Add note
              </button>
            </form>
            {notes.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-600">No notes yet.</p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-md border border-zinc-200 p-3"
                  >
                    {editingNoteId === note.id ? (
                      <form className="flex flex-col gap-2" onSubmit={handleUpdateNote}>
                        <textarea
                          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                          rows={3}
                          value={editingNoteText}
                          onChange={(event) =>
                            setEditingNoteText(event.target.value)
                          }
                          aria-label="Edit note"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="submit"
                            className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
                            onClick={() => {
                              setEditingNoteId(null);
                              setEditingNoteText("");
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <p className="text-sm text-zinc-700">{note.note}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <button
                            type="button"
                            className="rounded-md border border-zinc-300 px-2 py-1"
                            onClick={() => {
                              setEditingNoteId(note.id);
                              setEditingNoteText(note.note);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded-md border border-zinc-300 px-2 py-1"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </AppShell>
    </RequireAuth>
  );
}
