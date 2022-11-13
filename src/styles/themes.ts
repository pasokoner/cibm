import { createTheme } from "@mui/material";

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: "#343840",
    },

    // info: {
    //   main: "#e3d100",
    // },

    regular: {
      white: "#FFFDFA",
    },
  },

  typography: {
    fontFamily: ["Lato", "Roboto"].join(","),
  },
});
