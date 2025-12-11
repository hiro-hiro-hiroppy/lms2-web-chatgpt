import React from 'react';
import styles from './lms-layout.module.scss';
import LmsLogoutButton from './lms-logout-button';
import { CircularProgress } from '@mui/material';
import LmsChatBot from './lms-chatbot';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

type LmsLayoutProps = {
  children: React.ReactNode;
  isNeedLogin: boolean;
};

const LmsLayout: React.FC<LmsLayoutProps> = async ({ children, isNeedLogin }) => {
  let userId = null;

  try {
    const session = await getServerSession(authOptions);
    if (session) {
      userId = session.user.userId;
    }
  } catch (err) {
    console.error('getServerSession error:', err);
  }
  const isCanChatGPT = Number(process.env.NEXT_PUBLIC_IS_CAN_CHATGPT) ?? 0;

  return (
    <div className={styles.lms_layout}>
      <div className={styles.lms_header}>
        <div className={styles.lms_header_contents}>
          <h3>TOEIC Part5 学習サイト</h3>
          {isNeedLogin && <LmsLogoutButton userId={userId} />}
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className={styles.lms_main}>{children}</main>

      {/* チャットボット欄 */}
      {userId && isNeedLogin && isCanChatGPT === 1 && <LmsChatBot params={{ userId: userId }} />}

      {/* フィルター */}
      <div id="loading-filter" className={styles.loading_filter}>
        <CircularProgress />
      </div>
    </div>
  );
};

export default LmsLayout;

