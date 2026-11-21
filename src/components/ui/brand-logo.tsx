import Image from 'next/image';
import { APP } from '@/constants';

export function BrandLogo({ size = 36 }: { size?: number }) {
  return <Image src="/logo.png" alt={`${APP.name} logo`} width={size} height={size} priority />;
}
