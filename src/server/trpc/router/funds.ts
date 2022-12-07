import { Prisma } from "@prisma/client";
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

      if (!bankData) {
        throw new Error(`Bank does not exist`);
      }

      if (action === "DIRECT" || action === "CASHDEPOSIT") {
        await ctx.prisma.$transaction([
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
        try {
          await ctx.prisma.$transaction([
            ctx.prisma.transaction.create({
              data: {
                action: action,
                date: date,
                description: description,
                payee: payee,
                amount: -parseFloat(amount),
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
                amount: -parseFloat(amount),
                bankId: bankId,
                userId: ctx.session.user.id,
                checkNumber: checkNumber,
                dvNumber: dvNumber,
                status: "UNRELEASED",
                // userId: ctx.session?.user?.id as string,
              },
            }),
          ]);
        } catch (error) {
          console.log(error);
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
              throw new Error("Check number already exist");
            }
          }
        }
      }

      return { message: "Transaction successed" };
    }),
});
