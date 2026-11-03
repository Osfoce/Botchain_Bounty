export const safeExternalUrl = (value, { httpsOnly = false } = {}) => {
  if (typeof value !== "string" || !value.trim()) return "";

  try {
    const url = new URL(value.trim());
    const allowedProtocols = httpsOnly ? ["https:"] : ["http:", "https:"];
    if (
      !allowedProtocols.includes(url.protocol) ||
      url.username ||
      url.password
    ) {
      return "";
    }
    return url.href;
  } catch {
    return "";
  }
};
