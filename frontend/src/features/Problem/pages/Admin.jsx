import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useProblem } from "../hooks/useProblem";

const DEFAULT_FORM = {
  title: "",
  description: "",
  difficulty: "Easy",
  tagsText: "",
};

const Admin = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useSelector((state) => state.auth);
  const { problems, loading, error } = useSelector((state) => state.problem);
  const {
    getAllProblems,
    getProblemByIdForAdmin,
    updateProblemById,
    deleteProblemById,
  } = useProblem();

  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [editingProblem, setEditingProblem] = useState(null);
  const [formValues, setFormValues] = useState(DEFAULT_FORM);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user?.role === "admin") {
      getAllProblems();
    }
  }, [getAllProblems, user?.role]);

  const selectedProblem = useMemo(() => {
    if (!selectedProblemId) return null;
    return (
      problems.find((problem) => problem._id === selectedProblemId) || null
    );
  }, [problems, selectedProblemId]);

  const handleSelectForEdit = async (problemId) => {
    try {
      setActionLoading(true);
      const fullProblem = await getProblemByIdForAdmin(problemId);

      setEditingProblem(fullProblem);
      setSelectedProblemId(problemId);
      setFormValues({
        title: fullProblem.title || "",
        description: fullProblem.description || "",
        difficulty: fullProblem.difficulty || "Easy",
        tagsText: Array.isArray(fullProblem.tags)
          ? fullProblem.tags.join(", ")
          : "",
      });
    } catch (err) {
      window.alert(
        err?.response?.data?.message || "Failed to load problem for editing"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (problemId) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this problem?"
    );

    if (!shouldDelete) return;

    try {
      setActionLoading(true);
      await deleteProblemById(problemId);

      if (selectedProblemId === problemId) {
        setSelectedProblemId(null);
        setEditingProblem(null);
        setFormValues(DEFAULT_FORM);
      }

      await getAllProblems();
      window.alert("Problem deleted successfully.");
    } catch (err) {
      window.alert(err?.response?.data?.message || "Failed to delete problem.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingProblem?._id) {
      window.alert("Select a problem to update first.");
      return;
    }

    const normalizedTags = formValues.tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const payload = {
      ...editingProblem,
      title: formValues.title.trim(),
      description: formValues.description.trim(),
      difficulty: formValues.difficulty,
      tags: normalizedTags,
    };

    if (!payload.title || !payload.description || payload.tags.length === 0) {
      window.alert("Title, description and tags are required.");
      return;
    }

    try {
      setActionLoading(true);
      await updateProblemById(editingProblem._id, payload);
      await getAllProblems();
      window.alert("Problem updated successfully.");
    } catch (err) {
      window.alert(err?.response?.data?.message || "Failed to update problem.");
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="bg-base-100 rounded-xl shadow-sm p-6 w-full max-w-lg text-center">
          <p className="text-base-content/80">Please login first.</p>
          <button
            className="btn btn-primary mt-4"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="bg-base-100 rounded-xl shadow-sm p-6 w-full max-w-lg text-center">
          <p className="text-error font-medium">
            Only admin can manage problems.
          </p>
          <button
            className="btn btn-primary mt-4"
            onClick={() => navigate("/home")}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Problem Manager</h1>
          <div className="flex gap-2">
            <Link to="/admin/create-problem" className="btn btn-primary btn-sm">
              Create Problem
            </Link>
            <Link to="/home" className="btn btn-outline btn-sm">
              Back to Home
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-base-100 rounded-xl shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">All Problems</h2>

            {loading && (
              <p className="text-base-content/70">Loading problems...</p>
            )}
            {!loading && error && <p className="text-error">{error}</p>}
            {!loading && !error && problems.length === 0 && (
              <p className="text-base-content/70">No problems found.</p>
            )}

            {!loading && !error && problems.length > 0 && (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Difficulty</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {problems.map((problem, index) => (
                      <tr
                        key={problem._id}
                        className={
                          selectedProblemId === problem._id ? "bg-base-200" : ""
                        }
                      >
                        <td>{index + 1}</td>
                        <td className="font-medium">{problem.title}</td>
                        <td>{problem.difficulty}</td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-xs btn-primary"
                              onClick={() => handleSelectForEdit(problem._id)}
                              disabled={actionLoading}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-xs btn-error"
                              onClick={() => handleDelete(problem._id)}
                              disabled={actionLoading}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="bg-base-100 rounded-xl shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Update Problem</h2>

            {!editingProblem && (
              <p className="text-base-content/70">
                Choose a problem from the list and click Edit.
              </p>
            )}

            {editingProblem && (
              <form onSubmit={handleUpdate} className="space-y-4">
                <label className="form-control w-full">
                  <span className="label-text mb-1 font-medium">Title</span>
                  <input
                    className="input input-bordered"
                    value={formValues.title}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="form-control w-full">
                  <span className="label-text mb-1 font-medium">
                    Description
                  </span>
                  <textarea
                    className="textarea textarea-bordered h-32"
                    value={formValues.description}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="form-control w-full">
                  <span className="label-text mb-1 font-medium">
                    Difficulty
                  </span>
                  <select
                    className="select select-bordered"
                    value={formValues.difficulty}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        difficulty: e.target.value,
                      }))
                    }
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </label>

                <label className="form-control w-full">
                  <span className="label-text mb-1 font-medium">
                    Tags (comma separated)
                  </span>
                  <input
                    className="input input-bordered"
                    value={formValues.tagsText}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        tagsText: e.target.value,
                      }))
                    }
                  />
                </label>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Saving..." : "Update Problem"}
                </button>

                {selectedProblem && (
                  <p className="text-xs text-base-content/70">
                    Editing: {selectedProblem.title}
                  </p>
                )}
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Admin;
