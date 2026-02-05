import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import prisma from "./plugins/prisma";
import auth from "./plugins/auth";
import rateLimit from "./plugins/rateLimit";
import meRoute from "./routes/me";
import tapRoute from "./routes/tap";
import questsRoute from "./routes/quests";
import upgradesRoute from "./routes/upgrades";
import leaderboardRoute from "./routes/leaderboard";
import publicRoute from "./routes/public";

const app = Fastify({ logger: true });

app.register(helmet);
app.register(cors, { origin: true });
app.register(prisma);
app.register(rateLimit);
app.register(publicRoute);
app.register(auth);

app.register(meRoute);
app.register(tapRoute);
app.register(questsRoute);
app.register(upgradesRoute);
app.register(leaderboardRoute);

app.listen({ port: 3001, host: "0.0.0.0" }).catch(err => {
  app.log.error(err);
  process.exit(1);
});
