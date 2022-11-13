import * as React from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { trpc } from "../utils/trpc";

interface Column {
  id: "dvNumber" | "checkNumber" | "date" | "description" | "amount" | "fund";
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
];

interface Data {
  dvNumber: string;
  checkNumber: string;
  date: Date;
  description: string;
  amount: number;
  fund: string;
}

function createData(
  dvNumber: string,
  checkNumber: string,
  date: Date,
  description: string,
  amount: number,
  fund: string
): Data {
  return { dvNumber, checkNumber, date, description, amount, fund };
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
  to: string;
  from: string;
  status: "RELEASED" | "UNRELEASED";
};

export default function MuiTable({ to, from, status }: Props) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const { data, isLoading } = trpc.check.getAll.useQuery({
    to: to,
    from: from,
    status: status,
  });

  if (isLoading) {
    return <></>;
  }

  // const rows = [createData("55555", "1111232", new Date(), "Carlo", 23232, "sdsds")];
  const rows = data
    ? data.map(({ dvNumber, checkNumber, date, description, amount, bank }) => {
        return createData(dvNumber, checkNumber, date, description, amount, `${bank.acronym}`);
      })
    : [];

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <StyledTableRow>
              {columns.map((column) => (
                <StyledTableCell
                  key={column.id}
                  align={column.align}
                  style={{ maxWidth: column.maxWidth, width: "500px" }}
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

                        {typeof value === "object" && column.formatDate && column.formatDate(value)}

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
  );
}
