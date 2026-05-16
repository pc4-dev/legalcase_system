import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CasesList from '../components/Cases/CasesList';
import CaseDetail from '../components/Cases/CaseDetail';

export default function CasesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(id || null);

  useEffect(() => { if (id) setSelectedId(id); }, [id]);

  const handleSelect = (caseId) => {
    setSelectedId(caseId);
    navigate(`/cases/${caseId}`, { replace: true });
  };

  // When the selected case is deleted, clear the detail pane
  const handleDeleted = () => {
    setSelectedId(null);
    navigate('/cases', { replace: true });
  };

  return (
    <div className="split-layout">
      <CasesList
        selectedId={selectedId}
        onSelect={handleSelect}
        onDeleted={handleDeleted}
      />
      <div className="detail-pane">
        {selectedId ? (
          <CaseDetail caseId={selectedId} />
        ) : (
          <div className="empty-detail">
            <i className="ti ti-file-search" />
            <p>Select a case to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
