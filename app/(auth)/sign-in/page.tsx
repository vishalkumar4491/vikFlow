import { SignIn } from '@clerk/nextjs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | VikFlow',
};

export default function Page() {
  return <SignIn />;
}
