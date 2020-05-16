import React from "react";
import * as firebase from "firebase/app";
import "firebase/auth";
import { useAuth, useFunctions, useAnalytics } from "reactfire";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

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
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#ffffff",
  },
  helperText: {
    marginTop: theme.spacing(2),
  },
  textField: {
    width: 300,
    marginBottom: theme.spacing(2),
  },
}));

const BackupKeys = ({ setActiveStep, account, referrer }) => {
  const classes = useStyles();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const auth = useAuth();
  const functions = useFunctions();
  const analytics = useAnalytics();
  const [confirmed, setConfirmed] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [showDialog, setShowDialog] = React.useState(false);

  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [codeRequested, setCodeRequested] = React.useState(false);
  const [confirmationResult, setConfirmationResult] = React.useState(null);
  const [confirmationCode, setConfirmationCode] = React.useState("");

  //const createAccount = functions.httpsCallable("createFakeAccount"); // Use this for development
  const createAccount = functions.httpsCallable("createAccount");

  React.useEffect(() => {
    initializeRecaptcha();
  }, []);

  const initializeRecaptcha = () => {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "create-account",
      {
        size: "invisible",
        callback: function (response) {},
      }
    );

    window.recaptchaVerifier.render().then(function (widgetId) {
      window.recaptchaWidgetId = widgetId;
    });
  };

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

  const closeDialog = () => {
    setShowDialog(false);
    setPhoneNumber("");
    setCodeRequested(false);
    setConfirmationResult(null);
    setConfirmationCode("");
    setSubmitting(false);
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
              onClick={() =>
                analytics.logEvent("open_browser_extension", {
                  extension: "keychain",
                })
              }
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
            id="create-account"
            onClick={() => {
              if (confirmed) {
                setShowDialog(true);
              }
            }}
            className={classes.button}
          >
            Create HIVE Account
          </Button>
          <Dialog
            fullScreen={fullScreen}
            maxWidth="xs"
            open={showDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            disableBackdropClick
            disableEscapeKeyDown
          >
            <DialogTitle id="alert-dialog-title">
              One-Time-Code Phone Verification
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                In order to continue a phone verification is required.
              </DialogContentText>
              {!codeRequested ? (
                <React.Fragment>
                  <DialogContentText>
                    <b>Enter your Phone Number:</b>
                  </DialogContentText>
                  <Box display="flex">
                    <PhoneInput
                      disabled={codeRequested}
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(value) => {
                        setPhoneNumber(value);
                      }}
                    />
                  </Box>
                  <DialogContentText className={classes.helperText}>
                    Please enter your phone number and request a one-time-code.
                    After a few seconds you will receive a SMS message
                    containing your one-time-code, which is required to finish
                    account creation.
                  </DialogContentText>
                  <DialogContentText>
                    Your phone number is only used for this verification and
                    won't be given to 3rd parties or used for other purposes.
                  </DialogContentText>
                  <DialogContentText>
                    <b>We respect your privacy!</b>
                  </DialogContentText>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <DialogContentText>
                    <b>Enter your Confirmation Code:</b>
                  </DialogContentText>
                  <Box display="flex">
                    <TextField
                      className={classes.textField}
                      disabled={codeRequested ? false : true}
                      required
                      variant="outlined"
                      size="small"
                      id="confirmation-code"
                      label="Code"
                      type="text"
                      inputProps={{ minLength: 6, maxLength: 6 }}
                      value={confirmationCode}
                      onChange={(event) =>
                        setConfirmationCode(event.target.value)
                      }
                    />
                  </Box>
                  <DialogContentText>
                    A SMS message has been sent to your phone number{" "}
                    <b>+{phoneNumber}</b> with a one-time-code, which is
                    required to finish account creation.
                  </DialogContentText>
                </React.Fragment>
              )}
              <Backdrop className={classes.backdrop} open={submitting}>
                <CircularProgress color="inherit" />
              </Backdrop>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  closeDialog();
                }}
                color="primary"
              >
                Cancel
              </Button>
              {!codeRequested ? (
                <Button
                  disabled={codeRequested || phoneNumber === ""}
                  onClick={() => {
                    setSubmitting(true);
                    let appVerifier = window.recaptchaVerifier;

                    auth
                      .signInWithPhoneNumber("+" + phoneNumber, appVerifier)
                      .then(function (result) {
                        // SMS sent. Prompt user to type the code from the message, then sign the
                        // user in with confirmationResult.confirm(code).
                        setCodeRequested(true);
                        setConfirmationResult(result);
                        setSubmitting(false);
                      })
                      .catch(function (error) {
                        setError(error.message);
                        closeDialog();
                      });
                  }}
                  color="primary"
                  variant="contained"
                >
                  Request SMS
                </Button>
              ) : (
                <Button
                  disabled={
                    !codeRequested || confirmationCode.toString().length !== 6
                      ? true
                      : false
                  }
                  onClick={() => {
                    setSubmitting(true);
                    confirmationResult
                      .confirm(confirmationCode)
                      .then(function () {
                        createAccount({
                          username: account.username,
                          publicKeys: account.publicKeys,
                          referrer: referrer,
                        }).then(function (result) {
                          if (result.data.hasOwnProperty("error")) {
                            analytics.logEvent("create_account_error", {
                              error: result.data.error,
                            });
                            setError(result.data.error);
                            closeDialog();
                          } else {
                            analytics.logEvent("create_account_success");
                            setActiveStep(2);
                          }
                        });
                      })
                      .catch(function (error) {
                        setError(error.message);
                        closeDialog();
                      });
                  }}
                  color="primary"
                  variant="contained"
                >
                  Submit Code
                </Button>
              )}
            </DialogActions>
          </Dialog>
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
