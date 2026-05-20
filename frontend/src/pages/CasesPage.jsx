import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CasesList from '../components/Cases/CasesList';
import CaseDetail from '../components/Cases/CaseDetail';
import { DetailSkeleton } from '../components/Common/Skeleton';

export default function CasesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(id || null);
  const [newCase,    setNewCase]    = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => { if (id) setSelectedId(id); }, [id]);

  const handleSelect = (caseId) => {
    setSelectedId(caseId);
    setDetailLoading(true);
    setTimeout(() => setDetailLoading(false), 300);
    navigate(`/cases/${caseId}`, { replace: true });
  };

  const handleDeleted = () => {
    setSelectedId(null);
    navigate('/cases', { replace: true });
  };

  /* Called by Topbar NewCaseModal — instant add to list */
  const handleCaseCreated = (caseDoc) => {
    setNewCase(caseDoc);
    handleSelect(caseDoc._id);
  };

  /* Expose handler to window so Topbar can call it */
  useEffect(() => {
    window.__onCaseCreated = handleCaseCreated;
    return () => { delete window.__onCaseCreated; };
  }, []); // eslint-disable-line

  return (
    <div className="split-layout">
      <CasesList
        selectedId={selectedId}
        onSelect={handleSelect}
        onDeleted={handleDeleted}
        newCase={newCase}
      />
      <div className="detail-pane">
        {selectedId ? (
          detailLoading ? <DetailSkeleton /> : <CaseDetail caseId={selectedId} />
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
