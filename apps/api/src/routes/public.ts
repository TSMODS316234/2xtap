import { FastifyPluginAsync } from "fastify";
import crypto from "node:crypto";

const publicRoute: FastifyPluginAsync = async (app) => {
  app.post("/public/referral", async (req, reply) => {
    const token = req.headers["x-bot-token"];
    if (token !== process.env.BOT_TOKEN) return reply.code(401).send({ error: "unauthorized" });

    const { inviterCode, inviteeTelegramId } = req.body as { inviterCode: string; inviteeTelegramId: number };

    const inviter = await app.prisma.user.findUnique({ where: { referralCode: inviterCode } });
    if (!inviter) return reply.code(404).send({ error: "inviter_not_found" });

    const invitee = await app.prisma.user.upsert({
      where: { telegramId: BigInt(inviteeTelegramId) },
      update: {},
      create: {
        telegramId: BigInt(inviteeTelegramId),
        referralCode: crypto.randomBytes(4).toString("hex")
      }
    });

    if (!invitee.referredById) {
      await app.prisma.$transaction(async (tx) => {
        await tx.user.update({ where: { id: invitee.id }, data: { referredById: inviter.id } });
        await tx.referral.upsert({
          where: { inviterId_inviteeId: { inviterId: inviter.id, inviteeId: invitee.id } },
          update: {},
          create: { inviterId: inviter.id, inviteeId: invitee.id }
        });
      });
    }

    return { ok: true };
  });
};

export default publicRoute;
