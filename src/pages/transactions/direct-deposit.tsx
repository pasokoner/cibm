import { type NextPage } from "next";

import { useState } from "react";

import { Box, TextField, Typography, Stack, InputLabel, FormControl, Select } from "@mui/material";

import dayjs, { Dayjs } from "dayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import SendToMobileIcon from "@mui/icons-material/SendToMobile";

import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";

import { trpc } from "../../utils/trpc";

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
  depositNumber: string;
  description: string;
  amount: string;
};

const DirectDeposit: NextPage = () => {
  const { data } = trpc.funds.getAll.useQuery();

  const { mutate, isLoading, isSuccess } = trpc.funds.transact.useMutation({
    onSuccess: () => {
      reset();
    },
  });

  const [value, setValue] = useState<Dayjs | null>(null);
  const [dateError, setDateError] = useState<string | undefined>();

  const handleDateChange = (newValue: Dayjs | null) => {
    setValue(newValue);
  };

  const {
    register,
    handleSubmit,
    reset,
    // formState: { errors },
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { bankId, depositNumber, description, amount } = data;

    if (value) {
      const pastDate = new Date();
      const minusOneTime = pastDate.setDate(pastDate.getDate() - 2);
      if (value.toDate().setDate(value.toDate().getDate()) <= minusOneTime) {
        setDateError("date can not be less than a day");
        return;
      }
      mutate({
        action: "DIRECT",
        bankId: bankId,
        depositNumber: depositNumber,
        date: value.toDate(),
        description: description,
        amount: amount,
      });
    } else {
      mutate({
        action: "DIRECT",
        bankId: bankId,
        depositNumber: depositNumber,
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
          Add Transcation Direct Deposit
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
              <Typography mb={1.5}>Deposit Number</Typography>
              <TextField
                id="outlined-number"
                label="Enter Deposit Number"
                type="number"
                required
                {...register("depositNumber")}
                // InputLabelProps={{
                //   shrink: true,
                // }}
              />
            </Stack>
          </Stack>

          <Stack justifyContent="space-between">
            <Typography mb={1.5}>Date of Check</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                label="Date ( leave empty if same date )"
                inputFormat="MM/DD/YYYY"
                value={value}
                onChange={handleDateChange}
                minDate={dayjs(getMinusOneDate())}
                renderInput={(params) => (
                  <TextField {...params} sx={{ minWidth: 120, alignSelf: "flex-end" }} fullWidth />
                )}
              />
              {dateError && <Typography color="error">{dateError}</Typography>}
            </LocalizationProvider>
          </Stack>

          <Stack>
            <Typography mb={1.5}>Payee/Particulars</Typography>
            <TextField
              id="outlined-basic"
              variant="outlined"
              label="Enter Payee/Particulars"
              multiline
              required
              {...register("description")}
              rows={6}
            ></TextField>
          </Stack>

          <Stack>
            <Typography mb={1.5}>Cash Receipt</Typography>
            <TextField
              id="outlined-number"
              label="Enter Cash Receipt"
              type="float"
              required
              {...register("amount")}
            />
          </Stack>

          {isSuccess && <Typography color="success.main">Transaction success!</Typography>}

          {isLoading && <LinearProgress />}
          <Button
            endIcon={<SendToMobileIcon />}
            variant="contained"
            type="submit"
            disabled={isLoading}
          >
            Submit Deposit
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default DirectDeposit;
