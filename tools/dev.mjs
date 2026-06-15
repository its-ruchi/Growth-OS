import { spawn } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const children = [];
let exiting = false;

function launch(script) {
  const child = spawn(`${npmCommand} run ${script}`, {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  child.on('error', (error) => {
    if (exiting) return;
    exiting = true;
    // eslint-disable-next-line no-console
    console.error(`Failed to start "${script}" process:`, error);
    for (const proc of children) {
      if (!proc.killed) proc.kill();
    }
    process.exit(1);
  });

  child.on('exit', (code) => {
    if (exiting) return;
    if (code && code !== 0) {
      exiting = true;
      for (const proc of children) {
        if (!proc.killed) proc.kill();
      }
      process.exit(code);
    }
  });

  children.push(child);
}

function shutdown() {
  if (exiting) return;
  exiting = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

launch('dev:api');
launch('dev:client');
