import React from "react";
import { useAnalytics } from "reactfire";
import { isChrome, isEdgeChromium, isFirefox } from "react-device-detect";
import _ from "lodash";
import { useFormik } from "formik";
import * as Yup from "yup";
import hive from "@hiveio/hive-js";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import InputAdornment from "@material-ui/core/InputAdornment";
import Icon from "@material-ui/core/Icon";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";
import Tooltip from "@material-ui/core/Tooltip";
import Hidden from "@material-ui/core/Hidden";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import Box from "@material-ui/core/Box";

import { tos } from "../../config";
import ProfileCard from "../ProfileCard";
import keychain from "../../assets/keychain.png";

const useStyles = makeStyles((theme) => ({
  form: {
    width: "100%",
  },
  submit: {
    margin: theme.spacing(2),
  },
  textField: {
    width: 300,
  },
  chip: {
    marginTop: theme.spacing(2),
  },
  alertInfo: {
    marginBottom: theme.spacing(4),
  },
  button: {
    margin: theme.spacing(1),
  },
  iconRoot: {
    textAlign: "center",
  },
  imageIcon: {
    height: "100%",
    width: "100%",
  },
}));

const ChooseAccount = ({
  account,
  setActiveStep,
  setAccount,
  referrerAccount,
  setReferrerAccount,
  referrer,
  setReferrer,
  ticket,
  setTicket,
}) => {
  const classes = useStyles();
  const analytics = useAnalytics();

  const [referrerProfile, setReferrerProfile] = React.useState({});
  const [confirmed, setConfirmed] = React.useState(false);
  const [showTermsOfService, setShowTermsOfService] = React.useState(false);
  const [showReferrerDialog, setShowReferrerDialog] = React.useState(false);
  const [showTicketDialog, setShowTicketDialog] = React.useState(false);
  const [showKeychainAlert, setShowKeychainAlert] = React.useState(true);

  React.useEffect(() => {
    if (referrerAccount) {
      let referrerProfileCandidate = {};

      try {
        const profileJSON = JSON.parse(referrerAccount.posting_json_metadata)
          .profile;

        referrerProfileCandidate.account = referrer;

        if (profileJSON.hasOwnProperty("name")) {
          referrerProfileCandidate.name = profileJSON.name;
        }

        if (profileJSON.hasOwnProperty("profile_image")) {
          referrerProfileCandidate.profile_image = profileJSON.profile_image;
        }

        if (profileJSON.hasOwnProperty("about")) {
          referrerProfileCandidate.about = profileJSON.about;
        }

        setReferrerProfile(referrerProfileCandidate);
      } catch (error) {
        referrerProfileCandidate.account = referrer;
        referrerProfileCandidate.name = referrerAccount.name;
        referrerProfileCandidate.profile_image = "";
        referrerProfileCandidate.about = "";

        setReferrerProfile(referrerProfileCandidate);
      }
    }
  }, [referrerAccount, referrer]);

  const formik = useFormik({
    initialValues: {
      username: account.username,
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, "Username should contain at least 3 characters")
        .required("Username is required")
        .test("isValid", "Username is invalid", (value) => {
          if (value) {
            if (value.length >= 3) {
              if (_.isEmpty(hive.utils.validateAccountName(value))) {
                return true;
              } else {
                return false;
              }
            }
          } else {
            return true;
          }
        })
        .test("isAvailable", "Username is not available", async (value) => {
          if (value) {
            if (value.length >= 3) {
              let result = await hive.api.lookupAccountNamesAsync([value]);
              if (_.isEmpty(result[0])) {
                return true;
              } else {
                return false;
              }
            } else {
              return true;
            }
          } else {
            return true;
          }
        }),
    }),
    onSubmit: (values) => {
      if (confirmed) {
        let password = hive.formatter.createSuggestedPassword();

        setAccount({
          username: values.username,
          password: password,
          publicKeys: hive.auth.generateKeys(values.username, password, [
            "owner",
            "active",
            "posting",
            "memo",
          ]),
          privateKeys: hive.auth.getPrivateKeys(values.username, password, [
            "owner",
            "active",
            "posting",
            "memo",
          ]),
        });

        analytics.logEvent("confirm_account_name");
        setActiveStep(1);
      }
    },
  });

  const formikReferrer = useFormik({
    initialValues: {
      referrer: "",
    },
    validationSchema: Yup.object({
      referrer: Yup.string()
        .nullable()
        .min(3, "Username should contain at least 3 characters")
        .required("Username is required")
        .test("isValid", "Username is invalid", (value) => {
          if (value) {
            if (value.length >= 3) {
              if (_.isEmpty(hive.utils.validateAccountName(value))) {
                return true;
              } else {
                return false;
              }
            }
          } else {
            return true;
          }
        })
        .test("isAvailable", "Username doesn't exist", async (value) => {
          if (value) {
            if (value.length >= 3) {
              let result = await hive.api.lookupAccountNamesAsync([value]);
              if (_.isEmpty(result[0])) {
                return false;
              } else {
                return true;
              }
            } else {
              return true;
            }
          } else {
            return true;
          }
        }),
    }),
    onSubmit: (values) => {
      hive.api.getAccounts([values.referrer], function (err, result) {
        if (result) {
          if (result.length === 1) {
            setReferrer(values.referrer);
            setReferrerAccount(result[0]);
          }
        }
      });
      setShowReferrerDialog(false);
    },
  });

  const formikTicket = useFormik({
    initialValues: {
      ticket: "",
    },
    validationSchema: Yup.object({
      ticket: Yup.string()
        .nullable()
        .required("VIP Ticket is required")
        .test("isValid", "VIP Ticket is invalid", (value) => {
          if (value) {
            if (value.length === 36) {
              return true;
            } else {
              return false;
            }
          } else {
            return true;
          }
        }),
    }),
    onSubmit: (values) => {
      setTicket(values.ticket);
      setShowTicketDialog(false);
    },
  });

  const renderReferrerDialog = () => {
    return (
      <Dialog
        maxWidth="xs"
        open={showReferrerDialog}
        onClose={() => setShowReferrerDialog(false)}
        aria-labelledby="referrer-dialog-title"
        aria-describedby="referrer-dialog-description"
      >
        <form className={classes.form} onSubmit={formikReferrer.handleSubmit}>
          <DialogTitle id="referrer-dialog-title">
            Enter your Referrer
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              color={formikReferrer.errors.referrer ? "primary" : "secondary"}
              required
              type="text"
              id="referrer"
              name="referrer"
              label="Referrer"
              variant="outlined"
              margin="normal"
              value={
                formikReferrer.values.referrer &&
                formikReferrer.values.referrer.toLowerCase()
              }
              onChange={formikReferrer.handleChange}
              onBlur={formikReferrer.handleBlur}
              error={formikReferrer.errors.referrer ? true : false}
              helperText={
                formikReferrer.errors.referrer
                  ? formikReferrer.errors.referrer
                  : "Choose your Referrer for HIVE"
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    {formikReferrer.values.referrer === "" ? (
                      <Icon>emoji_nature</Icon>
                    ) : formikReferrer.errors.referrer ? (
                      <Icon color="error">error</Icon>
                    ) : (
                      <Icon color="action">check</Icon>
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setShowReferrerDialog(false);
              }}
              color="primary"
            >
              Close
            </Button>
            {referrer && (
              <Button
                onClick={() => {
                  setReferrer(null);
                  setReferrerAccount(null);
                  setShowReferrerDialog(false);
                }}
                color="primary"
                className={classes.submit}
              >
                Remove
              </Button>
            )}
            <Button
              type="submit"
              disabled={
                formikReferrer.values.referrer === "" ||
                formikReferrer.errors.referrer
                  ? true
                  : false
              }
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  };

  const renderTicketDialog = () => {
    return (
      <Dialog
        maxWidth="xs"
        open={showTicketDialog}
        onClose={() => setShowTicketDialog(false)}
        aria-labelledby="ticket-dialog-title"
        aria-describedby="ticket-dialog-description"
      >
        <form className={classes.form} onSubmit={formikTicket.handleSubmit}>
          <DialogTitle id="ticket-dialog-title">
            Enter your VIP Ticket
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              color={formikTicket.errors.ticket ? "primary" : "secondary"}
              required
              type="text"
              id="ticket"
              name="ticket"
              label="VIP Ticket"
              variant="outlined"
              margin="normal"
              inputProps={{
                maxLength: 36,
              }}
              value={formikTicket.values.ticket}
              onChange={formikTicket.handleChange}
              onBlur={formikTicket.handleBlur}
              error={formikTicket.errors.ticket ? true : false}
              helperText={
                formikTicket.errors.ticket
                  ? formikTicket.errors.ticket
                  : "Enter your VIP Ticket Code"
              }
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setShowTicketDialog(false);
              }}
              color="primary"
            >
              Close
            </Button>
            {ticket && (
              <Button
                onClick={() => {
                  setTicket(null);
                  setShowTicketDialog(false);
                }}
                color="primary"
                className={classes.submit}
              >
                Remove
              </Button>
            )}
            <Button
              type="submit"
              disabled={
                formikTicket.values.ticket === "" || formikTicket.errors.ticket
                  ? true
                  : false
              }
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  };

  return (
    <form className={classes.form} onSubmit={formik.handleSubmit}>
      <div>
        {window.hive_keychain &&
        showKeychainAlert &&
        (isChrome || isEdgeChromium || isFirefox) ? (
          <Hidden xsDown>
            <Grid item xs={12}>
              <Alert
                className={classes.alertInfo}
                severity="success"
                onClose={() => setShowKeychainAlert(false)}
              >
                <AlertTitle>
                  <b>Hive Keychain Browser Extension detected</b>
                </AlertTitle>
                <Box display="flex" p={1}>
                  <Box p={1}>
                    <Typography>
                      After signup you will be able to automatically import your
                      account and keys into Keychain.
                    </Typography>
                  </Box>
                </Box>
              </Alert>
            </Grid>
          </Hidden>
        ) : (
          showKeychainAlert && (
            <Hidden xsDown>
              <Grid item xs={12}>
                <Alert
                  className={classes.alertInfo}
                  severity="warning"
                  onClose={() => setShowKeychainAlert(false)}
                >
                  <AlertTitle>
                    <b>Use Hive Keychain Browser Extension</b>
                  </AlertTitle>
                  <Box display="flex" p={1}>
                    <Box p={1} flexGrow={1}>
                      <Typography>
                        It's highly recommended to use the Hive Keychain Browser
                        Extension which will act as your HIVE wallet and safe
                        storage of your keys.
                        <br />
                        <br />
                        If you download and install it <b>right now</b> we will
                        automatically import your account and keys into Keychain
                        at the end of signup.
                      </Typography>
                    </Box>
                    <Box p={1}>
                      <Typography align="center">
                        <b>Install</b>
                        <Button
                          onClick={() =>
                            analytics.logEvent("open_browser_extension", {
                              extension: "keychain",
                            })
                          }
                          target="_blank"
                          href={
                            isFirefox
                              ? "https://addons.mozilla.org/en-GB/firefox/addon/hive-keychain/"
                              : "https://chrome.google.com/webstore/detail/hive-keychain/jcacnejopjdphbnjgfaaobbfafkihpep"
                          }
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
                        <b>then</b>
                      </Typography>
                      <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        onClick={() => {
                          window.location.reload(false);
                        }}
                      >
                        Reload Page
                      </Button>
                    </Box>
                  </Box>
                </Alert>
              </Grid>
            </Hidden>
          )
        )}
      </div>
      <div>
        <Grid container alignItems="center" justify="center" direction="row">
          <Grid item>
            <Button
              onClick={() => {
                formikReferrer.setValues({
                  referrer: referrer ? referrer : "",
                });
                setShowReferrerDialog(true);
              }}
            >
              {_.isEmpty(referrerAccount) ? "Got a Referrer?" : "Edit Referrer"}
            </Button>
            {showReferrerDialog && renderReferrerDialog()}
          </Grid>
          <Grid item>
            <Button
              onClick={() => {
                formikTicket.setValues({
                  ticket: ticket ? ticket : "",
                });
                setShowTicketDialog(true);
              }}
            >
              {_.isEmpty(ticket) ? "Got a VIP Ticket?" : "Edit VIP Ticket"}
            </Button>
            {showTicketDialog && renderTicketDialog()}
          </Grid>
        </Grid>
      </div>
      {!_.isEmpty(referrerAccount) && (
        <div>
          <Grid container alignItems="center" justify="center" direction="row">
            <Grid item>
              {" "}
              <Typography variant="overline" display="block" align="center">
                <b>Your Referrer</b>
              </Typography>
              <ProfileCard profile={referrerProfile} />
            </Grid>
          </Grid>
        </div>
      )}
      {!_.isEmpty(ticket) && ticket !== "invalid" && (
        <div>
          <Grid container alignItems="center" justify="center" direction="row">
            <Tooltip
              title="This VIP Ticket allows you to bypass our verification process."
              placement="top"
            >
              <Chip
                className={classes.chip}
                icon={<Icon>confirmation_number</Icon>}
                label="Your VIP Ticket is valid"
                color="secondary"
              />
            </Tooltip>
          </Grid>
        </div>
      )}
      {!_.isEmpty(ticket) && ticket === "invalid" && (
        <div>
          <Grid container alignItems="center" justify="center" direction="row">
            <Chip
              className={classes.chip}
              icon={<Icon>confirmation_number</Icon>}
              label="Your VIP Ticket is invalid or has already be used"
              color="primary"
            />
          </Grid>
        </div>
      )}
      <div>
        <Grid container alignItems="center" justify="center" direction="row">
          <TextField
            className={classes.textField}
            color={formik.errors.username ? "primary" : "secondary"}
            required
            type="text"
            id="username"
            name="username"
            label="Username"
            variant="outlined"
            margin="normal"
            value={formik.values.username.toLowerCase()}
            onChange={(e) => {
              formik.handleChange(e);
              if (confirmed) {
                setConfirmed(false);
              }
            }}
            onBlur={formik.handleBlur}
            error={formik.errors.username ? true : false}
            helperText={
              formik.errors.username
                ? formik.errors.username
                : "Choose your Username for HIVE"
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  {formik.values.username === "" ? (
                    <Icon>emoji_nature</Icon>
                  ) : formik.errors.username ? (
                    <Icon color="error">error</Icon>
                  ) : (
                    <Icon color="action">check</Icon>
                  )}
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid container alignItems="center" justify="center" direction="row">
          <Button onClick={() => setShowTermsOfService(true)}>
            Terms of Service
          </Button>
        </Grid>
        <Dialog
          maxWidth="xs"
          open={showTermsOfService}
          onClose={() => setShowTermsOfService(false)}
          aria-labelledby="tos-dialog-title"
          aria-describedby="tos-dialog-description"
        >
          <DialogTitle id="tos-dialog-title">Terms of Service</DialogTitle>
          <DialogContent>
            {tos.map((element, index) => {
              return (
                <DialogContentText key={index} variant="body2">
                  {element}
                </DialogContentText>
              );
            })}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setShowTermsOfService(false);
              }}
              color="primary"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <Grid container alignItems="center" justify="center" direction="row">
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={confirmed}
                  onChange={() =>
                    confirmed ? setConfirmed(false) : setConfirmed(true)
                  }
                  name="confirm_terms_of_service"
                  disabled={
                    formik.errors.username || formik.values.username === ""
                      ? true
                      : false
                  }
                />
              }
              label="I agree to the terms of service"
            />
          </FormGroup>
        </Grid>
      </div>
      <div>
        <Grid container alignItems="center" justify="center" direction="row">
          <Button
            type="submit"
            disabled={formik.isSubmitting || !confirmed ? true : false}
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Continue
          </Button>
        </Grid>
      </div>
    </form>
  );
};

export default ChooseAccount;
