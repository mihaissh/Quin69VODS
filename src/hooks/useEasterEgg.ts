/**
 * Custom hook for managing easter egg functionality
 */

import { useState, useEffect, useRef } from 'react';
import {
  EASTER_EGG_CLICKS,
  EASTER_EGG_DURATION_MS,
  EASTER_EGG_COOLDOWN_MS,
  EASTER_EGG_MESSAGES,
} from '@/constants';

interface UseEasterEggReturn {
  showEasterEgg: boolean;
  clickMessage: string | null;
  handlePlayButtonClick: () => void;
}

/**
 * Hook to manage easter egg click handling and cooldown
 */
export function useEasterEgg(): UseEasterEggReturn {
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [clickMessage, setClickMessage] = useState<string | null>(null);
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [cooldownMessageShown, setCooldownMessageShown] = useState(false);
  
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check cooldown timer
  useEffect(() => {
    if (cooldownEndTime) {
      const checkCooldown = () => {
        const now = Date.now();
        if (now >= cooldownEndTime) {
          setIsOnCooldown(false);
          setCooldownEndTime(null);
          setCooldownMessageShown(false); // Reset message flag when cooldown ends
        }
      };

      const interval = setInterval(checkCooldown, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldownEndTime]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      if (cooldownMessageTimeoutRef.current) {
        clearTimeout(cooldownMessageTimeoutRef.current);
      }
    };
  }, []);

  const handlePlayButtonClick = () => {
    // Ignore clicks while easter egg is showing
    if (showEasterEgg) {
      return;
    }

    // Check if on cooldown
    if (isOnCooldown) {
      // Show cooldown message only once, then nothing for the rest of the cooldown
      if (!cooldownMessageShown) {
        // Clear any existing cooldown message timeout
        if (cooldownMessageTimeoutRef.current) {
          clearTimeout(cooldownMessageTimeoutRef.current);
        }
        
        setClickMessage(EASTER_EGG_MESSAGES.COOLDOWN);
        setCooldownMessageShown(true);
        
        cooldownMessageTimeoutRef.current = setTimeout(() => {
          setClickMessage(null);
          cooldownMessageTimeoutRef.current = null;
        }, 2000);
      }
      // Do nothing if message was already shown
      return;
    }

    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    const remainingClicks = EASTER_EGG_CLICKS - newCount;

    if (remainingClicks > 0) {
      // Clear any existing message timeout before setting a new one
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      
      // Show countdown message
      setClickMessage(EASTER_EGG_MESSAGES.CLICK_MORE(remainingClicks));
      
      // Set new timeout and store reference
      messageTimeoutRef.current = setTimeout(() => {
        setClickMessage(null);
        messageTimeoutRef.current = null;
      }, 1500);
    } else if (newCount === EASTER_EGG_CLICKS) {
      // Clear any existing message timeout
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }
      
      // Trigger easter egg
      setShowEasterEgg(true);
      setClickCount(0);
      setClickMessage(null);
      
      setTimeout(() => {
        setShowEasterEgg(false);
        
        // Start cooldown
        setCooldownEndTime(Date.now() + EASTER_EGG_COOLDOWN_MS);
        setIsOnCooldown(true);
      }, EASTER_EGG_DURATION_MS);
    }
  };

  return {
    showEasterEgg,
    clickMessage,
    handlePlayButtonClick,
  };
}

