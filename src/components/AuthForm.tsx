import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/utils/supabase/component";

const AuthForm: React.FC = () => {
  const router = useRouter();
  const supabase = createClient();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await logIn();
      } else {
        await signUp();
      }

      await refreshUser();

      router.push("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  async function logIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("Log in error:", error);
      throw new Error(
        "Failed to log in. Please try again. Error: " + error.message,
      );
    }
  }

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error("Sign up error:", error);
      throw new Error(
        "Failed to sign up. Please try again. Error: " + error.message,
      );
    }
  }

  return (
    <div className="max-w-md mx-auto bg-background-card p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        {isLogin ? "Log In" : "Sign Up"}
      </h2>
      {error && <p className="text-error">{error}</p>}
      <form onSubmit={handleAuth} className="space-y-4">
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
          aria-label="Email"
        />
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
          aria-label="Password"
        />
        <button
          type="submit"
          className="bg-primary text-background w-full my-4 rounded-lg hover:bg-primary-hover transition"
        >
          {isLogin ? "Log In" : "Sign Up"}
        </button>
      </form>
      <button
        onClick={() => setIsLogin(!isLogin)}
        className="w-full text-primary hover:underline mt-4"
      >
        {isLogin
          ? "Don't have an account? Sign Up"
          : "Already have an account? Log In"}
      </button>
    </div>
  );
};

export default AuthForm;
