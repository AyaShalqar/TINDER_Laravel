import React, { useState } from 'react';
import userService from '../services/userService';

const ImageUpload = ({ onImageUploaded }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image to upload.');
      return;
    }
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await userService.uploadImage(formData);
      onImageUploaded(response.image); // Pass the new image data up
      setFile(null); // Reset file input
      e.target.reset(); // Reset form to clear file input display
    } catch (err) {
      setError(err.message || 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Upload New Image</h4>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input type="file" onChange={handleFileChange} accept="image/*" />
      <button type="submit" disabled={uploading || !file}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
};

export default ImageUpload;