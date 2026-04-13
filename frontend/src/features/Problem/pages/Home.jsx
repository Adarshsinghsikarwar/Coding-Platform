import { useSelector } from "react-redux";
import { useLogout } from "../../auth/hooks/useLogout";

const Home = () => {
  const { handleLogout } = useLogout();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-sm px-6">
        <div className="flex-1">
          <span className="text-xl font-bold">Coding Platform</span>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-base-content/70">
              Hello, <span className="font-medium">{user.firstName}</span>
            </span>
          )}
          <button onClick={handleLogout} className="btn btn-sm btn-error btn-outline">
            Logout
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <p className="text-2xl font-semibold text-base-content/50">
          Welcome to the platform 🚀
        </p>
      </div>
    </div>
  );
};

export default Home;
