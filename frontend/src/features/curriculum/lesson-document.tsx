'use client';

import { Children, isValidElement, useState } from 'react';
import ReactMarkdown, {
  type Components,
  defaultUrlTransform,
} from 'react-markdown';
import { getConfiguredApiBaseUrl } from '@/lib/api-base';

const LOCAL_ASSET = /^\.\/assets\/[a-zA-Z0-9/_-]+\.(?:png|webp)$/;

export interface LessonDocumentProps {
  readonly markdown: string;
  readonly questSlug: string;
  readonly contentVersion: string;
  readonly apiBaseUrl?: string;
}

export function lessonAssetUrl(
  source: string,
  questSlug: string,
  contentVersion: string,
  apiBaseUrl = getConfiguredApiBaseUrl(),
): string | undefined {
  if (!LOCAL_ASSET.test(source)) return undefined;
  const path = source.slice(2);
  return `${apiBaseUrl}/api/v1/quests/${encodeURIComponent(questSlug)}/assets/${encodeURIComponent(contentVersion)}?path=${encodeURIComponent(path)}`;
}

function LessonImage({
  src,
  alt,
}: {
  readonly src?: string;
  readonly alt?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || !alt?.trim() || failed) {
    return (
      <span
        role="img"
        aria-label={alt?.trim() || 'Lesson illustration unavailable'}
        className="my-6 block rounded-md border border-line bg-surface-sunken p-4 text-sm text-muted"
      >
        Illustration unavailable
      </span>
    );
  }
  return (
    <span className="my-7 block">
      {/* Curriculum images are validated, versioned API resources with runtime URLs. */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="mx-auto h-auto max-h-[32rem] max-w-full rounded-md border border-line bg-surface-sunken object-contain"
      />
    </span>
  );
}

function codeLanguage(children: React.ReactNode): string {
  const child = Children.toArray(children)[0];
  if (!isValidElement<{ className?: unknown }>(child)) return 'Code example';
  const className = child.props.className;
  if (typeof className !== 'string') return 'Code example';
  const match = /language-([a-zA-Z0-9_-]+)/.exec(className);
  if (!match) return 'Code example';
  const language = match[1].toLowerCase();
  return language === 'js' || language === 'javascript'
    ? 'JavaScript example'
    : `${language} example`;
}

function lessonComponents(): Components {
  return {
    h1: ({ children }) => (
      <h2 className="mt-10 font-display text-3xl font-bold text-ink first:mt-0">
        {children}
      </h2>
    ),
    h2: ({ children }) => (
      <h3 className="mt-9 font-display text-2xl font-bold text-ink">
        {children}
      </h3>
    ),
    h3: ({ children }) => (
      <h4 className="mt-8 font-sans text-xl font-bold text-ink">{children}</h4>
    ),
    h4: ({ children }) => (
      <h5 className="mt-7 font-sans text-lg font-bold text-ink">{children}</h5>
    ),
    h5: ({ children }) => (
      <h6 className="mt-7 font-sans text-base font-bold text-ink">
        {children}
      </h6>
    ),
    h6: ({ children }) => (
      <h6 className="mt-7 font-sans text-base font-bold text-ink">
        {children}
      </h6>
    ),
    p: ({ children }) => (
      <p className="mt-5 text-base leading-8 text-ink/90">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="mt-5 list-disc space-y-2 pl-6 leading-7 marker:text-discovery">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mt-5 list-decimal space-y-3 pl-7 leading-7 marker:font-bold marker:text-reward">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="pl-1 text-ink/90">{children}</li>,
    strong: ({ children }) => (
      <strong className="font-bold text-ink">{children}</strong>
    ),
    em: ({ children }) => <em className="text-discovery">{children}</em>,
    blockquote: ({ children }) => (
      <aside
        className="pixel-corners-sm my-7 border-l-4 border-discovery bg-discovery/10 px-5 py-1"
        aria-label="Lesson callout"
      >
        {children}
      </aside>
    ),
    hr: () => <hr className="my-9 border-line" />,
    a: ({ href, children }) =>
      href ? (
        <a
          href={href}
          className="font-bold text-discovery underline decoration-2 underline-offset-4 hover:text-ink"
          {...(href.startsWith('https://')
            ? { target: '_blank', rel: 'noreferrer' }
            : {})}
        >
          {children}
        </a>
      ) : (
        <span>{children}</span>
      ),
    code: ({ className, children }) => (
      <code
        className={
          className
            ? `font-mono text-sm ${className}`
            : 'rounded-sm bg-surface-sunken px-1.5 py-0.5 font-mono text-[0.925em] text-ascent'
        }
      >
        {children}
      </code>
    ),
    pre: ({ children }) => {
      const label = codeLanguage(children);
      return (
        <div className="my-7 overflow-hidden rounded-md border border-line bg-surface-sunken">
          <div className="border-b border-line bg-surface-raised px-4 py-2 font-mono text-xs font-bold text-muted">
            {label}
          </div>
          <pre
            tabIndex={0}
            role="region"
            aria-label={label}
            className="max-w-full overflow-x-auto p-4 text-sm leading-6 text-ink outline-none"
          >
            {children}
          </pre>
        </div>
      );
    },
    img: ({ src, alt }) => (
      <LessonImage src={typeof src === 'string' ? src : undefined} alt={alt} />
    ),
  };
}

export function LessonDocument({
  markdown,
  questSlug,
  contentVersion,
  apiBaseUrl = getConfiguredApiBaseUrl(),
}: LessonDocumentProps): React.JSX.Element {
  const transformUrl = (
    url: string,
    _key: string,
    node: Readonly<{ tagName?: string }>,
  ): string => {
    if (node.tagName === 'img')
      return lessonAssetUrl(url, questSlug, contentVersion, apiBaseUrl) ?? '';
    if (node.tagName === 'a')
      return url.startsWith('#') || url.startsWith('https://')
        ? defaultUrlTransform(url)
        : '';
    return '';
  };
  return (
    <div className="lesson-document">
      <ReactMarkdown
        components={lessonComponents()}
        skipHtml
        urlTransform={transformUrl}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
