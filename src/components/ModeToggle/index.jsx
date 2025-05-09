import React from 'react'
import { Button } from '../ui/button';
import { MoonIcon, Sun } from 'lucide-react';
import { useTheme } from '../theme-provider';

const ModeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light")
    } else{
      setTheme("dark")
    }
  }

    return (
        <Button onClick={toggleTheme} className="w-full lg:w-9 sm: cursor-pointer">
            {theme === "dark" ? <Sun className="text-white"/> : <MoonIcon className="text-white"/>}
        </Button>
)
}

export default ModeToggle