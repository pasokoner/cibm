import { type NextPage } from "next";
import type { GetServerSideProps } from "next";

import { getSession } from "next-auth/react";

import { trpc } from "../../utils/trpc";

import { useState } from "react";

import {
  Box,
  TextField,
  Typography,
  Stack,
  InputLabel,
  FormControl,
  Select,
  Button,
  LinearProgress,
} from "@mui/material";

import dayjs, { Dayjs } from "dayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import PercentIcon from "@mui/icons-material/Percent";

import { useForm, SubmitHandler } from "react-hook-form";

const getMinusOneDate = (): string => {
  const date = new Date();
  const minusOneTime = new Date(date.setDate(date.getDate() - 1));

  const year = minusOneTime.getFullYear();
  const month = (1 + minusOneTime.getMonth()).toString().padStart(2, "0");
  const day = minusOneTime.getDate().toString().padStart(2, "0");

  return year + "/" + month + "/" + day;
};

type FormValues = {
  bankId: string;
  dvNumber: string;
  checkNumber: string;
  description: string;
  payee: string;
  amount: string;
};

const LoanPayment: NextPage = () => {
  const { data } = trpc.funds.getAll.useQuery();

  const {
    mutate,
    isSuccess,
    isLoading,
    data: message,
    isError,
    error,
  } = trpc.funds.transact.useMutation({
    onSuccess: () => {
      reset();
    },
  });

  const [dateError, setDateError] = useState<string | undefined>();
  const [value, setValue] = useState<Dayjs | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    // formState: { errors },
  } = useForm<FormValues>();

  const handleDateChange = (newValue: Dayjs | null) => {
    setValue(newValue);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { bankId, dvNumber, checkNumber, description, amount, payee } = data;
    if (value) {
      const pastDate = new Date();
      const minusOneTime = pastDate.setDate(pastDate.getDate() - 2);
      if (value.toDate().setDate(value.toDate().getDate()) <= minusOneTime) {
        setDateError("date can not be less than a day");
        return;
      }
      mutate({
        action: "LOAN",
        bankId: bankId,
        dvNumber: dvNumber,
        payee: payee,
        checkNumber: checkNumber,
        date: value.toDate(),
        description: description,
        amount: amount,
      });
    } else {
      mutate({
        action: "LOAN",
        bankId: bankId,
        dvNumber: dvNumber,
        payee: payee,
        checkNumber: checkNumber,
        date: new Date(),
        description: description,
        amount: amount,
      });
    }

    setDateError("");
  };

  return (
    <Box>
      <Box
        sx={{
          width: "80%",
          margin: "0 auto",
          borderRadius: "5px",
        }}
      >
        <Typography
          gutterBottom
          sx={{
            bgcolor: "primary.main",
            color: "white",
            py: 1.5,
            px: 2,
            mb: 2,
            fontSize: 18,
            borderRadius: "5px",
          }}
        >
          Add Transcation Loan Payment
        </Typography>

        <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap={2}>
          {/* <TextField label="Standard" variant="standard" /> */}

          <Stack direction="row" gap={3}>
            <Stack
              sx={{
                width: "50%",
              }}
            >
              <Typography mb={1.5}>Select Fund</Typography>
              <FormControl>
                <InputLabel htmlFor="grouped-native-select">Select Fund</InputLabel>
                <Select
                  native
                  defaultValue=""
                  id="grouped-native-select"
                  label="Select Funds"
                  required
                  {...register("bankId")}
                >
                  <option aria-label="None" value="" />

                  {data &&
                    data.map(({ id, section, bank }) => {
                      return (
                        <optgroup key={id} label={section}>
                          {bank &&
                            bank.map(({ id, acronym }) => {
                              return (
                                <option key={id} value={id}>
                                  {section} - {acronym}
                                </option>
                              );
                            })}
                        </optgroup>
                      );
                    })}
                </Select>
              </FormControl>
            </Stack>

            <Stack
              sx={{
                width: "50%",
              }}
            >
              <Typography mb={1.5}>DV Number</Typography>
              <TextField
                id="outlined-number"
                label="Enter DV Number"
                type="number"
                {...register("dvNumber")}
                // InputLabelProps={{
                //   shrink: true,
                // }}
              />
            </Stack>
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
                  minDate={dayjs(getMinusOneDate())}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      sx={{ minWidth: 120, alignSelf: "flex-end" }}
                      fullWidth
                    />
                  )}
                />
                {dateError && <Typography color="error">{dateError}</Typography>}
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
              helperText="Numeric positive value only"
              inputProps={{ inputMode: "numeric", pattern: "[+]?([0-9]*[.])?[0-9]+" }}
              required
              {...register("amount")}
            />
          </Stack>

          {isError && <Typography color="error.main">{error.message}</Typography>}

          {isSuccess && <Typography color="success.main">{message.message}</Typography>}

          {isLoading && <LinearProgress />}
          <Button endIcon={<PercentIcon />} variant="contained" type="submit" disabled={isLoading}>
            Submit Deposit
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default LoanPayment;

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
