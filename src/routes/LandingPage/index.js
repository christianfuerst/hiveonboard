import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

import { landingContent } from "../../config";
import LandingCard from "../../components/LandingCard";

const useStyles = makeStyles((theme) => ({
  grid: {
    margin: 10,
    padding: theme.spacing(1),
  },
}));

const LandingPage = () => {
  const classes = useStyles();

  return (
    <Grid
      className={classes.grid}
      container
      direction="row"
      justify="space-between"
      alignItems="center"
    >
      {landingContent.map((element, index) => {
        return (
          <Grid item xs={12} sm={4} key={index}>
            <LandingCard content={element} />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default LandingPage;
