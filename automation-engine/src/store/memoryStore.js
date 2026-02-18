class MemoryStore {
  constructor() {
    this.remindedIssueIds = new Set();
  }

  hasReminder(issueId) {
    return this.remindedIssueIds.has(issueId);
  }

  setReminder(issueId) {
    this.remindedIssueIds.add(issueId);
  }
}

module.exports = new MemoryStore();
