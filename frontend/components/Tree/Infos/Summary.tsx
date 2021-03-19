import { FC, useState, useEffect } from "react";
import useApi from "@/lib/useApi";
import { Box, Grid, makeStyles } from "@material-ui/core";
import InterventionsTable from "@/components/Interventions/InterventionsTable";
import { useAppContext } from "@/providers/AppContext";
import { useAppLayout } from "@/components/AppLayout/Base";
import { TIntervention } from "@/components/Interventions/Schema";
import TreeInfosProperties from "@/components/Tree/Infos/Properties";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

const useStyles = makeStyles(() => ({
  root: {},
}));

const Summary: FC<{ treeId: number }> = ({ treeId }) => {
  const { user, organization } = useAppContext();
  const { api } = useApi();
  const { apiETK } = api;
  const [tree, setTree] = useState<any>({});
  const [interventions, setInterventions] = useState<TIntervention[]>();
  const { dialog } = useAppLayout();
  const classes = useStyles();
  const router = useRouter();

  const getTree = async (id: number) => {
    if (organization) {
      try {
        const { data, status } = await apiETK.get(
          `/organization/${organization.id}/trees/${id}`
        );

        if (status === 200) {
          setTree(data);
        }
      } catch (error) {}
    }
  };

  const getInterventions = async (id: number) => {
    if (organization) {
      try {
        const { data, status } = await apiETK.get(
          `/organization/${organization.id}/trees/${id}/interventions`
        );

        if (status === 200) {
          setInterventions(data);
        }
      } catch (error) {}
    }
  };

  useEffect(() => {
    if (router?.query?.tree) {
      const id = Number(router.query.tree);
      getTree(id);
      getInterventions(id);
    }
  }, [router]);

  return (
    <Grid className={classes.root} container direction="column">
      <Grid item>
        <TreeInfosProperties tree={tree} />
      </Grid>
      <Grid item>
        <Box mt={5}>
          <InterventionsTable
            interventions={interventions}
            tree={tree}
            onNewIntervention={() => {
              dialog.current.close();
            }}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default Summary;
