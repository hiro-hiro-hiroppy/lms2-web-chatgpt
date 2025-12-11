'use client';

import {
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import styles from './document-component.module.scss';
import { filter } from '@/lib/filter';
import { Document } from '@prisma/client';
import { apiRequest } from '@/lib/api';

export type DocumentComponentProps = {
  documents: Document[];
  userId?: number;
};

// export const documentSelect = Prisma.validator<Prisma.DocumentSelect>()({
//   id: true,
//   heading: true,
//   documentPath: true
// });
// export type DocumentType = Prisma.DocumentGetPayload<{ select: typeof documentSelect }>;

export default function DocumentComponent(props: DocumentComponentProps) {
  const { documents, userId } = props;
  const [pageIndex, setPageIndex] = useState(0);
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0); // 経過時間
  // 資料選択プルダウン
  const [documentMenuItems, setDocumentMenuItems] = useState<Document[]>([]);
  const [documentMenuItemIndex, setDocumentMenuItemIndex] = useState<number>(0);

  // 次ページへ
  const next = () => {
    postDocumentHistory(pageIndex + 1, elapsed);
    setPageIndex((prev) => (prev + 1) % imagePaths.length);
  };

  // 前ページへ
  const prev = () => {
    postDocumentHistory(pageIndex + 1, elapsed);
    setPageIndex((prev) => (prev - 1 + imagePaths.length) % imagePaths.length);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // フォーム入力中は無効化
      const el = e.target as HTMLElement | null;
      const isTyping =
        el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (isTyping) return;

      // 左、右でページ切替できるように
      if (!(e.metaKey || e.ctrlKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (!(e.metaKey || e.ctrlKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [prev, next]);

  useEffect(() => {
    filter.hideFilter();

    setDocumentMenuItems(documents);
  }, [documents]);

  useEffect(() => {
    // 一旦elapsedをリセット
    setElapsed(0);

    // タイマーを記録
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - start) / 1000); // 秒単位
      setElapsed(elapsedTime);
    }, 1000);

    return () => clearInterval(timer); // クリーンアップ
  }, [pageIndex, documentMenuItemIndex]);

  useEffect(() => {
    filter.showFilter();
    const documentPath = documents[documentMenuItemIndex].documentPath;
    const pageCount = documents[documentMenuItemIndex].pageCount;
    const documentPaths = [];

    for (let i = 1; i <= pageCount; i++) {
      documentPaths.push(`${documentPath}/${i}.jpg`);
    }
    setImagePaths(documentPaths);
    setPageIndex(0);
    filter.hideFilter();
  }, [documentMenuItemIndex, documents]);

  const postDocumentHistory = async (pageNo: number, duration: number) => {
    if (duration < 15) {
      return;
    }

    const document = documentMenuItems[documentMenuItemIndex];
    const documentId = document.id;

    // APIを送信
    await apiRequest('/api/log/document_history', 'POST', {
      userId: Number(userId),
      documentId: documentId,
      pageNo: pageNo,
      duration: duration
    });
  };

  const handleChangeDocumentMenu = async (e: SelectChangeEvent) => {
    e.preventDefault();
    postDocumentHistory(pageIndex + 1, elapsed);

    const selectValue = Number(e.target.value);
    setDocumentMenuItemIndex(selectValue);
  };

  if (imagePaths.length === 0) return <></>;

  return (
    <>
      <div className={styles.document_main}>
        <Link
          href="/top"
          passHref
          onClick={() => {
            postDocumentHistory(pageIndex + 1, elapsed);
          }}
        >
          <Button variant="contained" color="primary">
            戻る
          </Button>
        </Link>

        <FormControl size="small" style={{ width: 110 }}>
          <InputLabel id="document_no_label">資料</InputLabel>
          <Select
            labelId="document_no_label"
            label="資料"
            value={String(documentMenuItemIndex)}
            onChange={handleChangeDocumentMenu}
          >
            {documentMenuItems.map((value, index) => (
              <MenuItem key={index} value={index}>
                {value.heading}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div style={{ marginTop: '10px', marginBottom: '20px' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '800px',
            //   maxWidth: 600,
            aspectRatio: '16 / 9',
            margin: 'auto'
          }}
        >
          <Image
            src={imagePaths[pageIndex]}
            alt={`画像${pageIndex + 1}`}
            fill
            style={{ objectFit: 'cover', borderRadius: 8 }}
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
        </div>

        <div
          style={{
            margin: 'auto',
            width: '100%',
            maxWidth: '800px',
            background: 'white',
            borderTop: '1px solid lightgray',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <IconButton color="primary" aria-label="next" onClick={prev}>
            <ArrowBackIcon />
          </IconButton>
          <div
            style={{
              width: '80px',
              display: 'flex',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}
          >
            {pageIndex + 1} / {imagePaths.length}
          </div>
          <IconButton color="primary" aria-label="next" onClick={next}>
            <ArrowForwardIcon />
          </IconButton>
        </div>
      </div>
    </>
  );
}

