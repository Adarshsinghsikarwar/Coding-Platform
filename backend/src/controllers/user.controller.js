export async function getProblemById(req, res) {
  const problemId = req.params.id;
  // Logic to get the problem with the given ID
  res.send(`Get problem with ID: ${problemId}`);
}

export async function getAllProblems(req, res) {
  // Logic to get all problems
  res.send("Get all problems");
}

export async function getAllSolvedProblemsByUser(req, res) {
  // Logic to get all solved problems by the user
  res.send("Get all solved problems");
}
