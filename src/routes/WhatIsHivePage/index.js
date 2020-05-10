import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  grid: {
    margin: 10,
    padding: theme.spacing(1),
  },
}));

const WhatIsHivePage = () => {
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
        <Typography variant="h4">Content is comming soon. Need a break right now.</Typography>
      </Grid>
    </Grid>
  );
};

export default WhatIsHivePage;
