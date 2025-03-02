import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/utils/supabase/component";
import { getInputClassName, validationRules } from "@/utils/validation";
import { AuthError } from "@/types/errors";

const AuthForm: React.FC = () => {
  const router = useRouter();
  const supabase = createClient();
  const { refreshUser } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setError(null);
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await logIn(data.email, data.password);
      } else {
        await signUp(data.email, data.password);
      }
      await refreshUser();
      router.push("/");
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Auth error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  async function logIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("Log in error:", error);
      throw new AuthError(
        "Failed to log in. Please check your credentials and try again.",
      );
    }
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error("Sign up error:", error);
      throw new AuthError(
        "Failed to sign up. Please check your information and try again.",
      );
    }
  }

  return (
    <div className="max-w-md mx-auto bg-background-card p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        {isLogin ? "Log In" : "Sign Up"}
      </h2>
      {error && <p className="text-error">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          className={getInputClassName(errors.email)}
          aria-label="Email"
          disabled={isSubmitting}
          {...register("email", validationRules.email)}
        />
        {errors.email && (
          <p className="text-error text-sm">{errors.email.message}</p>
        )}

        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          className={getInputClassName(errors.password)}
          aria-label="Password"
          disabled={isSubmitting}
          {...register("password", validationRules.password)}
        />
        {errors.password && (
          <p className="text-error text-sm">{errors.password.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`bg-primary text-background w-full p-2 my-4 rounded-lg hover:bg-primary-hover transition ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Processing..." : isLogin ? "Log In" : "Sign Up"}
        </button>
      </form>
      <button
        onClick={() => setIsLogin(!isLogin)}
        className="w-full text-primary hover:underline mt-4"
        disabled={isSubmitting}
      >
        {isLogin
          ? "Don't have an account? Sign Up"
          : "Already have an account? Log In"}
      </button>
    </div>
  );
};

export default AuthForm;
