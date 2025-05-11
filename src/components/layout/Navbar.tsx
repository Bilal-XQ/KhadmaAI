
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { changeLanguage } from "../../i18n/i18n";
import { Menu, X, User, ChevronDown, Globe, Home, LogIn, LogOut, Settings } from "lucide-react";

const Navbar = () => {
  const { t } = useTranslation("common");
  const { currentUser, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLanguageChange = (lang: string) => {
    changeLanguage(lang);
  };

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // All links are now visible to all users regardless of login status
  return (
    <nav className={`sticky top-0 z-50 bg-white transition-all duration-200 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center group">
                <span className="text-2xl font-bold bg-gradient-to-r from-khadma-blue to-khadma-darkBlue bg-clip-text text-transparent transition-all duration-300 group-hover:from-khadma-darkBlue group-hover:to-khadma-blue">
                  {t("app.name")}
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              <Link
                to="/"
                className={`flex items-center border-transparent ${isHomePage ? 'text-khadma-blue border-khadma-blue font-medium' : 'text-gray-600'} hover:border-khadma-blue hover:text-khadma-blue px-1 pt-1 border-b-2 transition-colors duration-200`}
              >
                <Home className="mr-1.5 h-4 w-4" />
                {t("nav.home")}
              </Link>
              {/* Make all main navigation links available to everyone */}
              <Link
                to="/dashboard"
                className={`border-transparent ${location.pathname === '/dashboard' ? 'text-khadma-blue border-khadma-blue font-medium' : 'text-gray-600'} hover:border-khadma-blue hover:text-khadma-blue px-1 pt-1 border-b-2 transition-colors duration-200`}
              >
                {t("nav.dashboard")}
              </Link>
              <Link
                to="/quests"
                className={`border-transparent ${location.pathname === '/quests' ? 'text-khadma-blue border-khadma-blue font-medium' : 'text-gray-600'} hover:border-khadma-blue hover:text-khadma-blue px-1 pt-1 border-b-2 transition-colors duration-200`}
              >
                {t("nav.quests")}
              </Link>
              <Link
                to="/tasks"
                className={`border-transparent ${location.pathname === '/tasks' ? 'text-khadma-blue border-khadma-blue font-medium' : 'text-gray-600'} hover:border-khadma-blue hover:text-khadma-blue px-1 pt-1 border-b-2 transition-colors duration-200`}
              >
                {t("nav.tasks")}
              </Link>
              <Link
                to="/interview"
                className={`border-transparent ${location.pathname === '/interview' ? 'text-khadma-blue border-khadma-blue font-medium' : 'text-gray-600'} hover:border-khadma-blue hover:text-khadma-blue px-1 pt-1 border-b-2 transition-colors duration-200`}
              >
                {t("nav.interview")}
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center text-gray-600 border-gray-200 hover:text-khadma-blue hover:border-khadma-blue"
                >
                  <Globe className="h-4 w-4 mr-1.5" />
                  <span className="mr-1">Language</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => handleLanguageChange("en")} className="cursor-pointer">
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("fr")} className="cursor-pointer">
                  Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("ar")} className="cursor-pointer">
                  العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <Link to="/profile">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center text-gray-600 border-gray-200 hover:text-khadma-blue hover:border-khadma-blue"
                  >
                    <User className="h-4 w-4 mr-1.5" />
                    {t("nav.profile")}
                  </Button>
                </Link>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => signOut()}
                  className="bg-red-500 text-white hover:bg-red-600 flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  {t("nav.logout")}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-200 text-gray-600 hover:text-khadma-blue hover:border-khadma-blue flex items-center"
                  >
                    <LogIn className="h-4 w-4 mr-1.5" />
                    {t("nav.login")}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-khadma-blue hover:bg-khadma-darkBlue flex items-center"
                  >
                    <User className="h-4 w-4 mr-1.5" />
                    {t("nav.signup")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-khadma-blue hover:bg-gray-100/70 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-khadma-blue transition-colors"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1 border-t border-gray-100">
            <Link
              to="/"
              className={`flex items-center pl-3 pr-4 py-2 border-l-4 ${isHomePage ? 'border-khadma-blue text-khadma-blue bg-khadma-blue/5 font-medium' : 'border-transparent text-gray-600'} hover:bg-gray-50 hover:border-khadma-blue hover:text-khadma-blue transition-colors`}
              onClick={toggleMenu}
            >
              <Home className="mr-2 h-4 w-4" />
              {t("nav.home")}
            </Link>
            {/* Make all navigation links available to everyone in mobile menu */}
            <Link
              to="/dashboard"
              className={`flex items-center pl-3 pr-4 py-2 border-l-4 ${location.pathname === '/dashboard' ? 'border-khadma-blue text-khadma-blue bg-khadma-blue/5 font-medium' : 'border-transparent text-gray-600'} hover:bg-gray-50 hover:border-khadma-blue hover:text-khadma-blue transition-colors`}
              onClick={toggleMenu}
            >
              <Settings className="mr-2 h-4 w-4" />
              {t("nav.dashboard")}
            </Link>
            <Link
              to="/quests"
              className={`flex items-center pl-3 pr-4 py-2 border-l-4 ${location.pathname === '/quests' ? 'border-khadma-blue text-khadma-blue bg-khadma-blue/5 font-medium' : 'border-transparent text-gray-600'} hover:bg-gray-50 hover:border-khadma-blue hover:text-khadma-blue transition-colors`}
              onClick={toggleMenu}
            >
              <Settings className="mr-2 h-4 w-4" />
              {t("nav.quests")}
            </Link>
            <Link
              to="/tasks"
              className={`flex items-center pl-3 pr-4 py-2 border-l-4 ${location.pathname === '/tasks' ? 'border-khadma-blue text-khadma-blue bg-khadma-blue/5 font-medium' : 'border-transparent text-gray-600'} hover:bg-gray-50 hover:border-khadma-blue hover:text-khadma-blue transition-colors`}
              onClick={toggleMenu}
            >
              <Settings className="mr-2 h-4 w-4" />
              {t("nav.tasks")}
            </Link>
            <Link
              to="/interview"
              className={`flex items-center pl-3 pr-4 py-2 border-l-4 ${location.pathname === '/interview' ? 'border-khadma-blue text-khadma-blue bg-khadma-blue/5 font-medium' : 'border-transparent text-gray-600'} hover:bg-gray-50 hover:border-khadma-blue hover:text-khadma-blue transition-colors`}
              onClick={toggleMenu}
            >
              <Settings className="mr-2 h-4 w-4" />
              {t("nav.interview")}
            </Link>
            <Link
              to="/profile"
              className={`flex items-center pl-3 pr-4 py-2 border-l-4 ${location.pathname === '/profile' ? 'border-khadma-blue text-khadma-blue bg-khadma-blue/5 font-medium' : 'border-transparent text-gray-600'} hover:bg-gray-50 hover:border-khadma-blue hover:text-khadma-blue transition-colors`}
              onClick={toggleMenu}
            >
              <User className="mr-2 h-4 w-4" />
              {t("nav.profile")}
            </Link>
            <div className="border-t border-gray-200 pt-4 pb-3">
              {currentUser ? (
                <div className="pl-3 pr-4">
                  <Button
                    variant="default"
                    className="w-full bg-red-500 hover:bg-red-600 flex items-center justify-center"
                    onClick={() => {
                      signOut();
                      toggleMenu();
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-1.5" />
                    {t("nav.logout")}
                  </Button>
                </div>
              ) : (
                <div className="pl-3 pr-4 flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="w-full"
                    onClick={toggleMenu}
                  >
                    <Button
                      variant="outline"
                      className="w-full border-gray-200 text-gray-600 hover:text-khadma-blue hover:border-khadma-blue flex items-center justify-center"
                    >
                      <LogIn className="h-4 w-4 mr-1.5" />
                      {t("nav.login")}
                    </Button>
                  </Link>
                  <Link
                    to="/signup"
                    className="w-full"
                    onClick={toggleMenu}
                  >
                    <Button
                      variant="default"
                      className="w-full bg-khadma-blue hover:bg-khadma-darkBlue flex items-center justify-center"
                    >
                      <User className="h-4 w-4 mr-1.5" />
                      {t("nav.signup")}
                    </Button>
                  </Link>
                </div>
              )}
              <div className="mt-3 pl-3 pr-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm text-gray-500 font-medium">Language</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleLanguageChange("en")}
                      className="px-3 py-2 text-sm rounded hover:bg-gray-100 border border-gray-200 text-gray-700 transition-colors"
                    >
                      EN
                    </button>
                    <button
                      onClick={() => handleLanguageChange("fr")}
                      className="px-3 py-2 text-sm rounded hover:bg-gray-100 border border-gray-200 text-gray-700 transition-colors"
                    >
                      FR
                    </button>
                    <button
                      onClick={() => handleLanguageChange("ar")}
                      className="px-3 py-2 text-sm rounded hover:bg-gray-100 border border-gray-200 text-gray-700 transition-colors"
                    >
                      عربي
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
