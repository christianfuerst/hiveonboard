import React from "react";
import {
  Route,
  Switch,
  Link as RouterLink,
  useLocation,
} from "react-router-dom";
import {
  makeStyles,
  createMuiTheme,
  ThemeProvider,
  responsiveFontSizes,
} from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";

import { muiThemeConfig } from "./config";
import HiveLogo from "./assets/hive_logo.png";
import HiveClaim from "./assets/hive_claim.png";
import LandingPage from "./routes/LandingPage";
import WhatIsHivePage from "./routes/WhatIsHivePage";
import CreateAccountPage from "./routes/CreateAccountPage";
import DAppsPage from "./routes/DAppsPage";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: 0,
  },
  appBar: {
    background: "#212429",
  },
  imageLogo: {
    height: 40,
  },
  imageClaim: {
    height: 40,
  },
  link: {
    margin: theme.spacing(0, 0.5, 0, 0.5),
  },
  box: {
    backgroundColor: "#e31337",
  },
  button: {
    color: "#ffffff",
  },
}));

let theme = createMuiTheme(muiThemeConfig);
theme = responsiveFontSizes(theme);

function App() {
  const classes = useStyles();
  const location = useLocation();

  return (
    <ThemeProvider theme={theme}>
      <Container className={classes.container} maxWidth="md">
        <CssBaseline />
        <AppBar className={classes.appBar} position="static">
          <Toolbar>
            <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Grid item>
                <Button
                  component={RouterLink}
                  to={"/" + location.search}
                  disabled={location.pathname === "/" ? true : false}
                >
                  <img
                    className={classes.imageLogo}
                    src={HiveLogo}
                    alt="HIVE Logo"
                  />
                </Button>
              </Grid>
              <Grid item>
                <img
                  className={classes.imageClaim}
                  src={HiveClaim}
                  alt="HIVE Claim"
                />
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
        <Box className={classes.box} display="flex">
          <Box>
            <Button
              className={classes.button}
              size="large"
              color="secondary"
              component={RouterLink}
              to={"/what-is-hive" + location.search}
              disabled={location.pathname === "/what-is-hive" ? true : false}
            >
              Learn
            </Button>
          </Box>
          <Box>
            <Button
              className={classes.button}
              size="large"
              color="secondary"
              component={RouterLink}
              to={"/create-account" + location.search}
              disabled={location.pathname === "/create-account" ? true : false}
            >
              Create Account
            </Button>
          </Box>
          <Box>
            <Button
              className={classes.button}
              size="large"
              component={RouterLink}
              to={"/discover-dapps" + location.search}
              disabled={location.pathname === "/discover-dapps" ? true : false}
            >
              Explore
            </Button>
          </Box>
        </Box>
        <Switch>
          <Route path="/" exact component={LandingPage} />
          <Route path="/what-is-hive" exact component={WhatIsHivePage} />
          <Route path="/create-account" exact component={CreateAccountPage} />
          <Route path="/discover-dapps" exact component={DAppsPage} />
        </Switch>
        <AppBar className={classes.appBar} position="static">
          <Toolbar variant="dense">
            <Grid
              container
              direction="row"
              justify="center"
              alignItems="center"
            >
              <Grid item>
                hiveonboard.com -
                <Link
                  className={classes.link}
                  target="_blank"
                  href="https://peakd.com/@hiveonboard"
                >
                  @hiveonboard
                </Link>
                - created by
                <Link
                  className={classes.link}
                  target="_blank"
                  href="https://peakd.com/@roomservice"
                >
                  @roomservice
                </Link>
                -
                <Link
                  className={classes.link}
                  target="_blank"
                  href="https://github.com/christianfuerst/hiveonboard"
                >
                  GitHub
                </Link>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
      </Container>
    </ThemeProvider>
  );
}

export default App;
