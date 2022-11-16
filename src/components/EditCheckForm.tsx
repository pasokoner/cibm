import { type NextPage } from "next";

import { useRouter } from "next/router";

import { trpc } from "../utils/trpc";

import { useState } from "react";

import { TextField, Typography, Stack, Button, LinearProgress } from "@mui/material";

import dayjs, { Dayjs } from "dayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import PercentIcon from "@mui/icons-material/Percent";

import { useForm, SubmitHandler } from "react-hook-form";

type FormValues = {
  dvNumber: string;
  checkNumber: string;
  description: string;
  payee: string;
  amount: string;
};

type Props = {
  checkId: number;
  lastAmount: number;
};

const EditCheckForm = (props: Props) => {
  const { checkId, lastAmount } = props;

  const router = useRouter();

  const { mutate, isSuccess, isLoading } = trpc.check.edit.useMutation({
    onSuccess: () => {
      router.reload();
    },
  });

  const [value, setValue] = useState<Dayjs | null>(null);

  const {
    register,
    handleSubmit,

    // formState: { errors },
  } = useForm<FormValues>();

  const handleDateChange = (newValue: Dayjs | null) => {
    setValue(newValue);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { dvNumber, checkNumber, description, amount, payee } = data;
    if (value) {
      mutate({
        checkId: checkId,
        dvNumber: dvNumber,
        payee: payee,
        checkNumber: checkNumber,
        date: value.toDate(),
        description: description,
        amount: amount,
        lastAmount: lastAmount,
      });
    } else {
      mutate({
        checkId: checkId,
        dvNumber: dvNumber,
        payee: payee,
        checkNumber: checkNumber,
        date: new Date(),
        description: description,
        amount: amount,
        lastAmount: lastAmount,
      });
    }
  };

  return (
    <>
      <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap={2}>
        <Stack>
          <Typography mb={1.5}>DV Number</Typography>
          <TextField
            id="outlined-number"
            label="Enter DV Number"
            type="number"
            {...register("dvNumber")}
          />
        </Stack>

        <Stack direction="row" justifyContent="space-between" gap={3}>
          <Stack
            sx={{
              width: "50%",
            }}
          >
            <Typography mb={1.5}>Check No.</Typography>
            <TextField
              id="outlined-number"
              label="Check Number"
              type="number"
              required
              {...register("checkNumber")}
              // InputLabelProps={{
              //   shrink: true,
              // }}
            />
          </Stack>

          <Stack
            sx={{
              width: "50%",
            }}
          >
            <Typography mb={1.5}>Date of Check</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                label="Date ( leave empty if same date )"
                inputFormat="MM/DD/YYYY"
                value={value}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField {...params} sx={{ minWidth: 120, alignSelf: "flex-end" }} fullWidth />
                )}
              />
            </LocalizationProvider>
          </Stack>
        </Stack>

        <Stack>
          <Typography mb={1.5}>Payee</Typography>
          <TextField
            id="outlined-basic"
            variant="outlined"
            label="Enter Payee"
            required
            {...register("payee")}
          ></TextField>
        </Stack>

        <Stack>
          <Typography mb={1.5}>Particulars</Typography>
          <TextField
            id="outlined-basic"
            variant="outlined"
            label="Enter Particulars"
            multiline
            required
            {...register("description")}
            rows={6}
          ></TextField>
        </Stack>

        <Stack>
          <Typography mb={1.5}>Net Amount Paid</Typography>
          <TextField
            id="outlined-number"
            label="Enter Net Amound Paid"
            helperText="Numeric value only"
            inputProps={{ inputMode: "numeric", pattern: "[+-]?([0-9]*[.])?[0-9]+" }}
            required
            {...register("amount")}
          />
        </Stack>

        {isSuccess && <Typography color="success.main">Edit success!</Typography>}

        {isLoading && <LinearProgress />}
        <Button endIcon={<PercentIcon />} variant="contained" type="submit" disabled={isLoading}>
          Save Edit
        </Button>
      </Stack>
    </>
  );
};

export default EditCheckForm;
