import { FastifyPluginAsync } from "fastify";

const tapRoute: FastifyPluginAsync = async (app) => {
  app.post("/tap", async (req, reply) => {
    const { taps } = req.body as { taps: number; client_ts: number };
    if (!req.user) return reply.code(401).send({ error: "unauthorized" });

    const maxTaps = 50;
    if (taps <= 0 || taps > maxTaps) {
      return reply.code(400).send({ error: "invalid_taps" });
    }

    const userId = req.user.id;
    const now = new Date();

    const result = await app.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("user_not_found");

      const minutes = Math.floor((now.getTime() - user.lastEnergyAt.getTime()) / 60000);
      const regen = minutes * user.regenRate;
      const energy = Math.min(user.energyMax, user.energy + regen);

      const usableTaps = Math.min(taps, energy);
      const earned = usableTaps * user.tapPower;
      const newEnergy = energy - usableTaps;

      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          energy: newEnergy,
          lastEnergyAt: now,
          totalPoints: { increment: earned },
          tapPoints: { increment: earned }
        }
      });

      return { earned, energyLeft: updated.energy, totalPoints: updated.totalPoints, tapPoints: updated.tapPoints };
    });

    return result;
  });
};

export default tapRoute;
