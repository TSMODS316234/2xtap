import { FastifyPluginAsync } from "fastify";

const questsRoute: FastifyPluginAsync = async (app) => {
  app.get("/quests", async (req, reply) => {
    if (!req.user) return reply.code(401).send({ error: "unauthorized" });

    const quests = await app.prisma.quest.findMany({ where: { active: true } });
    const statuses = await app.prisma.userQuest.findMany({ where: { userId: req.user.id } });

    return quests.map(q => {
      const uq = statuses.find(s => s.questId === q.id);
      return { ...q, status: uq?.status || "pending" };
    });
  });

  app.post("/quests/verify", async (req, reply) => {
    const { questId } = req.body as { questId: string };
    if (!req.user) return reply.code(401).send({ error: "unauthorized" });

    const quest = await app.prisma.quest.findUnique({ where: { id: questId } });
    if (!quest) return reply.code(404).send({ error: "quest_not_found" });

    const result = await app.prisma.$transaction(async (tx) => {
      if (quest.verify === false) {
        return tx.userQuest.upsert({
          where: { userId_questId: { userId: req.user!.id, questId } },
          update: { status: "pending" },
          create: { userId: req.user!.id, questId, status: "pending" }
        });
      }

      return tx.userQuest.upsert({
        where: { userId_questId: { userId: req.user!.id, questId } },
        update: { status: "verified", verifiedAt: new Date() },
        create: { userId: req.user!.id, questId, status: "verified", verifiedAt: new Date() }
      });
    });

    return { status: result.status };
  });

  app.post("/quests/claim", async (req, reply) => {
    const { questId } = req.body as { questId: string };
    if (!req.user) return reply.code(401).send({ error: "unauthorized" });

    const quest = await app.prisma.quest.findUnique({ where: { id: questId } });
    if (!quest) return reply.code(404).send({ error: "quest_not_found" });

    const result = await app.prisma.$transaction(async (tx) => {
      const uq = await tx.userQuest.findUnique({
        where: { userId_questId: { userId: req.user!.id, questId } }
      });

      if (!uq || uq.status !== "verified") throw new Error("not_verified");

      await tx.userQuest.update({
        where: { id: uq.id },
        data: { status: "claimed", claimedAt: new Date() }
      });

      const user = await tx.user.update({
        where: { id: req.user!.id },
        data: {
          totalPoints: { increment: quest.reward },
          questPoints: { increment: quest.reward }
        }
      });

      return { reward: quest.reward, totalPoints: user.totalPoints };
    });

    return { claimed: true, ...result };
  });
};

export default questsRoute;
