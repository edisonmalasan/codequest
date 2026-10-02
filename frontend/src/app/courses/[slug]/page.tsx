import { CoursePageClient } from '@/features/curriculum/course-page-client';

export default async function CoursePage({
  params,
}: {
  readonly params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  return <CoursePageClient slug={slug} />;
}
