import React from "react";
import { Link as RouterLink } from "react-router-dom";
import cx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import TextInfoContent from "@mui-treasury/components/content/textInfo";
import { useFourThreeCardMediaStyles } from "@mui-treasury/styles/cardMedia/fourThree";
import { useN04TextInfoContentStyles } from "@mui-treasury/styles/textInfoContent/n04";
import { useOverShadowStyles } from "@mui-treasury/styles/shadow/over";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 343,
    margin: theme.spacing(0, 0.5, 2, 0.5),
    borderRadius: 12,
    padding: 12,
  },
  media: {
    height: 0,
    borderRadius: 6,
    backgroundColor: "#ffffff",
  },
  button: {
    marginBottom: theme.spacing(1),
  },
}));

const LandingCard = ({ content, location }) => {
  const styles = useStyles();
  const mediaStyles = useFourThreeCardMediaStyles();
  const textCardContentStyles = useN04TextInfoContentStyles();
  const shadowStyles = useOverShadowStyles({ inactive: true });
  return (
    <Card className={cx(styles.root, shadowStyles.root)}>
      <CardMedia
        className={cx(styles.media, mediaStyles.root)}
        image={content.image}
        component={RouterLink}
        to={content.to + location.search}
      />
      <CardContent className={styles.content}>
        <Box display="flex">
          <Button
            className={styles.button}
            component={RouterLink}
            to={content.to + location.search}
            variant="contained"
            color="secondary"
            size="large"
            fullWidth
          >
            {content.heading}
          </Button>
        </Box>
        <TextInfoContent
          classes={textCardContentStyles}
          overline={content.overline}
          body={content.text}
        />
      </CardContent>
    </Card>
  );
};

export default LandingCard;
