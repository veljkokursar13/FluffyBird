import { useEffect, useState } from "react";

export function useLoading() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(id);
  }, []);
  return loading;
}