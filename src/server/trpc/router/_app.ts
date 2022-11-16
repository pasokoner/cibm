import { router } from "../trpc";
import { authRouter } from "./auth";
import { fundsRouter } from "./funds";
import { checkRouter } from "./check";
import { bankRouter } from "./bank";
import { transactionRouter } from "./transaction";
import { validUserRouter } from "./validUser";

export const appRouter = router({
  auth: authRouter,
  funds: fundsRouter,
  check: checkRouter,
  bank: bankRouter,
  transaction: transactionRouter,
  valid: validUserRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
