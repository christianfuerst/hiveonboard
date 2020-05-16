import React from "react";
import { useAnalytics } from "reactfire";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";

import { dApps } from "../../config";
import BlogCard from "../BlogCard";

const useStyles = makeStyles((theme) => ({
  alert: {
    marginBottom: theme.spacing(4),
  },
}));

const CreateAccount = ({ account, redirectUrl }) => {
  const classes = useStyles();
  const analytics = useAnalytics();

  if (redirectUrl) {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          You will be redirected to: <a href={redirectUrl}>{redirectUrl}</a>
          {(window.location.href = redirectUrl)}
        </Grid>
      </Grid>
    );
  } else {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Alert className={classes.alert} severity="success">
            <AlertTitle>Welcome to HIVE @{account.username}</AlertTitle>
            Your account was successfully created on the blockchain.
            <br />
            <b>Where do you want to go today?</b>
          </Alert>
        </Grid>
        {dApps.map((element, index) => {
          return (
            <Grid item xs={12} sm={4} md={3} key={index}>
              <BlogCard app={element} analytics={analytics} />
            </Grid>
          );
        })}
      </Grid>
    );
  }
};

export default CreateAccount;
