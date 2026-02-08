'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import styles from './crypto.module.css';

export default function CryptoDetail() {
  const { id } = useParams();
  const router = useRouter();
  
  const [history, setHistory] = useState([]);
  const [price, setPrice] = useState(0);
  const [myBalance, setMyBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    
    // 1. CoinGecko (Graphique + Prix actuel)
    try {
      const resGecko = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=30`);
      const dataGecko = await resGecko.json();
      
      const formattedData = dataGecko.prices.map((item: any) => ({
        date: new Date(item[0]).toLocaleDateString(undefined, {day: 'numeric', month: 'short'}),
        price: item[1]
      }));
      setHistory(formattedData);
      setPrice(dataGecko.prices[dataGecko.prices.length - 1][1]);
    } catch (e) {
      console.error("Erreur CoinGecko", e);
    }

    // 2. Mon Portefeuille
    if (token) {
        try {
          const resAssets = await fetch('/api/assets', {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          const myAssets = await resAssets.json();
          
          const total = myAssets
              .filter((a: any) => a.symbol.toLowerCase() === (id as string).toLowerCase())
              .reduce((sum: number, current: any) => sum + current.quantity, 0);
          
          setMyBalance(total);
        } catch (e) {
          console.error("Erreur Assets", e);
        }
    }
    setLoading(false);
  };

  const handleTransaction = async (type: 'buy' | 'sell') => {
    const token = localStorage.getItem('token');
    if (!token) {
        router.push('/login');
        return;
    }

    const qty = parseFloat(amount);
    if (!qty || qty <= 0) {
      alert("Veuillez entrer une quantité valide");
      return;
    }

    const finalQuantity = type === 'buy' ? qty : -qty;

    if (type === 'sell' && myBalance < qty) {
        alert("Fonds insuffisants !");
        return;
    }

    await fetch('/api/assets', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        symbol: id,
        quantity: finalQuantity
      }),
    });

    setAmount('');
    loadData();
    alert(`Opération réussie : ${type === 'buy' ? 'Achat' : 'Vente'}`);
  };

  if (loading) return <div style={{padding:40, textAlign:'center', color:'white'}}>Chargement des données...</div>;

  return (
    <main className={styles.container}>
      
      {/* HEADER */}
      <div className={styles.header}>
        <h1 className={styles.title}>{id}</h1>
        <div className={styles.price}>
            ${price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </div>
      </div>

      <div className={styles.grid}>
        
        {/* GRAPHIQUE */}
        <div className={styles.glassCard}>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#888" tick={{fontSize: 12}} tickMargin={10} />
                <YAxis domain={['auto', 'auto']} stroke="#888" tick={{fontSize: 12}} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#191c24', border: '1px solid #333', borderRadius: '8px'}}
                  itemStyle={{color: '#fff'}}
                  labelStyle={{color: '#888'}}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#00f260" 
                  strokeWidth={3} 
                  dot={false} 
                  activeDot={{r: 6, fill: 'white'}}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PANNEAU DE TRADING */}
        <div className={styles.glassCard}>
            <h3 className={styles.tradeTitle}>Passer un ordre</h3>
            
            <div className={styles.balanceInfo}>
                <span className={styles.balanceLabel}>Votre solde actuel</span>
                <div className={styles.balanceAmount}>
                  {myBalance} <span style={{textTransform:'uppercase', fontSize:'0.8em'}}>{id}</span>
                </div>
                <div style={{color:'#8899a6', fontSize:'0.9rem', marginTop:'5px'}}>
                   ≈ ${(myBalance * price).toLocaleString()}
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>Quantité</label>
                <input 
                    className={styles.input}
                    type="number" 
                    placeholder="0.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </div>

            <div className={styles.actions}>
                <button 
                    className={`${styles.btn} ${styles.btnBuy}`}
                    onClick={() => handleTransaction('buy')}>
                    ACHETER
                </button>
                <button 
                    className={`${styles.btn} ${styles.btnSell}`}
                    onClick={() => handleTransaction('sell')}>
                    VENDRE
                </button>
            </div>
        </div>

      </div>
    </main>
  );
}