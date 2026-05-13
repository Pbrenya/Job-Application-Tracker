import { getToken } from "@/app/lib/auth";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const buildUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
};

const readErrorMessage = async (response: Response) => {
  const fallback = `Request failed (${response.status})`;
  try {
    const data = await response.json();
    if (data?.msg) {
      return data.msg;
    }
    if (data?.message) {
      return data.message;
    }
    if (Array.isArray(data?.errors) && data.errors[0]?.msg) {
      return data.errors[0].msg;
    }
  } catch (err) {
    return fallback;
  }
  return fallback;
};

type JsonRequestInit = Omit<RequestInit, "body"> & { body?: unknown };

async function requestJson<T>(
  path: string,
  options: JsonRequestInit = {}
): Promise<T> {
  const url = buildUrl(path);
  const headers = new Headers(options.headers);
  const token = getToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const body = options.body;
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  if (body !== undefined && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const payload =
    body === undefined || isFormData || typeof body === "string"
      ? (body as BodyInit | undefined)
      : JSON.stringify(body);

  const response = await fetch(url, {
    ...options,
    headers,
    body: payload,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export type AuthResponse = {
  token: string;
};

export type Application = {
  id: string;
  company_id: string;
  job_title: string;
  description?: string | null;
  applied_at?: string | null;
  stage_id: number;
  salary_min?: number | null;
  salary_max?: number | null;
  job_url?: string | null;
  resume_path?: string | null;
};

export type Company = {
  id: string;
  name: string;
  location?: string | null;
  website?: string | null;
};

export type Note = {
  id: string;
  application_id: string;
  note: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type AnalyticsStats = {
  totalApplications: number;
  applicationsByStage: { name: string; count: number }[];
  applicationsByCompany: { name: string; count: number }[];
  applicationsOverTime: { month: string; count: number }[];
};

export type UploadResumeResponse = {
  msg: string;
  file: string;
  application: Application;
};

export const register = (email: string, password: string) =>
  requestJson<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: { email, password },
  });

export const login = (email: string, password: string) =>
  requestJson<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });

export const getApplications = () =>
  requestJson<Application[]>("/api/applications");

export const getApplication = (id: string) =>
  requestJson<Application>(`/api/applications/${id}`);

export const createApplication = (payload: Partial<Application>) =>
  requestJson<Application>("/api/applications", {
    method: "POST",
    body: payload,
  });

export const updateApplication = (id: string, payload: Partial<Application>) =>
  requestJson<Application>(`/api/applications/${id}`, {
    method: "PATCH",
    body: payload,
  });

export const deleteApplication = (id: string) =>
  requestJson<{ msg: string }>(`/api/applications/${id}`, {
    method: "DELETE",
  });

export const uploadResume = (id: string, file: File) => {
  const formData = new FormData();
  formData.append("resume", file);
  return requestJson<UploadResumeResponse>(`/api/applications/${id}/resume`, {
    method: "POST",
    body: formData,
  });
};

export const getCompanies = () => requestJson<Company[]>("/api/companies");

export const createCompany = (payload: Partial<Company>) =>
  requestJson<Company>("/api/companies", {
    method: "POST",
    body: payload,
  });

export const updateCompany = (id: string, payload: Partial<Company>) =>
  requestJson<Company>(`/api/companies/${id}`, {
    method: "PATCH",
    body: payload,
  });

export const deleteCompany = (id: string) =>
  requestJson<{ msg: string }>(`/api/companies/${id}`, {
    method: "DELETE",
  });

export const getNotes = (applicationId: string) =>
  requestJson<Note[]>(`/api/applications/${applicationId}/notes`);

export const addNote = (applicationId: string, note: string) =>
  requestJson<Note>(`/api/applications/${applicationId}/notes`, {
    method: "POST",
    body: { note },
  });

export const updateNote = (noteId: string, note: string) =>
  requestJson<Note>(`/api/notes/${noteId}`, {
    method: "PATCH",
    body: { note },
  });

export const deleteNote = (noteId: string) =>
  requestJson<{ msg: string }>(`/api/notes/${noteId}`, {
    method: "DELETE",
  });

export const getAnalytics = () =>
  requestJson<AnalyticsStats>("/api/analytics");
