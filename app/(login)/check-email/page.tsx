import Link from 'next/link';

type CheckEmailPageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function CheckEmailPage({ searchParams }: CheckEmailPageProps) {
  const { email } = await searchParams;

  return (
    <div className="min-h-[100dvh] bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="mt-3 text-sm text-gray-600">
            {email
              ? `We sent a magic sign-in link to ${email}.`
              : 'We sent a magic sign-in link to your email address.'}
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Open the email and click the link to complete sign-in.
          </p>
          <Link
            href="/sign-in"
            className="mt-6 inline-flex text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
