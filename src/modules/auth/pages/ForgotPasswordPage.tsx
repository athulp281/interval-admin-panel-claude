import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { z } from "zod";
import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import SubmitButton from "../components/SubmitButton";
import { authApi } from "../api";

const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});
type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotForm) {
    await authApi.forgotPassword(values);
    setSent(true);
  }

  return (
    <AuthCard
      title="Forgot password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link
          to="/auth/login"
          className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
        >
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div
          role="status"
          className="rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700 dark:border-success-500/40 dark:bg-success-500/10 dark:text-success-400"
        >
          If an account exists for that email, a reset link is on its way.
        </div>
      ) : (
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
          <SubmitButton loading={isSubmitting}>Send reset link</SubmitButton>
        </form>
      )}
    </AuthCard>
  );
}
