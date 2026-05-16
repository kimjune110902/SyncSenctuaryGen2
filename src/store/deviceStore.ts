import { create } from 'zustand';

export interface DeviceInfo {
  id: string;
  name: string;
  type: string;
}

export interface DeviceWarning {
  deviceId: string;
  deviceName: string;
  message: string;
}

interface DeviceStore {
  warnings: DeviceWarning[];

  addWarning: (warning: DeviceWarning) => void;
  removeWarning: (deviceId: string) => void;
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  warnings: [],

  addWarning: (warning) => set((state) => ({
    warnings: [...state.warnings.filter(w => w.deviceId !== warning.deviceId), warning]
  })),

  removeWarning: (deviceId) => set((state) => ({
    warnings: state.warnings.filter(w => w.deviceId !== deviceId)
  })),
}));
