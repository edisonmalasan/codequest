import { JourneyPageClient } from '@/features/curriculum/journey-page-client';

export default async function JourneyPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  return <JourneyPageClient slug={slug} />;
}
