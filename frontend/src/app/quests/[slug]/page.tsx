import { LessonPageClient } from '@/features/curriculum/lesson-page-client';

export default async function QuestLessonPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  return <LessonPageClient slug={slug} />;
}
