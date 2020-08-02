import React from "react";
import { useAnalytics } from "reactfire";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import Hidden from "@material-ui/core/Hidden";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Icon from "@material-ui/core/Icon";

import { dApps } from "../../config";
import whitelist from "../../config/whitelist.json";
import BlogCard from "../BlogCard";
import keychain from "../../assets/keychain.png";

const useStyles = makeStyles((theme) => ({
  alertInfo: {
    marginBottom: theme.spacing(4),
  },
  button: {
    margin: theme.spacing(2),
  },
  iconRoot: {
    textAlign: "center",
  },
  imageIcon: {
    height: "100%",
    width: "100%",
  },
}));

const CreateAccount = ({ account, redirectUrl, debugMode }) => {
  const classes = useStyles();
  const analytics = useAnalytics();

  if (
    redirectUrl &&
    (whitelist.some((url) => redirectUrl.startsWith(url)) || debugMode)
  ) {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          You will be redirected to:{" "}
          <a href={decodeURI(redirectUrl)}>{decodeURI(redirectUrl)}</a>
          <br />
          {(window.location.href = decodeURI(redirectUrl))}
        </Grid>
      </Grid>
    );
  } else {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Alert severity="success">
            <AlertTitle>Welcome to HIVE @{account.username}</AlertTitle>
            Your account was successfully created on the blockchain.
            <br />
            <b>Where do you want to go today?</b>
          </Alert>
        </Grid>
        <Hidden xsDown>
          <Grid item xs={12}>
            <Alert className={classes.alertInfo} severity="info">
              <AlertTitle>Use Keychain Browser Extension</AlertTitle>
              <Typography>
                For the best user experience on Desktop, it's highly recommended
                to use the Keychain Browser Extension.
              </Typography>

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
            </Alert>
          </Grid>
        </Hidden>
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
