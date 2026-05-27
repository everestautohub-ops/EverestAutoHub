import { useRef, useState } from 'react';
import { FiImage, FiX, FiPlus } from 'react-icons/fi';
import api from '../utils/api';

const IMG_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const resolveUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  if (img.startsWith('/uploads')) return `${IMG_BASE}${img}`;
  return img;
};

/**
 * Single image uploader — shows one preview, replace or clear.
 */
export function SingleImageUploader({ label, fieldKey, value, onUpload, onClear }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const preview = resolveUrl(value);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const { data } = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      onUpload(fieldKey, data.url);
    } catch { /* toast handled by caller */ }
    setUploading(false);
    e.target.value = '';
  };

  return (
    <div style={{ marginBottom: '1.2rem' }}>
      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {preview ? (
          <div style={{ position: 'relative', width: 90, height: 60, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
            <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button type="button" onClick={() => onClear(fieldKey)}
              style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
              <FiX size={11} />
            </button>
          </div>
        ) : (
          <div style={{ width: 90, height: 60, borderRadius: 8, border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
            <FiImage size={20} />
          </div>
        )}
        <button type="button" onClick={() => inputRef.current.click()}
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 14px', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '0.82rem' }}>
          {uploading ? 'Uploading...' : preview ? 'Change Image' : 'Upload Image'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </div>
    </div>
  );
}

/**
 * Multi-image uploader — grid of previews, add/remove freely.
 * images: string[]  — array of URLs
 * onChange: (newImages: string[]) => void
 */
export function MultiImageUploader({ label, images = [], onChange, hint }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const { data } = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        uploaded.push(data.url);
      }
      onChange([...images, ...uploaded]);
    } catch { /* toast handled by caller */ }
    setUploading(false);
    e.target.value = '';
  };

  const remove = (idx) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div style={{ marginBottom: '1.2rem' }}>
      {label && (
        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>
          {label}
          <span style={{ color: 'var(--primary)', marginLeft: 6, fontSize: '0.72rem' }}>
            ({images.length} image{images.length !== 1 ? 's' : ''})
          </span>
        </label>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {images.map((img, i) => {
          const url = resolveUrl(img);
          return (
            <div key={i} style={{ position: 'relative', width: 100, height: 68, borderRadius: 8, overflow: 'hidden', border: '2px solid var(--border)', flexShrink: 0 }}>
              <img src={url} alt={`Image ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', fontSize: '0.6rem', color: '#fff', textAlign: 'center', padding: '2px 0' }}>
                {i + 1}
              </div>
              <button type="button" onClick={() => remove(i)}
                style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(230,57,70,0.85)', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                <FiX size={10} />
              </button>
            </div>
          );
        })}

        {/* Add button */}
        <button type="button" onClick={() => inputRef.current.click()} disabled={uploading}
          style={{ width: 100, height: 68, borderRadius: 8, border: '2px dashed rgba(249,115,22,0.4)', background: 'rgba(249,115,22,0.05)', color: 'var(--primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'var(--font-body)' }}>
          {uploading ? <span>Uploading...</span> : <><FiPlus size={18} /><span>Add Image</span></>}
        </button>
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFiles} />

      {hint && <small style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block', marginTop: 6 }}>{hint}</small>}
    </div>
  );
}

export default MultiImageUploader;
