import { FastifyPluginAsync } from "fastify";

const meRoute: FastifyPluginAsync = async (app) => {
  app.get("/me", async (req, reply) => {
    if (!req.user) return reply.code(401).send({ error: "unauthorized" });
    const u = req.user;
    return {
      id: u.id,
      telegramId: u.telegramId.toString(),
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      totalPoints: u.totalPoints,
      tapPoints: u.tapPoints,
      questPoints: u.questPoints,
      energyMax: u.energyMax,
      energy: u.energy,
      regenRate: u.regenRate,
      tapPower: u.tapPower,
      referralCode: u.referralCode
    };
  });
};

export default meRoute;
