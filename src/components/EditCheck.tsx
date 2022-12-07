import React from "react";

import { IconButton, Backdrop, Stack, Typography } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import EditCheckForm from "./EditCheckForm";

import CloseIcon from "@mui/icons-material/Close";

type Props = {
  checkId: number;
  checkNumber: string;
  lastAmount: number;
};

const EditCheck = (props: Props) => {
  const { checkId, checkNumber, lastAmount } = props;

  const [open, setOpen] = React.useState(false);

  const handleToggle = () => {
    setOpen((prevState) => !prevState);
  };

  return (
    <>
      <IconButton onClick={handleToggle}>
        <EditIcon color="info" />
      </IconButton>
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, color: "black", cursor: "initial" }}
        open={open}
      >
        <Stack
          sx={{
            bgcolor: "white",
            borderRadius: "5px",
            width: { md: "900px", xs: "80%" },
            margin: "0 auto",
            p: 3,
          }}
        >
          <Stack
            direction="row"
            sx={{
              bgcolor: "primary.main",
              color: "white",
              py: 1.5,
              px: 2,
              mb: 2,
              fontSize: 18,
              borderRadius: "5px",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography>Editing Check #{checkNumber}</Typography>

            <IconButton sx={{ color: "white" }} onClick={handleToggle}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <EditCheckForm checkId={checkId} lastAmount={lastAmount} lastCheckNumber={checkNumber} />
        </Stack>
      </Backdrop>
    </>
  );
};

export default EditCheck;
