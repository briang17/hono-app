import { useState } from "react";
import { Outlet } from "@tanstack/react-router";
import { useAuthStore } from "../providers/AuthProvider";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import apiClient from "../lib/axios";

export function AppLayout() {
  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);
  const fetchSession = useAuthStore((state) => state.fetchSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fafafa]">
        <div className="text-center">
          <div className="text-[#1C2A52]">Loading...</div>
        </div>
      </div>
    );
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSigningIn(true);

    const endpoint = isSignUp ? "/auth/sign-up/email" : "/auth/sign-in/email";
    const body = isSignUp ? { email, password, name } : { email, password };

    try {
      const response = await apiClient.post(endpoint, body);

      const data = response.data;

      console.log("Auth response:", data);

      if (response.status === 200) {
        if (data.user || isSignUp) {
          console.log("Redirecting...");
          await fetchSession();
          const session = useAuthStore.getState().session;
          setTimeout(() => {
            if (session?.session?.activeOrganizationId) {
              window.location.href = "/open-houses";
            } else {
              window.location.href = "/create-organization";
            }
          }, 500);
        } else {
          setError("Authentication failed");
        }
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fafafa] p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#1C2A52] mb-2">Open House Manager</h1>
            <p className="text-gray-600">{isSignUp ? "Create an account" : "Sign in to manage your open houses"}</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4 bg-white p-6 rounded-lg border border-gray-200">
            {isSignUp && (
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••••"
                required
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isSigningIn}>
              {isSigningIn ? (isSignUp ? "Creating account..." : "Signing in...") : (isSignUp ? "Create Account" : "Sign In")}
            </Button>
          </form>
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-[#D0AC61] hover:underline text-sm"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPath = window.location.pathname;
  if (!session.session?.activeOrganizationId && currentPath !== "/create-organization") {
    window.location.href = "/create-organization";
    return null;
  }

  return <Outlet />;
}
