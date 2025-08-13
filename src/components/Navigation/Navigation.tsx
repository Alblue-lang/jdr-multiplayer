'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = [
    { href: '/', label: t('nav.home'), public: true },
    { href: '/dashboard', label: t('nav.dashboard'), auth: true },
    { href: '/campaigns', label: t('nav.campaigns'), auth: true },
    { href: '/chat', label: t('nav.chat'), auth: true },
    { href: '/calendar', label: t('nav.calendar'), auth: true },
    { href: '/ranking', label: t('nav.ranking'), auth: true },
  ]

  const visibleItems = navigationItems.filter(item => 
    item.public || (item.auth && isAuthenticated)
  )

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">JDR</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline">JDR Multiplayer</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 px-0"
            >
              <span className="sr-only">Toggle theme</span>
              {theme === 'dark' ? '🌞' : '🌙'}
            </Button>

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              className="w-9 px-0"
            >
              <span className="text-xs font-bold">
                {language.toUpperCase()}
              </span>
            </Button>

            {/* User Menu or Auth Buttons */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`/avatars/${user.avatar}.png`} alt={user.username} />
                      <AvatarFallback>
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <Badge variant="secondary" className="w-fit mt-1">
                        {user.role}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">{t('nav.profile')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">{t('nav.settings')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">{t('nav.login')}</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">{t('nav.register')}</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm" className="w-9 px-0">
                  <span className="sr-only">Toggle menu</span>
                  <div className="flex flex-col space-y-1">
                    <div className="w-4 h-0.5 bg-current"></div>
                    <div className="w-4 h-0.5 bg-current"></div>
                    <div className="w-4 h-0.5 bg-current"></div>
                  </div>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-6">
                  {/* User Info in Mobile */}
                  {isAuthenticated && user && (
                    <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`/avatars/${user.avatar}.png`} alt={user.username} />
                        <AvatarFallback>
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user.username}</p>
                        <Badge variant="secondary" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Navigation Links */}
                  <div className="flex flex-col space-y-2">
                    {visibleItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          pathname === item.href
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-primary hover:bg-muted'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  {/* Auth Buttons for Mobile */}
                  {!isAuthenticated && (
                    <div className="flex flex-col space-y-2 pt-4 border-t">
                      <Button asChild variant="outline" onClick={() => setIsMobileMenuOpen(false)}>
                        <Link href="/login">{t('nav.login')}</Link>
                      </Button>
                      <Button asChild onClick={() => setIsMobileMenuOpen(false)}>
                        <Link href="/register">{t('nav.register')}</Link>
                      </Button>
                    </div>
                  )}

                  {/* User Actions for Mobile */}
                  {isAuthenticated && (
                    <div className="flex flex-col space-y-2 pt-4 border-t">
                      <Button asChild variant="outline" onClick={() => setIsMobileMenuOpen(false)}>
                        <Link href="/profile">{t('nav.profile')}</Link>
                      </Button>
                      <Button asChild variant="outline" onClick={() => setIsMobileMenuOpen(false)}>
                        <Link href="/settings">{t('nav.settings')}</Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          logout()
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        {t('nav.logout')}
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
