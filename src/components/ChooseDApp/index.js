import React from "react";
import { useAnalytics } from "reactfire";
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListSubheader from "@material-ui/core/ListSubheader";
import Avatar from "@material-ui/core/Avatar";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import Grid from "@material-ui/core/Grid";

import { dApps } from "../../config";

const useStyles = makeStyles((theme) => ({
  alert: {
    margin: theme.spacing(2),
  },
  imageIcon: {
    height: "100%",
    width: "100%",
  },
  iconRoot: {
    textAlign: "center",
  },
  avatar: {
    background: "#f0f0f8",
  },
}));

const CreateAccount = () => {
  const classes = useStyles();
  const analytics = useAnalytics();

  return (
    <Grid container alignItems="center" justify="center" direction="column">
      <Grid item>
        <Alert className={classes.alert} severity="success">
          <AlertTitle>Free Welcome Gift</AlertTitle>
          We will reward you with a 100% upvote on your first post in order to
          welcome you to HIVE!
        </Alert>
      </Grid>
      <Grid item>
        <List
          className={classes.root}
          subheader={
            <ListSubheader component="div">
              <b>Choose your favorite dapp and get started!</b>
            </ListSubheader>
          }
        >
          {dApps.map((element, index) => {
            return (
              <ListItem
                button
                onClick={analytics.logEvent("open_dapp", {
                  dapp: element.name,
                })}
                component="a"
                key={index}
                target="_blank"
                href={element.url}
              >
                <ListItemAvatar>
                  <Avatar className={classes.avatar}>
                    <Icon className={classes.iconRoot}>
                      <img
                        className={classes.imageIcon}
                        src={`/dapps/${element.icon}`}
                        alt={element.name}
                      />
                    </Icon>
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={element.name}
                  secondary={element.subtitle}
                />
              </ListItem>
            );
          })}
        </List>
      </Grid>
    </Grid>
  );
};

export default CreateAccount;
