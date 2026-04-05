export async function createProblem(req, res) {
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    startCode,
    referenceSolution,
      
  } = req.body;
}

export async function updateProblem(req, res) {
  const problemId = req.params.id;
  // Logic to update the problem with the given ID
  res.send(`Update problem with ID: ${problemId}`);
}

export async function deleteProblem(req, res) {
  const problemId = req.params.id;
  // Logic to delete the problem with the given ID
  res.send(`Delete problem with ID: ${problemId}`);
}
