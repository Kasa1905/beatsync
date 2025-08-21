export const formatTimeMicro = (timeMs: number): string => {
  const milliseconds = Math.floor(timeMs) % 1000;
  const seconds = Math.floor(timeMs / 1000) % 60;
  const minutes = Math.floor(timeMs / 60000);

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
};

/**
 * Format a timestamp for chat messages with contextual date information
 * Shows "Today", "Yesterday", or the date for older messages
 */
export const formatChatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (isYesterday) {
    return "Yesterday " + date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // For older dates, show the date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
