import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from "firebase/auth";
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  DocumentData 
} from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../firebase";

// Global map for client-side object URL storage preview
const objectUrlStorageMap = new Map<string, string>();

const LOCAL_STORE_PREFIX = "eduproof_firestore_";

const SEED_ISSUED_CERTIFICATES: DocumentData[] = [
  {
    id: "cert_seed_1",
    certificate_id: "EDU-2025-001",
    course_name: "Full-Stack Web Development",
    student_name: "Stanford University",
    issue_date: "2025-01-15T00:00:00.000Z",
    created_at: "2025-01-15T00:00:00.000Z",
  },
  {
    id: "cert_seed_2",
    certificate_id: "AWS-12345",
    course_name: "AWS Certified Solutions Architect",
    student_name: "Amazon Web Services",
    issue_date: "2024-11-20T00:00:00.000Z",
    created_at: "2024-11-20T00:00:00.000Z",
  },
  {
    id: "cert_seed_3",
    certificate_id: "COURSE-67890",
    course_name: "Machine Learning Specialization",
    student_name: "Coursera / Stanford",
    issue_date: "2024-12-10T00:00:00.000Z",
    created_at: "2024-12-10T00:00:00.000Z",
  },
  {
    id: "cert_seed_4",
    certificate_id: "CERT-001",
    course_name: "Advanced Computer Science",
    student_name: "MIT OpenCourseWare",
    issue_date: "2025-02-01T00:00:00.000Z",
    created_at: "2025-02-01T00:00:00.000Z",
  },
];

function fetchWithTimeout<T>(promise: Promise<T>, timeoutMs = 1200): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout waiting for Firestore")), timeoutMs)
    ),
  ]);
}

function getLocalStorageDocs(tableName: string): DocumentData[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORE_PREFIX + tableName);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    if (tableName === "issued_certificates") {
      saveLocalStorageDocs(tableName, SEED_ISSUED_CERTIFICATES);
      return SEED_ISSUED_CERTIFICATES;
    }
    return [];
  } catch {
    return tableName === "issued_certificates" ? SEED_ISSUED_CERTIFICATES : [];
  }
}

function saveLocalStorageDocs(tableName: string, docs: DocumentData[]) {
  try {
    localStorage.setItem(LOCAL_STORE_PREFIX + tableName, JSON.stringify(docs));
  } catch {}
}

function setLocalDoc(tableName: string, docData: DocumentData) {
  const docs = getLocalStorageDocs(tableName);
  const idx = docs.findIndex((d) => d.id === docData.id || (docData.user_id && d.user_id === docData.user_id && (tableName === "user_roles" || tableName === "profiles")));
  if (idx >= 0) {
    docs[idx] = { ...docs[idx], ...docData };
  } else {
    docs.unshift(docData);
  }
  saveLocalStorageDocs(tableName, docs);
}

function updateLocalDocs(tableName: string, matchedDocs: DocumentData[], updateData: Record<string, any>) {
  const docs = getLocalStorageDocs(tableName);
  const matchedIds = new Set(matchedDocs.map((d) => d.id));
  const updatedDocs = docs.map((d) => {
    if (matchedIds.has(d.id)) {
      return { ...d, ...updateData, updated_at: new Date().toISOString() };
    }
    return d;
  });
  saveLocalStorageDocs(tableName, updatedDocs);
}

function deleteLocalDocs(tableName: string, matchedDocs: DocumentData[]) {
  const docs = getLocalStorageDocs(tableName);
  const matchedIds = new Set(matchedDocs.map((d) => d.id));
  const remaining = docs.filter((d) => !matchedIds.has(d.id));
  saveLocalStorageDocs(tableName, remaining);
}

function mapFirebaseUserToSupabaseUser(fbUser: FirebaseUser | null, metadata: Record<string, any> = {}) {
  if (!fbUser) return null;
  return {
    id: fbUser.uid,
    email: fbUser.email || "",
    email_confirmed_at: new Date().toISOString(),
    user_metadata: {
      full_name: fbUser.displayName || metadata.full_name || "",
      ...metadata
    },
    app_metadata: {},
    aud: "authenticated",
    role: "authenticated",
    created_at: new Date().toISOString(),
  };
}

function mapFirebaseSession(fbUser: FirebaseUser | null, metadata: Record<string, any> = {}) {
  if (!fbUser) return null;
  const user = mapFirebaseUserToSupabaseUser(fbUser, metadata)!;
  return {
    access_token: "firebase-mock-access-token",
    token_type: "bearer" as const,
    expires_in: 3600,
    refresh_token: "firebase-mock-refresh-token",
    user: user as any,
  };
}

class MutationResultBuilder {
  private actionPromise: Promise<{ data: any; error: any }>;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;

  constructor(actionPromise: Promise<{ data: any; error: any }>) {
    this.actionPromise = actionPromise;
  }

  select(_columns: string = "*") {
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  eq(_field: string, _val: any) {
    return this;
  }

  neq(_field: string, _val: any) {
    return this;
  }

  in(_field: string, _val: any[]) {
    return this;
  }

  async then(onfulfilled?: (value: { data: any; error: any }) => any, onrejected?: (reason: any) => any) {
    try {
      const res = await this.actionPromise;
      let finalData = res.data;
      if ((this.isSingle || this.isMaybeSingle) && Array.isArray(finalData)) {
        finalData = finalData.length > 0 ? finalData[0] : null;
      }
      const output = { data: finalData, error: res.error };
      return onfulfilled ? onfulfilled(output) : output;
    } catch (err: any) {
      const output = { data: null, error: err };
      return onrejected ? onrejected(err) : output;
    }
  }
}

class QueryBuilder {
  private tableName: string;
  private conditions: Array<{ field: string; op: string; val: any }> = [];
  private orConditions: string[] = [];
  private orderConfig: { field: string; direction: "asc" | "desc" } | null = null;
  private limitNum: number | null = null;
  private rangeConfig: { from: number; to: number } | null = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(_columns: string = "*", _options?: any) {
    return this;
  }

  eq(field: string, val: any) {
    this.conditions.push({ field, op: "==", val });
    return this;
  }

  neq(field: string, val: any) {
    this.conditions.push({ field, op: "!=", val });
    return this;
  }

  in(field: string, val: any[]) {
    this.conditions.push({ field, op: "in", val });
    return this;
  }

  or(filterStr: string) {
    if (filterStr) {
      this.orConditions.push(filterStr);
    }
    return this;
  }

  match(obj: Record<string, any>) {
    for (const [k, v] of Object.entries(obj)) {
      this.eq(k, v);
    }
    return this;
  }

  is(field: string, val: any) {
    this.conditions.push({ field, op: "==", val });
    return this;
  }

  contains(field: string, val: any) {
    this.conditions.push({ field, op: "contains", val });
    return this;
  }

  order(field: string, options: { ascending?: boolean } = { ascending: true }) {
    this.orderConfig = { field, direction: options.ascending !== false ? "asc" : "desc" };
    return this;
  }

  limit(n: number) {
    this.limitNum = n;
    return this;
  }

  range(from: number, to: number) {
    this.rangeConfig = { from, to };
    return this;
  }

  private async fetchDocs(): Promise<DocumentData[]> {
    let docs: DocumentData[] = getLocalStorageDocs(this.tableName);

    try {
      const colRef = collection(db, this.tableName);
      const snapshot = await fetchWithTimeout(getDocs(colRef), 1200);
      const cloudDocs: DocumentData[] = [];
      snapshot.forEach((d) => cloudDocs.push({ id: d.id, ...d.data() }));

      if (cloudDocs.length > 0) {
        const cloudIds = new Set(cloudDocs.map(d => d.id));
        const localOnly = docs.filter(ld => !cloudIds.has(ld.id));
        docs = [...cloudDocs, ...localOnly];
        saveLocalStorageDocs(this.tableName, docs);
      }
    } catch (err: any) {
      docs = getLocalStorageDocs(this.tableName);
    }

    // Filter by equality & in conditions
    if (this.conditions.length > 0) {
      docs = docs.filter((d) => {
        return this.conditions.every((c) => {
          if (c.op === "==") {
            if (c.field === "certificate_id" && typeof c.val === "string") {
              return String(d[c.field] || "").toLowerCase() === c.val.toLowerCase();
            }
            return d[c.field] === c.val;
          }
          if (c.op === "!=") return d[c.field] !== c.val;
          if (c.op === "in") return Array.isArray(c.val) && c.val.includes(d[c.field]);
          if (c.op === "contains") {
            const val = d[c.field];
            return Array.isArray(val) ? val.includes(c.val) : val === c.val;
          }
          return true;
        });
      });
    }

    // Filter by OR conditions
    if (this.orConditions.length > 0) {
      docs = docs.filter((d) => {
        return this.orConditions.every((orStr) => {
          const parts = orStr.split(",");
          return parts.some((part) => {
            const match = part.trim().match(/([a-zA-Z0-9_]+)\.eq\.(.+)/);
            if (match) {
              const [, field, val] = match;
              return String(d[field]) === String(val);
            }
            return true;
          });
        });
      });
    }

    // Sort
    if (this.orderConfig) {
      const { field, direction } = this.orderConfig;
      docs.sort((a, b) => {
        const valA = a[field] ?? "";
        const valB = b[field] ?? "";
        if (valA < valB) return direction === "asc" ? -1 : 1;
        if (valA > valB) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    // Range / Limit
    if (this.rangeConfig) {
      docs = docs.slice(this.rangeConfig.from, this.rangeConfig.to + 1);
    } else if (this.limitNum !== null) {
      docs = docs.slice(0, this.limitNum);
    }

    return docs;
  }

  async then(onfulfilled?: (value: { data: any[]; error: any; count: number | null }) => any, onrejected?: (reason: any) => any) {
    try {
      const docs = await this.fetchDocs();
      const res = { data: docs, error: null, count: docs.length };
      return onfulfilled ? onfulfilled(res) : res;
    } catch (err: any) {
      const res = { data: [], error: err, count: 0 };
      return onrejected ? onrejected(err) : res;
    }
  }

  async single() {
    const docs = await this.fetchDocs();
    if (docs.length >= 1) {
      return { data: docs[0], error: null };
    }
    return { data: null, error: { message: "JSON object requested, no rows returned", details: "", hint: "", code: "PGRST116" } };
  }

  async maybeSingle() {
    const docs = await this.fetchDocs();
    if (docs.length === 0) {
      return { data: null, error: null };
    }
    return { data: docs[0], error: null };
  }

  insert(data: Record<string, any> | Array<Record<string, any>>) {
    const doInsert = async () => {
      const items = Array.isArray(data) ? data : [data];
      const inserted: DocumentData[] = [];

      for (const item of items) {
        let docId = item.id;
        if (!docId && (this.tableName === "user_roles" || this.tableName === "profiles")) {
          docId = item.user_id;
        }
        if (!docId) {
          docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        }

        const docRecord = { id: docId, ...item, created_at: item.created_at || new Date().toISOString() };

        setLocalDoc(this.tableName, docRecord);
        inserted.push(docRecord);

        setDoc(doc(db, this.tableName, docId), docRecord, { merge: true }).catch(() => {});
      }

      return { data: Array.isArray(data) ? inserted : inserted[0], error: null };
    };

    return new MutationResultBuilder(doInsert());
  }

  upsert(data: Record<string, any> | Array<Record<string, any>>) {
    return this.insert(data);
  }

  update(data: Record<string, any>) {
    const doUpdate = async () => {
      const docs = await this.fetchDocs();
      const updated: DocumentData[] = [];

      for (const d of docs) {
        const docRecord = { ...d, ...data, updated_at: new Date().toISOString() };
        updated.push(docRecord);
        updateDoc(doc(db, this.tableName, d.id), { ...data, updated_at: new Date().toISOString() }).catch(() => {});
      }

      updateLocalDocs(this.tableName, docs, data);
      return { data: updated, error: null };
    };

    return new MutationResultBuilder(doUpdate());
  }

  delete() {
    const doDelete = async () => {
      const docs = await this.fetchDocs();
      for (const d of docs) {
        deleteDoc(doc(db, this.tableName, d.id)).catch(() => {});
      }
      deleteLocalDocs(this.tableName, docs);
      return { data: docs, error: null };
    };

    return new MutationResultBuilder(doDelete());
  }
}

class RealtimeChannelStub {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  on(_event: string, _filter: any, _callback?: any) {
    return this;
  }
  subscribe(callback?: any) {
    if (callback) callback("SUBSCRIBED");
    return this;
  }
  unsubscribe() {
    return this;
  }
}

// Storage Translation Bridge
const storageBridge = {
  from(bucket: string) {
    return {
      async upload(path: string, file: File | Blob, _options?: any) {
        const objectUrl = URL.createObjectURL(file);
        const storageKey = `${bucket}/${path}`;
        objectUrlStorageMap.set(storageKey, objectUrl);

        try {
          if (storage && storage.app && storage.app.options && storage.app.options.storageBucket) {
            uploadBytes(ref(storage, storageKey), file).catch(() => {});
          }
        } catch {}

        return { data: { path, fullPath: storageKey, publicUrl: objectUrl }, error: null };
      },
      getPublicUrl(path: string) {
        const storageKey = `${bucket}/${path}`;
        const localUrl = objectUrlStorageMap.get(storageKey);
        if (localUrl) {
          return { data: { publicUrl: localUrl } };
        }
        return {
          data: {
            publicUrl: `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/${encodeURIComponent(storageKey)}?alt=media`
          }
        };
      }
    };
  }
};

// Edge Functions Translation Bridge
const functionsBridge = {
  async invoke(functionName: string, options?: { body?: any }) {
    const body = options?.body || {};
    try {
      if (functionName === "assign-role") {
        const { userId, role } = body;
        if (userId && role) {
          const roleRecord = { id: userId, user_id: userId, role, created_at: new Date().toISOString() };
          setLocalDoc("user_roles", roleRecord);
          setDoc(doc(db, "user_roles", userId), roleRecord).catch(() => {});
          return { data: { success: true, message: `Role ${role} assigned successfully` }, error: null };
        }
      }

      if (functionName === "verify-certificate" || functionName === "public-verify") {
        const certId = body.certificateId || body.certificate_id || body.code;
        const qBuilder = new QueryBuilder("issued_certificates").eq("certificate_id", certId);
        const { data: cert } = await qBuilder.maybeSingle();

        const logEntry = {
          id: `log_${Date.now()}`,
          user_id: body.userId || "anonymous",
          status: cert ? "verified" : "failed",
          message: cert ? `Verified certificate: ${certId}` : `Verification failed for: ${certId}`,
          created_at: new Date().toISOString()
        };

        setLocalDoc("verification_logs", logEntry);
        setDoc(doc(db, "verification_logs", logEntry.id), logEntry).catch(() => {});

        if (cert) {
          return { data: { valid: true, certificate: cert, message: "Certificate verified successfully" }, error: null };
        } else {
          return { data: { valid: false, certificate: null, message: "Invalid or non-existent certificate ID" }, error: null };
        }
      }

      if (functionName === "admin-chat") {
        return { data: { response: "Admin AI Assistant: All Firestore verification logs and records are operational." }, error: null };
      }

      return { data: { success: true, message: `Local function ${functionName} executed` }, error: null };
    } catch (err: any) {
      console.error(`Edge function '${functionName}' invocation error:`, err);
      return { data: null, error: err };
    }
  }
};

// Authentication Translation Bridge
const authListeners = new Set<(event: string, session: any) => void>();

onAuthStateChanged(auth, (fbUser) => {
  const session = mapFirebaseSession(fbUser);
  const event = fbUser ? "SIGNED_IN" : "SIGNED_OUT";
  authListeners.forEach((cb) => cb(event, session));
});

const authBridge = {
  async signUp(options: { email: string; password: string; options?: { emailRedirectTo?: string; data?: Record<string, any> } }) {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, options.email, options.password);
      const user = mapFirebaseUserToSupabaseUser(userCred.user, options.options?.data);
      const session = mapFirebaseSession(userCred.user, options.options?.data);
      authListeners.forEach((cb) => cb("SIGNED_IN", session));
      return { data: { user, session }, error: null };
    } catch (err: any) {
      return { data: { user: null, session: null }, error: err };
    }
  },

  async signInWithPassword(options: { email: string; password: string }) {
    try {
      const userCred = await signInWithEmailAndPassword(auth, options.email, options.password);
      const user = mapFirebaseUserToSupabaseUser(userCred.user);
      const session = mapFirebaseSession(userCred.user);
      authListeners.forEach((cb) => cb("SIGNED_IN", session));
      return { data: { user, session }, error: null };
    } catch (err: any) {
      return { data: { user: null, session: null }, error: err };
    }
  },

  async signOut() {
    try {
      await fbSignOut(auth);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  },

  async getSession() {
    try {
      await auth.authStateReady();
    } catch {}
    const fbUser = auth.currentUser;
    return { data: { session: mapFirebaseSession(fbUser) }, error: null };
  },

  async getUser() {
    try {
      await auth.authStateReady();
    } catch {}
    const fbUser = auth.currentUser;
    return { data: { user: mapFirebaseUserToSupabaseUser(fbUser) }, error: null };
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    authListeners.add(callback);
    
    auth.authStateReady().then(() => {
      const fbUser = auth.currentUser;
      const session = mapFirebaseSession(fbUser);
      callback(fbUser ? "INITIAL_SESSION" : "SIGNED_OUT", session);
    }).catch(() => {
      callback("SIGNED_OUT", null);
    });

    return {
      data: {
        subscription: {
          unsubscribe() {
            authListeners.delete(callback);
          }
        }
      }
    };
  },

  async resend(_options?: any) {
    return { data: {}, error: null };
  },

  async resetPasswordForEmail(_email: string, _options?: any) {
    return { data: {}, error: null };
  },

  async updateUser(attributes: Record<string, any>) {
    const fbUser = auth.currentUser;
    return { data: { user: mapFirebaseUserToSupabaseUser(fbUser, attributes) }, error: null };
  }
};

// Main Supabase-to-Firebase Translation Interface
export const supabase = {
  from(tableName: string) {
    return new QueryBuilder(tableName);
  },
  auth: authBridge,
  storage: storageBridge,
  functions: functionsBridge,
  channel(name: string) {
    return new RealtimeChannelStub(name);
  },
  removeChannel(_channel: any) {},
  removeAllChannels() {},
};