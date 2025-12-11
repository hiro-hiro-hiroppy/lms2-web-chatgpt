'use client';
import ReactMarkdown from 'react-markdown';
import styles from './lms-markdown.module.scss'; // CSS Module を読み込み
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

type Props = {
  content: string;
};

export default function LmsMarkdown({ content }: Props) {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{content}</ReactMarkdown>
    </div>
  );
}

