import { z } from "zod";

import { router, publicProcedure } from "../trpc";

export const checkRouter = router({
  getAll: publicProcedure
    .input(
      z.object({
        to: z.string(),
        from: z.string(),
        status: z.enum(["RELEASED", "UNRELEASED"]),
        bankId: z.string().nullish(),
      })
    )
    .query(({ ctx, input }) => {
      const { to, from, status, bankId } = input;
      return ctx.prisma.check.findMany({
        where: {
          bankId: bankId ? bankId : undefined,
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
  released: publicProcedure
    .input(
      z.object({
        checkId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data = await ctx.prisma.check.update({
        where: {
          id: input.checkId,
        },

        data: {
          status: "RELEASED",
        },
      });

      return {};
    }),
});
