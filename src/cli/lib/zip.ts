import JSZip from 'jszip';
import { readFileSync, writeFileSync } from 'node:fs';

/**
 * Creates a ZIP file with a root-level `bundle` entry.
 * This is the format expected by the platform's download/bundle endpoint.
 */
export async function createBundleZip(
  bundleJsPath: string,
  outputZipPath: string,
): Promise<void> {
  const bundleCode = readFileSync(bundleJsPath, 'utf-8');
  const zip = new JSZip();
  zip.file('bundle', bundleCode);
  const buffer = await zip.generateAsync({ type: 'nodebuffer' });
  writeFileSync(outputZipPath, buffer);
}
