
import { useState, useEffect } from 'react';
import { pipe } from '@screenpipe/browser';

export function useScreenpipeRealtime() {
  const [events, setEvents] = useState<any[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let isComponentMounted = true;

    async function streamEvents() {
      try {
        for await (const event of pipe.streamVision(true)) {
          if (!isComponentMounted || !isActive) break;
          setEvents(prev => [event, ...prev.slice(0, 49)]);
        }
      } catch (error) {
        console.error('Screenpipe streaming error:', error);
      }
    }

    if (isActive) {
      streamEvents();
    }

    return () => {
      isComponentMounted = false;
    };
  }, [isActive]);

  return {
    events,
    isStreaming: isActive,
    toggleStreaming: () => setIsActive(prev => !prev),
  };
}
