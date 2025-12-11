'use client';
import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { filter } from '@/lib/filter';
// import { auth } from '@/lib/auth';
import { signIn } from 'next-auth/react';

export default function LoginComponent() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      if (!userId) {
        setError('ユーザーIDを入力してください');
        return;
      }
      if (!password) {
        setError('パスワードを入力してください');
        return;
      }

      filter.showFilter();
      const res = await signIn('credentials', {
        redirect: false,
        userId,
        password
      });

      if (res?.ok) {
        router.push('/top');
      } else {
        setError('ログインに失敗しました');
      }
    } catch {
      setError('ログインに失敗しました');
    } finally {
      filter.hideFilter();
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        style={{
          //   marginTop: "50px",
          width: '100%'
        }}
        method="POST"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
            //   background: 'rgb(255, 255, 255)',
            //   border: '1px solid lightgray',
            //   borderRadius: '5px',
            //   height: 'calc(100vh - 120px)',
            //   width: '600px'
          }}
        >
          <h4>ログイン</h4>
          <TextField
            id="tf_user_id"
            label="ユーザーID"
            type="text"
            // fullWidth
            margin="normal"
            value={userId}
            style={{ width: 400, backgroundColor: 'white' }}
            onChange={(e) => setUserId(e.target.value)}
            autoFocus
          />
          <TextField
            id="tf_password"
            label="パスワード"
            type="password"
            // fullWidth
            margin="normal"
            value={password}
            style={{ width: 400, backgroundColor: 'white' }}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            id="btn_login_validate"
            variant="contained"
            sx={{ mt: 3 }}
            style={{ width: 400 }}
          >
            認証
          </Button>
        </div>
      </form>
    </>
  );
}
