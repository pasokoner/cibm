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

import Head from "next/head";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const { data: validUser } = trpc.valid.getValid.useQuery();
  const { data: sessionData, status } = useSession();

  if (status === "loading") {
    return <></>;
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <Head>
        <title>CIBM System</title>
        <meta
          property="og:title"
          content="Provincial Governor's Office - CIBM System"
          key="title"
        />
      </Head>
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
