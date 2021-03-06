import { FC } from "react";
import { Grid, makeStyles, Theme, LinearProgress } from "@material-ui/core";
import CoreOptionsPanel from "@/components/Core/OptionsPanel";
import { useTranslation } from "react-i18next";
import { useAppContext } from "@/providers/AppContext";
import SimpleMetric from "@/components/Core/Metrics/SimpleMetric";
import { useRouter } from "next/router";
import useMetricsByYear from "@/lib/hooks/useMetricsByYear";

export interface InterventionMetricsProps {}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minHeight: 186,
  },
}));

const InterventionMetrics: FC<InterventionMetricsProps> = () => {
  const year = new Date().getFullYear();
  const classes = useStyles();
  const { t } = useTranslation(["components"]);
  const { user, organization } = useAppContext();
  const router = useRouter();
  const fetchMetricsTrees = useMetricsByYear(organization.id, year);

  if (!user?.is_superuser) return null;

  const { data: metrics, isLoading: loading } = fetchMetricsTrees();

  // Should be defined in Organization config
  const setCurrency = (locale: string): string => {
    switch (locale) {
      case "fr":
      case "es":
        return "EUR";
      case "en":
        return "USD";
      default:
        return "EUR";
    }
  };

  const displayedMetrics = [
    {
      key: "done_interventions_cost",
      value: metrics?.done_interventions_cost,
      caption: `${t(
        "components.Organization.Dashboards.InterventionMetrics.doneCaption"
      )}`,
    },
    {
      key: "scheduled_interventions_cost",
      value: metrics?.scheduled_interventions_cost,
      caption: `${t(
        "components.Organization.Dashboards.InterventionMetrics.scheduledCaption"
      )}`,
    },
  ];

  return (
    <CoreOptionsPanel
      label={`${t(
        "components.Organization.Dashboards.InterventionMetrics.title"
      )} ${year}`}
      items={[]}
    >
      <Grid
        className={classes.root}
        container
        direction="row"
        justifyContent="space-around"
        alignItems="center"
        spacing={4}
      >
        {loading ? (
          <LinearProgress />
        ) : (
          displayedMetrics.map((metric) => (
            <Grid item key={metric.key}>
              <SimpleMetric
                metric={metric.value.toLocaleString(router.locale, {
                  maximumFractionDigits: 0,
                  style: "currency",
                  currency: setCurrency(router.locale),
                })}
                caption={metric.caption}
              />
            </Grid>
          ))
        )}
      </Grid>
    </CoreOptionsPanel>
  );
};

export default InterventionMetrics;
