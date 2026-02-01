import 'server-only'

import { scrypt as _scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scrypt = promisify(_scrypt)

const HASH_KEY_LEN = 64

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = (await scrypt(password, salt, HASH_KEY_LEN)) as Buffer

  return `${salt}:${derivedKey.toString('hex')}`
}

export const verifyPassword = async (
  password: string,
  saltAndHash: string,
): Promise<boolean> => {
  const [salt, hash] = saltAndHash.split(':')

  if (!salt || !hash) {
    return false
  }

  const derivedKey = (await scrypt(password, salt, HASH_KEY_LEN)) as Buffer
  const hashBuffer = Buffer.from(hash, 'hex')

  return timingSafeEqual(derivedKey, hashBuffer)
}
