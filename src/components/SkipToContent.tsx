import { useState } from "react";

const SkipToContent = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Handle keyboard focus
  const handleFocus = () => setIsVisible(true);
  const handleBlur = () => setIsVisible(false);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView();
      }
    }
  };

  return (
    <a
      href="#main-content"
      className={`
        fixed top-4 left-4 z-50 bg-primary text-background px-4 py-2 rounded-lg
        transition-transform duration-200 focus:outline-none
        ${isVisible ? "transform-none" : "-translate-y-20"}
      `}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      Skip to content
    </a>
  );
};

export default SkipToContent;
