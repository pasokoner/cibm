import React from "react";

import { Backdrop, Typography, Stack, Button, IconButton, LinearProgress } from "@mui/material";
import { trpc } from "../utils/trpc";

type Props = {
  email: string;
  userDeletion: boolean;
  handleClose: () => void;
  refetchValid: () => void;
};

const DeletionBackdrop = ({ email, userDeletion, handleClose, refetchValid }: Props) => {
  const { mutate: deleteUser, isLoading } = trpc.valid.remove.useMutation({
    onSuccess: () => {
      refetchValid();
      handleClose();
    },
  });

  console.log(email);

  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={userDeletion}
    >
      <Stack>
        <Typography gutterBottom>Are you sure you want to remove this user?</Typography>
        {isLoading && <LinearProgress />}
        <Stack direction="row" justifyContent="center" gap={2} mt={1}>
          <Button
            variant="contained"
            color="success"
            disabled={isLoading}
            onClick={() => {
              console.log(email);
              deleteUser({ email: email });
            }}
          >
            Yes
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={isLoading}
            onClick={() => {
              handleClose();
            }}
          >
            No
          </Button>
        </Stack>
      </Stack>
    </Backdrop>
  );
};

export default DeletionBackdrop;
