'use client';

import { useKeepAlive } from '@/hooks/useKeepAlive';

export default function KeepAliveWrapper() {
  // Enable keep-alive for all pages
  useKeepAlive(true);

  // This component renders nothing - it just runs the keep-alive effect
  return null;
}