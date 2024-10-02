import { useState, useCallback, useEffect } from 'react';

export const useActionQueue = () => {
  const [actionQueue, setActionQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addAction = useCallback((action) => {
    setActionQueue(queue => [...queue, action]);
  }, []);

  const processNextAction = useCallback(() => {
    setActionQueue(queue => {
      if (queue.length === 0) {
        setIsProcessing(false);
        return queue;
      }

      const [nextAction, ...remainingActions] = queue;
      nextAction();
      
      if (remainingActions.length === 0) {
        setIsProcessing(false);
      }

      return remainingActions;
    });
  }, []);

  useEffect(() => {
    if (actionQueue.length > 0 && !isProcessing) {
      setIsProcessing(true);
      processNextAction();
    }
  }, [actionQueue, isProcessing, processNextAction]);

  return addAction;
};