export const validatePartialRoomId = (roomId: string) => {
  return /^[a-zA-Z0-9]*$/.test(roomId);
};

export const validateFullRoomId = (roomId: string) => {
  // Allow alphanumeric room IDs with 3-12 characters for testing flexibility
  return /^[a-zA-Z0-9]{3,12}$/.test(roomId);
};

export const createUserId = () => {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  } else {
    // Fallback for insecure contexts
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
};
