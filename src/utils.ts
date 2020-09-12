import { useEffect } from 'react';

export const useAsyncEffect = (effect: () => Promise<any>, deps: any[]) => useEffect(() => { effect(); }, deps);
