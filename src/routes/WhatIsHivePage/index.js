import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import _ from "lodash";
import hive from "@hiveio/hive-js";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Typography from "@material-ui/core/Typography";
import Icon from "@material-ui/core/Icon";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import InputAdornment from "@material-ui/core/InputAdornment";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles((theme) => ({
  grid: {
    margin: 0,
    padding: theme.spacing(1),
  },
  media: {
    height: "100%",
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "45%",
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  textField: {
    width: 300,
  },
  submit: {
    margin: theme.spacing(2),
  },
  text: {
    fontFamily: "Monospace",
    fontSize: 14,
    margin: theme.spacing(0, 1, 0, 1),
    color: "#FFFFFF",
  },
  paper: {
    margin: theme.spacing(2, 0, 2, 0),
    padding: theme.spacing(0.5),
    backgroundColor: theme.palette.secondary.main,
  },
}));

const WhatIsHivePage = () => {
  const classes = useStyles();

  const [referrerAccount, SetReferrerAccount] = React.useState(null);

  const formik = useFormik({
    initialValues: {
      username: "",
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, "Username should contain at least 3 characters")
        .required("Username is required")
        .test("isUser", "Username does not exist", async (value) => {
          if (value) {
            if (value.length >= 3) {
              let result = await hive.api.lookupAccountNamesAsync([value]);
              if (!_.isEmpty(result[0])) {
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
      SetReferrerAccount(values.username);
    },
  });

  return (
    <Grid
      className={classes.grid}
      container
      direction="row"
      justify="center"
      alignItems="center"
    >
      <Grid item xs={12}>
        <ExpansionPanel>
          <ExpansionPanelSummary
            expandIcon={<Icon>expand_more</Icon>}
            aria-controls="panel1-content"
            id="panel1-header"
            open={true}
          >
            <Typography className={classes.heading}>
              <b>Quick Starter Guide</b>
            </Typography>
            <Typography className={classes.secondaryHeading}>
              Learn about the future of social media
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Typography>
              <img
                className={classes.media}
                src="/images/learn_hive_banner.png"
                alt="Quick Starter Guide"
              />
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel>
          <ExpansionPanelSummary
            expandIcon={<Icon>expand_more</Icon>}
            aria-controls="panel2-content"
            id="panel2-header"
            open={true}
          >
            <Typography className={classes.heading}>
              <b>Keys and Roles Guide</b>
            </Typography>
            <Typography className={classes.secondaryHeading}>
              What are keys and their roles?
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Typography>
              <img
                className={classes.media}
                src="/images/user_guide_to_hive_keys_and_roles.jpg"
                alt="Keys and Roles Guide"
              />
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel>
          <ExpansionPanelSummary
            expandIcon={<Icon>expand_more</Icon>}
            aria-controls="panel3-content"
            id="panel3-header"
            open={true}
          >
            <Typography className={classes.heading}>
              <b>Referral program</b>
            </Typography>
            <Typography className={classes.secondaryHeading}>
              Help onboarding people and gain beneficiary rewards
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid
              container
              direction="row"
              justify="center"
              alignItems="center"
            >
              <Grid item xs={12}>
                <Typography>
                  Create your personal referrer link and bring new people to
                  HIVE!
                </Typography>
                {referrerAccount && (
                  <Grid
                    container
                    alignItems="center"
                    justify="center"
                    direction="column"
                  >
                    <Grid item>
                      <Typography
                        variant="overline"
                        display="block"
                        align="center"
                      >
                        <b>Your Referral Link</b>
                      </Typography>
                      <Paper className={classes.paper} elevation={3}>
                        <Typography className={classes.text}>
                          <b>
                            {"https://hiveonboard.com?ref=" + referrerAccount}
                          </b>
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                )}
                <form onSubmit={formik.handleSubmit}>
                  <Grid
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                  >
                    <Grid item xs={12}>
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
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                      >
                        Create Referral Link
                      </Button>
                    </Grid>
                  </Grid>
                </form>
                <Typography>
                  If a new user was created using your referral link,
                  @hiveonboard will send you a memo to your HIVE account for
                  notification.
                  <br />
                  Please take care of the referred user and consider sending a
                  small delegation since the new account won't have many
                  ressource credits available at start.
                  <br />
                  <br />
                  We will suggest to HIVE frontends that you, the referrer, will
                  gain 3% beneficiary rewards from post earnings of the referred
                  account. Please beware that referred accounts could always
                  change this setting on a frontend, since it's a totally
                  optional.
                </Typography>
              </Grid>
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Grid>
    </Grid>
  );
};

export default WhatIsHivePage;
