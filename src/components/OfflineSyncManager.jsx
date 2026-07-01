import React, { useEffect, useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useToast } from '../context/ToastContext';
import { supabase } from '../scripts/supabaseClient';
import { useAuth } from '../context/AuthProvider';

export const OfflineSyncManager = () => {
  const isOnline = useOnlineStatus();
  const { addToast } = useToast();
  const { user, userRole } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const syncOfflineScores = async () => {
      if (!isOnline || isSyncing) return;

      const queueRaw = localStorage.getItem('ltta-offline-scores');
      if (!queueRaw) return;

      let queue = [];
      try {
        queue = JSON.parse(queueRaw);
      } catch (e) {
        console.error('Failed to parse offline queue', e);
        localStorage.removeItem('ltta-offline-scores');
        return;
      }

      if (queue.length === 0) return;

      setIsSyncing(true);
      addToast(`Syncing ${queue.length} offline score(s)...`, 'info');

      let successCount = 0;
      let remainingQueue = [...queue];

      for (const item of queue) {
        try {
          const { payload, existingScoreId, updateData, matchId, home_team_number, userTeamNumber } = item;

          if (existingScoreId) {
            const { error: lineError } = await supabase
              .from('line_results')
              .update(payload)
              .eq('id', existingScoreId);
            if (lineError) throw lineError;
          } else {
            const { error: lineError } = await supabase
              .from('line_results')
              .insert([payload]);
            if (lineError) throw lineError;
          }

          const { error: matchError } = await supabase
            .from('team_match')
            .update(updateData)
            .eq('id', matchId);

          if (matchError) throw matchError;

          successCount++;
          remainingQueue = remainingQueue.filter((q) => q !== item);
        } catch (error) {
          console.error('Error syncing score:', error);
          if (error.message?.includes('JWT') || error.message?.includes('expired')) {
              addToast('Session expired. Please log in again to sync scores.', 'error');
              break; // Stop syncing and wait for re-login
          }
        }
      }

      localStorage.setItem('ltta-offline-scores', JSON.stringify(remainingQueue));
      setIsSyncing(false);

      if (successCount > 0) {
        addToast(`Successfully synced ${successCount} score(s).`, 'success');
      }
      if (remainingQueue.length > 0) {
          addToast(`Failed to sync ${remainingQueue.length} score(s). Will retry later.`, 'error');
      }
    };

    syncOfflineScores();
  }, [isOnline, addToast, user]); // Removed isSyncing from dependencies to prevent infinite loops on error

  return null;
};
