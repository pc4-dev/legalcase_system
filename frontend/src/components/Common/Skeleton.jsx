/* Skeleton — shimmer placeholder for loading states */

const SHIMMER = `
  @keyframes skShimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .sk-bone {
    background: linear-gradient(90deg, #F0EDE8 25%, #F7F5F2 50%, #F0EDE8 75%);
    background-size: 600px 100%;
    animation: skShimmer 1.4s infinite linear;
    border-radius: 6px;
  }
`;

/* Single bone */
export function Bone({ w = '100%', h = 14, r = 6, mb = 0, style = {} }) {
  return (
    <>
      <style>{SHIMMER}</style>
      <div className="sk-bone" style={{ width: w, height: h, borderRadius: r, marginBottom: mb, flexShrink: 0, ...style }} />
    </>
  );
}

/* ── Case list item skeleton ── */
export function CaseCardSkeleton() {
  return (
    <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0EDE8' }}>
      <style>{SHIMMER}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div className="sk-bone" style={{ width: 90, height: 12, borderRadius: 4 }} />
        <div className="sk-bone" style={{ width: 50, height: 18, borderRadius: 20 }} />
      </div>
      <div className="sk-bone" style={{ width: '80%', height: 14, borderRadius: 5, marginBottom: 7 }} />
      <div className="sk-bone" style={{ width: '55%', height: 12, borderRadius: 4, marginBottom: 8 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="sk-bone" style={{ width: 110, height: 11, borderRadius: 4 }} />
        <div className="sk-bone" style={{ width: 60,  height: 20, borderRadius: 20 }} />
        <div className="sk-bone" style={{ width: 60,  height: 11, borderRadius: 4 }} />
      </div>
    </div>
  );
}

/* ── Lawyer card skeleton ── */
export function LawyerCardSkeleton() {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #E8E4DF', borderRadius: 14, padding: 20 }}>
      <style>{SHIMMER}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div className="sk-bone" style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="sk-bone" style={{ width: '70%', height: 13, borderRadius: 5, marginBottom: 7 }} />
          <div className="sk-bone" style={{ width: '50%', height: 11, borderRadius: 4 }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="sk-bone" style={{ width: '60%', height: 11, borderRadius: 4 }} />
        <div className="sk-bone" style={{ width: '45%', height: 11, borderRadius: 4 }} />
        <div className="sk-bone" style={{ width: '55%', height: 11, borderRadius: 4 }} />
      </div>
    </div>
  );
}

/* ── Entity card skeleton ── */
export function EntityCardSkeleton() {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #E8E4DF', borderRadius: 14, padding: 20 }}>
      <style>{SHIMMER}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div className="sk-bone" style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="sk-bone" style={{ width: '75%', height: 13, borderRadius: 5, marginBottom: 7 }} />
          <div className="sk-bone" style={{ width: '40%', height: 18, borderRadius: 20 }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="sk-bone" style={{ width: '55%', height: 11, borderRadius: 4 }} />
        <div className="sk-bone" style={{ width: '50%', height: 11, borderRadius: 4 }} />
      </div>
    </div>
  );
}

/* ── Detail pane skeleton ── */
export function DetailSkeleton() {
  return (
    <div>
      <style>{SHIMMER}</style>
      {/* Header */}
      <div style={{ background: '#F07B2B', padding: '24px 28px', opacity: 0.35 }}>
        <div className="sk-bone" style={{ width: 120, height: 11, borderRadius: 4, marginBottom: 10, background: 'rgba(255,255,255,0.5)' }} />
        <div className="sk-bone" style={{ width: '80%', height: 20, borderRadius: 6, marginBottom: 8, background: 'rgba(255,255,255,0.5)' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="sk-bone" style={{ width: 130, height: 28, borderRadius: 20, background: 'rgba(255,255,255,0.4)' }} />
          <div className="sk-bone" style={{ width: 100, height: 28, borderRadius: 20, background: 'rgba(255,255,255,0.4)' }} />
        </div>
      </div>
      {/* Tabs */}
      <div style={{ padding: '0 28px', borderBottom: '1px solid #F0EDE8', display: 'flex', gap: 18 }}>
        {[80, 100, 90].map((w, i) => (
          <div key={i} className="sk-bone" style={{ width: w, height: 13, borderRadius: 4, margin: '14px 0' }} />
        ))}
      </div>
      {/* Info grid */}
      <div style={{ padding: '24px 28px', background: '#FAFAF9' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #F0EDE8', borderRadius: 10, padding: '14px 16px' }}>
              <div className="sk-bone" style={{ width: 60, height: 9, borderRadius: 3, marginBottom: 9 }} />
              <div className="sk-bone" style={{ width: '70%', height: 13, borderRadius: 5 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* n repetitions helper */
export function SkeletonList({ component: Comp, count = 5 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => <Comp key={i} />)}
    </>
  );
}
