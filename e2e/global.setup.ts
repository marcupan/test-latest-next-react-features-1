/* eslint-disable no-console */
import { execSync } from 'child_process'

async function globalSetup() {
  console.log('Setting up e2e tests...')
  console.log('Rebuilding database...')
  // eslint-disable-next-line sonarjs/no-os-command-from-path
  execSync('pnpm run db:rebuild', { stdio: 'inherit' })
  console.log('Seeding database...')
  // eslint-disable-next-line sonarjs/no-os-command-from-path
  execSync('pnpm run db:seed', { stdio: 'inherit' })
  console.log('E2E setup complete.')
}

export default globalSetup
