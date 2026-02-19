import { SidebarTrigger } from '@/components/ui/sidebar';
import ThemeToggle from './ThemeToggle.tsx';
import NavSearch from './NavSearch.tsx';
import XpBadge from './XpBadge.tsx';

interface TopBarProps {
  onMenuToggle?: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export default function TopBar({ theme, onThemeToggle }: TopBarProps) {
  return (
    <div className="sticky top-0 z-50 flex h-14 items-center border-b bg-background/85 backdrop-blur-lg px-4 gap-3">
      <SidebarTrigger />
      <span className="font-semibold text-lg">AI101</span>
      <div className="flex-1" />
      <XpBadge />
      <NavSearch />
      <ThemeToggle theme={theme} onToggle={onThemeToggle} />
    </div>
  );
}
