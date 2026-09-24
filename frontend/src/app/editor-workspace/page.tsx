import { notFound } from 'next/navigation';
import { WorkspacePreview } from './workspace-preview';

export default function EditorWorkspacePage(): React.JSX.Element {
  if (process.env.NODE_ENV === 'production') notFound();
  return <WorkspacePreview />;
}
