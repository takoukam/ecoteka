import React from "react";
import { Grid, Typography, Button } from "@material-ui/core";
import ErrorIcon from "@material-ui/icons/Error";
import { useRouter } from "next/router";

export interface ETKImportErrorProps {
  importedText?: string;
  buttonHistoryText?: string;
  buttonResetText?: string;
  onReset?(): void;
}

const defaultProps: ETKImportErrorProps = {
  importedText: "Une erreur s'est glissée dans votre fichier",
  buttonHistoryText: "Historique des imports",
  buttonResetText: "Importer un autre fichier",
  onReset: () => {},
};

const ETKImportError: React.FC<ETKImportErrorProps> = (props) => {
  const router = useRouter();

  const onHistoryClick = () => {
    router.push("/imports");
  };

  return (
    <Grid container item alignItems="center" direction="column" spacing={2}>
      <Grid item>
        <Typography variant="h6" color="error">
          {props.importedText}
        </Typography>
      </Grid>
      <Grid item>
        <ErrorIcon color="error" style={{ fontSize: 120 }} />
      </Grid>
      <Grid item>
        <Button color="primary" variant="contained" onClick={props.onReset}>
          {props.buttonResetText}
        </Button>
      </Grid>
      <Grid item>
        <Typography>ou</Typography>
      </Grid>
      <Grid item>
        <Button color="primary" variant="contained" onClick={onHistoryClick}>
          {props.buttonHistoryText}
        </Button>
      </Grid>
    </Grid>
  );
};

ETKImportError.defaultProps = defaultProps;

export default ETKImportError;