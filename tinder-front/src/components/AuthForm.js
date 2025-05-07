import React, { useState } from 'react';

const AuthForm = ({ onSubmit, submitText, isRegister = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone_number: '',
    gender: 'male',
    birth_date: '',
    sexual_orientation: 'straight',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (isRegister && formData.password !== formData.password_confirmation) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'An error occurred. Please check console.');
      if (err.errors) { // Laravel validation errors
        const firstErrorKey = Object.keys(err.errors)[0];
        setError(`Validation Error: ${err.errors[firstErrorKey][0]}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px', gap: '10px' }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {isRegister && (
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
      )}
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
      {isRegister && (
        <>
          <input type="tel" name="phone_number" placeholder="Phone Number (+7...)" value={formData.phone_number} onChange={handleChange} required />
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <select name="sexual_orientation" value={formData.sexual_orientation} onChange={handleChange}>
            <option value="straight">Straight</option>
            <option value="gay">Gay</option>
            <option value="lesbian">Lesbian</option>
            <option value="bisexual">Bisexual</option>
            <option value="pansexual">Pansexual</option>
            <option value="asexual">Asexual</option>
            <option value="other">Other</option>
          </select>
          <label>Birth Date:</label>
          <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} required />
        </>
      )}
      <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
      {isRegister && (
        <input type="password" name="password_confirmation" placeholder="Confirm Password" value={formData.password_confirmation} onChange={handleChange} required />
      )}
      <button type="submit" disabled={loading}>{loading ? 'Processing...' : submitText}</button>
    </form>
  );
};

export default AuthForm;