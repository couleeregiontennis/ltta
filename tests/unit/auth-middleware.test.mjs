import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

describe('JWT Secret Security in auth middleware', () => {
  test('throws error in production when JWT_SECRET is not provided', () => {
    assert.throws(
      () => {
        execSync(
          `node --input-type=module -e "import './server/middleware/auth.js';"`,
          {
            cwd: rootDir,
            env: { ...process.env, NODE_ENV: 'production', JWT_SECRET: '' },
            stdio: 'pipe'
          }
        );
      },
      (err) => {
        const stderr = err.stderr ? err.stderr.toString() : '';
        return stderr.includes('JWT_SECRET environment variable is required in production');
      }
    );
  });

  test('allows starting in production when JWT_SECRET is provided', () => {
    const output = execSync(
      `node --input-type=module -e "import { JWT_SECRET } from './server/middleware/auth.js'; console.log(JWT_SECRET);"`,
      {
        cwd: rootDir,
        env: { ...process.env, NODE_ENV: 'production', JWT_SECRET: 'my-production-secret' },
        encoding: 'utf8'
      }
    );
    assert.equal(output.trim(), 'my-production-secret');
  });

  test('uses fallback secret in non-production when JWT_SECRET is omitted', () => {
    const output = execSync(
      `node --input-type=module -e "import { JWT_SECRET } from './server/middleware/auth.js'; console.log(JWT_SECRET);"`,
      {
        cwd: rootDir,
        env: { ...process.env, NODE_ENV: 'development', JWT_SECRET: '' },
        encoding: 'utf8'
      }
    );
    assert.equal(output.trim(), 'ltta-local-dev-secret-change-in-production');
  });
});
