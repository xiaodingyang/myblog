import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useLocation } from 'umi';

export type AiAppleCtx = { id: string | null; title: string | null };

type AiAppleValue = {
  open: boolean;
  ctx: AiAppleCtx;
  openAssistant: (payload?: Partial<AiAppleCtx>) => void;
  closeAssistant: () => void;
};

const AiAppleContext = createContext<AiAppleValue | null>(null);

export const AiAppleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [ctx, setCtx] = useState<AiAppleCtx>({ id: null, title: null });

  const pathnameArticleId = useMemo(() => {
    const m = location.pathname.match(/^\/article\/([^/]+)\/?$/);
    return m ? m[1] : null;
  }, [location.pathname]);

  const openAssistant = useCallback(
    (payload?: Partial<AiAppleCtx>) => {
      setCtx({
        id: payload?.id !== undefined ? payload.id : pathnameArticleId,
        title: payload?.title !== undefined ? payload.title : null,
      });
      setOpen(true);
    },
    [pathnameArticleId],
  );

  const closeAssistant = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({ open, ctx, openAssistant, closeAssistant }),
    [open, ctx, openAssistant, closeAssistant],
  );

  return <AiAppleContext.Provider value={value}>{children}</AiAppleContext.Provider>;
};

export function useAiApple(): AiAppleValue {
  const v = useContext(AiAppleContext);
  if (!v) {
    throw new Error('useAiApple must be used within AiAppleProvider');
  }
  return v;
}
