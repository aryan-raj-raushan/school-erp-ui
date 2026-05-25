import { Building2, LayoutDashboard } from 'lucide-react';
import type { NavIconKey } from '@/constants';

const ICONS: Record<NavIconKey, React.ReactNode> = {
  dashboard: <LayoutDashboard size={18} />,
  schools: <Building2 size={18} />,
};

export function NavIcon({ name }: { name: NavIconKey }) {
  return <>{ICONS[name]}</>;
}
