import React, { createContext, useContext, useState, useEffect } from "react";

type UserRole = "guest" | "osis" | "operator";

interface AuthContextType {
  role: UserRole;
  login: (role: "osis" | "operator") => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>("guest");

  useEffect(() => {
    const storedRole = localStorage.getItem("user_role") as UserRole;
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const login = (newRole: "osis" | "operator") => {
    setRole(newRole);
    localStorage.setItem("user_role", newRole);
  };

  const logout = () => {
    setRole("guest");
    localStorage.removeItem("user_role");
  };

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
