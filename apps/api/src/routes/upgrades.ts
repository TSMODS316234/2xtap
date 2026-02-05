import { FastifyPluginAsync } from "fastify";

const upgradesRoute: FastifyPluginAsync = async (app) => {
  app.post("/upgrades/buy", async (req, reply) => {
    const { upgradeKey } = req.body as { upgradeKey: string };
    if (!req.user) return reply.code(401).send({ error: "unauthorized" });

    const result = await app.prisma.$transaction(async (tx) => {
      const upgrade = await tx.upgrade.findUnique({ where: { key: upgradeKey } });
      if (!upgrade) throw new Error("upgrade_not_found");

      const userUpgrade = await tx.userUpgrade.upsert({
        where: { userId_upgradeId: { userId: req.user!.id, upgradeId: upgrade.id } },
        update: {},
        create: { userId: req.user!.id, upgradeId: upgrade.id }
      });

      const cost = upgrade.baseCost + (userUpgrade.level * upgrade.increment);
      const user = await tx.user.findUnique({ where: { id: req.user!.id } });
      if (!user || user.totalPoints < cost) throw new Error("not_enough_points");

      const newLevel = userUpgrade.level + 1;
      if (newLevel > upgrade.maxLevel) throw new Error("max_level");

      await tx.userUpgrade.update({
        where: { id: userUpgrade.id },
        data: { level: newLevel }
      });

      const updated = await tx.user.update({
        where: { id: req.user!.id },
        data: {
          totalPoints: { decrement: cost },
          tapPower: upgradeKey === "tap_power" ? { increment: 1 } : undefined,
          energyMax: upgradeKey === "energy_max" ? { increment: 10 } : undefined,
          regenRate: upgradeKey === "regen_rate" ? { increment: 1 } : undefined
        }
      });

      return { level: newLevel, totalPoints: updated.totalPoints };
    });

    return result;
  });
};

export default upgradesRoute;
