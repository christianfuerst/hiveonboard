import React from "react";
import hive from "@hiveio/hive-js";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import ReactMarkDown from "react-markdown";

const useStyles = makeStyles((theme) => ({
  grid: {
    margin: 10,
    padding: theme.spacing(1),
  },
  card: {
    margin: 10,
  },
}));

const Image = (props) => {
  // eslint-disable-next-line jsx-a11y/alt-text
  return <img {...props} style={{ maxWidth: "100%" }} />;
};

const WhatIsHivePage = () => {
  const classes = useStyles();
  const [content, setContent] = React.useState(
    "Content is comming soon. Please bare with us."
  );

  React.useEffect(() => {
    hive.api.getContent(
      "hivepeople",
      "learn-about-hive-section-for-hiveonboard-com-use-or-edit-this-roomservice",
      function (err, result) {
        if (result) {
          setContent(result.body);
        }
      }
    );
  }, []);

  return (
    <Grid
      className={classes.grid}
      container
      direction="row"
      justify="center"
      alignItems="center"
    >
      <Grid item xs={12}>
        <Card className={classes.card}>
          <CardContent>
            <ReactMarkDown skipHtml={true} renderers={{ image: Image }}>
              {content}
            </ReactMarkDown>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default WhatIsHivePage;
