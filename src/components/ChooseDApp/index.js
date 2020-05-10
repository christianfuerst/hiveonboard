import React from "react";
import { useAnalytics } from "reactfire";
import Grid from "@material-ui/core/Grid";

import { dApps } from "../../config";
import BlogCard from "../BlogCard";

const CreateAccount = () => {
  const analytics = useAnalytics();

  return (
    <Grid container spacing={2}>
      {dApps.map((element, index) => {
        return (
          <Grid item xs={12} sm={4} md={3} key={index}>
            <BlogCard app={element} analytics={analytics} />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default CreateAccount;
