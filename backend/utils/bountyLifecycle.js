const isAcceptingEntries = (bounty, now = new Date()) => {
  if (!bounty || bounty.archivedAt || bounty.lifecycleStatus) return false;

  const startTime = new Date(bounty.startDate).getTime();
  const deadline = new Date(bounty.deadline).getTime();
  const currentTime = now.getTime();

  return (
    Number.isFinite(startTime) &&
    Number.isFinite(deadline) &&
    currentTime >= startTime &&
    currentTime <= deadline
  );
};

module.exports = { isAcceptingEntries };
