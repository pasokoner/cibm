import { z } from "zod";

import { router, protectedProcedure } from "../trpc";

export const transactionRouter = router({
  getAll: protectedProcedure.input(z.object({ bankId: z.string() })).query(({ input, ctx }) => {
    const data = ctx.prisma.transaction.findMany({
      where: {
        bankId: input.bankId,
      },

      orderBy: {
        date: "desc",
      },
    });

    return data;
  }),
});
