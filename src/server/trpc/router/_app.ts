import { router } from "../trpc";
import { authRouter } from "./auth";
import { exampleRouter } from "./example";
import { fundsRouter } from "./funds";
import { checkRouter } from "./check";
import { bankRouter } from "./bank";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  funds: fundsRouter,
  check: checkRouter,
  bank: bankRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
