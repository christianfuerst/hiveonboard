import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";

import { landingContent } from "../../config";
import LandingCard from "../../components/LandingCard";

const useStyles = makeStyles((theme) => ({
  grid: {
    margin: 0,
    padding: theme.spacing(1),
  },
}));

const LandingPage = ({ location }) => {
  const classes = useStyles();

  return (
    <Grid
      className={classes.grid}
      container
      direction="row"
      justifyContent="center"
      alignItems="center"
    >
      {landingContent.map((element, index) => {
        return (
          <Grid item xs={12} sm={4} key={index}>
            <Box display="flex" justifyContent="center" alignItems="center">
              <LandingCard content={element} location={location} />
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default LandingPage;
