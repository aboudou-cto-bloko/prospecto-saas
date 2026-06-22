import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { scrypt, randomBytes } from "node:crypto";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const config = { N: 16384, r: 16, p: 1, dkLen: 64 };

function generateKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password.normalize("NFKC"),
      salt,
      config.dkLen,
      { N: config.N, r: config.r, p: config.p, maxmem: 128 * config.N * config.r * 2 },
      (err, key) => { if (err) reject(err); else resolve(key); }
    );
  });
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = await generateKey(password, salt);
  return `${salt}:${key.toString("hex")}`;
}

async function main() {
  const hash = await hashPassword("ProspectDemo2026!");
  console.log("Hash:", hash.substring(0, 40) + "...");

  const account = await prisma.account.findFirst({
    where: { user: { email: "pro@aboudouzinsou.com" }, providerId: "credential" },
  });

  if (!account) {
    console.error("Account not found");
    return;
  }

  await prisma.account.update({
    where: { id: account.id },
    data: { password: hash },
  });

  console.log("Password updated for pro@aboudouzinsou.com");
}

main().catch(console.error).finally(() => prisma.$disconnect());
