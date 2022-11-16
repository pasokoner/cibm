import { trpc } from "../utils/trpc";

import React from "react";

import { styled } from "@mui/material/styles";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Typography,
  CircularProgress,
  Stack,
} from "@mui/material";

interface Column {
  id: "action" | "dvNumber" | "checkNumber" | "depositNumber" | "date" | "description" | "amount";
  label: string;
  maxWidth?: number;
  align?: "right";
  format?: (value: number) => string;
  formatDate?: (value: Date) => string;
}

const columns: readonly Column[] = [
  { id: "action", label: "Action", maxWidth: 50 },
  { id: "dvNumber", label: "DV #", maxWidth: 50 },
  { id: "checkNumber", label: "Check #", maxWidth: 50 },
  { id: "depositNumber", label: "Deposit #", maxWidth: 50 },
  {
    id: "date",
    label: "Date of Check/Deposit",
    maxWidth: 60,
    align: "right",
    formatDate: (value: Date) => {
      const year = value.getFullYear();
      const month = (1 + value.getMonth()).toString().padStart(2, "0");
      const day = value.getDate().toString().padStart(2, "0");

      return month + "/" + day + "/" + year;
    },
  },
  {
    id: "description",
    label: "Payee/Particulars",
    maxWidth: 500,
  },
  {
    id: "amount",
    label: "Net Amount Paid/Cast Receipt",
    maxWidth: 100,

    format: (value: number) => value.toLocaleString("en-US"),
  },
];

interface Data {
  action: string;
  dvNumber: string;
  checkNumber: string;
  depositNumber: string;
  date: Date;
  description: string;
  amount: number;
}

function createData(
  action: string,
  dvNumber: string,
  checkNumber: string,
  depositNumber: string,
  date: Date,
  description: string,
  amount: number
): Data {
  return { action, dvNumber, checkNumber, depositNumber, date, description, amount };
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 13,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 1,
  },
}));

type Props = {
  bankId: string;
};

export default function MuiTransacationTable({ bankId }: Props) {
  const { data, isLoading, refetch, isSuccess } = trpc.transaction.getAll.useQuery({
    bankId: bankId,
  });

  const { data: fundDetails } = trpc.bank.details.useQuery({
    bankId: bankId,
  });

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // const rows = [createData("55555", "1111232", new Date(), "Carlo", 23232, "sdsds")];
  const rows = data
    ? data.map(
        ({ action, dvNumber, checkNumber, depositNumber, payee, date, description, amount }) => {
          dvNumber = dvNumber ? dvNumber : "";
          checkNumber = checkNumber ? checkNumber : "";
          depositNumber = depositNumber ? depositNumber : "";

          description =
            payee && description ? `Payee: ${payee} || Particulars: ${description}` : description;

          return createData(
            action,
            dvNumber,
            checkNumber,
            depositNumber,
            date,
            description,
            amount
          );
        }
      )
    : [];

  return (
    <>
      {fundDetails && (
        <Stack
          sx={{
            bgcolor: "primary.main",
            color: "white",
            p: 3,
            mb: 3,
            borderRadius: "5px",
            flexDirection: { md: "row", xs: "column" },
            justifyContent: { md: "space-between", xs: "flex-start" },
            alignItems: { md: "center" },
          }}
        >
          <Typography gutterBottom variant="h4">
            {fundDetails.fund.section} Fund {fundDetails.acronym}
          </Typography>
          <Typography
            gutterBottom
            sx={{
              fontSize: { md: 25, xs: 20 },
            }}
          >
            Ending Balance - &#8369; {fundDetails.endingBalance.toLocaleString("en-US")}
          </Typography>
        </Stack>
      )}

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <StyledTableRow>
                {columns.map((column) => (
                  <StyledTableCell
                    key={column.id}
                    align={column.align}
                    style={{
                      maxWidth: column.maxWidth,
                      width: "500px",
                    }}
                  >
                    {column.label}
                  </StyledTableCell>
                ))}
              </StyledTableRow>
            </TableHead>

            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                return (
                  <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.checkNumber}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <StyledTableCell key={column.id} align={column.align}>
                          {typeof value !== "object" &&
                            column.format &&
                            typeof value === "number" &&
                            column.format(value)}
                          {typeof value === "object" &&
                            column.formatDate &&
                            column.formatDate(value)}
                          {typeof value === "string" && value}
                        </StyledTableCell>
                      );
                    })}
                  </StyledTableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {isSuccess && data.length === 0 && (
          <Typography align="center" p={5}>
            No Records Found!
          </Typography>
        )}
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  );
}
