import { createContext, useState, useCallback, ReactNode } from "react";

export interface UserContextType {
  isSignedIn: boolean;
  userEmail: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const signIn = useCallback(
    async (email: string, password: string): Promise<void> => {
      // Demo implementation - in production, this would call your backend API
      if (!email.trim() || !password.trim()) {
        throw new Error("Email and password are required");
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Demo: accept any valid email/password combination
      console.log("[ZKTanitID] User signed in:", email);
      setIsSignedIn(true);
      setUserEmail(email);
    },
    [],
  );

  const signOut = useCallback(() => {
    console.log("[ZKTanitID] User signed out");
    setIsSignedIn(false);
    setUserEmail(null);
  }, []);

  const value: UserContextType = {
    isSignedIn,
    userEmail,
    signIn,
    signOut,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
