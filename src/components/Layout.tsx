import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { muiTheme } from "../styles/themes";
import { CssBaseline } from "@mui/material";
import MuiDrawer from "./MuiDrawer";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <MuiDrawer>{children}</MuiDrawer>
    </ThemeProvider>
  );
};

export default Layout;
