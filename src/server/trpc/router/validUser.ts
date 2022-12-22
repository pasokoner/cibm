import { router, protectedProcedure } from "../trpc";
import { z } from "zod";

export const validUserRouter = router({
  getValid: protectedProcedure.input(z.object({})).query(async ({ ctx }) => {
    const data = await ctx.prisma.validUser.findFirst({
      where: {
        email: ctx.session.user.email as string,
      },
    });

    return {
      isValid: data?.email === ctx.session.user.email,
    };
  }),
  getAll: protectedProcedure.query(({ ctx }) => {
    const data = ctx.prisma.validUser.findMany({});

    return data;
  }),
  add: protectedProcedure
    .input(z.object({ email: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.prisma.validUser.create({
        data: {
          email: input.email,
        },
      });

      return { message: "successfully added user" };
    }),

  remove: protectedProcedure
    .input(z.object({ email: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.prisma.validUser.delete({
        where: {
          email: input.email,
        },
      });

      return { message: "successfully deleted user" };
    }),
});
