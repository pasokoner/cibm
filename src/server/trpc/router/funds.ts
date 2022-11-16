import { z } from "zod";

import { router, protectedProcedure } from "../trpc";

export const fundsRouter = router({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.fund.findMany({
      include: {
        bank: true,
      },
    });
  }),
  getSpecificFunds: protectedProcedure
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

  transact: protectedProcedure
    .input(
      z.object({
        action: z.enum(["DIRECT", "CASHDEPOSIT", "LOAN"]),
        dvNumber: z.string().optional(),
        checkNumber: z.string().optional(),
        depositNumber: z.string().optional(),
        bankId: z.string(),
        amount: z.string(),
        description: z.string(),
        payee: z.string().optional(),
        date: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        action,
        bankId,
        amount,
        description,
        payee,
        date,
        dvNumber,
        checkNumber,
        depositNumber,
      } = input;

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
        newEndingBalance = bankData.endingBalance + parseFloat(amount);
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
              amount: parseFloat(amount),
              bankId: bankId,
              userId: ctx.session.user.id,
              depositNumber: depositNumber,
              // userId: ctx.session?.user?.id as string,
            },
          }),
        ]);
      }

      if (action === "LOAN" && checkNumber && payee) {
        newEndingBalance = bankData.endingBalance - parseFloat(amount);

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
              payee: payee,
              amount: parseFloat(amount),
              bankId: bankId,
              userId: ctx.session.user.id,
              checkNumber: checkNumber,
              dvNumber: dvNumber,
              // userId: ctx.session?.user?.id as string,
            },
          }),
          ctx.prisma.check.create({
            data: {
              date: date,
              payee: payee,
              description: description,
              amount: parseFloat(amount),
              bankId: bankId,
              userId: ctx.session.user.id,
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
