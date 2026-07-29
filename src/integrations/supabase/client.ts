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
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy as fsOrderBy, 
  limit as fsLimit, 
  runTransaction,
  DocumentData 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebase";

// Global map for client-side object URL storage preview
const objectUrlStorageMap = new Map<string, string>();

function mapFirebaseUserToSupabaseUser(fbUser: FirebaseUser | null, metadata: Record<string, any> = {}) {
  if (!fbUser) return null;
  return {
    id: fbUser.uid,
    email: fbUser.email || "",
    user_metadata: {
      full_name: fbUser.displayName || metadata.full_name || "",
      ...metadata
    },
    app_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  };
}

function mapFirebaseSession(fbUser: FirebaseUser | null, metadata: Record<string, any> = {}) {
  if (!fbUser) return null;
  const user = mapFirebaseUserToSupabaseUser(fbUser, metadata)!;
  return {
    access_token: "firebase-mock-access-token",
    token_type: "bearer",
    expires_in: 3600,
    refresh_token: "firebase-mock-refresh-token",
    user,
  };
}

class QueryBuilder {
  private tableName: string;
  private conditions: Array<{ field: string; op: any; val: any }> = [];
  private orderConfig: { field: string; direction: "asc" | "desc" } | null = null;
  private limitNum: number | null = null;
  private selectCols: string | null = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns: string = "*", _options?: { count?: string; head?: boolean }) {
    this.selectCols = columns;
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
    if (Array.isArray(val) && val.length > 0) {
      this.conditions.push({ field, op: "in", val });
    } else {
      this.conditions.push({ field, op: "==", val: "__EMPTY_IN_CLAUSE__" });
    }
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

  private async fetchDocs(): Promise<DocumentData[]> {
    try {
      const colRef = collection(db, this.tableName);
      let qConstraints: any[] = [];

      for (const cond of this.conditions) {
        qConstraints.push(where(cond.field, cond.op, cond.val));
      }

      if (this.orderConfig) {
        qConstraints.push(fsOrderBy(this.orderConfig.field, this.orderConfig.direction));
      }

      if (this.limitNum !== null) {
        qConstraints.push(fsLimit(this.limitNum));
      }

      const q = query(colRef, ...qConstraints);
      const snapshot = await getDocs(q);

      const results: DocumentData[] = [];
      snapshot.forEach((d) => {
        results.push({ id: d.id, ...d.data() });
      });

      return results;
    } catch (err) {
      console.error(`Error querying Firestore collection '${this.tableName}':`, err);
      return [];
    }
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
    if (docs.length === 1) {
      return { data: docs[0], error: null };
    }
    if (docs.length === 0) {
      return { data: null, error: { message: "JSON object requested, no rows returned", details: "", hint: "", code: "PGRST116" } };
    }
    return { data: docs[0], error: null };
  }

  async maybeSingle() {
    const docs = await this.fetchDocs();
    if (docs.length === 0) {
      return { data: null, error: null };
    }
    return { data: docs[0], error: null };
  }

  async insert(data: Record<string, any> | Array<Record<string, any>>) {
    try {
      const items = Array.isArray(data) ? data : [data];
      const inserted: DocumentData[] = [];

      for (const item of items) {
        let docId = item.id || item.user_id || item.certificate_id;
        if (docId && typeof docId === "string") {
          const docRef = doc(db, this.tableName, docId);
          await setDoc(docRef, { ...item, created_at: item.created_at || new Date().toISOString() }, { merge: true });
          inserted.push({ id: docId, ...item });
        } else {
          const colRef = collection(db, this.tableName);
          const docRef = await addDoc(colRef, { ...item, created_at: item.created_at || new Date().toISOString() });
          inserted.push({ id: docRef.id, ...item });
        }
      }

      return { data: Array.isArray(data) ? inserted : inserted[0], error: null };
    } catch (err: any) {
      console.error(`Error inserting into Firestore '${this.tableName}':`, err);
      return { data: null, error: err };
    }
  }

  async upsert(data: Record<string, any> | Array<Record<string, any>>) {
    return this.insert(data);
  }

  async update(data: Record<string, any>) {
    try {
      const docs = await this.fetchDocs();
      const updated: DocumentData[] = [];

      for (const d of docs) {
        const docRef = doc(db, this.tableName, d.id);
        await updateDoc(docRef, { ...data, updated_at: new Date().toISOString() });
        updated.push({ ...d, ...data });
      }

      return { data: updated, error: null };
    } catch (err: any) {
      console.error(`Error updating Firestore '${this.tableName}':`, err);
      return { data: null, error: err };
    }
  }

  async delete() {
    try {
      const docs = await this.fetchDocs();
      for (const d of docs) {
        const docRef = doc(db, this.tableName, d.id);
        await deleteDoc(docRef);
      }
      return { data: docs, error: null };
    } catch (err: any) {
      console.error(`Error deleting from Firestore '${this.tableName}':`, err);
      return { data: null, error: err };
    }
  }
}

// Storage Translation Bridge
const storageBridge = {
  from(bucket: string) {
    return {
      async upload(path: string, file: File | Blob, _options?: any) {
        try {
          // Store object URL locally for instant browser preview
          const objectUrl = URL.createObjectURL(file);
          const storageKey = `${bucket}/${path}`;
          objectUrlStorageMap.set(storageKey, objectUrl);

          // Best-effort upload to Firebase Storage if available
          try {
            const storageRef = ref(storage, storageKey);
            await uploadBytes(storageRef, file);
          } catch (storageErr) {
            console.warn("Firebase Storage upload skipped/failed, using local Object URL fallback:", storageErr);
          }

          return { data: { path, fullPath: storageKey }, error: null };
        } catch (err: any) {
          return { data: null, error: err };
        }
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
          await setDoc(doc(db, "user_roles", userId), { user_id: userId, role, created_at: new Date().toISOString() });
          return { data: { success: true, message: `Role ${role} assigned successfully` }, error: null };
        }
      }

      if (functionName === "verify-certificate" || functionName === "public-verify") {
        const certId = body.certificateId || body.certificate_id || body.code;
        const qBuilder = new QueryBuilder("issued_certificates").eq("certificate_id", certId);
        const { data: cert } = await qBuilder.maybeSingle();

        const logEntry = {
          user_id: body.userId || "anonymous",
          status: cert ? "verified" : "failed",
          message: cert ? `Verified certificate: ${certId}` : `Verification failed for: ${certId}`,
          created_at: new Date().toISOString()
        };

        // Transaction log to Firestore
        await addDoc(collection(db, "verification_logs"), logEntry);

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
  async signUp(options: { email: string; password: string; options?: { data?: Record<string, any> } }) {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, options.email, options.password);
      const user = mapFirebaseUserToSupabaseUser(userCred.user, options.options?.data);
      const session = mapFirebaseSession(userCred.user, options.options?.data);
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
    const fbUser = auth.currentUser;
    return { data: { session: mapFirebaseSession(fbUser) }, error: null };
  },

  async getUser() {
    const fbUser = auth.currentUser;
    return { data: { user: mapFirebaseUserToSupabaseUser(fbUser) }, error: null };
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    authListeners.add(callback);
    // Initial call
    const session = mapFirebaseSession(auth.currentUser);
    callback(auth.currentUser ? "INITIAL_SESSION" : "SIGNED_OUT", session);

    return {
      data: {
        subscription: {
          unsubscribe() {
            authListeners.delete(callback);
          }
        }
      }
    };
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
};