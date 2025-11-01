import axios from "axios";
import { create } from "zustand";

export type Credential = {
  id?: number;
  platform?: string | null;
  createdAt?: string | null;
  ok?: boolean;
};

export interface CredState {
  id: number | null;
  platform: string | null;
  data: string | null;
  createdAt: string | null;
  success: boolean;
  credentialsMetaData: Pick<Credential, "createdAt" | "platform" | "id">[];
  isLoading: boolean;
  error: string | null;
  createCredentials: (name: string, credential: unknown) => Promise<boolean>;
  getAllCredentialsMetaData: () => Promise<Credential[]>;
  getDecryptedCredential: (id: number) => Promise<any>;
  deleteCredential: (platform: string) => Promise<boolean>; // <-- NEW
}

export const useCredStore = create<CredState>((set, get): CredState => ({
  id: null,
  platform: null,
  data: null,
  createdAt: null,
  success: false,
  credentialsMetaData: [],
  isLoading: false,
  error: null,

  createCredentials: async (name, credential) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const baseURL =
        import.meta.env.VITE_URL_REACT_APP_API_URL ?? "http://localhost:3000";

      const res = await axios.post<{ message?: Credential }>(
        `${baseURL}/api/v1/credential/`,
        { name, credential },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          timeout: 10000,
        }
      );
      console.log(res);
      const msg = res.data?.message ?? null;
      const ok = Boolean(msg?.ok ?? false);

      const current = get().credentialsMetaData ?? [];

      let nextMeta = current;
      if (msg?.id != null) {
        const exists = current.some((c) => c.id === msg.id);

        const newMetaItem = {
          id: msg.id,
          platform: msg.platform ?? null,
          createdAt: msg.createdAt ?? null,
        };

        nextMeta = exists
          ? current.map((c) => (c.id === msg.id ? newMetaItem : c))
          : [...current, newMetaItem];
      }

      set({
        id: msg?.id ?? get().id,
        platform: msg?.platform ?? get().platform,
        createdAt: msg?.createdAt ?? get().createdAt,
        credentialsMetaData: nextMeta,
        success: ok,
        error: null,
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("createCredentials:", message);
      set({ success: false, isLoading: false, error: message });
      return false;
    }
  },

  getAllCredentialsMetaData: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const baseURL =
        import.meta.env.VITE_REACT_APP_API_URL ?? "http://localhost:3000";
      const res = await axios.get<{
        value: Pick<Credential, "id" | "platform" | "createdAt">[];
      }>(`${baseURL}/api/v1/credential`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      set({ isLoading: false, credentialsMetaData: res.data.value });
      return res.data.value;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const Error = error.response?.data?.error;
        console.log(Error);
        set({
          success: false,
          isLoading: false,
          error: "error while fetching all credentials",
        });
      } else {
        console.error("error while fetching all credentials", error);
        set({
          success: false,
          isLoading: false,
          error: "error while fetching all credentials",
        });
      }
      return [];
    }
  },

  getDecryptedCredential: async (id: number) => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const baseURL =
        import.meta.env.VITE_REACT_APP_API_URL ?? "http://localhost:3000";

      const res = await axios.get(`${baseURL}/api/v1/credential/decrypted/${id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const cred = res.data?.value ?? null;

      if (cred) {
        set({
          id: id,
          success: true,
          error: null,
        });
      } else {
        set({ success: false });
      }
      console.log(cred);
      return cred;
    } catch (err: unknown) {
      let message = "Error while fetching credential";
      if (axios.isAxiosError<{ error?: string; message?: string }>(err)) {
        message =
          err.response?.data?.message ??
          err.response?.data?.error ??
          err.message ??
          message;
        console.error("API error:", err.response?.status, err.response?.data);
      } else {
        console.error("Unknown error:", err);
      }

      set({ success: false, error: message });
      return null;
    }
  },

  deleteCredential: async (platform: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const baseURL =
        import.meta.env.VITE_REACT_APP_API_URL ?? "http://localhost:3000";

      
      const url = `${baseURL}/api/v1/credential/delete?platform=${encodeURIComponent(
        platform
      )}`;

      const res = await axios.delete(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        timeout: 10000,
      });

      const current = get().credentialsMetaData ?? [];
      const nextMeta = current.filter((c) => c.platform !== platform);

      set({
        credentialsMetaData: nextMeta,
        success: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err: unknown) {
      let message = "Error while deleting credential";
      if (axios.isAxiosError(err)) {
        message =
          err.response?.data?.message ??
          err.response?.data?.error ??
          err.message ??
          message;
        console.error("API error:", err.response?.status, err.response?.data);
      } else {
        console.error("Unknown error:", err);
      }
      set({ success: false, isLoading: false, error: message });
      return false;
    }
  },
}));
