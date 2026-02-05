import fp from "fastify-plugin";
import crypto from "node:crypto";

function checkInitData(initData: string, botToken: string): boolean {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return false;
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secret = crypto.createHash("sha256").update(botToken).digest();
  const hmac = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");
  return hmac === hash;
}

export default fp(async (app) => {
  app.decorateRequest("user", null);

  app.addHook("preHandler", async (req, reply) => {
    if (req.url.startsWith("/public")) return;
    const auth = req.headers.authorization;
    if (!auth?.startsWith("tma ")) return reply.code(401).send({ error: "unauthorized" });

    const initData = auth.slice(4);
    if (!checkInitData(initData, process.env.BOT_TOKEN || "")) {
      return reply.code(401).send({ error: "invalid_init_data" });
    }

    const params = new URLSearchParams(initData);
    const userJson = params.get("user");
    if (!userJson) return reply.code(401).send({ error: "missing_user" });

    const tgUser = JSON.parse(userJson) as {
      id: number; username?: string; first_name?: string; last_name?: string;
    };

    const user = await app.prisma.user.upsert({
      where: { telegramId: BigInt(tgUser.id) },
      update: {
        username: tgUser.username,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name
      },
      create: {
        telegramId: BigInt(tgUser.id),
        username: tgUser.username,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        referralCode: crypto.randomBytes(4).toString("hex")
      }
    });

    req.user = user;
  });
});

declare module "fastify" {
  interface FastifyRequest {
    user: import("@prisma/client").User | null;
  }
}
