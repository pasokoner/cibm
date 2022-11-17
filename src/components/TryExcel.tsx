import { group } from "console";
import React, { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { trpc } from "../utils/trpc";

import _ from "lodash";

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

enum Section {
  TRUST,
  GENERAL,
  SEF,
}

type Seeds = {
  bankAcronym: string;
  checkNumber: string;
  date: Date;
  description: string;
  amount: number;
  payee: string;
  fundSection: "GENERAL" | "SEF" | "TRUST";
};

export default function SheetJSReactAoO() {
  /* the component state is an array of presidents */

  const [seeds, setSeeds] = React.useState<Seeds[]>();

  const { mutate } = trpc.porting.importLoan.useMutation({});

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
          const worksheet = workbook.Sheets[workbook.SheetNames[i]];
          const jsonData = XLSX.utils.sheet_to_json<Fund>(worksheet);

          jsonData.forEach((item) => {
            if (item.Status && item.Status === "Released") {
              return;
            }
            if (
              item.Date &&
              item.Check &&
              item.Payee &&
              item.Particulars &&
              item.Amount &&
              item.Fund
            ) {
              const sectionBank = item.Fund.split(" ");

              if (
                sectionBank[1] &&
                section.includes(sectionBank[1].toUpperCase()) &&
                sectionBank[0]
              ) {
                // // console.log(excelDateToJSDate(item.Date));
                // console.log(item);
                const section = sectionBank[1].toUpperCase().trim();
                const bankAcronym = sectionBank[0].toUpperCase().trim();

                const dataSeed = {
                  bankAcronym: bankAcronym,
                  checkNumber: item.Check.toString(),
                  date: excelDateToJSDate(item.Date),
                  description: item.Particulars,
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

        // console.log(general);
        // console.log(sef);
        // console.log(trust);

        if (general) {
          const groups = _.groupBy(general, "bankAcronym");

          // const groups = general.reduce(
          //   (groups, item) => ({
          //     ...groups,
          //     [item.bankAcronym]: [...(groups[item.bankAcronym] || []), item],
          //   }),
          //   {}
          // );

          console.log(groups);

          _.forOwn(groups, function (value, key) {
            console.log(value, key);
            const totalAmount = value.reduce((n, { amount }) => n + amount, 0);

            mutate({
              totalAmount: totalAmount,
              fundSection: "GENERAL",
              bankAcronym: key,
              data: value,
            });
          });

          // for (const bank in groups) {
          //   const totalAmount = groups[bank].reduce((n, { amount }) => n + amount, 0);

          //   console.log(totalAmount);

          //   mutate({
          //     totalAmount: totalAmount,
          //     fundSection: "GENERAL",
          //     bankAcronym: bank,
          //     ...groups[bank],
          //   });
          // }
        }
      }
    }
  };

  return (
    <>
      <input type="file" onChange={handleFile} />
    </>
  );
}
