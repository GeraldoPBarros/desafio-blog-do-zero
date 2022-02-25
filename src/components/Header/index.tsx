import Link from 'next/link';

import styles from './header.module.scss';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Header() {
  return (
    <div className={styles.container}>
      <Link key="logo" href="/">
        <img src="/images/Logo.png" alt="logo" />
      </Link>
    </div>
  );
}
