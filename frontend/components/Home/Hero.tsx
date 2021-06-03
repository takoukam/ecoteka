import { FC, useState } from "react";
import {
  makeStyles,
  Theme,
  Paper,
  Grid,
  Typography,
  Box,
  Button,
} from "@material-ui/core";
import { Trans, useTranslation } from "react-i18next";
import MapProvider, { useMapContext } from "@/components/Map/Provider";
import OSMLayer from "@/components/Map/Layers/OSM";
import MapSearchCity from "@/components/Map/SearchCity";

export interface HomeHeroProps {}

const useStyles = makeStyles<Theme, { coords: [] }>((theme: Theme) => ({
  root: {
    position: "relative",
    height: "calc(100vh - 200px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    position: "relative",
  },
  paper: {
    position: "absolute",
    zIndex: 10,
    top: 20,
    left: 20,
    padding: "20px",
    width: "calc(100% - 40px)",
    [theme.breakpoints.up("md")]: {
      margin: "0 auto",
      left: 0,
      width: "50%",
      maxWidth: 780,
      right: 0,
      padding: "30px 40px",
    },
  },
  founded: {
    display: (props) => (props.coords ? "none" : "block"),
  },
}));

const HomeHero: FC<HomeHeroProps> = ({}) => {
  const { t } = useTranslation(["common", "components"]);
  const [coords, setCoords] = useState();
  const classes = useStyles({ coords });
  const { setClickInfo } = useMapContext();
  const osmLayer = OSMLayer(true);

  const handleOnChangeCity = (coords) => {
    setCoords(coords);
  };

  return (
    <div className={classes.root}>
      <MapProvider
        PaperProps={{ elevation: 0, className: classes.map }}
        layers={[osmLayer]}
        height={"100%"}
      >
        <Paper className={classes.paper}>
          <Grid container direction="column" alignItems="stretch">
            <Grid item className={classes.founded}>
              <Typography
                variant="h3"
                component="h1"
                color="textPrimary"
                align="center"
              >
                <Trans>{t("components.Home.title")}</Trans>
              </Typography>
            </Grid>
            <Grid item className={classes.founded}>
              <Box mt={4} />
            </Grid>
            <Grid item>
              <Grid container spacing={1} justify="center" alignItems="center">
                <Grid item xs={12}>
                  <MapSearchCity onChange={handleOnChangeCity} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </MapProvider>
    </div>
  );
};

export default HomeHero;
