

export function getUserFromToken() {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
  } catch (err) {
    return null;
  }
}