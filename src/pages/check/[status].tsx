import { Box, Typography } from "@mui/material";
import React from "react";
import MuiTable from "../../components/MuiCheckTable";

import { useRouter } from "next/router";

enum Status {
  RELEASED = "RELEASED",
  UNRELEASED = "UNRELEASED",
}

const Check = () => {
  const router = useRouter();
  const { status, to, from, bankId } = router.query;

  if (!from && !to) {
    return <></>;
  }

  return (
    <Box>
      <MuiTable
        status={status === "UNRELEASED" ? Status.UNRELEASED : Status.RELEASED}
        from={from as string}
        to={to as string}
        bankId={bankId as string}
      />
    </Box>
  );
};

export default Check;
