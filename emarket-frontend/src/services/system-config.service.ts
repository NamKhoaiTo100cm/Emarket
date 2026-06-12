import { apiFetch } from "@/lib/api";

export interface SystemConfig {
  key: string;
  value: string;
  updatedAt: string;
}

export const systemConfigService = {
  getConfigs: (): Promise<SystemConfig[]> => apiFetch("/system-config"),

  updateConfig: (key: string, value: string): Promise<SystemConfig> =>
    apiFetch(`/system-config/${key}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value }),
    }),
};
