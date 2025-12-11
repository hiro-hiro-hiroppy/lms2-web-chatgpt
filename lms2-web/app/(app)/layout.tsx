import React from 'react';
import LmsLayout from '@/lms-common/layout/lms-layout';

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LmsLayout isNeedLogin={true}>{children}</LmsLayout>;
}

