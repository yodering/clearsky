export const validateIdentifier = (identifier: string): boolean => {
  // Handle format: username.bsky.social or username@domain.com
  const handleRegex = /^[a-zA-Z0-9_.]+(@[a-zA-Z0-9]+\.[a-zA-Z0-9]+)?$/;
  return handleRegex.test(identifier);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().toLowerCase();
};