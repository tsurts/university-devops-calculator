import { mkdir, appendFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { setTimeout } from 'node:timers/promises';

const target = process.argv[2] ?? process.env.APP_URL;
const logPath = process.env.HEALTH_LOG ?? 'logs/health-check.log';
if (!target) {
  console.error('Usage: npm run health-check -- https://your-app.vercel.app');
  process.exit(1);
}
const url = new URL(target);
if (!['https:', 'http:'].includes(url.protocol)) throw new Error('URL must use HTTP or HTTPS');
await mkdir(dirname(logPath), { recursive: true });
let healthy = false;
for (let attempt = 1; attempt <= 5; attempt++) {
  const start = Date.now();
  let detail;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000), redirect: 'follow' });
    const body = await response.text();
    healthy = response.ok && body.includes('<title>DevOps Calculator</title>') && body.includes('id="display"');
    detail = 'status=' + response.status + ' content=' + (healthy ? 'valid' : 'invalid');
  } catch (error) {
    detail = 'error=' + error.message;
  }
  const line = new Date().toISOString() + ' ' + (healthy ? 'PASS' : 'FAIL') + ' attempt=' + attempt + ' url=' + url.origin + url.pathname + ' ' + detail + ' duration_ms=' + (Date.now() - start) + '\n';
  await appendFile(logPath, line);
  process.stdout.write(line);
  if (healthy) break;
  if (attempt < 5) await setTimeout(3000);
}
process.exitCode = healthy ? 0 : 1;
