import { z } from "zod";

import { router, protectedProcedure } from "../trpc";

export const portingRouter = router({
  importLoan: protectedProcedure
    .input(
      z.object({
        totalAmount: z.number(),
        fundSection: z.enum(["GENERAL", "SEF", "TRUST"]),
        bankAcronym: z.string(),
        data: z.array(
          z.object({
            amount: z.number(),
            date: z.date(),
            payee: z.string(),
            description: z.string().optional(),
            dvNumber: z.string().optional(),
            checkNumber: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data: seedData, fundSection, bankAcronym } = input;

      const bank = await ctx.prisma.bank.findFirst({
        where: {
          fund: {
            section: fundSection,
          },
          acronym: bankAcronym,
        },
      });

      if (bank) {
        const transactionSeeds = seedData.map((d) => {
          return {
            action: "LOAN" as "LOAN" | "DIRECT" | "CASHDEPOSIT" | "EDITLOAN",
            bankId: bank.id,
            userId: ctx.session.user.id,
            ...d,
            amount: -d.amount,
          };
        });

        const checkSeeds = seedData.map((d) => {
          return {
            bankId: bank.id,
            userId: ctx.session.user.id,
            status: "UNRELEASED" as "UNRELEASED" | "RELEASED",
            ...d,
            amount: -d.amount,
          };
        });

        await ctx.prisma.$transaction([
          ctx.prisma.transaction.createMany({
            data: transactionSeeds,

            skipDuplicates: true,
          }),
          ctx.prisma.check.createMany({
            data: checkSeeds,

            skipDuplicates: true,
          }),
        ]);
      }

      return { message: `LOAN from ${fundSection} - ${bankAcronym} successfully imported` };
    }),

  deleteAll: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.transaction.deleteMany({});
    await ctx.prisma.check.deleteMany({});

    return {};
  }),
});
