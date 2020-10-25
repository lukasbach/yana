import { SettingsObject } from '../../settings/types';
import React, { useContext } from 'react';

export interface SettingsContextValue {
  settings: SettingsObject;
  changeSettings: (changed: Partial<SettingsObject>) => void;
  createStringHandler: (key: keyof SettingsObject) => (value: string) => void;
  createBooleanHandler: (key: keyof SettingsObject) => (value: boolean | string) => void;
  createIntHandler: (key: keyof SettingsObject) => (value: number | string) => void;
  createFloatHandler: (key: keyof SettingsObject) => (value: number | string) => void;
  dirty: boolean;
  save: () => Promise<void>;
}

export const SettingsContext = React.createContext<SettingsContextValue>(null as any);

export const useSettingsPageContext = () => useContext(SettingsContext);
