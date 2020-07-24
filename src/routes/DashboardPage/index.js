import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";

import ProfileCard from "../../components/ProfileCard";
import ReferralsTable from "../../components/ReferralsTable";

const useStyles = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(2),
  },
  alert: {
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

const DashboardPage = ({ auth, userProfile }) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardHeader title="Dashboard" />
      <CardContent>
        {auth ? (
          <React.Fragment>
            <Grid
              container
              spacing={2}
              direction="row"
              justify="space-between"
              alignItems="flex-start"
            >
              <Grid item>
                <Typography>Your Referral Link:</Typography>
                <Paper className={classes.paper} elevation={3}>
                  <Typography className={classes.text}>
                    {"https://hiveonboard.com?ref=" + userProfile.name}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item>
                <ProfileCard profile={userProfile} />
              </Grid>
            </Grid>
            <ReferralsTable profile={userProfile} />
          </React.Fragment>
        ) : (
          <Alert className={classes.alert} severity="error">
            <AlertTitle>Not Authorized</AlertTitle>
            You have to login into your HIVE Account in order to access the
            Dashboard.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardPage;
