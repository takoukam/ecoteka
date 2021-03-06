import React from "react";
import { makeStyles, Button, Grid } from "@material-ui/core";
import { useDrag } from "react-dnd";
import { ItemTypes } from "@/components/Interventions/Calendar/ItemTypes";
import { TIntervention } from "@/components/Interventions/Schema";
import { INTERVENTION_COLORS } from "@/components/Interventions/constants";
import { useAppLayout } from "@/components/AppLayout/Base";
export interface CalendarTodoInterventionProps {
  todoIntervention: TIntervention;
}

const defaultProps: CalendarTodoInterventionProps = {
  todoIntervention: undefined,
};

const useStyles = makeStyles(() => ({
  root: {},
}));

const CalendarTodoIntervention: React.FC<CalendarTodoInterventionProps> = (
  props
) => {
  const { dialog } = useAppLayout();
  const [collectedProps, drag] = useDrag({
    item: { type: ItemTypes.BOX, id: props.todoIntervention.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const color = INTERVENTION_COLORS[props.todoIntervention.intervention_type];

  return (
    <Grid item>
      <Button
        ref={drag}
        size="small"
        variant="contained"
        style={{ backgroundColor: color }}
      >
        &nbsp;
      </Button>
    </Grid>
  );
};

CalendarTodoIntervention.defaultProps = defaultProps;

export default CalendarTodoIntervention;
