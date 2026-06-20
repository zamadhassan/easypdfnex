'use client';

import { useParams } from 'next/navigation';
import PostForm from '../../PostForm';

export default function EditPostPage() {
  const params = useParams();
  return <PostForm postId={params.id as string} />;
}
