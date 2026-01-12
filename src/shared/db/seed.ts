/* eslint-disable no-console, sonarjs/pseudo-random */

import { db } from '@/shared/db'
import { faker } from '@faker-js/faker'
import { DatabaseError } from 'pg'

import { hashPassword } from '@/lib/crypto'

// Seeds a default organization and admin user.
// Values can be overridden via env:
//   SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ORG_NAME

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!@#'
const ORG_NAME = process.env.SEED_ORG_NAME ?? 'Acme Inc'

async function seed() {
  console.log('Starting seed...')

  try {
    await db.transaction().execute(async (trx) => {
      // Ensure org exists
      const org = await trx
        .insertInto('organizations')
        .values({ name: ORG_NAME })
        .returning('id')
        .executeTakeFirstOrThrow()
      const orgId = org.id
      console.log(`Organization created: ${ORG_NAME} (${orgId})`)

      // Create admin user
      const saltAndHash = await hashPassword(ADMIN_PASSWORD)
      const [salt, password_hash] = saltAndHash.split(':') as [string, string]

      const adminUser = await trx
        .insertInto('users')
        .values({
          email: ADMIN_EMAIL,
          password_hash,
          salt,
        })
        .returning('id')
        .executeTakeFirstOrThrow()
      const adminUserId = adminUser.id
      console.log(`Admin user created: ${ADMIN_EMAIL} (${adminUserId})`)

      // Link as admin to org
      await trx
        .insertInto('users_organizations')
        .values({
          user_id: adminUserId,
          organization_id: orgId,
          role: 'admin',
        })
        .execute()

      // Create more users
      const userIds: string[] = [adminUserId]
      for (let i = 0; i < 5; i++) {
        const saltAndHash = await hashPassword(faker.internet.password())
        const [salt, password_hash] = saltAndHash.split(':') as [string, string]
        const user = await trx
          .insertInto('users')
          .values({
            email: faker.internet.email(),
            password_hash,
            salt,
          })
          .returning('id')
          .executeTakeFirstOrThrow()
        userIds.push(user.id)
        await trx
          .insertInto('users_organizations')
          .values({
            user_id: user.id,
            organization_id: orgId,
            role: 'member',
          })
          .execute()
      }
      console.log(`Created 5 additional users.`)

      // Create projects
      for (let i = 0; i < 3; i++) {
        const project = await trx
          .insertInto('projects')
          .values({
            name: faker.company.buzzPhrase(),
            organization_id: orgId,
            created_by_id: adminUserId,
          })
          .returning(['id', 'name'])
          .executeTakeFirstOrThrow()
        console.log(`Created project: ${project.name}`)

        // Create tasks
        for (let j = 0; j < 5; j++) {
          const task = await trx
            .insertInto('tasks')
            .values({
              title: faker.hacker.phrase(),
              project_id: project.id,
              organization_id: orgId,
              created_by_id:
                userIds[Math.floor(Math.random() * userIds.length)]!,
            })
            .returning('id')
            .executeTakeFirstOrThrow()

          // Create comments
          for (let k = 0; k < 2; k++) {
            await trx
              .insertInto('comments')
              .values({
                body: faker.lorem.sentence(),
                task_id: task.id,
                user_id: userIds[Math.floor(Math.random() * userIds.length)]!,
                organization_id: orgId,
              })
              .execute()
          }
        }
        console.log(
          `Created 5 tasks with 2 comments each for project ${project.name}`,
        )
      }
    })

    console.log('Seed completed successfully.')
    console.log(`Login with: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
  } catch (err: unknown) {
    if (err instanceof DatabaseError && err.code === '23505') {
      console.error(
        'Seed failed due to unique constraint (maybe already seeded).',
      )
    } else {
      console.error(err)
    }
    process.exit(1)
  } finally {
    process.exit()
  }
}

seed()
