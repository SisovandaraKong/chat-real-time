import { useState } from "react";
import { User } from "@/types/chat";
import { userApi } from "@/services/api";

interface LoginFormProps {
  onLogin: (user: User) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    try {
      if (isSignup) {
        // Create new user
        const response = await userApi.createUser({
          username,
          displayName: displayName || username,
          email: email || `${username}@example.com`,
        });

        // Update status to online
        await userApi.updateUserStatus(response.data.id, "ONLINE");
        onLogin({ ...response.data, status: "ONLINE" as const });
      } else {
        // Try to find existing user by ID or username
        let response;
        // Check if input is a number (ID)
        if (!isNaN(Number(username))) {
          try {
            response = await userApi.getUserById(Number(username));
          } catch {
            // If not found by ID, try by username
            const searchResponse = await userApi.searchUsers(username);
            response = { data: searchResponse.data[0] }; // Take the first match
          }
        } else {
          // Try by username directly
          const searchResponse = await userApi.searchUsers(username);
          response = { data: searchResponse.data[0] }; // Take the first match
        }

        if (response?.data) {
          await userApi.updateUserStatus(response.data.id, "ONLINE");
          onLogin({ ...response.data, status: "ONLINE" as const });
        } else {
          alert(
            "User not found. Please sign up first or use a valid username or user ID."
          );
        }
      }
    } catch (error) {
      console.error("Login/Signup failed:", error);
      alert("Failed to login/signup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignup ? "Create Account" : "Login to Chat"}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {isSignup ? "Username" : "Username or User ID"}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={
                  isSignup
                    ? "Enter username"
                    : "Enter username or ID (e.g., 1, 2, 3)"
                }
              />
            </div>

            {isSignup && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-blue-600 hover:text-blue-500"
            >
              {isSignup
                ? "Already have an account? Login"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
