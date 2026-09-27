const appPort = process.env.CODEQUEST_E2E_APP_PORT ?? '3100';
const previewPort = process.env.CODEQUEST_E2E_PREVIEW_PORT ?? '3101';

export const appOrigin = `http://127.0.0.1:${appPort}`;
export const runtimeOrigin = `http://localhost:${appPort}`;
export const previewOrigin = `http://localhost:${previewPort}`;
