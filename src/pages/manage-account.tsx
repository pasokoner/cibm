import { Stack, Typography, Box, Button, LinearProgress, TextField } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import React from "react";
import { trpc } from "../utils/trpc";

import type { GetServerSideProps } from "next";

import { getSession } from "next-auth/react";

import { useForm, SubmitHandler } from "react-hook-form";
import DeletionBackdrop from "../components/DeletionBackdrop";

type FormValues = {
  email: string;
};

const ManageAccount = () => {
  const { data: validUser, refetch } = trpc.valid.getAll.useQuery();

  const [successAdd, setSuccessAdd] = React.useState(false);

  const [userDeletion, setUserDeletion] = React.useState(false);

  const [email, setEmail] = React.useState("");

  const { mutate: addUser, isLoading: addingUser } = trpc.valid.add.useMutation({
    onSuccess: () => {
      refetch();
      reset();
      setSuccessAdd(true);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    // formState: { errors },
  } = useForm<FormValues>();

  const handleClose = () => {
    setUserDeletion(false);
  };

  const refetchValid = () => {
    refetch();
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { email } = data;

    addUser({ email: email });
  };

  return (
    <Stack>
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          p: 3,
          mb: 3,
          borderRadius: "5px",
        }}
      >
        <Typography variant="h4">Manage Account</Typography>
        <Typography>Adding gmail account of a user will enable them to use the system</Typography>
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        gap={2}
        mb={1}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <TextField
          variant="standard"
          placeholder="Enter google email"
          label="Email"
          helperText="only google email will be accepted"
          required
          {...register("email")}
          inputProps={{
            inputMode: "numeric",
            pattern: "^[a-z0-9](.?[a-z0-9]){5,}@g(oogle)?mail.com$",
          }}
          sx={{
            minWidth: "200px",
          }}
        ></TextField>
        <Button variant="contained" type="submit">
          Add user
        </Button>
      </Stack>
      {successAdd && <Typography color="success.main">User successfully added!</Typography>}
      {addingUser && <LinearProgress />}

      <Stack direction="row">
        <Typography
          align="center"
          sx={{
            width: "80px",
            p: 1,
            mr: 4,
            fontSize: 16,
          }}
        >
          Remove
        </Typography>
        <Typography p={1} fontSize={16}>
          Gmail
        </Typography>
      </Stack>

      {validUser &&
        validUser.map(({ email, id }) => (
          <Stack direction="row" key={id}>
            <IconButton
              color="error"
              sx={{
                width: "80px",
                p: 1,
                mr: 4,
              }}
              onClick={() => {
                setEmail(email);
                setUserDeletion(true);
              }}
            >
              <DeleteIcon />
            </IconButton>

            <Typography p={1}>{email}</Typography>
          </Stack>
        ))}

      {userDeletion && (
        <DeletionBackdrop
          handleClose={handleClose}
          refetchValid={refetchValid}
          userDeletion={userDeletion}
          email={email}
        />
      )}
    </Stack>
  );
};

export default ManageAccount;

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
