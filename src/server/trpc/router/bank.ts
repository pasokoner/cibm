import { z } from "zod";

import { router, protectedProcedure } from "../trpc";

export const bankRouter = router({
  details: protectedProcedure
    .input(z.object({ bankId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const data = await ctx.prisma.bank.findFirst({
        where: {
          id: input.bankId,
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

  add: protectedProcedure
    .input(
      z.object({
        fundId: z.string(),
        name: z.string(),
        acronym: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { fundId, name, acronym } = input;

      const data = await ctx.prisma.bank.create({
        data: {
          fundId: fundId,
          endingBalance: 0,
          name: name,
          acronym: acronym,
        },
      });

      return { message: "Bank Successfully Added" };
    }),
});
