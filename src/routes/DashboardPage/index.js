import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";

const useStyles = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(2),
  },
  alert: {
    margin: theme.spacing(2),
  },
}));

const DashboardPage = ({ auth }) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardHeader title="Dashboard" />
      <CardContent>
        <Grid container direction="row" justify="center" alignItems="center">
          {auth ? (
            <Typography>Dashboard Content</Typography>
          ) : (
            <Alert className={classes.alert} severity="error">
              <AlertTitle>Not Authorized</AlertTitle>
              You have to login into your HIVE Account in order to access the
              Dashboard.
            </Alert>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DashboardPage;
