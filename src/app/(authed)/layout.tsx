import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { AppHeader } from '@/shared/ui/AppHeader';
import { getSession } from '@/lib/auth';

export default async function AuthedLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <>
      <AppHeader session={session} />
      <main className="p-8">{children}</main>
      {modal}
    </>
  );
}
