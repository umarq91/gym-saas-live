import { prisma } from "../db"
import { GymStatus, UserRole } from "../generated/prisma/enums"


const PASSWORD =
  "$2b$12$jzsXCsbnmJgEITa3QP4PM.xEUzgUMviSwPJ3FS2TNWFZ0ce1aJ.7e"

async function main() {
  console.log("🌱 Seeding database...")

  // ---- Gyms --------------------------------------------------
  const gyms = await prisma.gym.createMany({
    data: Array.from({ length: 5 }).map((_, i) => ({
      name: `Gym ${i + 1}`,
      address: `Street ${i + 1}, City`,
      googleMapAddress: `https://maps.google.com/?q=Gym+${i + 1}`,
      status: GymStatus.ACTIVE,
    })),
  })

  const allGyms = await prisma.gym.findMany()

  // ---- Users (OWNER + STAFF only) ----------------------------
  for (let i = 0; i < 10; i++) {
    const gym = allGyms[i % allGyms.length]

    await prisma.user.create({
      data: {
        email: `user${i + 2}@example.com`,
        username: `user${i + 1}`,
        name: `User ${i + 1}`,
        password: PASSWORD,
        role: i % 2 === 0 ? UserRole.OWNER : UserRole.STAFF,
        gymId: gym.id,
      },
    })
  }

  // ---- Members ----------------------------------------------
  for (let i = 0; i < 10; i++) {
    const gym = allGyms[i % allGyms.length]

    await prisma.member.create({
      data: {
        name: `Member ${i + 1}`,
        phone: `0300-00000${i}`,
        email: `member${i + 1}@example.com`,
        gymId: gym.id,
        isActive: true,
      },
    })
  }

  console.log("✅ Seeding completed")
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
