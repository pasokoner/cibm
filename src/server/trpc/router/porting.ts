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
            description: z.string(),
            dvNumber: z.string().optional(),
            checkNumber: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { totalAmount, data: seedData, fundSection, bankAcronym } = input;

      const bank = await ctx.prisma.bank.findFirst({
        where: {
          fund: {
            section: fundSection,
          },
          acronym: bankAcronym,
        },
      });

      if (bank) {
        const newEndingBalance = bank.endingBalance - totalAmount;

        const transactionSeeds = seedData.map((d) => {
          return {
            action: "LOAN" as "LOAN" | "DIRECT" | "CASHDEPOSIT" | "EDITLOAN",
            bankId: bank.id,
            userId: ctx.session.user.id,
            ...d,
          };
        });

        const checkSeeds = seedData.map((d) => {
          return {
            bankId: bank.id,
            userId: ctx.session.user.id,
            status: "UNRELEASED" as "UNRELEASED" | "RELEASED",
            ...d,
          };
        });

        await ctx.prisma.$transaction([
          ctx.prisma.bank.update({
            where: {
              id: bank.id,
            },
            data: {
              endingBalance: newEndingBalance,
            },
          }),
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

      return {};
    }),
});
