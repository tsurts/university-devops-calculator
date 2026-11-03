import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function deploymentUrl(result) {
  if (result.error) throw new Error('Vercel reported a deployment error');
  const deployment = result.deployment ?? result;
  const value = deployment.productionUrl || deployment.url;
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Vercel response did not contain a deployment URL');
  }
  const url = new URL(value.startsWith('https://') ? value : 'https://' + value);
  if (!url.hostname.endsWith('.vercel.app') || url.username || url.password) {
    throw new Error('Expected a Vercel application URL');
  }
  return url.href;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(deploymentUrl(JSON.parse(readFileSync(process.argv[2], 'utf8'))));
}
