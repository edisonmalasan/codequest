import { describe, expect, it } from 'vitest';

import { buildStaticDocument, PreviewSourceError } from './static-document';

describe('static preview document', () => {
  it('keeps useful HTML and CSS while omitting active markup', () => {
    const result = buildStaticDocument([
      {
        id: 'html',
        language: 'html',
        source:
          '<main><h1 class="title">Hello</h1><a href="https://example.com/leak">Link</a><script>throw Error("ran")</script><img src="https://example.com/image"></main>',
      },
      {
        id: 'css',
        language: 'css',
        source: '.title { color: red; }',
      },
    ]);

    expect(result.html).toContain('<h1 class="title">Hello</h1>');
    expect(result.html).toContain('.title { color: red; }');
    expect(result.html).toContain('<a>Link</a>');
    expect(result.html).not.toContain('https://example.com');
    expect(result.html).not.toContain('throw Error');
    expect(result.filteredActiveContent).toBe(true);
  });

  it('does not let CSS close its style element', () => {
    const result = buildStaticDocument([
      { id: 'html', language: 'html', source: '<p>Safe</p>' },
      {
        id: 'css',
        language: 'css',
        source: '</style><script>window.escaped = true</script>',
      },
    ]);
    expect(result.html).not.toContain('</style><script>');
    expect(result.html).toContain('\\3C /style>');
  });

  it('rejects missing, duplicate, and oversized source', () => {
    expect(() => buildStaticDocument([])).toThrow(PreviewSourceError);
    expect(() =>
      buildStaticDocument([
        { id: 'same', language: 'html', source: '<p>A</p>' },
        { id: 'same', language: 'css', source: '' },
      ]),
    ).toThrow(PreviewSourceError);
    expect(() =>
      buildStaticDocument([
        { id: 'html', language: 'html', source: 'a'.repeat(65_537) },
      ]),
    ).toThrow(PreviewSourceError);
    expect(() =>
      buildStaticDocument([
        { id: 'one', language: 'html', source: 'A' },
        { id: 'two', language: 'html', source: 'B' },
      ]),
    ).toThrow(PreviewSourceError);
    expect(() =>
      buildStaticDocument([
        { id: 'xml', language: 'xml' as 'html', source: '<p>A</p>' },
      ]),
    ).toThrow(PreviewSourceError);
  });

  it('keeps inert form structure while removing destinations, embeddings, refresh, and event attributes', () => {
    const result = buildStaticDocument([
      {
        id: 'html',
        language: 'html',
        source:
          '<meta http-equiv="refresh" content="0;url=/bad"><form action="/bad"><button onclick="fetch(1)">Go</button></form><iframe src="/bad"></iframe><svg onload="fetch(1)"></svg><a href="javascript:alert(1)">Text</a>',
      },
    ]);
    expect(result.html).toContain('<a>Text</a>');
    expect(result.html).toContain('<form><button>Go</button></form>');
    expect(result.html.split('<body>')[1]).not.toMatch(
      /<meta|action=|<iframe|<svg|onclick|href=|fetch\(1\)/,
    );
    expect(result.filteredActiveContent).toBe(true);
  });

  it('displays safe labels and fields but never activates link destinations', () => {
    const result = buildStaticDocument([
      {
        id: 'html',
        language: 'html',
        source:
          '<a id="jump" href="#questions">Questions</a><form id="questions"><fieldset><legend>Search</legend><label for="query">Place</label><input id="query" name="query" type="text"></fieldset></form>',
      },
    ]);
    expect(result.filteredActiveContent).toBe(false);
    expect(result.html).toContain('<a id="jump">Questions</a>');
    expect(result.html).toContain('<label for="query">Place</label>');
    expect(result.html).toContain(
      '<input id="query" name="query" type="text">',
    );
    expect(result.html).toContain("form-action 'none'");
    expect(result.html).not.toContain('allow-forms');
    expect(result.html).not.toContain('href=');
  });
});
