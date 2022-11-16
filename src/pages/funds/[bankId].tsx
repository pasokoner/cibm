import type { GetServerSideProps } from "next";

import { useRouter } from "next/router";

import { getSession } from "next-auth/react";

import React from "react";

import { Box } from "@mui/material";

import MuiTransacationTable from "../../components/MuiTransactionTable";

const BankInformation = () => {
  const router = useRouter();
  const { bankId } = router.query;

  if (!bankId) {
    return <></>;
  }

  return (
    <Box>
      <MuiTransacationTable bankId={bankId as string} />
    </Box>
  );
};

export default BankInformation;

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
