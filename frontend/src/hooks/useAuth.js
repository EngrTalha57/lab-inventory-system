import { useEffect, useState } from "react";
import authManager from "../utils/auth";

export const useAuth = () => {
  const [state, setState] = useState({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const unsubscribe = authManager.subscribe(setState);
    authManager.init();
    return unsubscribe;
  }, []);

  return {
    ...state,
    logout: () => authManager.logout(),
  };
};
