import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import MaterialTable from "material-table";

const useStyles = makeStyles((theme) => ({
  grid: {
    margin: 0,
    padding: theme.spacing(1),
  },
}));

const TicketsTable = ({ tickets }) => {
  const classes = useStyles();

  return (
    <Grid
      className={classes.grid}
      container
      direction="row"
      justify="center"
      alignItems="center"
    >
      <Grid item xs={12}>
        <MaterialTable
          title="VIP Tickets"
          columns={[
            {
              title: "Ticket Code",
              field: "ticket",
              type: "string",
              width: 400,
            },
            {
              title: "Consumed",
              field: "consumed",
              type: "boolean",
              defaultSort: "asc",
            },
            {
              title: "Consumed by Account",
              field: "consumedBy",
              type: "string",
            },
          ]}
          data={tickets.items}
          options={{
            exportButton: true,
          }}
        />
      </Grid>
    </Grid>
  );
};

export default TicketsTable;
