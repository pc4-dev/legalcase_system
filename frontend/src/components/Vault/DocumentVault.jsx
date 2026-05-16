import { useState, useEffect } from 'react';
import { caseService } from '../../services/caseService';

const FOLDERS = [
  { name:'Pleadings & plaints', icon:'ti-file-type-pdf', type:'plaint' },
  { name:'Annexures',           icon:'ti-files',         type:'annexure' },
  { name:'Letters & notices',   icon:'ti-mail',          type:'letter' },
  { name:'Affidavits',          icon:'ti-file-text',     type:'affidavit' },
  { name:'Orders & decrees',    icon:'ti-file-certificate', type:'decree' },
  { name:'Photographs',         icon:'ti-photo',         type:'evidence' },
];

const FILE_ICON = {
  plaint:'ti-file-type-pdf', annexure:'ti-file-type-pdf',
  letter:'ti-mail', affidavit:'ti-file-text',
  decree:'ti-file-certificate', evidence:'ti-photo',
  contract:'ti-file-invoice', other:'ti-file',
};

export default function DocumentVault() {
  const [allDocs, setAllDocs]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeFolder, setActiveFolder] = useState(null);
  const [search, setSearch]             = useState('');

  useEffect(() => {
    caseService.getAll({ limit:100 }).then(({ cases }) => {
      const docs = [];
      (cases || []).forEach((c) =>
        (c.documents || []).forEach((d) => docs.push({ ...d, caseCode:c.caseCode, caseId:c._id }))
      );
      setAllDocs(docs);
    }).finally(() => setLoading(false));
  }, []);

  const folderCount = (type) => allDocs.filter((d) => d.fileType === type).length;

  const visible = allDocs
    .filter((d) => !activeFolder || d.fileType === activeFolder)
    .filter((d) => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.caseCode?.toLowerCase().includes(search.toLowerCase()))
    .filter((d) => d.status === 'uploaded' || activeFolder);

  return (
    <div className="scroll-area">
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, flexWrap:'wrap', gap:10 }}>
        <div style={{ fontSize:13, color:'var(--ink-50)', fontWeight:500 }}>
          <i className="ti ti-database" style={{ marginRight:6, color:'var(--orange)' }} />
          {allDocs.length} files across all matters
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {activeFolder && (
            <button className="btn btn-ghost btn-sm" onClick={() => setActiveFolder(null)}>
              <i className="ti ti-x" /> Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Upload zone */}
      <div className="upload-zone" style={{ marginBottom:22 }}>
        <i className="ti ti-cloud-upload" />
        To upload a document, open a specific case → Documents tab
      </div>

      {/* Folder grid */}
      <div className="section-heading">Folders</div>
      <div className="vault-grid">
        {FOLDERS.map((f) => (
          <div
            key={f.type}
            className="vault-folder"
            onClick={() => setActiveFolder(activeFolder === f.type ? null : f.type)}
            style={{ borderColor: activeFolder === f.type ? 'var(--orange)' : undefined, background: activeFolder === f.type ? 'var(--orange-light)' : undefined, boxShadow: activeFolder === f.type ? 'var(--shadow-o)' : undefined }}
          >
            <i className={`ti ${f.icon}`} />
            <div>
              <div className="vault-folder-name">{f.name}</div>
              <div className="vault-folder-count">{loading ? '…' : folderCount(f.type)} files</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + file list */}
      <div className="section-heading" style={{ marginTop:24 }}>
        {activeFolder ? FOLDERS.find((f) => f.type === activeFolder)?.name : 'Recent uploads'}
      </div>

      <div style={{ marginBottom:14 }}>
        <div className="search-wrap">
          <i className="ti ti-search" />
          <input type="text" placeholder="Search documents or case codes…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading && (
        <div style={{ textAlign:'center', padding:40 }}>
          <div className="spinner-orange" style={{ margin:'0 auto 12px' }} />
          <div style={{ fontSize:13, color:'var(--ink-50)' }}>Loading documents…</div>
        </div>
      )}

      {!loading && (
        <div className="doc-list">
          {visible.length === 0 && (
            <div style={{ textAlign:'center', padding:'40px 20px', color:'var(--ink-50)' }}>
              <i className="ti ti-file-off" style={{ fontSize:36, display:'block', marginBottom:10, color:'var(--orange-mid)' }} />
              {search ? 'No documents match your search' : 'No documents in this category'}
            </div>
          )}
          {visible.slice(0, 30).map((doc) => (
            <div key={doc._id} className={`doc-item${doc.status === 'pending' ? ' doc-pending' : ''}`}>
              <div className="doc-left">
                <i className={`ti ${FILE_ICON[doc.fileType] || 'ti-file'}`} />
                <div>
                  <div className="doc-name" style={{ maxWidth:300 }}>{doc.name}</div>
                  <div style={{ fontSize:11, color:'var(--ink-50)', marginTop:2 }}>
                    <span style={{ fontFamily:'var(--font-mono)', color:'var(--orange)', fontWeight:600, marginRight:8 }}>{doc.caseCode}</span>
                    {doc.fileSize && <span>{doc.fileSize}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                <span className="doc-type-tag">{doc.fileType}</span>
                <div className="doc-actions">
                  {doc.filePath && (
                    <a href={doc.filePath} target="_blank" rel="noreferrer">
                      <button className="icon-btn" title="View"><i className="ti ti-eye" /></button>
                    </a>
                  )}
                  {doc.filePath && (
                    <a href={doc.filePath} download>
                      <button className="icon-btn" title="Download"><i className="ti ti-download" /></button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
