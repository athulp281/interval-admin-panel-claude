import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import AuthCard from "../components/AuthCard";
import FormCheckbox from "../components/FormCheckbox";
import FormInput from "../components/FormInput";
import SubmitButton from "../components/SubmitButton";
import { useAuth } from "../context/useAuth";
import { useLastEmail } from "@/stores/authStore";
import { authErrorMessage } from "../lib/errorMessages";
import { loginSchema, type LoginFormValues } from "../schemas/login.schema";

export default function LoginPage() {
  const { login } = useAuth();
  const lastEmail = useLastEmail();
  const navigate = useNavigate();
  const location = useLocation();
  const flash = (location.state as { flash?: string } | null)?.flash ?? null;
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(flash);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: lastEmail ?? "", password: "", rememberMe: false },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      const result = await login(values);
      if (result.kind === "twoFactorRequired") {
        navigate("/auth/two-factor", {
          state: {
            challengeId: result.challengeId,
            email: values.email,
          },
        });
      } else {
        navigate("/");
      }
    } catch (err) {
      setServerError(authErrorMessage(err, "Sign-in failed"));
    }
  }

  return (
    <AuthCard
      title="Sign In"
      subtitle="Enter your email and password to sign in to Interval."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            to="/auth/register"
            className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
          >
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <FormInput
          label="Email"
          required
          type="email"
          placeholder="you@interval.com"
          autoComplete="email"
          {...register("email")}
          error={errors.email?.message}
        />

        <FormInput
          label="Password"
          required
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          autoComplete="current-password"
          {...register("password")}
          error={errors.password?.message}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="cursor-pointer"
            >
              {showPassword ? (
                <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
              )}
            </button>
          }
        />

        <div className="flex items-center justify-between">
          <FormCheckbox label="Keep me logged in" {...register("rememberMe")} />
          <Link
            to="/auth/forgot-password"
            className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
          >
            Forgot password?
          </Link>
        </div>

        {serverError && (
          <div
            role="alert"
            className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400"
          >
            {serverError}
          </div>
        )}

        <SubmitButton loading={isSubmitting}>Sign in</SubmitButton>
      </form>
    </AuthCard>
  );
}
