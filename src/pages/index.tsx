import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import GoogleIcon from "@mui/icons-material/Google";
import { Stack } from "@mui/material";

import { useSession, signIn } from "next-auth/react";

function Copyright(props: any) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {"Copyright © PITO and Developed by "}
      <Link color="inherit" href="https://www.linkedin.com/in/john-carlo-asilo-679047204/">
        John Carlo Asilo
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

export default function SignInSide() {
  const { data: sessionData } = useSession();

  if (sessionData) {
    return (
      <Stack alignContent="center" alignItems="center">
        <Typography variant="h3" mb={3} mt={10}>
          Welcome to CIBM System
        </Typography>
        <Typography>You are login as {sessionData.user?.name}</Typography>
      </Stack>
    );
  }

  return (
    <Grid container component="main" sx={{ height: "100vh" }}>
      <CssBaseline />
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: "url(https://source.unsplash.com/ssKEI4HRRtI)",
          backgroundRepeat: "no-repeat",
          backgroundColor: (t) =>
            t.palette.mode === "light" ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            pb: 20,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Welcome to CIBM System
          </Typography>
          <Box component="form" sx={{ mt: 1 }}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              endIcon={<GoogleIcon />}
              onClick={() => {
                signIn();
              }}
            >
              Sign In with Google
            </Button>

            <Copyright sx={{ mt: "auto" }} />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
