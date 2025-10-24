import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const AddStudent = ({ onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    email: '',
    dob: ''
  });
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { API_URL } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`${API_URL}/subjects`, config);
      setSubjects(data);
      setMarks(data.map(subject => ({
        subject: subject._id,
        marksObtained: 0
      })));
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMarkChange = (index, value) => {
    const newMarks = [...marks];
    newMarks[index].marksObtained = parseInt(value) || 0;
    setMarks(newMarks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.post(`${API_URL}/students`, {
        ...formData,
        marks
      }, config);

      if (onUpdate) onUpdate();
      navigate('/dashboard/students');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-section">
      <div className="section-header">
        <div>
          <h2>Add New Student</h2>
          <p className="text-muted">Enter student details and marks</p>
        </div>
        <Link to="/dashboard/students" className="btn btn-secondary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to List
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="student-form">
        <div className="form-card">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="rollNo">Roll Number *</label>
              <input
                type="text"
                id="rollNo"
                name="rollNo"
                value={formData.rollNo}
                onChange={handleChange}
                placeholder="CS001"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dob">Date of Birth *</label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-card">
          <h3>Subject Marks</h3>
          {subjects.length === 0 ? (
            <div className="empty-state-small">
              <p>No subjects available. Please add subjects first.</p>
              <Link to="/dashboard/subjects" className="btn btn-primary btn-sm">
                Add Subjects
              </Link>
            </div>
          ) : (
            <div className="marks-grid">
              {subjects.map((subject, index) => (
                <div key={subject._id} className="mark-item">
                  <label>
                    {subject.name} ({subject.code})
                    <span className="max-marks">Max: {subject.maxMarks}</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={subject.maxMarks}
                    value={marks[index]?.marksObtained || 0}
                    onChange={(e) => handleMarkChange(index, e.target.value)}
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <Link to="/dashboard/students" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={loading || subjects.length === 0}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Adding...
              </>
            ) : (
              'Add Student'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;