import { z } from "zod";

import { router, publicProcedure } from "../trpc";

export const fundsRouter = router({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.fund.findMany({
      include: {
        bank: true,
      },
    });
  }),
  getSpecificFunds: publicProcedure
    .input(z.object({ section: z.enum(["GENERAL", "SEF", "TRUST"]) }))
    .query(({ ctx, input }) => {
      return ctx.prisma.fund.findFirst({
        where: {
          section: input.section,
        },
        include: {
          bank: true,
        },
      });
    }),

  transact: publicProcedure
    .input(
      z.object({
        action: z.enum(["DIRECT", "CASHDEPOSIT", "LOAN"]),
        dvNumber: z.string().optional(),
        checkNumber: z.string().optional(),
        depositNumber: z.string().optional(),
        bankId: z.string(),
        amount: z.number(),
        description: z.string(),
        date: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { action, bankId, amount, description, date, dvNumber, checkNumber, depositNumber } =
        input;

      const bankData = await ctx.prisma.bank.findFirst({
        where: {
          id: bankId,
        },
      });

      if (!bankData?.endingBalance) {
        throw new Error(`Bank does not exist`);
      }

      let newEndingBalance = 0;

      if (action === "DIRECT" || action === "CASHDEPOSIT") {
        newEndingBalance = bankData.endingBalance + amount;
        await ctx.prisma.$transaction([
          ctx.prisma.bank.update({
            where: {
              id: bankId,
            },
            data: {
              endingBalance: newEndingBalance,
            },
          }),
          ctx.prisma.transaction.create({
            data: {
              action: action,
              date: date,
              description: description,
              amount: amount,
              bankId: bankId,
              userId: "cla979of70000f1pgzi50s8wt",
              depositNumber: depositNumber,
              // userId: ctx.session?.user?.id as string,
            },
          }),
        ]);
      }

      if (action === "LOAN" && dvNumber && checkNumber) {
        newEndingBalance = bankData.endingBalance - amount;

        await ctx.prisma.$transaction([
          ctx.prisma.bank.update({
            where: {
              id: bankId,
            },
            data: {
              endingBalance: newEndingBalance,
            },
          }),
          ctx.prisma.transaction.create({
            data: {
              action: action,
              date: date,
              description: description,
              amount: amount,
              bankId: bankId,
              userId: "cla979of70000f1pgzi50s8wt",
              checkNumber: checkNumber,
              dvNumber: dvNumber,
              // userId: ctx.session?.user?.id as string,
            },
          }),
          ctx.prisma.check.create({
            data: {
              date: date,
              description: description,
              amount: amount,
              bankId: bankId,
              userId: "cla979of70000f1pgzi50s8wt",
              checkNumber: checkNumber,
              dvNumber: dvNumber,
              status: "UNRELEASED",
              // userId: ctx.session?.user?.id as string,
            },
          }),
        ]);
      }

      return { message: "Transaction successed" };
    }),
});
