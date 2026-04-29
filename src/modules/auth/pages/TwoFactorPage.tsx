import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import SubmitButton from "../components/SubmitButton";
import { useAuth } from "../context/useAuth";
import { authErrorMessage } from "../lib/errorMessages";
import type { ApiError } from "../api/types";
import { twoFactorSchema, type TwoFactorFormValues } from "../schemas/twoFactor.schema";

interface LocationState {
  challengeId?: string;
  email?: string;
}

export default function TwoFactorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyTwoFactor, resendTwoFactor } = useAuth();
  const state = (location.state ?? {}) as LocationState;
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TwoFactorFormValues>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: { code: "" },
  });

  if (!state.challengeId) {
    return <Navigate to="/auth/login" replace />;
  }

  function handleChallengeError(err: unknown) {
    const e = err as ApiError;
    // Backend §2.3: 410 challenge_expired means the challenge is gone (TTL,
    // attempt limit, or already consumed). Push the user back to login.
    if (e?.code === "challenge_expired") {
      navigate("/auth/login", {
        replace: true,
        state: { flash: authErrorMessage(e) },
      });
      return true;
    }
    return false;
  }

  async function onSubmit(values: TwoFactorFormValues) {
    setServerError(null);
    try {
      await verifyTwoFactor(state.challengeId!, values.code);
      navigate("/", { replace: true });
    } catch (err) {
      if (handleChallengeError(err)) return;
      setServerError(authErrorMessage(err, "Verification failed"));
    }
  }

  async function onResend() {
    setServerError(null);
    setResendNotice(null);
    try {
      await resendTwoFactor(state.challengeId!);
      setResendNotice("A new code has been sent to your email.");
    } catch (err) {
      if (handleChallengeError(err)) return;
      setServerError(authErrorMessage(err, "Could not resend code"));
    }
  }

  return (
    <AuthCard
      title="Two-step verification"
      subtitle={
        <>
          We sent a 6-digit code to{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {state.email ?? "your email"}
          </span>
          . Enter it below to continue.
        </>
      }
      footer={
        <Link
          to="/auth/login"
          className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
        >
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <FormInput
          label="Verification code"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          {...register("code")}
          error={errors.code?.message}
        />

        {serverError && (
          <div
            role="alert"
            className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400"
          >
            {serverError}
          </div>
        )}
        {resendNotice && (
          <div
            role="status"
            className="rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700 dark:border-success-500/40 dark:bg-success-500/10 dark:text-success-400"
          >
            {resendNotice}
          </div>
        )}

        <SubmitButton loading={isSubmitting}>Verify</SubmitButton>

        <button
          type="button"
          onClick={onResend}
          className="block w-full text-center text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
        >
          Didn&apos;t receive the code? Resend
        </button>
      </form>
    </AuthCard>
  );
}
