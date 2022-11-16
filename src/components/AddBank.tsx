import { useRouter } from "next/router";

import { trpc } from "../utils/trpc";

import {
  Backdrop,
  Button,
  Typography,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import { useForm, SubmitHandler } from "react-hook-form";

type Props = {
  fundId: string;
  section: "GENERAL" | "TRUST" | "SEF";
  handleClose: () => void;
};

type NewBankFormValues = {
  name: string;
  acronym: string;
  endingBalance: string;
};

const AddBank = (props: Props) => {
  const { fundId, handleClose, section } = props;

  const router = useRouter();

  const {
    mutate: addBank,
    isLoading,
    isSuccess,
    isError,
    error,
  } = trpc.bank.add.useMutation({
    onSuccess() {
      router.reload();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    // formState: { errors },
  } = useForm<NewBankFormValues>();

  const onSubmit: SubmitHandler<NewBankFormValues> = async (data) => {
    addBank({ ...data, fundId: fundId });
  };

  return (
    <Backdrop
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, color: "black", cursor: "initial" }}
      open={true}
    >
      <Stack
        gap={1.5}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          bgcolor: "white",
          p: 2,
          borderRadius: "10px",
          "& .MuiSvgIcon-root	": {
            color: "black",
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography mr={10} fontSize={20} fontWeight={2}>
            Adding Bank from {section} Fund
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Typography>Bank Name</Typography>
        <TextField label="Enter Bank Name" {...register("name")} />
        <Typography>Bank Acronym</Typography>
        <TextField label="Enter Bank Acronym" {...register("acronym")} />
        <Typography>Account Balance</Typography>
        <TextField
          label="Enter Account Balance"
          helperText="Numeric value only"
          inputProps={{ inputMode: "numeric", pattern: "[+-]?([0-9]*[.])?[0-9]+" }}
          {...register("endingBalance")}
        />
        {isError && <Typography color="error">{error.message}</Typography>}
        {isSuccess && <Typography color="success.main">Bank is Added!</Typography>}
        {isLoading && <LinearProgress />}
        <Button variant="contained" type="submit">
          Add Bank
        </Button>
      </Stack>
    </Backdrop>
  );
};

export default AddBank;
