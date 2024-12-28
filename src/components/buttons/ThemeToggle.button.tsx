"use client";
import { useEffect, useState } from "react";
import { Tooltip } from "antd";
/*icons*/
import { IoSunny } from "react-icons/io5";
import { IoMoon } from "react-icons/io5";

/**
 * ThemeToggle Component
 * @returns {JSX.Element} Le composant toggleur de thème.
 */
export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <Tooltip title="Changer le thème">
      <div className="relative p-1">
        <input
          id="switch"
          className="absolute w-full h-full opacity-0 m-0 cursor-pointer"
          name="switch"
          type="checkbox"
          checked={isDarkMode}
          onChange={toggleTheme}
        />
        <label
          className="block relative w-12 h-6 bg-orange-600 rounded-full transition duration-400"
          htmlFor="switch"
        >
          <span
            className={`absolute top-0 left-0 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center transition duration-400 ${
              isDarkMode ? "translate-x-full bg-gray-900" : ""
            }`}
          >
            {isDarkMode ? <IoSunny /> : <IoMoon />}
          </span>
        </label>
      </div>
    </Tooltip>
  );
}
