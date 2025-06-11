import React, { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      setAuthChecked(true);
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL}/auth/check-auth`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(data.loggedIn === true);
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => {
        setAuthChecked(true);
      });
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    checkAuth();
  };

  const logout = () => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        }
      })
      .catch((err) => console.error("Logout error:", err));
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, authChecked, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
