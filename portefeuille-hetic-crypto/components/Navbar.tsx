'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>💎</span> CryptoApp
        </Link>
        
        <div className={styles.menu}>
          <Link 
            href="/" 
            className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}>
            Mon Portefeuille
          </Link>
          <Link 
            href="/market" 
            className={`${styles.link} ${pathname === '/market' ? styles.active : ''}`}>
            Marché
          </Link>
        </div>
      </div>
    </nav>
  );
}