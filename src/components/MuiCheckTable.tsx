import React from "react";

import { useSession } from "next-auth/react";

import { trpc } from "../utils/trpc";

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
  Button,
  ButtonGroup,
  IconButton,
  Typography,
  Stack,
  LinearProgress,
  Snackbar,
} from "@mui/material";

import MuiAlert, { AlertProps } from "@mui/material/Alert";

import NoteIcon from "@mui/icons-material/Note";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import EditIcon from "@mui/icons-material/Edit";
import { Box } from "@mui/system";
import EditCheck from "./EditCheck";

interface Column {
  id: "dvNumber" | "checkNumber" | "date" | "description" | "amount" | "fund" | "checkId";
  label: string;
  maxWidth?: number;
  align?: "right";
  format?: (value: number) => string;
  formatDate?: (value: Date) => string;
}

const columns: readonly Column[] = [
  { id: "dvNumber", label: "DV #", maxWidth: 50 },
  { id: "checkNumber", label: "Check #", maxWidth: 50 },
  {
    id: "date",
    label: "Date of Check",
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
    label: "Net Amount Paid",
    maxWidth: 100,

    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    id: "fund",
    label: "Fund",
    maxWidth: 100,
  },
  {
    id: "checkId",
    label: "Actions",
    maxWidth: 100,
  },
];

interface Data {
  dvNumber: string;
  checkNumber: string;
  date: Date;
  description: string;
  amount: number;
  fund: string;
  checkId: number;
}

function createData(
  dvNumber: string,
  checkNumber: string,
  date: Date,
  description: string,
  amount: number,
  fund: string,
  checkId: number
): Data {
  return { dvNumber, checkNumber, date, description, amount, fund, checkId };
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

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

type Props = {
  to: string;
  from: string;
  status: "RELEASED" | "UNRELEASED" | "CANCELLED";
  bankId?: string;
};

export default function MuiTable({ to, from, status, bankId }: Props) {
  const { data: sessionData } = useSession();

  const { data: fundDetails } = trpc.bank.details.useQuery({
    bankId: bankId,
  });

  const { data, isLoading, refetch, isSuccess } = trpc.check.getAll.useQuery({
    to: to,
    from: from,
    status: status,
    bankId: bankId,
  });

  const { mutate: released, isLoading: isReleasing } = trpc.check.released.useMutation({
    onSuccess: () => {
      refetch();
      setPage(0);
      setAlertSeverity("success");
      setAlertMessage("Check released!");
      handleOpenAlert();
    },
  });

  const { mutate: cancelled, isLoading: isCancelling } = trpc.check.released.useMutation({
    onSuccess: () => {
      refetch();
      setPage(0);
      setAlertSeverity("error");
      setAlertMessage("Check cancelled!");
      handleOpenAlert();
    },
  });

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState("");
  const [alertSeverity, setAlertSeverity] = React.useState<"success" | "error">("success");

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleOpenAlert = () => {
    setOpenAlert(true);
  };

  const handleCloseAlert = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenAlert(false);
  };

  if (isLoading) {
    return <></>;
  }

  console.log(data, fundDetails);

  const rows = data
    ? data.map(({ dvNumber, checkNumber, date, description, payee, amount, bank, id }) => {
        dvNumber = dvNumber ? dvNumber : "";
        description = description ? description : "";
        description = `Payee: ${payee} || Particulars: ${description}`;
        return createData(dvNumber, checkNumber, date, description, amount, `${bank.acronym}`, id);
      })
    : [];

  const total = data ? data.reduce((n, { amount }) => n + amount, 0) : 0;

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
          <Box>
            <Typography gutterBottom variant="h4">
              {status} CHECK
            </Typography>
            <Typography>
              {fundDetails.fund.section} Fund {fundDetails.acronym} -{" "}
              <Typography component="span">{from}</Typography> |{" "}
              <Typography component="span">{to}</Typography>
            </Typography>
          </Box>

          <Typography
            gutterBottom
            sx={{
              fontSize: { md: 25, xs: 20 },
            }}
          >
            TOTAL - &#8369; {total.toLocaleString("en-US")}
          </Typography>
        </Stack>
      )}

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        {(isCancelling || isReleasing) && <LinearProgress />}
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
                      display: `${
                        status !== "UNRELEASED" && column.id === "checkId" ? "none" : ""
                      }`,
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
                        <StyledTableCell
                          key={column.id}
                          align={column.align}
                          sx={{
                            display: `${
                              status !== "UNRELEASED" && column.id === "checkId" ? "none" : ""
                            }`,
                          }}
                        >
                          {typeof value !== "object" &&
                            column.format &&
                            typeof value === "number" &&
                            column.id !== "checkId" &&
                            column.format(value)}
                          {typeof value === "object" &&
                            column.formatDate &&
                            column.formatDate(value)}
                          {typeof value === "string" && value}
                          {column.id === "checkId" ? (
                            <>
                              <ButtonGroup>
                                <IconButton
                                  onClick={() => {
                                    released({ checkId: value as number });
                                  }}
                                >
                                  <NoteIcon color="success" />
                                </IconButton>
                                {sessionData?.user?.role === "ADMIN" && (
                                  <>
                                    <EditCheck
                                      checkId={row["checkId"]}
                                      checkNumber={row["checkNumber"]}
                                      lastAmount={row["amount"]}
                                    />
                                    <IconButton
                                      onClick={() => {
                                        cancelled({ checkId: value as number });
                                      }}
                                    >
                                      <StrikethroughSIcon color="error" />
                                    </IconButton>
                                  </>
                                )}
                              </ButtonGroup>
                            </>
                          ) : (
                            ""
                          )}
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

      <Snackbar open={openAlert} autoHideDuration={3000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: "100%" }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
