import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import MaterialTable from "material-table";

import TicketCard from "../TicketCard";

const useStyles = makeStyles((theme) => ({
  grid: {
    margin: 0,
    "min-height": "calc(100vh - 208px)"
  },
}));

const TicketsTable = ({ profile, tickets }) => {
  const classes = useStyles();
  const [claimTicket, setClaimTicket] = React.useState(null);

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
          actions={[
            {
              icon: "confirmation_number",
              tooltip: "Ticket Info",
              onClick: (event, rowData) => setClaimTicket(rowData.ticket),
            },
          ]}
        />
        <TicketCard
          profile={profile}
          ticket={claimTicket ? claimTicket : ""}
          setShowTicketCard={setClaimTicket}
          open={claimTicket ? true : false}
        />
      </Grid>
    </Grid>
  );
};

export default TicketsTable;
