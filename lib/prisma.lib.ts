import { Prisma, PrismaClient } from "@prisma/client";
// import { aggregateTemplate } from "./template.util";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({ log: ["info"] });
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;

// export const EmbeddedExcerciseQuery = async (
//   query: string,
//   limit: number,
//   numCandidates: number
// ): Promise<any> => {
//   console.log("Initiated Query");
//   return await prisma.embeddedexercises.aggregateRaw({
//     pipeline: await aggregateTemplate(query, limit, numCandidates),
//   });
// };
