import React from "react";
import { useFunctions, useAnalytics } from "reactfire";
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
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";

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
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#ffffff",
  },
  alert: {
    margin: theme.spacing(2),
  },
}));

const CreateAccount = ({ setActiveStep, setAccount }) => {
  const classes = useStyles();
  const functions = useFunctions();
  const analytics = useAnalytics();
  const createAccount = functions.httpsCallable("createAccount");
  const [confirmed, setConfirmed] = React.useState(false);
  const [error, setError] = React.useState(null);

  const formik = useFormik({
    initialValues: {
      username: "",
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
        createAccount({ username: values.username }).then(function (result) {
          if (result.data.hasOwnProperty("error")) {
            analytics.logEvent("create_account_error", {
              error: result.data.error,
            });
            setError(result.data.error);
            setConfirmed(false);
            formik.setSubmitting(false);
          } else {
            analytics.logEvent("create_account_success");
            setAccount(result.data);
            setActiveStep(1);
          }
        });
      }
    },
  });

  return (
    <form className={classes.form} onSubmit={formik.handleSubmit}>
      <div>
        <Grid container alignItems="center" justify="center" direction="row">
          <TextField
            className={classes.textField}
            required
            type="text"
            id="username"
            name="username"
            label="Username"
            variant="outlined"
            margin="normal"
            value={formik.values.username}
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
      </div>
      <div>
        <Grid container alignItems="center" justify="center" direction="row">
          <Button
            type="submit"
            disabled={
              formik.errors.username ||
              formik.values.username === "" ||
              confirmed
                ? true
                : false
            }
            variant="contained"
            color="primary"
            onClick={() => {
              analytics.logEvent("confirm_account_name");
              setConfirmed(true);
            }}
            className={classes.submit}
          >
            Confirm Username
          </Button>
          <Button
            type="submit"
            disabled={formik.isSubmitting || !confirmed ? true : false}
            variant="contained"
            color="primary"
            className={classes.submit}
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
        <Backdrop className={classes.backdrop} open={formik.isSubmitting}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    </form>
  );
};

export default CreateAccount;
