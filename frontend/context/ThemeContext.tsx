import React,{createContext, useContext, useState, ReactNode} from "react";
import { Theme , ThemeContextType} from "@/types/themeContextType";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({children} : {children:ReactNode}) =>{
    const [theme,setTheme] = useState<Theme>("light");

    const toggleTheme = ()=>{
        setTheme((prev) => (prev==="light" ? "dark" : "light"))
    };

    return(
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }
  return context;
};

