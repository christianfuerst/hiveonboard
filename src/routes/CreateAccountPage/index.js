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

import CreateAccount from "../../components/CreateAccount";
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
              {publicData.accountTickets === 0 && 1 === 0 ? (
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
    </React.Fragment>
  );
};

export default CreateAccountPage;
