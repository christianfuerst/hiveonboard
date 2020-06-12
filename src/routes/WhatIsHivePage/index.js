import React from "react";
import { useHistory } from "react-router-dom";
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
  const history = useHistory();

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
              <b>Advantages</b>
            </Typography>
            <Typography className={classes.secondaryHeading}>
              Why is HIVE more than just a Cryptocurrency?
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Typography>
              <img
                className={classes.media}
                src="/images/more_than_cryptocurrency_banner.png"
                alt="Advantages"
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
              <b>Keys and Roles</b>
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
                alt="Keys and Roles"
              />
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel>
          <ExpansionPanelSummary
            expandIcon={<Icon>expand_more</Icon>}
            aria-controls="panel4-content"
            id="panel4-header"
            open={true}
          >
            <Typography className={classes.heading}>
              <b>Referral Program</b>
            </Typography>
            <Typography className={classes.secondaryHeading}>
              Onboard your friends an earn rewards
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
                        disabled={
                          formik.errors.username ||
                          formik.values.username === ""
                        }
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                      >
                        Create Referral Link
                      </Button>
                      <Button
                        disabled={
                          formik.errors.username ||
                          formik.values.username === ""
                        }
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={() => {
                          history.push("/referrals/" + formik.values.username);
                        }}
                      >
                        Track your referrals
                      </Button>
                    </Grid>
                  </Grid>
                </form>
                <Typography>
                  If someone joins HIVE with your referral link, @hiveonboard
                  will send a memo to your HIVE account.
                  <br />
                  Please take care of the referred user and consider sending a
                  small delegation since your referral won't have many resource
                  credits available at start.
                  <br />
                  <br />
                  We are recommending that Hive interfaces (dApps) give you, the
                  referrer, a 3% beneficiary reward from the post earnings of
                  your referral. Please be advised that your referrals can
                  always change this setting on their own, since it's totally
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
