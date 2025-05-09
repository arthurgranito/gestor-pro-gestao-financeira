import { createContext, useContext, useEffect, useState } from "react";

// Definindo o contexto do ThemeProvider
const ThemeProviderContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("system");

  // Função para verificar o tema do sistema
  const getSystemTheme = () => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? "dark"
      : "light";
  };

  // Efeito para aplicar o tema, baseado no estado ou no tema do sistema
  useEffect(() => {
    const root = document.documentElement;

    // Definir o tema baseado no estado ou no sistema
    if (theme === "system") {
      const systemTheme = getSystemTheme();
      root.classList.remove("dark", "light");
      root.classList.add(systemTheme);
    } else {
      root.classList.remove("dark", "light");
      root.classList.add(theme);
    }

    // Armazenar o tema no localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Recupera o tema do localStorage, caso tenha sido salvo
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme("system");
    }
  }, []);

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// Hook para acessar o contexto do tema
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
