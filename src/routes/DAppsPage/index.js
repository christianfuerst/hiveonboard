import React from "react";
import { useAnalytics } from "reactfire";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import { dApps } from "../../config";
import BlogCard from "../../components/BlogCard";

const useStyles = makeStyles((theme) => ({
  card: {
    margin: 10,
    paddingTop: 40,
  },
}));

const DAppsPage = () => {
  const classes = useStyles();
  const analytics = useAnalytics();

  return (
    <Card className={classes.card}>
      <CardContent>
        <Grid container spacing={2}>
          {dApps.map((element, index) => {
            return (
              <Grid item xs={12} sm={4} md={3} key={index}>
                <BlogCard app={element} analytics={analytics} />
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DAppsPage;
