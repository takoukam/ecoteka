import { FC, useEffect, useState } from "react";
import { Button, Grid, IconButton, withStyles } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import useApi from "@/lib/useApi";
import { useAppContext } from "@/providers/AppContext";
import { TIntervention } from "@/components/Interventions/Schema";
import { AppLayoutCartoDialog } from "../../AppLayout/Carto";
import InterventionEditForm from "@/components/Interventions/Panel/EditForm";
import InterventionArchiveForm from "@/components/Interventions/Panel/ArchiveForm";
import InterventionDoneForm from "@/components/Interventions/Panel/DoneForm";
import Header from "@/components/Interventions/Panel/Header";
import { useAppLayout } from "@/components/AppLayout/Base";

interface IInterventionEditProps {}

interface IInterventionResponse {
  status: number;
  data: TIntervention;
}

interface IInterventionEditForm {
  intervention: TIntervention;
  saving: boolean;
  onSave(): void;
}

const ArchiveButton = withStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    color: theme.palette.error.main,
    borderColor: theme.palette.error.main,
    "&:hover": {
      borderColor: theme.palette.error.dark,
    },
  },
}))(Button);

const InterventionsEdit: FC<IInterventionEditProps> = () => {
  const { t } = useTranslation("components");
  const { organization } = useAppContext();
  const router = useRouter();
  const { apiETK } = useApi().api;
  const { dialog } = useAppLayout();
  const [intervention, setIntervention] = useState<TIntervention>();
  const [saving, setSaving] = useState<boolean>(false);
  const [cancelSaving, setCancelSaving] = useState<boolean>(false);
  const [doneSaving, setDoneSaving] = useState<boolean>(false);
  const [active, setActive] = useState<boolean>(false);

  const getIntervention = async (intervertionId: number) => {
    try {
      const url = `/organization/${organization.id}/interventions/${intervertionId}`;
      const { status, data }: IInterventionResponse = await apiETK.get(url);

      if (status === 200) {
        setIntervention(data);
      }
    } catch (e) {}
  };

  const handleOnBackToTree = () => {
    if (intervention?.tree_id) {
      router.push({
        pathname: "/[organizationSlug]/map",
        query: {
          panel: "info",
          tree: intervention.tree_id,
          organizationSlug: organization.slug,
        },
      });
    }
  };

  useEffect(() => {
    dialog.current.setContent(
      <InterventionArchiveForm
        intervention={intervention}
        saving={cancelSaving}
        onSave={() => setCancelSaving(false)}
      />
    );
    if (!cancelSaving) {
      const interventionId = Number(router.query?.intervention);
      getIntervention(interventionId);
    }
  }, [cancelSaving]);

  useEffect(() => {
    dialog.current.setContent(
      <InterventionDoneForm
        intervention={intervention}
        saving={doneSaving}
        onSave={() => setDoneSaving(false)}
      />
    );
    if (!doneSaving) {
      const interventionId = Number(router.query?.intervention);
      getIntervention(interventionId);
    }
  }, [doneSaving]);

  const handleClosePanel = () => {
    const dialogActions = [
      {
        label: t("common.buttons.no"),
        variant: "outlined",
        size: "small",
        onClick: () => handleOnClosePanel(),
      },
      {
        label: t("common.buttons.yes"),
        variant: "contained",
        size: "small",
        color: "secondary",
        noClose: true,
        onClick: () => handleOnClosePanelWithSave(),
      },
    ];
    dialog.current.open({
      title: t("components.Interventions.Panel.closePanel.title"),
      dialogProps: {
        fullWidth: true,
        maxWidth: "md",
      },
      actions: dialogActions,
    });
  };

  const handleInterventionCancellation = () => {
    const dialogActions = [
      {
        label: t("common.buttons.quit"),
      },
      {
        label: t("common.buttons.confirm"),
        variant: "contained",
        size: "small",
        color: "secondary",
        noClose: true,
        onClick: () => handleOnCancellationSave(),
      },
    ];
    dialog.current.open({
      title: t("components.Interventions.Panel.archiveDialog.title"),
      content: (
        <InterventionArchiveForm
          intervention={intervention}
          saving={cancelSaving}
          onSave={() => setCancelSaving(false)}
        />
      ),
      dialogProps: {
        fullWidth: true,
        maxWidth: "md",
      },
      dialogContentProps: {
        dividers: true,
      },
      actions: dialogActions,
    });
  };

  const handleOnClosePanel = () => {
    dialog.current.close();
    handleOnBackToTree();
  };

  const handleOnClosePanelWithSave = () => {
    setSaving(true);
    dialog.current.close();
    handleOnBackToTree();
  };

  const handleOnCancellationSave = () => {
    dialog.current.close();
    setCancelSaving(true);
  };

  const handleOnDoneSave = () => {
    dialog.current.close();
    setDoneSaving(true);
    router.push({
      pathname: "/[organizationSlug]/map",
      query: {
        tree: intervention.tree_id,
        organizationSlug: organization.slug,
      },
    });
  };

  const handleValdidateIntervention = () => {
    const dialogActions = [
      {
        label: t("common.buttons.cancel"),
      },
      {
        label: t("common.buttons.confirm"),
        variant: "contained",
        size: "small",
        color: "secondary",
        noClose: true,
        onClick: () => handleOnDoneSave(),
      },
    ];
    dialog.current.open({
      title: t("components.Interventions.Panel.doneDialog.title"),
      content: (
        <InterventionDoneForm
          intervention={intervention}
          saving={doneSaving}
          onSave={() => setDoneSaving(false)}
        />
      ),
      dialogProps: {
        fullWidth: true,
        maxWidth: "md",
      },
      dialogContentProps: {
        dividers: true,
      },
      actions: dialogActions,
    });
  };

  useEffect(() => {
    const { query, route } = router;
    setIntervention(undefined);
    if (
      route === "/[organizationSlug]/map" &&
      query.panel === "intervention-edit" &&
      query.tree &&
      query.intervention
    ) {
      const interventionId = Number(router.query?.intervention);

      getIntervention(interventionId);
      setActive(true);
    } else {
      setActive(false);
    }
  }, [router.query]);

  return (
    active && (
      <AppLayoutCartoDialog
        titleNoPadding
        title={
          intervention && (
            <Header
              intervention={intervention}
              secondaryActions={
                <IconButton aria-label="close" onClick={handleClosePanel}>
                  <CloseIcon />
                </IconButton>
              }
            />
          )
        }
        actions={
          <Grid container>
            <Button
              color="primary"
              variant="contained"
              size="small"
              fullWidth
              disabled={Boolean(
                intervention?.properties?.cancelled || intervention?.done
              )}
              onClick={() => handleValdidateIntervention()}
            >
              {t("components.Interventions.Panel.validate")}
            </Button>
          </Grid>
        }
      >
        <Grid container spacing={2} direction="column">
          <Grid item>
            <ArchiveButton
              variant="outlined"
              fullWidth
              disabled={Boolean(
                intervention?.properties?.cancelled || intervention?.done
              )}
              onClick={handleInterventionCancellation}
            >
              {t("components.Interventions.Panel.archive")}
            </ArchiveButton>
          </Grid>
          <Grid item>
            <InterventionEditForm
              intervention={intervention}
              saving={saving}
              onSave={() => setSaving(false)}
            />
          </Grid>
        </Grid>
      </AppLayoutCartoDialog>
    )
  );
};

export default InterventionsEdit;
