import * as React from "react";

import { List, ListItemButton, ListItemIcon, ListItemText, Collapse } from "@mui/material";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { trpc } from "../utils/trpc";

type Props = {
  section: "GENERAL" | "TRUST" | "SEF";
  icon: JSX.Element;
};

export default function MuiFundsItem({ section, icon }: Props) {
  const [open, setOpen] = React.useState(false);

  const { data } = trpc.funds.getSpecificFunds.useQuery({ section: section });

  const handleClick = () => {
    setOpen(!open);
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
                <ListItemButton sx={{ pl: 4 }} key={id}>
                  <ListItemIcon>
                    <AccountBalanceIcon />
                  </ListItemIcon>
                  <ListItemText primary={acronym} />
                </ListItemButton>
              );
            })}
        </List>
      </Collapse>
    </>
  );
}
