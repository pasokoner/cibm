import { List, Typography } from "@mui/material";

import BallotIcon from "@mui/icons-material/Ballot";
import BookIcon from "@mui/icons-material/Book";
import HandshakeIcon from "@mui/icons-material/Handshake";

import MuiFundsItem from "./MuiFundsItem";

const MuiDrawerFunds = () => {
  return (
    <>
      <Typography ml={2}>Funds</Typography>
      <List>
        <MuiFundsItem section="GENERAL" icon={<BallotIcon />} />
        <MuiFundsItem section="SEF" icon={<BookIcon />} />
        <MuiFundsItem section="TRUST" icon={<HandshakeIcon />} />
      </List>
    </>
  );
};

export default MuiDrawerFunds;
