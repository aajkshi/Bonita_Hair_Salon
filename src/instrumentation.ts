export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { execSync } = await import("child_process");
    try {
      execSync("npx prisma db push --skip-generate", {
        stdio: "inherit",
        env: { ...process.env },
      });
      console.log("Database schema pushed successfully");
    } catch (e) {
      console.error("Failed to push database schema:", e);
    }

    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      const staffCount = await prisma.staff.count();
      if (staffCount === 0) {
        console.log("Database empty, running seed...");
        execSync("npx tsx prisma/seed.ts", {
          stdio: "inherit",
          env: { ...process.env },
        });
        console.log("Seed completed");
      }
      await prisma.$disconnect();
    } catch (e) {
      console.error("Failed to check/seed database:", e);
    }
  }
}
