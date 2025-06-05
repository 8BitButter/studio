"use client";
import { Rocket } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface HeaderProps {
  appName: string;
}

export function Header({ appName }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 md:px-8"> {/* Increased padding */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Rocket className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-headline font-semibold text-foreground">
              {appName}
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
