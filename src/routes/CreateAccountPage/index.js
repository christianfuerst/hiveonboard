import React from "react";
import { useFirestore, useFirestoreDocData } from "reactfire";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Chip from "@material-ui/core/Chip";
import Icon from "@material-ui/core/Icon";
import Tooltip from "@material-ui/core/Tooltip";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import Link from "@material-ui/core/Link";

import ChooseAccount from "../../components/ChooseAccount";
import BackupAccount from "../../components/BackupAccount";
import ChooseDApp from "../../components/ChooseDApp";

const useStyles = makeStyles((theme) => ({
  card: {
    margin: 10,
  },
  subHeader: {
    fontSize: 14,
  },
  title: {
    flexGrow: 1,
  },
  chip: {
    margin: theme.spacing(0.5, 0, 0.5, 0),
  },
}));

const CreateAccountPage = () => {
  const classes = useStyles();
  const firestore = useFirestore();
  const publicData = useFirestoreDocData(firestore.doc("public/data"));

  const [accountTickets, setAccountTickets] = React.useState(0);
  const [activeStep, setActiveStep] = React.useState(0);
  const [account, setAccount] = React.useState({});
  const steps = getSteps();

  React.useEffect(() => {
    if (typeof publicData !== "undefined") {
      var tickets = publicData.accountTickets;

      if (publicData.creators) {
        publicData.creators.forEach((element) => {
          tickets = tickets + element.accountTickets;
        });
      }

      setAccountTickets(tickets);
    }
  }, [publicData]);

  function getSteps() {
    return ["Choose your account", "Backup your account", "Choose your dapp"];
  }

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <ChooseAccount
            setActiveStep={setActiveStep}
            setAccount={setAccount}
          />
        );
      case 1:
        return (
          <BackupAccount
            setActiveStep={setActiveStep}
            setAccount={setAccount}
            account={account}
          />
        );
      case 2:
        return <ChooseDApp account={account} />;
      default:
        return "Unknown step";
    }
  }

  return (
    <React.Fragment>
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
              {accountTickets === 0 ? (
                <Tooltip
                  enterTouchDelay={0}
                  title={`Current supply: ${accountTickets} accounts`}
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
                  title={`Current supply: ${accountTickets} accounts`}
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
              {accountTickets === 0 ? (
                <Alert className={classes.alert} severity="info">
                  <AlertTitle>Service Unvailable</AlertTitle>
                  We are currently out of account creation tickets. Check back
                  later or use{" "}
                  <Link href="https://signup.hive.io" target="_blank">
                    signup.hive.io
                  </Link>{" "}
                  for other account creation options.
                </Alert>
              ) : (
                getStepContent(activeStep)
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </React.Fragment>
  );
};

export default CreateAccountPage;
