import { useRouter } from "next/router";

import { useSession } from "next-auth/react";

import React from "react";

import { trpc } from "../utils/trpc";

import { List, ListItemButton, ListItemIcon, ListItemText, Collapse } from "@mui/material";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

import AddIcon from "@mui/icons-material/Add";

import AddBank from "./AddBank";

type Props = {
  section: "GENERAL" | "TRUST" | "SEF";
  icon: JSX.Element;
};

export default function MuiFundsItem({ section, icon }: Props) {
  const [open, setOpen] = React.useState(false);

  const [openAdd, setOpenAdd] = React.useState(false);

  const { data: sessionData } = useSession();

  const router = useRouter();

  const { data } = trpc.funds.getSpecificFunds.useQuery({ section: section });

  const handleClick = () => {
    setOpen(!open);
  };

  const handleOpenAdd = () => {
    setOpenAdd(!openAdd);
  };

  return (
    <>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={section} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {data &&
            data.bank &&
            data.bank.map(({ id, acronym }) => {
              return (
                <ListItemButton
                  sx={{ pl: 4 }}
                  key={id}
                  onClick={() => {
                    router.push({
                      pathname: `/funds/[bankId]`,
                      query: {
                        bankId: id,
                      },
                    });
                  }}
                >
                  <ListItemIcon>
                    <AccountBalanceIcon />
                  </ListItemIcon>
                  <ListItemText primary={acronym} />
                </ListItemButton>
              );
            })}
          {data && sessionData?.user?.role === "ADMIN" && (
            <ListItemButton sx={{ pl: 4 }} onClick={handleOpenAdd}>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary={"Add Bank"} />
            </ListItemButton>
          )}
        </List>
      </Collapse>

      {data && openAdd && (
        <AddBank section={section} handleClose={handleOpenAdd} fundId={data?.id} />
      )}
    </>
  );
}
