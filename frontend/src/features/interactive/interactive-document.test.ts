import { describe, expect, it } from 'vitest';
import {
  captureInteractiveSnapshot,
  InteractiveSourceError,
} from './interactive-snapshot';
import { buildInteractiveDocument } from './interactive-document';

function documentFrom(html: string) {
  return buildInteractiveDocument(
    captureInteractiveSnapshot({
      contentVersion: 'q01:1',
      files: [
        { id: 'page', language: 'html', source: html },
        { id: 'logic', language: 'javascript', source: '' },
      ],
    }),
  );
}

describe('interactive display document', () => {
  it('assigns bounded stable node IDs for a simple DOM exercise', () => {
    const result = documentFrom(
      '<main><h1 id="title">Hello</h1><button id="next">Next</button></main>',
    );
    expect(
      result.nodes.map((node) => [node.nodeId, node.parentId, node.tag]),
    ).toEqual([
      ['n0', null, 'main'],
      ['n1', 'n0', 'h1'],
      ['n2', 'n0', 'button'],
    ]);
    expect(result.body).toContain('data-cq-node="n1"');
    expect(result.description).toContain('Hello');
  });

  it('removes executable markup, navigation, and unsafe input types', () => {
    const result = documentFrom(
      '<a href="https://sink.test">Link</a><script>fetch("https://sink.test")</script><input type="submit" onfocus="alert(1)">',
    );
    expect(result.body).not.toContain('sink.test');
    expect(result.body).not.toContain('<script');
    expect(result.body).not.toContain('onfocus');
    expect(result.body).toContain('type="text"');
    expect(result.filteredActiveContent).toBe(true);
  });

  it('rejects an element flood rather than rendering partial success', () => {
    expect(() => documentFrom('<span>x</span>'.repeat(513))).toThrow(
      InteractiveSourceError,
    );
  });
});
