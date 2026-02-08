'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './market.module.css';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
}

export default function MarketPage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const res = await fetch('/api/proxy/market');
        
        if (!res.ok) {
           if(res.status === 429) throw new Error("Trop d'appels API. Attendez une minute.");
           throw new Error("Erreur lors du chargement des données.");
        }

        const data = await res.json();
        setCoins(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Impossible de charger le marché.");
      } finally {
        setLoading(false);
      }
    };

    fetchMarket();
  }, []);

  if (error) return (
    <div className={styles.container} style={{textAlign: 'center', paddingTop: 100}}>
        <h2 style={{color: '#ff4d4d'}}>Oups ! 😕</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} style={{marginTop: 20, padding: '10px 20px', cursor: 'pointer'}}>
            Réessayer
        </button>
    </div>
  );

  if (loading) return <div className={styles.container}><p className={styles.loading}>Chargement du marché...</p></div>;

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>📈 Marché Crypto</h1>
      
      <div className={styles.glassCard}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>#</th>
              <th className={styles.th}>Actif</th>
              <th className={styles.th}>Prix</th>
              <th className={styles.th}>24h %</th>
              <th className={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin) => (
              <tr key={coin.id} className={styles.tr}>
                <td className={styles.td} style={{ color: '#666' }}>{coin.market_cap_rank}</td>
                
                <td className={styles.td}>
                  <div className={styles.coinInfo}>
                    <img src={coin.image} alt={coin.name} width={30} height={30} style={{borderRadius: '50%'}} />
                    <div>
                        <div className={styles.coinName}>{coin.name}</div>
                        <div className={styles.coinSymbol}>{coin.symbol}</div>
                    </div>
                  </div>
                </td>
                
                <td className={styles.td} style={{fontWeight: 'bold'}}>
                    ${coin.current_price.toLocaleString()}
                </td>
                
                <td className={`${styles.td} ${coin.price_change_percentage_24h > 0 ? styles.positive : styles.negative}`}>
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </td>
                
                <td className={styles.td}>
                  <Link href={`/crypto/${coin.id}`} className={styles.actionButton}>
                    Voir & Trader
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}