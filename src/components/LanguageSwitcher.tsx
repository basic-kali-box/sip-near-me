import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

interface LanguageSwitcherProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

export function LanguageSwitcher({
  variant = "ghost",
  size = "sm",
  showText = false
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  const handleLanguageChange = (newLanguage: 'en' | 'fr') => {
    i18n.changeLanguage(newLanguage);
  };

  const languages = [
    { code: 'en' as const, name: 'English', nativeName: 'English' },
    { code: 'fr' as const, name: 'French', nativeName: 'Français' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className="flex items-center gap-2"
          aria-label={`Current language: ${currentLanguage?.nativeName}. Click to change language`}
          aria-haspopup="menu"
          aria-expanded="false"
        >
          <Globe className="w-4 h-4" aria-hidden="true" />
          {showText && (
            <span className="hidden sm:inline">
              {currentLanguage?.nativeName}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40" role="menu" aria-label="Language selection">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex items-center justify-between cursor-pointer ${
              i18n.language === lang.code ? 'bg-accent' : ''
            }`}
            role="menuitem"
            aria-label={`Switch to ${lang.nativeName}`}
            aria-current={i18n.language === lang.code ? 'true' : 'false'}
          >
            <span>{lang.nativeName}</span>
            {i18n.language === lang.code && (
              <div className="w-2 h-2 bg-primary rounded-full" aria-hidden="true" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
