import { BuildWorkspace } from '../build-workspace';

export default async function BuildPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  return <BuildWorkspace buildId={id} />;
}
