import { z } from "zod";

import { router, protectedProcedure } from "../trpc";

export const transactionRouter = router({
  getAll: protectedProcedure
    .input(
      z.object({
        bankId: z.string(),
        createdAt: z.enum(["asc", "desc"]).optional(),
        date: z.enum(["asc", "desc"]).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const groups = await ctx.prisma.transaction.groupBy({
        by: ["bankId"],
        _sum: {
          amount: true,
        },
      });

      const filterGroup = groups.filter((g) => g.bankId === input.bankId);

      if (filterGroup) {
        const data = await ctx.prisma.transaction.findMany({
          where: {
            bankId: input.bankId,
          },

          orderBy: {
            createAt: input.createdAt,
            date: input.date,
          },
        });

        return {
          transactions: data,
          totalAmount: filterGroup ? filterGroup[0]?._sum.amount : 0,
        };
      }

      return {};
    }),
});
