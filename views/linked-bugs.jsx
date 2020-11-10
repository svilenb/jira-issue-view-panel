import React from 'react';
import DynamicTable from '@atlaskit/dynamic-table';
import moment from "moment";

function createKey(input) {
  return input ? input.replace(/^(the|a|an)/, '').replace(/\s/g, '') : input;
}

export default function LinkedBugs(props) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    AP.request(`/rest/api/3/issue/${props.issueKey}?fields=issuelinks`).then(data => {
      const jsonData = JSON.parse(data.body);
      const issueLinks = jsonData.fields.issuelinks;

      const linkedBugs = issueLinks.filter(issueLink => {
        if (issueLink.inwardIssue) {
          return issueLink.inwardIssue.fields.issuetype.id === "10005"
        } else if (issueLink.outwardIssue) {
          return issueLink.outwardIssue.fields.issuetype.id === "10005"
        } else {
          return false;
        }
      }).map(issueLink => issueLink.inwardIssue || issueLink.outwardIssue);

      return Promise.all(linkedBugs.map(linkedBug => {
        return AP.request(
          `/rest/api/3/issue/${linkedBug.id}?fields=summary,assignee,created,status`
        );
      })).then(values => {
        const newRows = values.map((value, index) => {
          const bugEntity = JSON.parse(value.body);
          const assignee = bugEntity.fields.assignee ? bugEntity.fields.assignee.displayName : "Unassigned";

          return {
            key: `row-${index}-${bugEntity.key}`,
            cells: [
              {
                key: createKey(bugEntity.fields.summary),
                content: bugEntity.fields.summary
              },
              {
                key: createKey(bugEntity.fields.status.name),
                content: bugEntity.fields.status.name
              },
              {
                key: createKey(assignee),
                content: assignee
              },
              {
                key: createKey(bugEntity.fields.created),
                content: moment(bugEntity.fields.created).format("DD/MM/YYYY")
              }
            ]
          };
        });

        setRows(newRows);
        setIsLoading(false);
      });
    }).catch(e => {
      console.log(e.err);
      setIsLoading(false);
    });;
  }, []);

  return (
    <DynamicTable
      caption="Linked Bugs"
      head={{
        cells: [
          {
            key: "summary",
            content: "Summary",
            isSortable: true,
            width: 15
          },
          {
            key: "create-date",
            content: "Create date",
            isSortable: true,
            width: 25
          },
          {
            key: "assignee",
            content: "Assignee",
            isSortable: true,
            width: 25,
          },
          {
            key: "status",
            content: "Status",
            isSortable: true,
            width: 15,
          }
        ]
      }}
      rows={rows}
      rowsPerPage={10}
      defaultPage={1}
      loadingSpinnerSize="large"
      isLoading={isLoading}
      isFixedSize
      defaultSortKey="summary"
      defaultSortOrder="ASC"
      onSort={() => console.log('onSort')}
      onSetPage={() => console.log('onSetPage')}
    />
  );
}
