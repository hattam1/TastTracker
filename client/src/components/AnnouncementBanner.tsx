import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAnnouncements } from '../hooks/announcement-provider';

export default function AnnouncementBanner() {
  const { currentAnnouncement } = useAnnouncements();
  const [dismissed, setDismissed] = useState(false);

  if (!currentAnnouncement || dismissed) {
    return null;
  }

  return (
    <div className="bg-primary/90 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 text-sm md:text-base">
          {currentAnnouncement.content}
        </div>
        <button
          type="button"
          className="ml-3 flex-shrink-0 p-1.5 rounded-md text-white hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-white"
          onClick={() => setDismissed(true)}
        >
          <span className="sr-only">Dismiss</span>
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}