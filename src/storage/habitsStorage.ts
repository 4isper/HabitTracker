import { createMMKV } from 'react-native-mmkv';

import i18n from '../i18n';

import type { Habit } from '../types/habit';

const HABITS_STORAGE_KEY = 'habits';

const storage =  createMMKV();

export function loadHabits(): Habit[] {
  try {
    const raw = storage.getString(HABITS_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn(i18n.t('storage.loadFailed'), error);
    return [];
  }
}

export function saveHabits(habits: Habit[]): boolean {
  try {
    storage.set(HABITS_STORAGE_KEY, JSON.stringify(habits));
    return true;
  } catch (error) {
    console.warn(i18n.t('storage.saveFailed'), error);
    return false;
  }
}