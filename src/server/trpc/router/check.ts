import { z } from "zod";

import { router, protectedProcedure } from "../trpc";

export const checkRouter = router({
  getAll: protectedProcedure
    .input(
      z.object({
        to: z.string(),
        from: z.string(),
        status: z.enum(["RELEASED", "UNRELEASED", "CANCELLED"]),
        bankId: z.string().optional(),
      })
    )
    .query(({ ctx, input }) => {
      const { to, from, status, bankId } = input;

      const data = ctx.prisma.check.findMany({
        where: {
          bankId: bankId,
          status: status,
          date: {
            gte: new Date(new Date(from).setDate(new Date(from).getDate() - 1)),
          },

          AND: {
            date: {
              lte: new Date(new Date(to).setDate(new Date(to).getDate() + 1)),
            },
          },
        },

        orderBy: {
          date: "desc",
        },

        include: {
          bank: true,
        },
      });

      return data;
    }),
  released: protectedProcedure
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
          userId: ctx.session?.user?.id,
        },
      });

      return {};
    }),
  cancelled: protectedProcedure
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
          status: "CANCELLED",
          userId: ctx.session?.user?.id,
        },
      });

      return { message: "Successfully cancelled check" };
    }),
  edit: protectedProcedure
    .input(
      z.object({
        checkId: z.number(),
        dvNumber: z.string().optional(),
        checkNumber: z.string().optional(),
        amount: z.string(),
        description: z.string(),
        payee: z.string().optional(),
        date: z.date(),
        lastAmount: z.number(),
        lastCheckNumber: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { amount, description, payee, date, dvNumber, checkNumber, checkId, lastCheckNumber } =
        input;

      await ctx.prisma.$transaction([
        ctx.prisma.check.update({
          where: {
            id: checkId,
          },
          data: {
            date: date,
            description: description,
            payee: payee,
            amount: -parseFloat(amount),
            userId: ctx.session.user.id,
            checkNumber: checkNumber,
            dvNumber: dvNumber,
          },
        }),
        ctx.prisma.transaction.update({
          where: {
            checkNumber: lastCheckNumber,
          },
          data: {
            date: date,
            description: description,
            payee: payee,
            amount: -parseFloat(amount),
            userId: ctx.session.user.id,
            checkNumber: checkNumber,
            dvNumber: dvNumber,
          },
        }),
      ]);

      return { message: "Successfully edited check" };
    }),
});
