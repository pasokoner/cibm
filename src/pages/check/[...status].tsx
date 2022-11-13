import { Box, Typography } from "@mui/material";
import React from "react";
import MuiTable from "../../components/MuiCheckTable";

import { useRouter } from "next/router";

const Check = () => {
  const router = useRouter();
  const { status, to, from, fund } = router.query;

  if (!from && !to) {
    return <></>;
  }

  console.log(status, to, from, fund);

  return (
    <Box>
      <Typography mb={2} variant="h4">
        {status?.toLocaleString().toLocaleUpperCase()}
      </Typography>

      <Typography mb={2}>{status?.toLocaleString().toLocaleUpperCase()}</Typography>
      <MuiTable status="UNRELEASED" from={from as string} to={to as string} />
    </Box>
  );
};

export default Check;
