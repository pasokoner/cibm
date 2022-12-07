import * as React from "react";
import { Typography, Popper, IconButton, Fade, Paper } from "@mui/material";
import PopupState, { bindToggle, bindPopper } from "material-ui-popup-state";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

type Props = {
  children: React.ReactNode;
};

export default function PopperPopupState(props: Props) {
  const { children } = props;

  return (
    <PopupState variant="popper" popupId="demo-popup-popper">
      {(popupState) => (
        <div>
          <IconButton color="warning" disableRipple {...bindToggle(popupState)}>
            <ErrorOutlineIcon />
          </IconButton>
          <Popper {...bindPopper(popupState)} transition>
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={350}>
                <Paper
                  sx={{
                    p: 2,
                  }}
                >
                  {children}
                </Paper>
              </Fade>
            )}
          </Popper>
        </div>
      )}
    </PopupState>
  );
}
