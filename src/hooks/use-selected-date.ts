import createContextHook from '@/utils/create-context-hook';
import { useCallback, useMemo, useState } from 'react';

function formatISO(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  return d.toISOString().split('T')[0];
}

export const [SelectedDateProvider, useSelectedDate] = createContextHook(() => {
  const [selectedDate, setSelectedDate] = useState<string>(formatISO(new Date()));

  const goTo = useCallback((iso: string) => {
    if (!iso?.match(/^\d{4}-\d{2}-\d{2}$/)) return;
    setSelectedDate(iso);
  }, []);

  const addDays = useCallback((days: number) => {
    const [y, m, d] = selectedDate.split('-').map(n => parseInt(n, 10));
    const next = new Date(Date.UTC(y, (m - 1), d));
    next.setUTCDate(next.getUTCDate() + days);
    setSelectedDate(formatISO(next));
  }, [selectedDate]);

  const goPrevDay = useCallback(() => addDays(-1), [addDays]);
  const goNextDay = useCallback(() => addDays(1), [addDays]);

  return useMemo(() => ({ selectedDate, goTo, goPrevDay, goNextDay }), [selectedDate, goTo, goPrevDay, goNextDay]);
});

