'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { filter } from '@/lib/filter';
import { signOut } from 'next-auth/react';

type LmsLogoutButtonProps = {
  userId: number | null;
};

export default function LmsLogoutButton(props: LmsLogoutButtonProps) {
  const router = useRouter();
  const { userId } = props;
  const [isLogin, setIsLogin] = useState<boolean>(false);

  useEffect(() => {
    if (userId) {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
  }, [userId]);

  const handleLogout = async () => {
    try {
      filter.showFilter();
      await signOut({
        callbackUrl: '/login' // ログアウト後に遷移するURL
      });
    } finally {
      filter.hideFilter();
    }
  };

  if (isLogin) {
    return (
      isLogin && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ marginBottom: '-5px' }}>ID : {userId}</span>
          <Button variant="text" onClick={handleLogout} style={{ marginBottom: '-10px' }}>
            ログアウト
          </Button>
        </div>
      )
    );
  } else {
    return <></>;
  }
}

