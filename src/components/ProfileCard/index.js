import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Paper from "@material-ui/core/Paper";


const useStyles = makeStyles((theme) => ({
    list: {
        width: 320,
        color: "#FFFFFF",
      },
      paper: {
        backgroundColor: theme.palette.secondary.light,
      },
}));

const ProfileCard = ({ profile }) => {
  const classes = useStyles();

  return (
    <Paper className={classes.paper}>
    <List className={classes.list}>
      <ListItem
        alignItems="flex-start"
        onClick={() =>
          window.open(
            "https://peakd.com/@" + profile.account,
            "_blank"
          )
        }
      >
        <ListItemAvatar>
          <Avatar
            alt={profile.name}
            src={profile.profile_image}
          />
        </ListItemAvatar>
        <ListItemText
          primaryTypographyProps={{ color: "initial" }}
          secondaryTypographyProps={{
            color: "initial",
            variant: "caption",
          }}
          primary={profile.name}
          secondary={profile.about}
        />
      </ListItem>
    </List>
  </Paper>
  );
};

export default ProfileCard;
