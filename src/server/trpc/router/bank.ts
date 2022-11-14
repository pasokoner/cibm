import { z } from "zod";

import { router, publicProcedure } from "../trpc";

export const bankRouter = router({
  details: publicProcedure
    .input(z.object({ bankId: z.string().nullish() }))
    .query(async ({ input, ctx }) => {
      const data = await ctx.prisma.bank.findFirst({
        where: {
          id: input.bankId ? input.bankId : undefined,
        },

        include: {
          fund: {
            select: {
              section: true,
            },
          },
        },
      });

      return data;
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),
});
