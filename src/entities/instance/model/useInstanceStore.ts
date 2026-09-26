import { create } from "zustand";

interface InstanceState {
  idInstance: string | null;
  apiTokenInstance: string | null;
  setCredentials: (data: {
    idInstance: string;
    apiTokenInstance: string;
  }) => void;
  clearCredentials: () => void;
}

export const useInstanceStore = create<InstanceState>((set) => ({
  idInstance: null,
  apiTokenInstance: null,
  setCredentials: (data) =>
    set({
      idInstance: data.idInstance,
      apiTokenInstance: data.apiTokenInstance,
    }),
  clearCredentials: () => set({ idInstance: null, apiTokenInstance: null }),
}));
