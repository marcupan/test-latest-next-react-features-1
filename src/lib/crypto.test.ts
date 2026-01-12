/* eslint-disable sonarjs/no-hardcoded-passwords */
import { hashPassword, verifyPassword } from './crypto'

describe('Password Hashing and Verification', () => {
  it('should correctly hash and verify a password', async () => {
    const password = 'my-secret-password'
    const saltAndHash = await hashPassword(password)
    const isCorrect = await verifyPassword(password, saltAndHash)

    expect(isCorrect).toBe(true)
  })

  it('should return false for an incorrect password', async () => {
    const password = 'my-secret-password'
    const wrongPassword = 'another-password'
    const saltAndHash = await hashPassword(password)
    const isCorrect = await verifyPassword(wrongPassword, saltAndHash)

    expect(isCorrect).toBe(false)
  })

  it('should return false for an invalid saltAndHash string', async () => {
    const password = 'my-secret-password'
    const invalidSaltAndHash = 'invalid-string'
    const isCorrect = await verifyPassword(password, invalidSaltAndHash)

    expect(isCorrect).toBe(false)
  })
})
