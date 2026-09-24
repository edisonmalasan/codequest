import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LessonDocument, lessonAssetUrl } from './lesson-document';

const props = {
  questSlug: 'first-message',
  contentVersion: '1.0.0',
  apiBaseUrl: 'https://api.codequest.test',
};

describe('LessonDocument', () => {
  it('renders the approved static Markdown structures semantically', () => {
    render(
      <LessonDocument
        {...props}
        markdown={`# First message

Learn **strings** with *care* and \`console.log\`.

## Instructions

1. Read the example.
2. Change the message.

> Compare the exact output.

\`\`\`javascript
console.log('A very long example line');
\`\`\`

[Read more](https://developer.mozilla.org/)`}
      />,
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'First message' }),
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Instructions' }),
    ).toBeDefined();
    expect(screen.getByRole('list')).toBeDefined();
    expect(
      screen.getByRole('complementary', { name: 'Lesson callout' }).textContent,
    ).toContain('Compare the exact output.');
    expect(
      screen
        .getByRole('region', { name: 'JavaScript example' })
        .getAttribute('tabindex'),
    ).toBe('0');
    expect(
      screen.getByRole('link', { name: 'Read more' }).getAttribute('rel'),
    ).toBe('noreferrer');
  });

  it('keeps HTML inert and refuses unsafe links and images', () => {
    render(
      <LessonDocument
        {...props}
        markdown={`<script>window.lessonExecuted = true</script>

[Unsafe](javascript:alert(1))

![Remote](https://tracker.example/image.png)

![](./assets/no-alt.png)`}
      />,
    );

    expect(document.querySelector('script')).toBeNull();
    expect(screen.getByText('Unsafe').closest('a')).toBeNull();
    expect(document.querySelector('img')).toBeNull();
    expect(screen.getAllByText('Illustration unavailable')).toHaveLength(2);
  });

  it('rewrites validated local illustrations and reports load failure safely', () => {
    render(
      <LessonDocument
        {...props}
        markdown="![Scope chain](./assets/diagrams/scope.webp)"
      />,
    );
    const image = screen.getByRole('img', { name: 'Scope chain' });
    expect(image.getAttribute('src')).toBe(
      'https://api.codequest.test/api/v1/quests/first-message/assets/1.0.0?path=assets%2Fdiagrams%2Fscope.webp',
    );
    fireEvent.error(image);
    expect(
      screen.getByRole('img', { name: 'Scope chain' }).textContent,
    ).toContain('Illustration unavailable');
  });

  it('rejects traversal and unsupported lesson asset paths', () => {
    expect(
      lessonAssetUrl(
        './assets/../secret.png',
        props.questSlug,
        props.contentVersion,
        props.apiBaseUrl,
      ),
    ).toBeUndefined();
    expect(
      lessonAssetUrl(
        './assets/diagram.svg',
        props.questSlug,
        props.contentVersion,
        props.apiBaseUrl,
      ),
    ).toBeUndefined();
  });
});
