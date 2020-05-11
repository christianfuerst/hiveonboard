import React from "react";
import { useFunctions, useAnalytics } from "reactfire";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";

import hivesigner from "../../assets/hivesigner.png";
import keychain from "../../assets/keychain.png";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(2),
  },
  alert: {
    margin: theme.spacing(2),
  },
  text: {
    fontFamily: "Monospace",
    fontSize: 14,
    margin: theme.spacing(0, 1, 0, 1),
  },
  paper: {
    margin: theme.spacing(2, 0, 2, 0),
    padding: theme.spacing(0.5),
  },
  imageIcon: {
    height: "100%",
    width: "100%",
  },
  iconRoot: {
    textAlign: "center",
  },
}));

const BackupKeys = ({ setActiveStep, account }) => {
  const classes = useStyles();
  const analytics = useAnalytics();
  const functions = useFunctions();
  const [confirmed, setConfirmed] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);

  //const createAccount = functions.httpsCallable("createFakeAccount"); // Use this for development
  const createAccount = functions.httpsCallable("createAccount");

  const accountString =
    `--------------- YOUR ACCOUNT -------------\n` +
    `Username: ${account.username}\n` +
    `Password: ${account.password}\n` +
    `------------------------ PRIVATE KEYS ----------------------\n` +
    `Owner:   ${account.privateKeys.owner}\n` +
    `Active:  ${account.privateKeys.active}\n` +
    `Posting: ${account.privateKeys.posting}\n` +
    `Memo:    ${account.privateKeys.memo}\n` +
    `------------------------ PUBLIC KEYS -------------------------\n` +
    `Owner:   ${account.publicKeys.owner}\n` +
    `Active:  ${account.publicKeys.active}\n` +
    `Posting: ${account.publicKeys.posting}\n` +
    `Memo:    ${account.publicKeys.memo}`;

  const downloadBackupFile = () => {
    const element = document.createElement("a");
    const file = new Blob([accountString], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "HIVE-ACOUNT-" + account.username + "-BACKUP.txt";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <Grid container alignItems="center" justify="center" direction="column">
      <Grid item>
        <Typography variant="h6">Welcome to HIVE!</Typography>
        <Typography>
          Congratulations, your account is almost ready!
          <br />
          <br />
          Your HIVE username and password:
        </Typography>
      </Grid>
      <Grid item>
        <Paper className={classes.paper} elevation={3}>
          <Grid
            container
            alignItems="center"
            justify="center"
            direction="column"
          >
            <Grid item>
              <Typography className={classes.text}>
                <b>Username: {account.username}</b>
              </Typography>
              <Typography className={classes.text}>
                <b>Password: {account.password}</b>
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <Grid item>
        <Typography>
          Recommended browser extensions to manage and secure your account:
        </Typography>
        <Grid container alignItems="center" justify="center" direction="row">
          <Grid item>
            <Button
              onClick={analytics.logEvent("open_browser_extension", {
                extension: "keychain",
              })}
              target="_blank"
              href="https://chrome.google.com/webstore/detail/hive-keychain/jcacnejopjdphbnjgfaaobbfafkihpep"
              variant="contained"
              color="secondary"
              size="large"
              className={classes.button}
              startIcon={
                <Icon className={classes.iconRoot}>
                  <img
                    className={classes.imageIcon}
                    src={keychain}
                    alt="Keychain"
                  />
                </Icon>
              }
            >
              Keychain
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={analytics.logEvent("open_browser_extension", {
                extension: "hivesigner",
              })}
              target="_blank"
              href="https://chrome.google.com/webstore/detail/hivesigner/ophihnhnfgcmhpbcennhppicomdeabip"
              variant="contained"
              color="secondary"
              size="large"
              className={classes.button}
              startIcon={
                <Icon className={classes.iconRoot}>
                  <img
                    className={classes.imageIcon}
                    src={hivesigner}
                    alt="Hivesigner"
                  />
                </Icon>
              }
            >
              Hivesigner
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Alert className={classes.alert} severity="warning">
          <AlertTitle>Please backup your account password and keys!</AlertTitle>
          You can change your password later, but for now you have to keep it
          safe. We don't offer account recovery yet, so be aware of the fact if
          you lose your password, your account cannot be recovered.
        </Alert>
      </Grid>
      <Grid item>
        <Grid container alignItems="center" justify="center" direction="row">
          <Button
            variant="contained"
            color="primary"
            disabled={confirmed ? true : false}
            onClick={() => {
              analytics.logEvent("download_backup_file");
              downloadBackupFile();
              setConfirmed(true);
            }}
            className={classes.button}
          >
            Download Backup
          </Button>
          <Button
            disabled={!confirmed ? true : false}
            variant="contained"
            color="primary"
            onClick={() => {
              if (confirmed) {
                setSubmitting(true);
                createAccount(account).then(function (result) {
                  if (result.data.hasOwnProperty("error")) {
                    analytics.logEvent("create_account_error", {
                      error: result.data.error,
                    });
                    setError(result.data.error);
                    setSubmitting(false);
                  } else {
                    analytics.logEvent("create_account_success");
                    setActiveStep(2);
                  }
                });
              }
            }}
            className={classes.button}
          >
            Create HIVE Account
          </Button>
        </Grid>
        {error && (
          <Grid container alignItems="center" justify="center" direction="row">
            <Alert
              className={classes.alert}
              severity="error"
              onClose={() => setError(null)}
            >
              <AlertTitle>Account could not be created</AlertTitle>
              {error}
            </Alert>
          </Grid>
        )}
        <Backdrop className={classes.backdrop} open={submitting}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </Grid>
    </Grid>
  );
};

export default BackupKeys;
