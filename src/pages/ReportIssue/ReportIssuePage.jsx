import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { issuesAPI } from '../../services/api';
import { 
  Camera, MapPin, Info, Send, X, 
  UploadCloud, Image as ImageIcon 
} from 'lucide-react';
import toast from 'react-hot-toast';
import './ReportIssuePage.css';

const categories = [
  { id: 'pothole', label: 'Pothole', icon: '🕳️' },
  { id: 'garbage', label: 'Garbage', icon: '🗑️' },
  { id: 'water_leakage', label: 'Water Leakage', icon: '💧' },
  { id: 'streetlight', label: 'Streetlight', icon: '💡' },
  { id: 'sewage', label: 'Sewage', icon: '🚽' },
  { id: 'park', label: 'Park', icon: '🌳' },
  { id: 'other', label: 'Other', icon: '📌' },
];

const ReportIssuePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: 'pothole',
    title: '',
    description: '',
    address: '',
    area: '',
    pincode: '',
  });
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (images.length + acceptedFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    const newImages = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    
    setImages(prev => [...prev, ...newImages]);
  }, [images]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    images.forEach(image => data.append('images', image));

    try {
      const res = await issuesAPI.create(data);
      toast.success('Issue reported successfully!');
      navigate(`/issues/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-page container section-padding">
      <div className="report-grid">
        <div className="report-form-container">
          <div className="form-header">
            <h1>Report a Civic Issue</h1>
            <p>Fill in the details below to notify the authorities.</p>
          </div>

          <form onSubmit={handleSubmit} className="report-form">
            <section className="form-section">
              <div className="section-title">
                <Info size={18} />
                <h3>Issue Details</h3>
              </div>
              
              <div className="input-group">
                <label>Category</label>
                <div className="category-select">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`cat-option ${formData.category === cat.id ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                    >
                      <span className="cat-icon">{cat.icon}</span>
                      <span className="cat-label">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label>Issue Title</label>
                <input 
                  name="title"
                  type="text" 
                  placeholder="e.g. Large pothole near main gate" 
                  required
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>Description</label>
                <textarea 
                  name="description"
                  rows="4" 
                  placeholder="Describe the issue in detail..." 
                  required
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </section>

            <section className="form-section">
              <div className="section-title">
                <MapPin size={18} />
                <h3>Location</h3>
              </div>
              
              <div className="input-group">
                <label>Street Address</label>
                <input 
                  name="address"
                  type="text" 
                  placeholder="e.g. 123, 5th Cross" 
                  required
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="location-row">
                <div className="input-group">
                  <label>Area</label>
                  <input 
                    name="area"
                    type="text" 
                    placeholder="e.g. Indiranagar" 
                    required
                    value={formData.area}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <label>Pincode</label>
                  <input 
                    name="pincode"
                    type="text" 
                    placeholder="560038" 
                    required
                    maxLength="6"
                    value={formData.pincode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            <button type="submit" className="btn btn-primary btn-block submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : (
                <>
                  Submit Report <Send size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="report-sidebar">
          <div className="image-upload-card">
            <div className="section-title">
              <Camera size={18} />
              <h3>Photos</h3>
            </div>
            <p className="upload-hint">Upload up to 5 clear photos of the issue (Max 5MB each)</p>
            
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              <div className="dropzone-content">
                <UploadCloud size={40} />
                <p>Drag & drop photos or <span>Browse</span></p>
              </div>
            </div>

            <div className="image-previews">
              {images.map((file, index) => (
                <div key={index} className="preview-item">
                  <img src={file.preview} alt="preview" />
                  <button type="button" onClick={() => removeImage(index)} className="remove-img">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {images.length === 0 && (
                <div className="empty-preview">
                  <ImageIcon size={24} />
                  <span>No photos yet</span>
                </div>
              )}
            </div>
          </div>

          <div className="guidelines-card">
            <div className="section-title">
              <Info size={18} />
              <h3>Reporting Tips</h3>
            </div>
            <ul>
              <li>Take photos from different angles.</li>
              <li>Ensure the location is accurate for faster response.</li>
              <li>Provide a clear description of the severity.</li>
              <li>Avoid including people's faces in photos.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssuePage;
