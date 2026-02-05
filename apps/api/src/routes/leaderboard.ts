import { FastifyPluginAsync } from "fastify";

const leaderboardRoute: FastifyPluginAsync = async (app) => {
  app.get("/leaderboard", async () => {
    const users = await app.prisma.user.findMany({
      orderBy: { totalPoints: "desc" },
      take: 100,
      select: { username: true, totalPoints: true }
    });

    return users.map((u, i) => ({
      rank: i + 1,
      username: u.username ?? "anon",
      totalPoints: u.totalPoints
    }));
  });
};

export default leaderboardRoute;
