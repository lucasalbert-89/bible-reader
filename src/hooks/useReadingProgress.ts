import { useState, useEffect, useCallback } from 'react';
import { PlanId, ReadingMode } from '../types';
import { useAuth } from '../context/AuthContext';
import { fetchUserProgress, syncProgressToSupabase } from '../lib/supabase';
import { PLANS_INFO } from '../data/plansInfo';

export function useReadingProgress() {
  const { user } = useAuth();

  // Active plan selection
  const [selectedPlan, setSelectedPlanState] = useState<PlanId>(() => {
    const saved = localStorage.getItem('biblia_active_plan');
    if (saved === 'plano-365' || saved === 'plano-180' || saved === 'plano-90') {
      return saved;
    }
    return 'plano-365';
  });

  // Reading mode: 'misto' (AT + Salmos/Provérbios + NT) or 'sequencial' (Gênesis a Apocalipse direto)
  const [readingMode, setReadingModeState] = useState<ReadingMode>(() => {
    const saved = localStorage.getItem('biblia_reading_mode');
    if (saved === 'misto' || saved === 'sequencial') {
      return saved;
    }
    return 'misto';
  });

  const setReadingMode = (mode: ReadingMode) => {
    setReadingModeState(mode);
    localStorage.setItem('biblia_reading_mode', mode);
  };

  // Completed days for the active plan
  const [completedDays, setCompletedDays] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(`biblia_completed_${selectedPlan}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedWithCloud, setSyncedWithCloud] = useState(false);

  // Switch plan
  const setSelectedPlan = (planId: PlanId) => {
    setSelectedPlanState(planId);
    localStorage.setItem('biblia_active_plan', planId);
    
    // Load that plan's local progress immediately
    try {
      const saved = localStorage.getItem(`biblia_completed_${planId}`);
      setCompletedDays(saved ? JSON.parse(saved) : []);
    } catch {
      setCompletedDays([]);
    }
  };

  // Sync with Supabase on auth change or plan change
  useEffect(() => {
    let isMounted = true;

    async function loadCloudProgress() {
      if (!user) {
        setSyncedWithCloud(false);
        return;
      }

      setIsSyncing(true);
      try {
        const cloudDays = await fetchUserProgress(user.id, selectedPlan);

        if (!isMounted) return;

        // Get local days
        const localSaved = localStorage.getItem(`biblia_completed_${selectedPlan}`);
        const localDays: number[] = localSaved ? JSON.parse(localSaved) : [];

        if (cloudDays !== null) {
          // Merge local and cloud days so no progress is lost
          const merged = Array.from(new Set([...cloudDays, ...localDays])).sort((a, b) => a - b);
          setCompletedDays(merged);
          localStorage.setItem(`biblia_completed_${selectedPlan}`, JSON.stringify(merged));

          // If there were local days not yet in cloud, push merged back to cloud
          if (merged.length !== cloudDays.length) {
            await syncProgressToSupabase(user.id, selectedPlan, merged);
          }
          setSyncedWithCloud(true);
        } else if (localDays.length > 0) {
          // No cloud record yet, but user has local progress: push local to cloud
          await syncProgressToSupabase(user.id, selectedPlan, localDays);
          setSyncedWithCloud(true);
        }
      } catch (err) {
        console.error('Erro na sincronização de progresso:', err);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    }

    loadCloudProgress();

    return () => {
      isMounted = false;
    };
  }, [user, selectedPlan]);

  // Toggle a day (mark completed or uncomplete)
  const toggleDay = useCallback(async (dayNumber: number) => {
    setCompletedDays((prev) => {
      const exists = prev.includes(dayNumber);
      const updated = exists ? prev.filter((d) => d !== dayNumber) : [...prev, dayNumber].sort((a, b) => a - b);

      // Save locally immediately
      localStorage.setItem(`biblia_completed_${selectedPlan}`, JSON.stringify(updated));

      // If logged in, sync to Supabase in background
      if (user) {
        setIsSyncing(true);
        syncProgressToSupabase(user.id, selectedPlan, updated, dayNumber)
          .then((success) => {
            if (success) setSyncedWithCloud(true);
          })
          .finally(() => {
            setIsSyncing(false);
          });
      }

      return updated;
    });
  }, [selectedPlan, user]);

  const isDayCompleted = useCallback((dayNumber: number) => {
    return completedDays.includes(dayNumber);
  }, [completedDays]);

  const currentPlanInfo = PLANS_INFO.find((p) => p.id === selectedPlan) || PLANS_INFO[0];
  const totalDays = currentPlanInfo.totalDays;
  const progressPercentage = Math.round((completedDays.length / totalDays) * 100);

  return {
    selectedPlan,
    setSelectedPlan,
    readingMode,
    setReadingMode,
    currentPlanInfo,
    completedDays,
    toggleDay,
    isDayCompleted,
    totalDays,
    progressPercentage,
    isSyncing,
    syncedWithCloud,
    isGuest: !user,
  };
}
