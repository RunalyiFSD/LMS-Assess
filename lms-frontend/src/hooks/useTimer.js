import { useState, useEffect, useRef } from 'react';

/**
 * Custom countdown timer hook.
 * @param {number} initialSeconds - Initial timer countdown length
 * @param {Function} onExpire - Callback triggered when timer runs out
 * @returns {Object} { timeLeft, isExpired, formatTime }
 */
export const useTimer = (initialSeconds, onExpire) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isExpired, setIsExpired] = useState(false);
  const hasTriggeredExpire = useRef(false);

  // Keep track of the expire callback ref
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Sync timeLeft when initialSeconds changes (e.g., when API loading completes)
  useEffect(() => {
    if (initialSeconds > 0) {
      setTimeLeft(initialSeconds);
      setIsExpired(false);
      hasTriggeredExpire.current = false;
    } else if (initialSeconds === 0) {
      setTimeLeft(0);
      setIsExpired(true);
    }
  }, [initialSeconds]);

  // Manage countdown interval safely
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      if (!hasTriggeredExpire.current) {
        hasTriggeredExpire.current = true;
        if (onExpireRef.current) onExpireRef.current();
      }
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setIsExpired(true);
          if (!hasTriggeredExpire.current) {
            hasTriggeredExpire.current = true;
            if (onExpireRef.current) onExpireRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft > 0]); // Runs only when active state flips (static during countdown)

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return { timeLeft, isExpired, formatTime };
};
