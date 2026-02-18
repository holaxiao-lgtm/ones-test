const dayjs = require("dayjs");

function getIssueStatusName(issue) {
  if (!issue) return "";
  if (issue.state && issue.state.name) return issue.state.name;
  if (issue.status && issue.status.name) return issue.status.name;
  if (issue.state_name) return issue.state_name;
  if (issue.status_name) return issue.status_name;
  if (issue.state) return issue.state;
  if (issue.status) return issue.status;
  return "";
}

function getUpdatedAt(issue) {
  return issue.updated_at || issue.updatedAt || issue.updated_time || issue.updatedTime || issue.updated;
}

module.exports = {
  name: "overdueReminder",
  description: "Remind owner when issue is overdue for updates",
  condition: async ({ config, store, issue }) => {
    const status = getIssueStatusName(issue);
    if (status !== config.targetStatus) return false;

    const updatedAt = getUpdatedAt(issue);
    if (!updatedAt) return false;

    const overdueAt = dayjs().subtract(config.overdueDays, "day");
    if (!dayjs(updatedAt).isBefore(overdueAt)) return false;

    const issueId = issue.id || issue.uuid;
    if (!issueId) return false;

    if (store.hasReminder(issueId)) return false;

    return true;
  },
  action: async ({ issueService, store, issue }) => {
    const issueId = issue.id || issue.uuid;
    const ownerName = issue.owner && issue.owner.name ? issue.owner.name : "负责人";
    const comment = `@${ownerName} 该任务已超过设定天数未更新，请及时跟进。`;

    await issueService.addComment(issueId, comment);
    store.setReminder(issueId);
  }
};
