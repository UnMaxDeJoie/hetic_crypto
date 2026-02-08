'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

interface Asset {
  _id: string;
  symbol: string;
  quantity: number;
}

interface PriceData {
  [key: string]: { usd: number };
}

export default function Home() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [prices, setPrices] = useState<PriceData>({});
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [userName, setUserName] = useState('');
  
  const [form, setForm] = useState({ symbol: '', quantity: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    if (user) {
      setUserName(JSON.parse(user).name);
    }

    fetchData(token);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const fetchData = async (token: string) => {
    try {
      const resAssets = await fetch('/api/assets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (resAssets.status === 401) {
        logout();
        return;
      }

      const dataAssets: Asset[] = await resAssets.json();
      setAssets(dataAssets);

      if (dataAssets.length === 0) {
        setLoading(false);
        return;
      }

      const assetIds = dataAssets.map(a => a.symbol.toLowerCase()).join(',');
      const resPrices = await fetch(`/api/proxy/price?ids=${assetIds}`);
      const dataPrices: PriceData = await resPrices.json();
      setPrices(dataPrices);

      let total = 0;
      dataAssets.forEach(asset => {
        const coinId = asset.symbol.toLowerCase();
        const price = dataPrices[coinId]?.usd || 0;
        total += asset.quantity * price;
      });
      setTotalValue(total);
      setLoading(false);

    } catch (error) {
      console.error("Erreur:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;
    
    await fetch('/api/assets', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        symbol: form.symbol.toLowerCase(),
        quantity: parseFloat(form.quantity)
      }),
    });

    setForm({ symbol: '', quantity: '' });
    fetchData(token);
  };

  return (
    <main className={styles.container}>
      
      {/* HEADER */}
      <div className={styles.header}>
        <div>
            <h1 className={styles.title}>Bonjour, <span className={styles.highlight}>{userName}</span> 👋</h1>
            <p className={styles.subtitle}>Aperçu de vos investissements</p>
        </div>
        <button onClick={logout} className={styles.logoutButton}>
            Déconnexion
        </button>
      </div>

      {/* CARTE TOTALE AVEC EFFET GLOW */}
      <div className={styles.totalCard}>
        <div className={styles.totalLabel}>Solde Total</div>
        <div className={styles.totalAmount}>
          {loading ? '...' : totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </div>
      </div>

      <div className={styles.grid}>
        {/* FORMULAIRE */}
        <div className={styles.glassCard}>
          <h3 className={styles.cardTitle}>⚡ Transaction Rapide</h3>
          <p className={styles.helperText}>Ajoutez une transaction manuelle</p>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              className={styles.input}
              type="text"
              placeholder="ID (ex: bitcoin)"
              value={form.symbol}
              onChange={(e) => setForm({ ...form, symbol: e.target.value })}
              required
            />
            <input
              className={styles.input}
              type="number"
              placeholder="Quantité"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
            <button type="submit" className={styles.addButton}>
              Ajouter
            </button>
          </form>
        </div>

        {/* LISTE DES ACTIFS */}
        <div className={styles.glassCard}>
          <h3 className={styles.cardTitle}>📊 Vos Actifs</h3>
          {loading ? <p className={styles.loading}>Chargement...</p> : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Actif</th>
                    <th>Quantité</th>
                    <th>Prix</th>
                    <th>Valeur</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => {
                    const coinId = asset.symbol.toLowerCase();
                    const price = prices[coinId]?.usd || 0;
                    const value = asset.quantity * price;
                    
                    return (
                      <tr key={asset._id} className={styles.tr}>
                        <td className={styles.td}>
                           <Link href={`/crypto/${coinId}`} className={styles.assetLink}>
                             <div className={styles.coinIcon}>{asset.symbol.charAt(0).toUpperCase()}</div>
                             {asset.symbol}
                           </Link>
                        </td>
                        <td className={styles.td}>{asset.quantity}</td>
                        <td className={styles.td}>${price.toLocaleString()}</td>
                        <td className={`${styles.td} ${styles.valueText}`}>
                          ${value.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}