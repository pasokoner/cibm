import { Button, Typography } from "@mui/material";
import { type NextPage } from "next";

import { signIn } from "next-auth/react";

const Home: NextPage = () => {
  return (
    <>
      <Button
        onClick={() => {
          signIn();
        }}
      >
        Sign in
      </Button>
    </>
  );
};

export default Home;
