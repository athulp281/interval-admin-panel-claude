import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import AuthCard from "../components/AuthCard";
import FormCheckbox from "../components/FormCheckbox";
import FormInput from "../components/FormInput";
import SubmitButton from "../components/SubmitButton";
import { useAuth } from "../context/useAuth";
import { isApiError } from "@/stores/authStore";
import { authErrorMessage } from "../lib/errorMessages";
import { registerSchema, type RegisterFormValues } from "../schemas/register.schema";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false,
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        acceptedTerms: values.acceptedTerms,
      });
      navigate("/auth/login", { state: { justRegistered: true } });
    } catch (err) {
      if (isApiError(err) && err.fieldErrors) {
        for (const [field, message] of Object.entries(err.fieldErrors)) {
          setError(field as keyof RegisterFormValues, { message });
        }
      }
      setServerError(authErrorMessage(err, "Registration failed"));
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start your Interval journey — it only takes a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormInput
          label="Full name"
          required
          placeholder="Jane Doe"
          autoComplete="name"
          {...register("name")}
          error={errors.name?.message}
        />
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
          placeholder="At least 8 characters"
          autoComplete="new-password"
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
        <FormInput
          label="Confirm password"
          required
          type={showPassword ? "text" : "password"}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
        <FormCheckbox
          label={
            <>
              I agree to the{" "}
              <a href="#" className="text-brand-500 hover:text-brand-600">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-brand-500 hover:text-brand-600">
                Privacy Policy
              </a>
              .
            </>
          }
          {...register("acceptedTerms")}
          error={errors.acceptedTerms?.message}
        />

        {serverError && (
          <div
            role="alert"
            className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400"
          >
            {serverError}
          </div>
        )}

        <SubmitButton loading={isSubmitting}>Create account</SubmitButton>
      </form>
    </AuthCard>
  );
}
