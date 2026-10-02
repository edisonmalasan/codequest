import { JourneyOverview } from '@/features/curriculum/journey-overview';

export default async function JourneyPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  return <JourneyOverview slug={slug} />;
}
