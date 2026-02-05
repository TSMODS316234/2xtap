import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.quest.upsert({
    where: { key: "daily_checkin" },
    update: {},
    create: {
      key: "daily_checkin",
      type: "daily_checkin",
      title: "Daily Check-in",
      description: "Come back every day",
      reward: 10,
      verify: true
    }
  });

  await prisma.quest.upsert({
    where: { key: "join_channel" },
    update: {},
    create: {
      key: "join_channel",
      type: "join_channel",
      title: "Join Channel",
      description: "Join our Telegram channel",
      reward: 25,
      verify: true,
      metadata: { channel: "@your_channel" }
    }
  });

  await prisma.quest.upsert({
    where: { key: "referral_bonus" },
    update: {},
    create: {
      key: "referral_bonus",
      type: "referral_bonus",
      title: "Invite a Friend",
      description: "Get bonus when friend joins",
      reward: 50,
      verify: true
    }
  });

  await prisma.quest.upsert({
    where: { key: "exchange_signup" },
    update: {},
    create: {
      key: "exchange_signup",
      type: "exchange_signup",
      title: "Exchange Signup",
      description: "Manual verification by admin",
      reward: 100,
      verify: false
    }
  });

  const upgrades = [
    { key: "tap_power", title: "Tap Power", baseCost: 50, increment: 25 },
    { key: "energy_max", title: "Energy Max", baseCost: 100, increment: 50 },
    { key: "regen_rate", title: "Regen Rate", baseCost: 150, increment: 75 }
  ];

  for (const u of upgrades) {
    await prisma.upgrade.upsert({
      where: { key: u.key },
      update: {},
      create: { ...u, description: "Upgrade your stats" }
    });
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});
