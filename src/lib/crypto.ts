import { scrypt as _scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scrypt = promisify(_scrypt)

const HASH_KEY_LEN = 64 // 64 bytes

/**
 * Hashes a password with a random salt using scrypt.
 * @param password The password to hash.
 * @returns A promise that resolves to "salt:hash".
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = (await scrypt(password, salt, HASH_KEY_LEN)) as Buffer

  return `${salt}:${derivedKey.toString('hex')}`
}

/**
 * Verifies a password against a salt and hash.
 * @param password The password to verify.
 * @param saltAndHash The "salt:hash" string from the database.
 * @returns A promise that resolves to true if the password is correct, false otherwise.
 */
export async function verifyPassword(
  password: string,
  saltAndHash: string,
): Promise<boolean> {
  const [salt, hash] = saltAndHash.split(':')

  if (!salt || !hash) {
    return false // Or throw an error, depending on the desired behavior
  }

  const derivedKey = (await scrypt(password, salt, HASH_KEY_LEN)) as Buffer
  const hashBuffer = Buffer.from(hash, 'hex')

  // Use timingSafeEqual to prevent timing attacks
  return timingSafeEqual(derivedKey, hashBuffer)
}
