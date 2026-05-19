import { useState, useEffect } from 'react';

/**
 * SelectOrOther
 * Props:
 *   options    - array of strings for dropdown options
 *   value      - current value (controlled)
 *   onChange   - (newValue) => void
 *   placeholder- placeholder for the input when Other is selected
 *   label      - optional label shown in select
 *   style      - optional style for select/input
 *   className  - optional className for focus styling
 */
export default function SelectOrOther({
  options = [],
  value = '',
  onChange,
  placeholder = 'Type custom value…',
  label = '— Select —',
  style = {},
  className = '',
}) {
  /* Check if current value is one of the preset options */
  const isPreset = (v) => !v || options.includes(v);

  const [mode, setMode] = useState(isPreset(value) ? 'select' : 'other');
  const [customVal, setCustomVal] = useState(isPreset(value) ? '' : value);

  /* Sync when value changes externally (e.g. edit modal pre-fill) */
  useEffect(() => {
    if (isPreset(value)) {
      setMode('select');
    } else if (value) {
      setMode('other');
      setCustomVal(value);
    }
  }, [value]); // eslint-disable-line

  const handleSelectChange = (e) => {
    const v = e.target.value;
    if (v === '__other__') {
      setMode('other');
      setCustomVal('');
      onChange('');
    } else {
      setMode('select');
      onChange(v);
    }
  };

  const handleCustomChange = (e) => {
    setCustomVal(e.target.value);
    onChange(e.target.value);
  };

  const handleBackToSelect = () => {
    setMode('select');
    setCustomVal('');
    onChange('');
  };

  const baseStyle = {
    width: '100%', padding: '10px 13px',
    border: '1.5px solid #E8E4DF', borderRadius: 9,
    fontSize: 13.5, color: '#1C1A18', background: '#FAFAF9',
    fontFamily: "'DM Sans', sans-serif", outline: 'none',
    transition: 'border-color 0.13s',
    ...style,
  };

  if (mode === 'other') {
    return (
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={customVal}
          onChange={handleCustomChange}
          placeholder={placeholder}
          className={className}
          style={{ ...baseStyle, paddingRight: 36 }}
          autoFocus
        />
        {/* Back to dropdown button */}
        <button
          type="button"
          onClick={handleBackToSelect}
          title="Back to list"
          style={{
            position: 'absolute', right: 8, top: '50%',
            transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#C4BDB6', fontSize: 16, padding: 2,
            display: 'flex', alignItems: 'center',
            transition: 'color 0.12s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#F07B2B'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#C4BDB6'}
        >
          <i className="ti ti-list" />
        </button>
      </div>
    );
  }

  return (
    <select
      value={value || ''}
      onChange={handleSelectChange}
      className={className}
      style={baseStyle}
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
      <option value="__other__">✏️  Other (type custom…)</option>
    </select>
  );
}
