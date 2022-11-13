import { router } from "../trpc";
import { authRouter } from "./auth";
import { exampleRouter } from "./example";
import { fundsRouter } from "./funds";
import { checkRouter } from "./check";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  funds: fundsRouter,
  check: checkRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
