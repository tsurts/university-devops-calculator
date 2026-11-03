import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
for (const directory of ['dist', '.vercel/output']) {
  await rm(directory, { recursive: true, force: true });
}
await mkdir('.vercel/output/static', { recursive: true });
await cp('src', 'dist', { recursive: true });
await cp('dist', '.vercel/output/static', { recursive: true });
await writeFile('.vercel/output/config.json', JSON.stringify({ version: 3 }));
console.log('Built static assets in dist/ and Vercel Build Output API artifact in .vercel/output/');
