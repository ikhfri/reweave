import ForgotPasswordClient from "./forgot-password-client";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function ForgotPasswordPage({
  params,
}: Props) {
  const { locale } = await params;

  return <ForgotPasswordClient locale={locale} />;
}