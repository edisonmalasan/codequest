import {
  captureInteractiveSnapshot,
  InteractiveSourceError,
  type CapturedInteractiveSnapshot,
} from '@/features/interactive';
import type { PreviewFile } from '@/features/preview';
import type { WorkspaceFile } from '@/features/editor/editor-workspace-types';

export const BUILD_SCHEMA_VERSION = 1;
export const BUILD_MANIFEST_VERSION = 1;
export const BUILD_TEMPLATE_VERSION = 1;
export const BUILD_CONTENT_VERSION = 'build-web-v1';
export const BUILD_FILE_IDS = ['index.html', 'style.css', 'main.js'] as const;

export const BUILD_STARTER_FILES: readonly WorkspaceFile[] = Object.freeze([
  Object.freeze({
    id: 'index.html',
    name: 'index.html',
    language: 'html',
    starterSource:
      '<main class="site">\n  <h1>Your first Build</h1>\n  <p id="message">Make something original.</p>\n  <button id="change">Change the message</button>\n</main>',
  }),
  Object.freeze({
    id: 'style.css',
    name: 'style.css',
    language: 'css',
    starterSource:
      '.site { max-width: 32rem; margin: 2rem auto; padding: 2rem; font-family: system-ui; color: #172340; }\nbutton { padding: .7rem 1rem; border: 0; border-radius: .5rem; background: #345bc8; color: white; cursor: pointer; }',
  }),
  Object.freeze({
    id: 'main.js',
    name: 'main.js',
    language: 'javascript',
    starterSource:
      'document.getElementById("change").addEventListener("click", () => {\n  document.getElementById("message").textContent = "You made it yours!";\n});',
  }),
]);

/** Validate the fixed Build manifest before forwarding any source to Run. */
export function validateBuildSnapshot(
  files: readonly PreviewFile[],
): CapturedInteractiveSnapshot {
  if (!Array.isArray(files) || files.length !== BUILD_STARTER_FILES.length) {
    throw new InteractiveSourceError('Build requires three reviewed files');
  }
  for (let index = 0; index < BUILD_STARTER_FILES.length; index += 1) {
    const actual = files[index];
    const expected = BUILD_STARTER_FILES[index];
    if (actual?.id !== expected.id || actual.language !== expected.language) {
      throw new InteractiveSourceError('Build manifest is unsupported');
    }
  }
  return captureInteractiveSnapshot({
    contentVersion: BUILD_CONTENT_VERSION,
    files,
  });
}
