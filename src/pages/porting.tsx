import React from "react";
import type { GetServerSideProps } from "next";

import { getSession } from "next-auth/react";
import * as XLSX from "xlsx";
import { trpc } from "../utils/trpc";

import _ from "lodash";
import { Button, Typography, Stack } from "@mui/material";
import PopperPopupState from "../components/MuiPopper";

interface Fund {
  Check: number;
  Date: number;
  Payee: string;
  Particulars: string;
  Amount: number;
  Fund: string;
  Status: string;
}

const excelDateToJSDate = (serial: number) => {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);

  const fractional_day = serial - Math.floor(serial) + 0.0000001;

  let total_seconds = Math.floor(86400 * fractional_day);

  const seconds = total_seconds % 60;

  total_seconds -= seconds;

  const hours = Math.floor(total_seconds / (60 * 60));
  const minutes = Math.floor(total_seconds / 60) % 60;

  return new Date(
    date_info.getFullYear(),
    date_info.getMonth(),
    date_info.getDate(),
    hours,
    minutes,
    seconds
  );
};

const section = ["TRUST", "GENERAL", "SEF"];

type Seeds = {
  bankAcronym: string;
  checkNumber: string;
  date: Date;
  description?: string;
  amount: number;
  payee: string;
  fundSection: "GENERAL" | "SEF" | "TRUST";
};

const Porting = () => {
  /* the component state is an array of presidents */

  const [successText, setSuccessText] = React.useState<string[]>([]);

  const { mutate } = trpc.porting.importLoan.useMutation({
    onSuccess: (data) => {
      setSuccessText((prevState) => [...prevState, data.message]);
    },
  });

  const { mutate: deleteAll } = trpc.porting.deleteAll.useMutation();

  /* Fetch and update the state once */
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        const data = await file?.arrayBuffer();

        const workbook = XLSX.read(data);
        const trust: Seeds[] = [];
        const sef: Seeds[] = [];
        const general: Seeds[] = [];

        workbook.SheetNames.forEach((item, i) => {
          const worksheet = workbook.Sheets[`${workbook.SheetNames[i] as string}`];
          const jsonData = XLSX.utils.sheet_to_json<Fund>(worksheet as XLSX.WorkSheet);

          jsonData.forEach((item) => {
            if (item.Status && item.Status === "Released") {
              return;
            }
            if (item.Date && item.Check && item.Payee && item.Amount && item.Fund) {
              const sectionBank = item.Fund.split(" ");

              if (
                sectionBank[1] &&
                section.includes(sectionBank[1].toUpperCase()) &&
                sectionBank[0]
              ) {
                const section = sectionBank[1].toUpperCase().trim();
                const bankAcronym = sectionBank[0].toUpperCase().trim();

                const dataSeed = {
                  bankAcronym: bankAcronym,
                  checkNumber: item.Check.toString().trim(),
                  date: excelDateToJSDate(item.Date),
                  description: item.Particulars ? item.Particulars : undefined,
                  amount: item.Amount,
                  payee: item.Payee,
                  fundSection: section as "GENERAL" | "SEF" | "TRUST",
                };

                if (section === "GENERAL") {
                  general.push(dataSeed);
                }

                if (section === "SEF") {
                  sef.push(dataSeed);
                }

                if (section === "TRUST") {
                  trust.push(dataSeed);
                }
              }
            }
          });
        });

        if (general) {
          const groups = _.groupBy(general, "bankAcronym");

          _.forOwn(groups, function (value, key) {
            const totalAmount = value.reduce((n, { amount }) => n + amount, 0);

            mutate({
              totalAmount: totalAmount,
              fundSection: "GENERAL",
              bankAcronym: key,
              data: value,
            });
          });
        }

        if (sef) {
          const groups = _.groupBy(sef, "bankAcronym");

          _.forOwn(groups, function (value, key) {
            const totalAmount = value.reduce((n, { amount }) => n + amount, 0);

            mutate({
              totalAmount: totalAmount,
              fundSection: "SEF",
              bankAcronym: key,
              data: value,
            });
          });
        }

        if (trust) {
          const groups = _.groupBy(trust, "bankAcronym");

          _.forOwn(groups, function (value, key) {
            const totalAmount = value.reduce((n, { amount }) => n + amount, 0);

            mutate({
              totalAmount: totalAmount,
              fundSection: "TRUST",
              bankAcronym: key,
              data: value,
            });
          });
        }
      }
    }
  };

  return (
    <Stack>
      <Stack direction="row">
        <Button variant="contained" component="label">
          LOAN - UNRELEASED
          <input type="file" hidden onChange={handleFile} />
        </Button>
        <PopperPopupState>
          <Typography fontWeight="bold" mb={2}>
            Things to consider when import files
          </Typography>

          <Stack gap={1} ml={2}>
            <Typography fontWeight="bold">Things to consider when import files</Typography>
            <Typography fontWeight="bold">Things to consider when import files</Typography>
            <Typography fontWeight="bold">Things to consider when import files</Typography>
            <Typography fontWeight="bold">Things to consider when import files</Typography>
          </Stack>
        </PopperPopupState>
      </Stack>

      <Button
        onClick={() => {
          deleteAll();
        }}
      >
        Delete all
      </Button>

      {successText &&
        successText.map((t, n) => (
          <Typography color="success" key={n}>
            {t}
          </Typography>
        ))}
    </Stack>
  );
};

export default Porting;

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
