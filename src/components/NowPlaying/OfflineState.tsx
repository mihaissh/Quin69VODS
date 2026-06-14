'use client';

import Image from 'next/image';
import { ASSETS, OFFLINE_MESSAGES } from '@/constants';
import { InfoField } from './InfoField';

/**
 * Get rotating offline message
 */
const getRotatingMessage = (messages: typeof OFFLINE_MESSAGES) => {
  const messageIndex = Math.floor(Date.now() / 60000) % messages.length;
  return messages[messageIndex];
};

/**
 * Offline state component
 */
export function OfflineState() {
  const message = getRotatingMessage(OFFLINE_MESSAGES);
  const getAssetPath = (filename: string): string => {
    return `${ASSETS.BASE_PATH}/${filename}`;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-shrink-0 mx-auto sm:mx-0">
        <div className="relative h-52 w-52 overflow-hidden rounded-lg shadow-lg">
          <Image
            src={getAssetPath(ASSETS.BEDGE_EMOTE)}
            alt="Bedge"
            fill
            sizes="208px"
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="space-y-2 text-center sm:text-left">
          <InfoField 
            label="Status" 
            value={message.title} 
            labelColor="text-[var(--color-live)]"
          />
          <div>
            <span className="text-[var(--color-live)] text-[10px] font-medium uppercase tracking-wide block mb-1">
              Activity
            </span>
            <p className="text-base font-semibold text-[var(--color-text-secondary)] leading-tight">
              {message.subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

