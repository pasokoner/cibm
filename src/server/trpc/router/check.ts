import { z } from "zod";

import { router, publicProcedure } from "../trpc";

export const checkRouter = router({
  getAll: publicProcedure
    .input(
      z.object({
        to: z.string(),
        from: z.string(),
        status: z.enum(["RELEASED", "UNRELEASED"]),
      })
    )
    .query(({ ctx, input }) => {
      const { to, from, status } = input;

      return ctx.prisma.check.findMany({
        where: {
          status: status,

          date: {
            gte: new Date(from),
          },

          AND: {
            date: {
              lte: new Date(to),
            },
          },
        },

        include: {
          bank: true,
          
        },
      });
    }),
});
