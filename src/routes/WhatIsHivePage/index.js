import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Typography from "@material-ui/core/Typography";
import Icon from "@material-ui/core/Icon";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import Link from "@material-ui/core/Link";

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
  alert: {
    margin: theme.spacing(2),
  },
  link: {
    margin: theme.spacing(0, 0.5, 0, 0.5),
  },
}));

const WhatIsHivePage = ({ client }) => {
  const classes = useStyles();

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
                <Alert className={classes.alert} severity="info">
                  <AlertTitle>Login to your Referral Dashboard</AlertTitle>
                  Please use the
                  <Link
                    className={classes.link}
                    component={RouterLink}
                    onClick={() => {
                      client.login({});
                    }}
                  >
                    Referral Login
                  </Link>
                  in order to access your dashboard including your personal
                  referral link.
                </Alert>
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
