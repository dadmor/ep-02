// FooterBranding.tsx - Komponent z logo i opisem do użycia w stopce
import React from "react";
import { useNavigate } from "react-router-dom";

interface FooterBrandingProps {
  /** Wielkość logo (domyślnie h-8) */
  logoSize?: string;
  /** Czy pokazać pełny opis (domyślnie true) */
  showFullDescription?: boolean;
  /** Dodatkowe klasy CSS */
  className?: string;
}

export const FooterBranding: React.FC<FooterBrandingProps> = ({
  logoSize = "h-8",
  showFullDescription = true,
  className = "",
}) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <div className={`text-center space-y-4 ${className}`}>
      <img
        src="/smart-edu-play-logo.svg"
        alt="Smart Edu Play Logo"
        className={`${logoSize} mx-auto opacity-60 cursor-pointer hover:opacity-80 transition-opacity duration-200`}
        onClick={handleLogoClick}
      />
      <div className="space-y-1">
        <p className="text-xs text-gray-500 font-medium">Smart Edu Play</p>
        {showFullDescription && (
          <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
            Platforma edukacyjna nowej generacji z gamifikacją
          </p>
        )}
        <p className="text-xs text-gray-300 pt-1">
          &copy; 2024 Wszystkie prawa zastrzeżone
        </p>
      </div>
    </div>
  );
};