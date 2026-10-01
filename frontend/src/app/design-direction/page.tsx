import { notFound } from 'next/navigation';
import { DesignDirectionPreview } from './preview';

export default function DesignDirectionPage(): React.JSX.Element {
  if (process.env.NODE_ENV === 'production') notFound();
  return <DesignDirectionPreview />;
}
