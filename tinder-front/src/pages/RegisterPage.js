import React from 'react';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const { register } = useAuth();

  return (
    <div>
      <h2>Register</h2>
      <AuthForm onSubmit={register} submitText="Register" isRegister={true} />
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
};

export default RegisterPage;