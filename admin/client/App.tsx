import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';
import './App.css';

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

interface HealthStatus {
  status: string;
  uptime: number;
  timestamp: number;
  version: string;
}

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<HistoryIndex | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCam, setFilterCam] = useState<string>('');
  const [showOnlyCloudy, setShowOnlyCloudy] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyRes, healthRes] = await Promise.all([
        fetch('/api/history'),
        fetch('/api/health')
      ]);

      if (!historyRes.ok) throw new Error(t('errorLoading'));
      const json = await historyRes.json();
      // Sort entries by timestamp descending
      json.entries.sort((a: HistoryEntry, b: HistoryEntry) => b.timestamp - a.timestamp);
      setData(json);

      if (healthRes.ok) {
        const healthJson = await healthRes.json();
        setHealth(healthJson);
      }

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

  const filteredEntries = useMemo(() => {
    return data?.entries.filter(e => {
      const matchesCam = !filterCam || e.camId.toLowerCase().includes(filterCam.toLowerCase());
      const matchesCloudy = !showOnlyCloudy || (e.cloudScore && e.cloudScore > 50);
      return matchesCam && matchesCloudy;
    }) || [];
  }, [data, filterCam, showOnlyCloudy]);

  const groupedEntries = useMemo(() => {
    const groups: Record<string, HistoryEntry[]> = {};
    filteredEntries.forEach(entry => {
      if (!groups[entry.camId]) {
        groups[entry.camId] = [];
      }
      groups[entry.camId].push(entry);
    });
    return groups;
  }, [filteredEntries]);

  const uniqueCams = useMemo(() => 
    Array.from(new Set(data?.entries.map(e => e.camId) || [])).sort()
  , [data]);

  const getCloudColor = (score: number) => {
    if (score > 70) return 'var(--danger-color)';
    if (score > 40) return 'orange';
    return 'var(--success-color)';
  };

  return (
    <div className="admin-container">
      <header className="panel">
        <div className="header-section">
          <div>
            <h1>{t('title')}</h1>
            {health && (
              <div className="status-badge">
                <div className={`status-indicator ${health.status === 'ok' ? 'status-ok' : 'status-error'}`} />
                <span>{t('status')}: {health.status}</span>
                <span>{t('version')}: {health.version}</span>
                <span>{t('uptime')}: {Math.floor(health.uptime / 60)}m</span>
              </div>
            )}
          </div>
          <div className="button-group">
            <button onClick={() => i18n.changeLanguage('en')}>EN</button>
            <button onClick={() => i18n.changeLanguage('fi')}>FI</button>
            <button className="primary" onClick={fetchData}>{t('refresh')}</button>
          </div>
        </div>

        <div className="panel-inset">
          <div className="controls">
            <div>
              <label style={{ marginRight: '10px' }}>{t('filterByCam')}: </label>
              <select value={filterCam} onChange={(e) => setFilterCam(e.target.value)}>
                <option value="">{t('allImages')}</option>
                {uniqueCams.map(cam => (
                  <option key={cam} value={cam}>{cam}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                id="cloudy-check"
                type="checkbox" 
                checked={showOnlyCloudy} 
                onChange={(e) => setShowOnlyCloudy(e.target.checked)} 
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <label htmlFor="cloudy-check" style={{ cursor: 'pointer' }}>{t('onlyCloudy')}</label>
            </div>

            {data && (
              <div style={{ marginLeft: 'auto', fontSize: '0.9rem', color: '#666' }}>
                {t('lastUpdated')}: {new Date(data.lastUpdated).toLocaleString()} | {filteredEntries.length} {t('entries')}
              </div>
            )}
          </div>
        </div>
      </header>

      {loading && (
        <div className="panel" style={{ textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      )}
      
      {error && (
        <div className="panel" style={{ color: 'var(--danger-color)', textAlign: 'center' }}>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && filteredEntries.length === 0 && (
        <div className="panel" style={{ textAlign: 'center' }}>
          <p>{t('empty')}</p>
        </div>
      )}

      {Object.entries(groupedEntries).map(([camId, entries]) => (
        <section key={camId} className="place-group">
          <div className="place-header">
            <h2>{camId}</h2>
            <span className="card-subtitle">{entries.length} images</span>
          </div>
          
          <div className="entry-grid">
            {entries.map((entry) => (
              <article key={`${entry.camId}-${entry.timestamp}`} className="card">
                <div className="card-image-wrapper">
                  <img 
                    src={`/images/${entry.filename}`} 
                    alt={entry.camId} 
                    loading="lazy"
                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/280x180?text=Image+Not+Found')}
                  />
                </div>
                
                <div className="card-content">
                  <span className="card-title">{entry.camId}</span>
                  <span className="card-subtitle">{new Date(entry.timestamp).toLocaleString()}</span>
                  
                  {entry.cloudScore !== undefined && (
                    <div className="cloud-meter">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span>{t('cloudScore')}</span>
                        <span style={{ fontWeight: 'bold', color: getCloudColor(entry.cloudScore) }}>
                          {entry.cloudScore}%
                        </span>
                      </div>
                      <div className="meter-track">
                        <div className="meter-fill" style={{ 
                          width: `${entry.cloudScore}%`, 
                          backgroundColor: getCloudColor(entry.cloudScore)
                        }} />
                      </div>
                    </div>
                  )}
                  
                  <div style={{ marginTop: '15px' }}>
                    <button 
                      className="danger"
                      onClick={() => handleDelete(entry.camId, entry.timestamp)}
                      style={{ width: '100%' }}
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default App;
