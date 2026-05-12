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

const noteCardTones = ["peach", "mint", "lavender", "sky", "pink", "slate"];

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
      <AppShell fullBleed showFilters={false}>
        <div className="jt-page">
          <div className="jt-page__head">
            <div>
              <h1>Application details</h1>
              <p className="jt-page__subtitle">
                Keep notes, resumes, and updates in one view.
              </p>
            </div>
          </div>
          {loading ? <p className="jt-page__subtitle">Loading...</p> : null}
          {error ? <p className="jt-alert jt-alert--error">{error}</p> : null}
          {status ? (
            <p className="jt-alert jt-alert--success">{status}</p>
          ) : null}

          {application ? (
            <section className="jt-panel">
              <div className="jt-panel__title">Role overview</div>
              <div className="jt-item-card__title">
                {application.job_title}
              </div>
              <div className="jt-item-card__meta">
                Stage: {application.stage_id}
              </div>
              {application.applied_at ? (
                <div className="jt-item-card__meta">
                  Applied: {formatDate(application.applied_at)}
                </div>
              ) : null}
              {application.job_url ? (
                <div className="jt-item-card__meta">
                  Job URL: {application.job_url}
                </div>
              ) : null}
              {application.resume_path ? (
                <div className="jt-item-card__meta">
                  Resume: {application.resume_path}
                </div>
              ) : null}
            </section>
          ) : null}

          <section className="jt-panel">
            <div className="jt-panel__title">Upload resume</div>
            <form className="jt-form" onSubmit={handleUpload}>
              <label className="jt-field">
                Resume file
                <input
                  className="jt-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={(event) =>
                    setResumeFile(event.target.files?.[0] ?? null)
                  }
                />
              </label>
              <button type="submit" className="jt-button jt-button--primary">
                Upload resume
              </button>
            </form>
          </section>

          <section className="jt-panel">
            <div className="jt-panel__title">Notes</div>
            <form className="jt-form" onSubmit={handleAddNote}>
              <textarea
                className="jt-textarea"
                rows={3}
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                placeholder="Add a note"
              />
              <button type="submit" className="jt-button jt-button--primary">
                Add note
              </button>
            </form>
            {notes.length === 0 ? (
              <p className="jt-page__subtitle">No notes yet.</p>
            ) : (
              <div className="jt-grid">
                {notes.map((note, index) => (
                  <div
                    key={note.id}
                    className={`jt-item-card jt-item-card--${
                      noteCardTones[index % noteCardTones.length]
                    }`}
                  >
                    {editingNoteId === note.id ? (
                      <form className="jt-form" onSubmit={handleUpdateNote}>
                        <textarea
                          className="jt-textarea"
                          rows={3}
                          value={editingNoteText}
                          onChange={(event) =>
                            setEditingNoteText(event.target.value)
                          }
                          aria-label="Edit note"
                        />
                        <div className="jt-row">
                          <button
                            type="submit"
                            className="jt-button jt-button--primary jt-button--sm"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="jt-button jt-button--outline jt-button--sm"
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
                        <p className="jt-item-card__meta">{note.note}</p>
                        <div className="jt-row">
                          <button
                            type="button"
                            className="jt-button jt-button--outline jt-button--sm"
                            onClick={() => {
                              setEditingNoteId(note.id);
                              setEditingNoteText(note.note);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="jt-button jt-button--outline jt-button--sm"
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
