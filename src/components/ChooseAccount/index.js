import React from "react";
import { useAnalytics } from "reactfire";
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

import { tos } from "../../config";

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
}));

const ChooseAccount = ({ setActiveStep, setAccount }) => {
  const classes = useStyles();
  const analytics = useAnalytics();

  const [confirmed, setConfirmed] = React.useState(false);
  const [showTermsOfService, setShowTermsOfService] = React.useState(false);

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

  return (
    <form className={classes.form} onSubmit={formik.handleSubmit}>
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
