import Link from "next/link";

import { signOut, useSession } from "next-auth/react";

import React from "react";

import {
  AppBar,
  Box,
  Button,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";
import NoteIcon from "@mui/icons-material/Note";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";

import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import SendToMobileIcon from "@mui/icons-material/SendToMobile";
import PercentIcon from "@mui/icons-material/Percent";

import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";

import LogoutIcon from "@mui/icons-material/Logout";

import MuiDrawerFunds from "./MuiDrawerFunds";
import CheckSelect from "./CheckSelect";

const drawerWidth = 240;

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
  children: React.ReactNode;
}

export default function MuiDrawer(props: Props) {
  const { window, children } = props;

  const { data: sessionData } = useSession();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [cancelled, setCancelled] = React.useState(false);
  const [released, setReleased] = React.useState(false);
  const [unreleased, setUnreleased] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleCancelled = () => {
    setCancelled((prevState) => !prevState);
  };

  const toggleReleased = () => {
    setReleased((prevState) => !prevState);
  };
  const toggleUnreleased = () => {
    setUnreleased((prevState) => !prevState);
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        <ListItem
          disablePadding
          sx={{
            py: 1,
          }}
        >
          <ListItemButton>
            <ListItemIcon>
              <AccountCircleIcon fontSize="large" />
            </ListItemIcon>
            <ListItemText primary={sessionData?.user?.name?.split(" ")[0]} />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider />

      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={toggleReleased}>
            <ListItemIcon>
              <CancelPresentationIcon />
            </ListItemIcon>
            <ListItemText primary="Cancelled Check" />
          </ListItemButton>

          {cancelled && <CheckSelect status="CANCELLED" handleClose={toggleCancelled} />}
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={toggleReleased}>
            <ListItemIcon>
              <NoteIcon />
            </ListItemIcon>
            <ListItemText primary="Released Check" />
          </ListItemButton>

          {released && <CheckSelect status="RELEASED" handleClose={toggleReleased} />}
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={toggleUnreleased}>
            <ListItemIcon>
              <StrikethroughSIcon />
            </ListItemIcon>
            <ListItemText primary="Unreleased Check" />
          </ListItemButton>

          {unreleased && <CheckSelect status="UNRELEASED" handleClose={toggleUnreleased} />}
        </ListItem>
      </List>

      <Divider />

      <MuiDrawerFunds />

      <Divider />
      <Typography ml={2}>Transcations</Typography>

      <List>
        <Link href="/transactions/deposit">
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <MonetizationOnIcon />
              </ListItemIcon>
              <ListItemText primary="Deposit" />
            </ListItemButton>
          </ListItem>
        </Link>

        <Link href="/transactions/direct-deposit">
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <SendToMobileIcon />
              </ListItemIcon>
              <ListItemText primary="Direct Deposit" />
            </ListItemButton>
          </ListItem>
        </Link>

        <Link href="/transactions/loan-payment">
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <PercentIcon />
              </ListItemIcon>
              <ListItemText primary="Loan Payment" />
            </ListItemButton>
          </ListItem>
        </Link>

        {sessionData?.user?.role === "ADMIN" && (
          <>
            <Divider />
            <Typography ml={2}>Accounts</Typography>

            <Link href="/manage-account">
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <SupervisorAccountIcon />
                  </ListItemIcon>
                  <ListItemText primary="Manage Account" />
                </ListItemButton>
              </ListItem>
            </Link>
          </>
        )}

        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              signOut();
            }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            CIBM
          </Typography>

          <Link
            href="/porting"
            style={{
              marginLeft: "auto",
            }}
          >
            <Button color="warning" variant="contained">
              IMPORT
            </Button>
          </Link>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}

        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              color: "regular.white",
              bgcolor: "primary.main",
              boxSizing: "border-box",
              width: drawerWidth,
            },
            "& .MuiListItem-root": {
              "&:hover": {
                bgcolor: "primary.light",
              },
            },

            "& .MuiSvgIcon-root": {
              color: "regular.white",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              color: "regular.white",
              bgcolor: "primary.main",
              boxSizing: "border-box",
              width: drawerWidth,
            },
            "& .MuiListItem-root": {
              "&:hover": {
                bgcolor: "primary.light",
              },
            },

            "& .MuiSvgIcon-root": {
              color: "regular.white",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
