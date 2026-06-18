import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { canAccessValidacoesTab } from '@/features/aprovacoes/approval-roles';
import { fetchPendingApprovalCount } from '@/features/aprovacoes/pending-counts';
import { useAuthRole } from '@/hooks/use-auth-role';

export function usePendingApprovalCount(): number {
  const { role } = useAuthRole();
  const [count, setCount] = useState(0);

  const loadCount = useCallback(async () => {
    if (!canAccessValidacoesTab(role)) {
      setCount(0);
      return;
    }

    try {
      const pending = await fetchPendingApprovalCount(role);
      setCount(pending);
    } catch {
      setCount(0);
    }
  }, [role]);

  useFocusEffect(
    useCallback(() => {
      void loadCount();
    }, [loadCount]),
  );

  return count;
}
