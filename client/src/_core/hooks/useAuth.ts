import { useState, useEffect } from "react";

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);

  useEffect(() => {
    setLoading(false);
    setUser(null);
  }, []);

  const logout = () => {
    setUser(null);
  };

  return { user, loading, logout };
}
