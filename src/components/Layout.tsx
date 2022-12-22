import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { muiTheme } from "../styles/themes";
import { CssBaseline } from "@mui/material";
import MuiDrawer from "./MuiDrawer";
import { useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";

import { Button, Typography } from "@mui/material";
import { signIn, signOut } from "next-auth/react";
import { Stack } from "@mui/system";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const { data: sessionData, status } = useSession();
  const { data: validUser } = trpc.valid.getValid.useQuery(
    {},
    {
      enabled: !!sessionData,
    }
  );

  if (status === "loading") {
    return <></>;
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {sessionData && (sessionData.user?.role === "ADMIN" || validUser?.isValid) && (
        <MuiDrawer>{children}</MuiDrawer>
      )}

      {sessionData && sessionData.user?.role === "USER" && !validUser?.isValid && (
        <Stack>
          <Typography align="center">You are not authorized to view to this page</Typography>
          <Button
            onClick={() => {
              signOut();
            }}
          >
            Sign out
          </Button>
        </Stack>
      )}

      {!sessionData && <>{children}</>}
    </ThemeProvider>
  );
};

export default Layout;
