import { notFound } from 'next/navigation';
import { DesignSystemShowcase } from './showcase-client';

export default function DesignSystemPage(): React.JSX.Element {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }
  return <DesignSystemShowcase />;
}
