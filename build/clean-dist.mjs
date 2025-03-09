import fs from 'node:fs';

await fs.promises.rm('dist/', { recursive: true, force: true });
