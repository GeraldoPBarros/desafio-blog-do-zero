import Link from 'next/link';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Header() {
  return (
    <>
      <Link key="logo" href="/">
        <img src="/images/Logo.png" alt="logo" />
      </Link>
    </>
  );
}
