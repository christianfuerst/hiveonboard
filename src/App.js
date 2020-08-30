import React from "react";
import createPersistedState from "use-persisted-state";
import _ from "lodash";
import {
  Route,
  Switch,
  Link as RouterLink,
  useLocation,
} from "react-router-dom";
import hivesigner from "hivesigner";
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
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import Tooltip from "@material-ui/core/Tooltip";

import { muiThemeConfig } from "./config";
import HiveLogo from "./assets/hiveonboard_logo_white.png";
import HiveClaim from "./assets/hive_claim.png";
import LandingPage from "./routes/LandingPage";
import WhatIsHivePage from "./routes/WhatIsHivePage";
import CreateAccountPage from "./routes/CreateAccountPage";
import DAppsPage from "./routes/DAppsPage";
import DashboardPage from "./routes/DashboardPage";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: 0,
    margin: 0,
    "min-height": "100%",
    display: "flex",
    "flex-flow": "column"
  },
  appBar: {
    background: "#212429",
    padding: "10px 40px",
    "box-shadow": "none"
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
    padding: "10px 50px"
  },
  button: {
    color: "#ffffff",
  },
  buttonBox: {
    padding: "5px 25px"
  },
  avatarImg: {
    width: 25,
    height: 25,
  },
}));

const theme = responsiveFontSizes(createMuiTheme(muiThemeConfig));
const useAccessTokenState = createPersistedState("accessToken");
const useUsernameState = createPersistedState("username");

function App() {
  const classes = useStyles();
  const location = useLocation();

  const [accessToken, setAccessToken] = useAccessTokenState(null);
  const [username, setUsername] = useUsernameState(null);
  const [auth, setAuth] = React.useState(null);
  const [userProfile, setUserProfile] = React.useState({});

  const client = new hivesigner.Client({
    app: "hiveonboard",
    callbackURL: "http://hiveonboard.com/dashboard",
    //callbackURL: "http://localhost:3000/dashboard",
    scope: ["login"],
    accessToken: [accessToken],
  });

  React.useEffect(() => {
    const query = new URLSearchParams(location.search);

    if (!_.isNil(query.get("access_token"))) {
      setAccessToken(query.get("access_token"));
    }

    if (!_.isNil(query.get("username"))) {
      setUsername(query.get("username"));
    }
  }, [location.search, setAccessToken, setUsername]);

  React.useEffect(() => {
    if (accessToken && username && !auth) {
      client.me(function (err, res) {
        if (err) {
          setAuth(null);
          setUserProfile({});
        } else {
          setAuth(res);

          let userProfileCandidate = {};

          userProfileCandidate.account = username;
          userProfileCandidate.reputation = res.account.reputation;

          try {
            const profileJSON = JSON.parse(res.account.posting_json_metadata)
              .profile;

            if (profileJSON.hasOwnProperty("name")) {
              userProfileCandidate.name = profileJSON.name;
            }

            if (profileJSON.hasOwnProperty("profile_image")) {
              userProfileCandidate.profile_image = profileJSON.profile_image;
            }

            if (profileJSON.hasOwnProperty("about")) {
              userProfileCandidate.about = profileJSON.about;
            }

            setUserProfile(userProfileCandidate);
          } catch (error) {
            userProfileCandidate.name = username;
            userProfileCandidate.profile_image = "";
            userProfileCandidate.about = "";

            setUserProfile(userProfileCandidate);
          }
        }
      });
    }
  }, [auth, accessToken, username, client]);

  return (
    <ThemeProvider theme={theme}>
      <Container className={classes.container} maxWidth="100%">
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
        <Box
          className={classes.box}
          display="flex"
          flexWrap="wrap"
          alignItems="center"
        >
          <Box>
            <Button
              className={[classes.button, classes.buttonBox]}
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
              className={[classes.button, classes.buttonBox]}
              color="secondary"
              component={RouterLink}
              to={"/what-is-hive" + location.search}
              disabled={location.pathname === "/what-is-hive" ? true : false}
            >
              Learn More
            </Button>
          </Box>
          
          <Box flexGrow={1}>
            <Button
              className={[classes.button, classes.buttonBox]}
              component={RouterLink}
              to={"/discover-dapps" + location.search}
              disabled={location.pathname === "/discover-dapps" ? true : false}
            >
              Explore
            </Button>
          </Box>
          {!auth ? (
            <Box>
              <Button
                className={[classes.button, classes.buttonBox]}
                size="large"
                onClick={() => {
                  client.login({});
                }}
              >
                Referral Login
              </Button>
            </Box>
          ) : (
            <React.Fragment>
              <Box>
                <Button
                  className={classes.button}
                  component={RouterLink}
                  to={"/dashboard" + location.search}
                  disabled={location.pathname === "/dashboard" ? true : false}
                >
                  My Dashboard
                </Button>
              </Box>
              <Box>
                <Tooltip title="Logout">
                  <IconButton
                    size="small"
                    className={classes.button}
                    component={RouterLink}
                    onClick={() => {
                      client.revokeToken();
                      setAccessToken(null);
                      setAuth(null);
                      setUserProfile({});
                    }}
                    to={"/"}
                  >
                    <Icon>exit_to_app</Icon>{" "}
                  </IconButton>
                </Tooltip>
              </Box>
            </React.Fragment>
          )}
        </Box>
        <Switch>
          <Route path="/" exact component={LandingPage} />
          <Route
            path="/what-is-hive"
            exact
            render={(props) => <WhatIsHivePage {...props} client={client} />}
          />
          <Route path="/create-account" exact component={CreateAccountPage} />
          <Route path="/discover-dapps" exact component={DAppsPage} />
          <Route
            path="/dashboard"
            exact
            render={(props) => (
              <DashboardPage
                {...props}
                accessToken={accessToken}
                userProfile={userProfile}
              />
            )}
          />
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
                  href="https://hivesigner.com/sign/account-witness-vote?witness=roomservice&approve=1"
                >
                  Vote for Witness
                </Link>
                -
                <Link
                  className={classes.link}
                  target="_blank"
                  href="https://github.com/christianfuerst/hiveonboard"
                >
                  GitHub
                </Link>
                -
                <Link
                  className={classes.link}
                  target="_blank"
                  href="https://app.swaggerhub.com/apis-docs/christianfuerst/hiveonboard.com/1.0.0"
                >
                  API
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
