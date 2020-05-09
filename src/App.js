import React from "react";
import { useFirestore, useFirestoreDocData } from "reactfire";
import {
  makeStyles,
  createMuiTheme,
  ThemeProvider,
  responsiveFontSizes,
} from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import Chip from "@material-ui/core/Chip";
import Icon from "@material-ui/core/Icon";
import Tooltip from "@material-ui/core/Tooltip";
import Link from "@material-ui/core/Link";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";

import { muiThemeConfig } from "./config";
import HiveLogo from "./assets/hive_logo.png";
import HiveClaim from "./assets/hive_claim.png";
import CreateAccount from "./components/CreateAccount";
import BackupAccount from "./components/BackupAccount";
import ChooseDApp from "./components/ChooseDApp";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: 0,
  },
  card: {
    margin: 10,
  },
  subHeader: {
    fontSize: 14,
  },
  appBar: {
    background: "#212429",
  },
  title: {
    flexGrow: 1,
  },
  imageLogo: {
    height: 40,
  },
  imageClaim: {
    height: 40,
  },
  chip: {
    margin: theme.spacing(0.5, 0, 0.5, 0),
  },
  link: {
    margin: theme.spacing(0, 0.5, 0, 0.5),
  },
}));

let theme = createMuiTheme(muiThemeConfig);
theme = responsiveFontSizes(theme);

function App() {
  const classes = useStyles();
  const firestore = useFirestore();
  const publicData = useFirestoreDocData(firestore.doc("public/data"));

  const [activeStep, setActiveStep] = React.useState(0);
  const [account, setAccount] = React.useState({});
  const steps = getSteps();

  function getSteps() {
    return ["Create your account", "Backup your account", "Choose your dapp"];
  }

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <CreateAccount
            setActiveStep={setActiveStep}
            setAccount={setAccount}
          />
        );
      case 1:
        return (
          <BackupAccount setActiveStep={setActiveStep} account={account} />
        );
      case 2:
        return <ChooseDApp />;
      default:
        return "Unknown step";
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Container className={classes.container} maxWidth="md">
        <AppBar className={classes.appBar} position="static">
          <Toolbar>
            <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Grid item>
                <img
                  className={classes.imageLogo}
                  src={HiveLogo}
                  alt="HIVE Logo"
                />
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
        <CssBaseline />
        <Card color="secondary" className={classes.card}>
          <CardContent>
            <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Grid item md={8}>
                <Typography className={classes.subHeader} variant="overline">
                  <b>Create your free HIVE account!</b>
                </Typography>
              </Grid>
              <Grid item md={2}>
                <Tooltip
                  enterTouchDelay={0}
                  title="It's a blazing fast distributed blockchain database that supports community building, social interaction and 3rd party apps with cryptocurrency rewards."
                >
                  <Chip
                    className={classes.chip}
                    color="primary"
                    label="What's HIVE?"
                    icon={<Icon>help</Icon>}
                  />
                </Tooltip>
              </Grid>
              <Grid item md={2}>
                {publicData.accountTickets === 0 ? (
                  <Tooltip
                    enterTouchDelay={0}
                    title={`Current supply: ${publicData.accountTickets} accounts`}
                  >
                    <Chip
                      className={classes.chip}
                      color="primary"
                      label="Service Unavailable"
                      icon={<Icon>error</Icon>}
                    />
                  </Tooltip>
                ) : (
                  <Tooltip
                    enterTouchDelay={0}
                    title={`Current supply: ${publicData.accountTickets} accounts`}
                  >
                    <Chip
                      className={classes.chip}
                      color="secondary"
                      label="Service Available"
                      icon={<Icon>done</Icon>}
                    />
                  </Tooltip>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Card className={classes.card}>
          <CardContent>
            <Grid
              container
              direction="column"
              justify="center"
              alignItems="center"
              spacing={2}
            >
              <Grid item xs={12}>
                <Stepper alternativeLabel activeStep={activeStep}>
                  {steps.map((label) => {
                    return (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    );
                  })}
                </Stepper>
              </Grid>
              <Grid item xs={12}>
                {publicData.accountTickets === 0 ? (
                  <Alert className={classes.alert} severity="info">
                    <AlertTitle>Service Unvailable</AlertTitle>
                    We are currently out of account creation tickets. Check back
                    later.
                  </Alert>
                ) : (
                  getStepContent(activeStep)
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <AppBar className={classes.appBar} position="static">
          <Toolbar variant="dense">
            <Grid
              container
              direction="row"
              justify="center"
              alignItems="center"
            >
              <Grid item>
                hiveonboard.com is sponsored by
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
