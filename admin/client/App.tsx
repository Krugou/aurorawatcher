import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';

interface HistoryEntry {
  timestamp: number;
  camId: string;
  filename: string;
  cloudScore?: number;
}

interface HistoryIndex {
  lastUpdated: number;
  entries: HistoryEntry[];
}

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<HistoryIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCam, setFilterCam] = useState<string>('');
  const [showOnlyCloudy, setShowOnlyCloudy] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/history');
      if (!response.ok) throw new Error(t('errorLoading'));
      const json = await response.json();
      // Sort entries by timestamp descending
      json.entries.sort((a: HistoryEntry, b: HistoryEntry) => b.timestamp - a.timestamp);
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (camId: string, timestamp: number) => {
    if (!window.confirm(t('deleteConfirm'))) return;

    try {
      const response = await fetch(`/api/history/${camId}/${timestamp}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(t('failedDelete'));
      
      alert(t('deleted'));
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredEntries = data?.entries.filter(e => {
    const matchesCam = !filterCam || e.camId.toLowerCase().includes(filterCam.toLowerCase());
    const matchesCloudy = !showOnlyCloudy || (e.cloudScore && e.cloudScore > 50);
    return matchesCam && matchesCloudy;
  }) || [];

  const uniqueCams = Array.from(new Set(data?.entries.map(e => e.camId) || []));

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{t('title')}</h1>
        <div>
          <button onClick={() => i18n.changeLanguage('en')}>EN</button>
          <button onClick={() => i18n.changeLanguage('fi')}>FI</button>
          <button onClick={fetchData} style={{ marginLeft: '10px' }}>{t('refresh')}</button>
        </div>
      </header>

      {data && (
        <p>
          {t('lastUpdated')}: {new Date(data.lastUpdated).toLocaleString()}
          | {data.entries.length} entries
        </p>
      )}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div>
          <label>{t('filterByCam')}: </label>
          <select value={filterCam} onChange={(e) => setFilterCam(e.target.value)}>
            <option value="">All</option>
            {uniqueCams.map(cam => (
              <option key={cam} value={cam}>{cam}</option>
            ))}
          </select>
        </div>

        <div>
          <label>
            <input 
              type="checkbox" 
              checked={showOnlyCloudy} 
              onChange={(e) => setShowOnlyCloudy(e.target.checked)} 
            />
            {t('onlyCloudy')}
          </label>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && filteredEntries.length === 0 && <p>{t('empty')}</p>}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '20px' 
      }}>
        {filteredEntries.map((entry) => (
          <div key={`${entry.camId}-${entry.timestamp}`} style={{ 
            border: '1px solid #ccc', 
            borderRadius: '8px', 
            overflow: 'hidden',
            padding: '10px',
            backgroundColor: (entry.cloudScore || 0) > 70 ? '#fff0f0' : 'inherit'
          }}>
            <img 
              src={`/images/${entry.filename}`} 
              alt={entry.camId} 
              style={{ width: '100%', height: '150px', objectFit: 'cover' }}
              onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/250x150?text=Error')}
            />
            <div style={{ marginTop: '10px' }}>
              <strong>{entry.camId}</strong>
              <br />
              <small>{new Date(entry.timestamp).toLocaleString()}</small>
              {entry.cloudScore !== undefined && (
                <div style={{ marginTop: '5px' }}>
                  <small>{t('cloudScore')}: {entry.cloudScore}%</small>
                  <div style={{ width: '100%', height: '5px', backgroundColor: '#eee', marginTop: '2px' }}>
                    <div style={{ 
                      width: `${entry.cloudScore}%`, 
                      height: '100%', 
                      backgroundColor: entry.cloudScore > 70 ? 'red' : entry.cloudScore > 40 ? 'orange' : 'green' 
                    }} />
                  </div>
                </div>
              )}
              <div style={{ marginTop: '10px' }}>
                <button 
                  onClick={() => handleDelete(entry.camId, entry.timestamp)}
                  style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
