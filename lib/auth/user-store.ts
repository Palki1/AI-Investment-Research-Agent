type Activity = { id: string; type: string; meta?: any; ts: number };

export type User = {
  id: string;
  email: string;
  name?: string;
  createdAt: number;
  lastActive?: number;
  activities?: Activity[];
  feedback?: string[];
  // NOTE: For local/demo only. Do NOT store plaintext passwords in production.
  password?: string;
};

const STORAGE_KEY = "ai:users_v1";
let MEM_STORE = new Map<string, User>();

function ensureLoaded() {
  if (MEM_STORE.size > 0) return;
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const arr: User[] = JSON.parse(raw);
    for (const u of arr) MEM_STORE.set(u.id, u);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Failed to load users from storage", err);
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...MEM_STORE.values()]));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Failed to persist users to storage", err);
  }
}

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function listUsers(): User[] {
  ensureLoaded();
  return [...MEM_STORE.values()].sort((a, b) => b.createdAt - a.createdAt);
}

export function getUserByEmail(email: string): User | undefined {
  ensureLoaded();
  return [...MEM_STORE.values()].find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): User | undefined {
  ensureLoaded();
  return MEM_STORE.get(id);
}

export function createUser({ email, name, password }: { email: string; name?: string; password?: string }): User {
  ensureLoaded();
  const existing = getUserByEmail(email);
  if (existing) throw new Error("User already exists");
  const user: User = {
    id: makeId(),
    email,
    name,
    password,
    createdAt: Date.now(),
    activities: [],
    feedback: [],
  };
  MEM_STORE.set(user.id, user);
  persist();
  return user;
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  ensureLoaded();
  const u = MEM_STORE.get(id);
  if (!u) return undefined;
  const updated = { ...u, ...updates };
  MEM_STORE.set(id, updated);
  persist();
  return updated;
}

export function deleteUser(id: string) {
  ensureLoaded();
  MEM_STORE.delete(id);
  persist();
}

export function addActivity(userId: string, type: string, meta?: any) {
  ensureLoaded();
  const u = MEM_STORE.get(userId);
  if (!u) return;
  const act: Activity = { id: makeId(), type, meta, ts: Date.now() };
  u.activities = u.activities || [];
  u.activities.push(act);
  u.lastActive = act.ts;
  MEM_STORE.set(userId, u);
  persist();
}

export function addFeedback(userId: string, text: string) {
  ensureLoaded();
  const u = MEM_STORE.get(userId);
  if (!u) return;
  u.feedback = u.feedback || [];
  u.feedback.push(text);
  MEM_STORE.set(userId, u);
  persist();
}

export function clearUsers() {
  MEM_STORE = new Map();
  persist();
}

export default {
  listUsers,
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  addActivity,
  addFeedback,
  clearUsers,
};
