"use client";
import { Rocket } from 'lucide-react';

interface HeaderProps {
  appName: string;
}

export function Header({ appName }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 md:px-6">
        <div className="flex items-center space-x-3">
          <Rocket className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-semibold text-foreground">
            {appName}
          </h1>
        </div>
      </div>
    </header>
  );
}
