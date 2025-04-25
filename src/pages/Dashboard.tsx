import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

// Tipos
interface Item {
  url: string;
  name: string;
  isFolder: boolean;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// Modal Componente
function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#fff', borderRadius: 8, boxShadow: '0 8px 32px #142a4c33',
        minWidth: 320, maxWidth: 1080, minHeight: "80vh", overflowY: "auto", padding: 30, position: "relative"
      }}>
        <button onClick={onClose}
          style={{
            position: 'absolute', right: 16, top: 12, border: 0, background: 'none', fontSize: 26,
            color: '#a4b0bb', cursor: "pointer"
          }}>×</button>
        <h3 style={{ marginTop: 0, color: "#183e92" }}>{title}</h3>
        <div style={{ marginTop: 16 }}>{children}</div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [folderUrl, setFolderUrl] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [folderHistory, setFolderHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const sessionId = localStorage.getItem('sessionId');

  // Fetch inicial
  useEffect(() => {
    const fetchPodData = async () => {
      setError(null);
      try {
        const headers = new Headers();
        headers.append('session-id', sessionId || '');
        headers.append('Content-Type', 'application/json');
        const resPod = await fetch('/api/op/pod', { method: 'GET', headers });
        if (!resPod.ok) throw new Error('Falha no backend');
        const podData = await resPod.json();
        setBaseUrl(podData.baseUrl);
        setFolderUrl(podData.baseUrl);
      } catch (e) { setError('Erro de conexão!'); setLoading(false); }
    };
    fetchPodData();
    // eslint-disable-next-line
  }, []);

  // Fetch a cada pasta acessada
  useEffect(() => {
    if (!folderUrl) return;
    const fetchFolder = async () => {
      setError(null);
      try {
        setLoading(true);
        const headers = new Headers();
        headers.append('session-id', sessionId || '');
        const resFolder = await fetch(
          `/api/op/folder?folderUrl=${encodeURIComponent(folderUrl)}`,
          { method: 'GET', headers }
        );
        if (!resFolder.ok) throw new Error('Falha ao listar itens');
        const folderData = await resFolder.json();
        setItems(folderData.items as Item[]);
        setLoading(false);
      } catch (e) { setError("Erro ao buscar pasta!"); setLoading(false); }
    };
    fetchFolder();
  }, [folderUrl, sessionId]);

  // Navegação por pasta ou arquivo
  const handleClick = async (item: Item) => {
    if (item.isFolder) {
      setFolderHistory((prev) => [...prev, folderUrl!]);
      setFolderUrl(item.url);
      setFileContent(null);
      setSelectedFile(null);
    } else {
      try {
        setError(null);
        const headers = new Headers();
        headers.append('session-id', sessionId || '');
        const res = await fetch(
          `/api/op/read?resourceUrl=${encodeURIComponent(item.url)}`,
          { method: 'GET', headers }
        );
        if (!res.ok) throw new Error('Erro ao ler arquivo!');
        const result = await res.text();
        setSelectedFile(item.name);
        setFileContent(result);
        setModalOpen(true);
      } catch (e) { setError('Erro ao ler arquivo'); }
    }
  };

  // Breadcrumb navegação
  let relPath = "";
  if (baseUrl && folderUrl) {
    // Remove baseUrl do início (garantindo sem barra duplicada)
    relPath = folderUrl.replace(baseUrl, "").replace(/^\/+/, "");
  }
  const relParts = relPath ? relPath.split('/').filter(Boolean) : [];

  // Header actions
  function handleLogout() {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('iss');
    localStorage.removeItem('code');
    localStorage.removeItem('state');
    navigate('/', { replace: true });
  }
  function handleRefresh() {
    setFolderUrl(folderUrl); // Força reload via useEffect
  }

  return (
    <div style={{ minHeight: "100vh", minWidth: '100vh', background: "#f7fafc", fontFamily: "Inter, Arial, sans-serif" }}>
      {/* HEADER */}
      <header style={{
        background: "#1b2a4b", color: "#fff", display: "flex",
        alignItems: "center", justifyContent: "space-between",
        padding: "1rem 2.5rem", fontWeight: 600
      }}>
        <span>
          <span style={{ color: "#e7ff93" }}>Outlier</span> Files
        </span>
        <div>
          <button onClick={handleRefresh}
            style={{
              background: "#eef4ff", color: "#2c4ea2", border: 0, fontWeight: 600, borderRadius: 7,
              padding: '.4rem 1.2rem', fontSize: "1rem", cursor: "pointer", marginRight: 12
            }}>↻ Refresh</button>
          <button onClick={handleLogout}
            style={{
              background: "#ef4444", color: "#fff", border: 0,
              borderRadius: 7, padding: '.4rem 1.2rem', fontSize: "1rem", cursor: "pointer"
            }}>⎋ Logout</button>
        </div>
      </header>
      {/* SUB HEADER */}
      <div style={{
        background: "#f5f7fb", color: "#1b2a4b", fontSize: "1.09rem",
        padding: "1rem 2.5rem 0.7rem 2.5rem", borderBottom: "1px solid #eaecee"
      }}>
        <nav aria-label="breadcrumb">
          <span
            style={{ cursor: 'pointer', color: "#2178e0", textDecoration: 'underline', marginRight: 2 }}
            onClick={() => {
              setFolderUrl(baseUrl!);
              setFolderHistory([]);
              setFileContent(null);
              setSelectedFile(null);
            }}
          >
            Raiz
          </span>
          {relParts.map((name, idx) => {
            const pathUpToLevel = [baseUrl, ...relParts.slice(0, idx + 1)].join('/');
            const isLast = idx === relParts.length - 1;
            return (
              <span key={pathUpToLevel}>
                <span style={{ color: "#a4aacc", fontWeight: 600 }}> / </span>
                <span
                  style={{
                    cursor: isLast ? 'default' : 'pointer',
                    color: isLast ? "#1b2a4b" : "#2178e0",
                    fontWeight: isLast ? 600 : undefined,
                    textDecoration: isLast ? undefined : 'underline',
                    marginRight: 2
                  }}
                  onClick={
                    isLast
                      ? undefined
                      : () => {
                        setFolderUrl(pathUpToLevel);
                        setFolderHistory([]); // Se não quiser histórico zere, senão adapte
                        setFileContent(null);
                        setSelectedFile(null);
                      }
                  }
                >
                  {decodeURIComponent(name)}
                </span>
              </span>
            );
          })}
        </nav>
      </div>
      {/* CORPO */}
      <main style={{
        maxWidth: 980, margin: '2.2rem auto 0 auto', background: '#fff',
        borderRadius: '15px', minHeight: 480, boxShadow: '0 2px 16px #1b2a4b10', padding: "2.4rem 2.2rem"
      }}>
        {error && (
          <div style={{
            background: "#fbebeb", color: "#c12e2e",
            fontWeight: 500, borderRadius: 7, padding: '0.85rem 1rem', marginBottom: "1.3rem"
          }}>{error}</div>
        )}
        {loading ? (
          <div style={{
            color: "#8fa2bd", textAlign: 'center', padding: '3.7rem 0', fontSize: '1.11rem'
          }}>
            ⏳ Carregando arquivos...
          </div>
        ) : (
          items.length === 0 ? (
            <div style={{
              color: "#aab3c8", textAlign: "center", marginTop: "5rem",
              fontSize: "1.1rem", fontStyle: "italic"
            }}>Nenhuma pasta ou arquivo nesta pasta.</div>
          ) : (
            <div style={{
              display: "flex", flexWrap: "wrap", gap: "1.15rem", marginTop: 0
            }}>
              {items.map((item) => (
                <div key={item.url}
                  onClick={() => handleClick(item)}
                  style={{
                    flex: "1 0 170px", minWidth: 133, maxWidth: 240,
                    cursor: "pointer",
                    background: item.isFolder ? "#e9f1fc" : "#f6f8fa", border: item.isFolder ? "2px solid #b5e2ff" : "1px solid #ececec",
                    borderRadius: 9,
                    padding: '1rem 1.12rem', fontWeight: item.isFolder ? 600 : 400, fontSize: "1.06rem",
                    display: 'flex', alignItems: 'center', transition: 'background .13s'
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = item.isFolder ? "#ddebff" : "#edf0fa")}
                  onMouseOut={e => (e.currentTarget.style.background = item.isFolder ? "#e9f1fc" : "#f6f8fa")}
                  tabIndex={0}
                  onKeyPress={e => { if (e.key === 'Enter') handleClick(item); }}
                >
                  <span style={{ fontSize: "2.2rem", width: 37, display: "inline-block", marginRight: 10 }}>
                    {item.isFolder ? "📁" : "📄"}
                  </span>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          )
        )}
        {/* Modal arquivo */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={selectedFile || ""}
        >
          <pre style={{
            background: "#f7fafc", borderRadius: 8, padding: "1.2rem",
            fontFamily: "JetBrains Mono, Fira Mono, Consolas, monospace", fontSize: "1.01em",
            lineHeight: 1.53, color: "#232a38", maxHeight: 900, overflowY: "auto"
          }}>{fileContent}</pre>
        </Modal>
      </main>
    </div>
  );
}