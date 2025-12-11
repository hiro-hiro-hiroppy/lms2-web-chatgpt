import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import DocumentComponent from '@/components/document/document-component';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

// const DocumentComp = dynamic(() => import('@/components/document/document-component'), {
//   // ssr: false
// });

// const DynamicPDFViewer = dynamic(() => import('@react-pdf/renderer').then((mod) => mod.PDFViewer), {
//   loading: () => <p>Loading...</p>,
//   ssr: false
// });

type DocumentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const prisma = new PrismaClient();

export default async function Document({ params }: DocumentPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user.userId;

  // データを取得
  const documents = await prisma.document.findMany({
    where: {
      categoryId: Number(id)
    },
    orderBy: {
      id: 'asc'
    }
  });

  // const imageDir = path.join(process.cwd(), `public/document/${props.id}`);
  // const files = fs.readdirSync(imageDir);
  // const imagePaths = files.map((file) => `/document/${props.id}/${file}`);
  // const componentProps: DocumentComponentProps = {
  //   fileUrls: imagePaths
  // };

  // return (
  //   <Suspense
  //     fallback={<div style={{ padding: 12, border: '1px solid #eee' }}>PDF読み込み中...</div>}
  //   >
  //     <DocumentComp documents={documents} userId={userId} />
  //   </Suspense>
  // );

  return <DocumentComponent documents={documents} userId={userId} />;
}

