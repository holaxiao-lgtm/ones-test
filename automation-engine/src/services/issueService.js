const client = require("./onesClient");

async function listIssues(projectId, page = 1, size = 100) {
  const resp = await client.get("/issues", {
    params: {
      project_id: projectId,
      page,
      size
    }
  });

  if (resp.data && Array.isArray(resp.data.data)) {
    return resp.data.data;
  }

  if (resp.data && Array.isArray(resp.data.items)) {
    return resp.data.items;
  }

  return [];
}

async function listAllIssues(projectId) {
  const all = [];
  let page = 1;

  while (true) {
    const batch = await listIssues(projectId, page, 100);
    if (batch.length === 0) break;
    all.push(...batch);
    page += 1;
  }

  return all;
}

async function addComment(issueId, content) {
  await client.post(`/issues/${issueId}/comments`, {
    content
  });
}

module.exports = {
  listIssues,
  listAllIssues,
  addComment
};
