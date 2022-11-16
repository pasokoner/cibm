import type { GetServerSideProps } from "next";

import { useRouter } from "next/router";

import { getSession } from "next-auth/react";

import React from "react";

import { Box } from "@mui/material";

import MuiTable from "../../components/MuiCheckTable";

enum Status {
  RELEASED = "RELEASED",
  UNRELEASED = "UNRELEASED",
  CANCELLED = "CANCELLED",
}

const Check = () => {
  const router = useRouter();
  const { status, to, from, bankId } = router.query;

  if (!from && !to) {
    return <></>;
  }

  return (
    <Box>
      {status === "UNRELEASED" && (
        <MuiTable
          status={Status.UNRELEASED}
          from={from as string}
          to={to as string}
          bankId={bankId as string}
        />
      )}

      {status === "RELEASED" && (
        <MuiTable
          status={Status.RELEASED}
          from={from as string}
          to={to as string}
          bankId={bankId as string}
        />
      )}

      {status === "CANCELLED" && (
        <MuiTable
          status={Status.CANCELLED}
          from={from as string}
          to={to as string}
          bankId={bankId as string}
        />
      )}
    </Box>
  );
};

export default Check;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};
