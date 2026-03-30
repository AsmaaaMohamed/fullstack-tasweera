"use client";

import React from "react";
import Image from "next/image";

function Email({
  senderName,
  initials,
  message,
  date,
  isFromCurrentUser,
  messageId,
  onDelete,
}) {
  return (
    <div className="flex flex-col gap-2 py-3 sm:py-4 w-full">
      {/* Header Row: Avatar + Name on Left, Date + Delete on Right */}
      <div className="flex items-center justify-between w-full">
        {/* Left: Avatar + Name */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#E6A525] flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
              {initials}
            </div>
          </div>
          <div className="text-sm sm:text-base font-semibold text-gray-900 dark:!text-white">
            {senderName}
          </div>
        </div>

        {/* Right: Date + Delete */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-xs sm:text-sm text-gray-400 whitespace-nowrap flex-shrink-0 dark:!text-gray-400">
            {date}
          </div>
          {isFromCurrentUser && onDelete && (
            <button
              onClick={() => onDelete(messageId)}
              className="flex items-center justify-center hover:opacity-70 transition-opacity"
              aria-label="Delete message"
            >
              <Image
                src="/user/profile/sidebar/trash.svg"
                alt="Delete"
                width={16}
                height={16}
                className="brightness-0 opacity-50"
              />
            </button>
          )}
        </div>
      </div>

      {/* Content Row: Message beneath */}
      {/* Indent message to align with name (avatar width + gap) if desired, or just keep it simple block. 
          User said "under them the layout as it is right now", usually implies under the *name*.
          Avatar (8 or 10) + Gap (2 or 3).
          w-8 is 2rem, gap-2 is 0.5rem. ~2.5rem padding.
      */}
      <div className="pl-10 sm:pl-14 text-sm sm:text-base text-gray-500 leading-relaxed dark:!text-gray-300">
        {message}
      </div>
    </div>
  );
}

export default Email;
