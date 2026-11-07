export const bundledModel = {
  name: 'RealESR general ×4',
  file: 'models/realesr-general-x4v3.onnx',
  id: '924ebad6532777303582d4ce7811849b88869231a3ae7093e0f21200249df8d5',
  scale: 4,
};
export const previewSide = (mobile: boolean) => mobile ? 192 : 320;
export function aiInputLimit(maxPixels: number, scale: number) { return Math.floor(maxPixels / (scale * scale)); }
export function aiSizeError(width: number, height: number, maxPixels: number, scale = 4) {
  const limit = aiInputLimit(maxPixels, scale);
  return width * height > limit
    ? `Esta foto tiene ${(width * height / 1e6).toFixed(2)} MP. La IA ×${scale} admite hasta ${(limit / 1e6).toFixed(2)} MP de entrada en este dispositivo. Prepara una copia ligera o usa los ajustes clásicos.`
    : null;
}
export function fittedInput(width: number, height: number, maxPixels: number, scale = 4) {
  const ratio = Math.min(1, Math.sqrt(aiInputLimit(maxPixels, scale) / (width * height)));
  return { width: Math.max(1, Math.floor(width * ratio)), height: Math.max(1, Math.floor(height * ratio)) };
}
export function remainingTime(completed: number, total: number, elapsedMs: number) {
  return completed >= 2 && completed < total ? Math.max(0, elapsedMs / completed * (total - completed)) : undefined;
}
export function duration(ms: number) {
  const seconds = Math.max(1, Math.round(ms / 1000));
  return seconds < 60 ? `${seconds} s` : `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
}
export interface InferenceProgress {
  stage: 'loading-model' | 'upscaling' | 'composing' | 'encoding';
  completed: number;
  total: number;
  elapsedMs: number;
  etaMs?: number;
}
export interface AiReport {
  inputWidth: number;
  inputHeight: number;
  outputWidth: number;
  outputHeight: number;
  scale: number;
  blocks: number;
  elapsedMs: number;
  backend: 'cpu';
}
