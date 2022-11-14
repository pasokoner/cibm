import React, { useState } from "react";

import {
  Backdrop,
  Stack,
  FormControl,
  Typography,
  InputLabel,
  Select,
  Divider,
  Button,
  TextField,
  IconButton,
} from "@mui/material";

import { SelectChangeEvent } from "@mui/material/Select";

import dayjs, { Dayjs } from "dayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { useRouter } from "next/router";

import { trpc } from "../utils/trpc";
import CloseIcon from "@mui/icons-material/Close";

const getFormattedDate = (value: Date) => {
  const year = value.getFullYear();
  const month = (1 + value.getMonth()).toString().padStart(2, "0");
  const day = value.getDate().toString().padStart(2, "0");

  return month + "/" + day + "/" + year;
};

type Props = {
  handleClose: () => void;
  status: "RELEASED" | "UNRELEASED";
};

const CheckSelect = ({ handleClose, status }: Props) => {
  const { data } = trpc.funds.getAll.useQuery();
  const router = useRouter();

  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);
  const [bankId, setBankId] = useState("");

  const handleFromDateChange = (newValue: Dayjs | null) => {
    setDateFrom(newValue);
  };

  const handleToDateChange = (newValue: Dayjs | null) => {
    setDateTo(newValue);
  };

  const handleFundChange = (event: SelectChangeEvent) => {
    setBankId(event.target.value as string);
  };

  const handleExtract = () => {
    if (dateTo && dateFrom && bankId) {
      handleClose();
      router.push({
        pathname: `/check/[status]`,
        query: {
          status: status,
          from: getFormattedDate(dateFrom.toDate()),
          to: getFormattedDate(dateTo.toDate()),
          bankId: bankId,
        },
      });
    }
  };

  return (
    <Backdrop
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, color: "black", cursor: "initial" }}
      open={true}
    >
      <Stack
        gap={2.5}
        sx={{
          bgcolor: "white",
          p: 2,
          borderRadius: "10px",
          "& .MuiSvgIcon-root	": {
            color: "black",
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between">
          <Typography fontSize={25} fontWeight="bold">
            Check
          </Typography>

          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider
          sx={{
            border: 1,
          }}
        />

        <Stack direction="row" gap={2} alignItems="center">
          <Typography>Select Fund</Typography>
          <FormControl>
            <InputLabel>Fund (--ALL--)</InputLabel>
            <Select
              native
              id="grouped-native-select"
              label="Fund (--ALL--)"
              value={bankId}
              onChange={handleFundChange}
              required
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

        <Stack direction="row" gap={2} alignItems="center">
          <Typography>From</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDatePicker
              label="MM/DD/YYYY"
              inputFormat="MM/DD/YYYY"
              value={dateFrom}
              onChange={handleFromDateChange}
              renderInput={(params) => (
                <TextField {...params} sx={{ minWidth: 120, alignSelf: "flex-end" }} fullWidth />
              )}
            />
            {/* {dateError && <Typography color="error">{dateError}</Typography>} */}
          </LocalizationProvider>

          <Typography>To</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDatePicker
              label="MM/DD/YYYY"
              inputFormat="MM/DD/YYYY"
              value={dateTo}
              onChange={handleToDateChange}
              minDate={dayjs(dateFrom)}
              renderInput={(params) => (
                <TextField {...params} sx={{ minWidth: 120, alignSelf: "flex-end" }} fullWidth />
              )}
            />
          </LocalizationProvider>
        </Stack>

        <Button
          variant="contained"
          onClick={() => {
            handleExtract();
          }}
        >
          Extract
        </Button>
      </Stack>
    </Backdrop>
  );
};

export default CheckSelect;
