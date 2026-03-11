import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}
