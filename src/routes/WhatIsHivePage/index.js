import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

const useStyles = makeStyles((theme) => ({
  grid: {
    margin: 0,
    padding: theme.spacing(1),
  },
  card: {
    margin: 10,
  },
  media: {
    height: "100%",
    width: "100%",
  },
}));

const WhatIsHivePage = () => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent>
        <Grid
          className={classes.grid}
          container
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Grid item xs={12}>
            <img
              className={classes.media}
              src="/images/learn_hive_banner.png"
              alt="Learn Hive"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default WhatIsHivePage;
