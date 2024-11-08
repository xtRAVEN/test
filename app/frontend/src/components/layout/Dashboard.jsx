import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { intl, changeLanguage } from '@/i18n';
import {
  CircleUser,
  Home,
  Menu,
  LandPlotIcon,
  MapPinIcon,
  ShieldIcon,
  Globe
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModeToggle } from '@/components/mode-toggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { USER_PERMISSIONS } from '@/login/constants';
const BrandLogo = React.memo(({ className }) => {
  // Access the global config directly
  const config = window.APP_CONFIG || { siteName: '', logoPath: '' };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={config.logoPath} alt="" className="h-6 w-6" />
      <span className="font-semibold mt-1">{config.siteName}</span>
    </div>
  );
});


const NavLink = React.memo(({ to, children, className, onClick, requiredPermission, userPermissions }) => {
  if (requiredPermission && !userPermissions.includes(requiredPermission)) {
    return null;
  }
  return (
    <Link
      to={to}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        onClick(to);
      }}
    >
      {typeof children === 'string' ? intl.formatMessage({ id: children }) : children}
    </Link>
  );
});

const Header = React.memo(({ handleNavigation, onLanguageChange, currentLocale, toggleMobileMenu }) => {
  return (
    <header className='flex justify-end h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-10'>
      <Button variant='outline' size='icon' className='shrink-0 md:hidden mr-auto' onClick={toggleMobileMenu}>
        <Menu className='h-5 w-5' />
        <span className='sr-only'>{intl.formatMessage({ id: "toggleNavigationMenu" })}</span>
      </Button>
      <div className='flex-1 md:flex-none' />
      <ModeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='secondary' size='icon' className='rounded-full'>
            <Globe className='h-5 w-5' />
            <span className='sr-only'>{intl.formatMessage({ id: "toggleLanguage" })}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => onLanguageChange('en')} className={currentLocale === 'en' ? 'bg-muted' : ''}>
            English
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onLanguageChange('fr')} className={currentLocale === 'fr' ? 'bg-muted' : ''}>
            Français
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='secondary' size='icon' className='rounded-full'>
            <CircleUser className='h-5 w-5' />
            <span className='sr-only'>{intl.formatMessage({ id: "toggleUserMenu" })}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>{intl.formatMessage({ id: "myAccount" })}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleNavigation('logout')}>
            {intl.formatMessage({ id: "logout" })}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
});

function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState([]);
  const [currentLocale, setCurrentLocale] = useState(intl.locale);
  const [key, setKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const storedPermissions = localStorage.getItem(USER_PERMISSIONS);
    if (storedPermissions) {
      try {
        const parsedPermissions = JSON.parse(storedPermissions);
        setUserPermissions(parsedPermissions);
        console.log('Retrieved permissions:', parsedPermissions);
      } catch (error) {
        console.error('Error parsing permissions:', error);
      }
    } else {
      console.warn('No permissions found in localStorage');
    }
  }, []);

  const handleNavigation = useCallback((path) => {
    setIsOpen(false);
    navigate(path);
  }, [navigate]);

  const handleLanguageChange = useCallback((newLocale) => {
    changeLanguage(newLocale);
    setCurrentLocale(newLocale);
    setKey(prevKey => prevKey + 1);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const renderNavItems = useCallback((mobile = false) => (
    <>
      <NavLink
        to='/'
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${mobile ? 'mx-[-0.65rem]' : ''}`}
        onClick={handleNavigation}
        userPermissions={userPermissions}
      >
        <Home className='h-5 w-5' />
        {intl.formatMessage({ id: "dashboard" })}
      </NavLink>
      <NavLink
        to='construction'
        className={`flex items-center gap-3 px-3 rounded-lg py-2 text-muted-foreground transition-all hover:text-primary ${mobile ? 'mx-[-0.65rem]' : ''}`}
        onClick={handleNavigation}
        requiredPermission="parcel.add_parcel"
        userPermissions={userPermissions}
      >
        <MapPinIcon className='h-5 w-5' />
        {intl.formatMessage({ id: "createParcel" })}
      </NavLink>
      <NavLink
        to='parcel'
        className={`flex items-center gap-3 px-3 rounded-lg py-2 text-muted-foreground transition-all hover:text-primary ${mobile ? 'mx-[-0.65rem]' : ''}`}
        onClick={handleNavigation}
        requiredPermission="parcel.view_parcel"
        userPermissions={userPermissions}
      >
        <LandPlotIcon className='h-5 w-5' />
        {intl.formatMessage({ id: "parcelList" })}
      </NavLink>
    </>
  ), [handleNavigation, userPermissions]);

  const memoizedHeader = useMemo(() => (
    <Header 
      handleNavigation={handleNavigation} 
      onLanguageChange={handleLanguageChange}
      currentLocale={currentLocale}
      toggleMobileMenu={toggleMobileMenu}
    />
  ), [handleNavigation, handleLanguageChange, currentLocale, toggleMobileMenu]);

  return (
    <div key={key} className='grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]'>
      <div className='hidden border-r bg-muted/40 md:block'>
        <div className='flex h-full max-h-screen flex-col gap-2 sticky top-0'>
          <div className='flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6'>
            <NavLink to='/' className='flex items-center gap-2 font-semibold' onClick={handleNavigation} userPermissions={userPermissions}>
              <BrandLogo />
            </NavLink>
          </div>
          <nav className='flex-1 overflow-y-auto px-2 text-sm font-medium lg:px-4'>
            {renderNavItems()}
            <a
              href='/admin/'
              target="_blank"
              rel="noopener noreferrer"
              className='flex items-center gap-3 px-3 rounded-lg py-2 text-muted-foreground transition-all hover:text-primary'
            >
              <ShieldIcon className='h-5 w-5' />
              {intl.formatMessage({ id: "administratorPage" })}
            </a>
          </nav>
        </div>
      </div>

      <div className='flex flex-col'>
        {memoizedHeader}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side='left' className='flex flex-col'>
            <nav className='grid gap-2 text-lg font-medium'>
              <NavLink to='/' className='flex items-center -m-2 mb-2 gap-2 font-semibold' onClick={handleNavigation} userPermissions={userPermissions}>
                <BrandLogo />
              </NavLink>
              {renderNavItems(true)}
              <a
                href='/admin/'
                target="_blank"
                rel="noopener noreferrer"
                className='flex items-center gap-3 rounded-lg py-2 text-muted-foreground transition-all hover:text-primary'
                onClick={() => setIsOpen(false)}
              >
                <ShieldIcon className='h-5 w-5' />
                {intl.formatMessage({ id: "administratorPage" })}
              </a>
            </nav>
          </SheetContent>
        </Sheet>

        <main className='flex-1 overflow-y-auto p-4 lg:p-6'>
          <div className='h-full w-full rounded-lg border shadow-sm'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;