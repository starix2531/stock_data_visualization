import React, { useState } from 'react';
import { Modal } from 'antd';
import { doSignInWithEmailAndPassword , doCreateUserWithEmailAndPassword } from './auth'
import { useAuth } from './index';
//import './RegistrationForm.css';

const RegistrationForm = ({ visible, onCancel, onSwitchToLogin, onlogIn }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { userLoggedIn, setCurrentUser } = useAuth();
  const [modalVisible, setModalVisible] = useState(visible);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const closeModal = () => {
    setModalVisible(false);
    onCancel();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Perform form validation
    if (!email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if(!isRegistering) {
      setIsRegistering(true)
      try {
        await doCreateUserWithEmailAndPassword(email, password);
        const result = await doSignInWithEmailAndPassword(email, password);
        setCurrentUser(result);
        onlogIn(userLoggedIn);
        closeModal();  // Close the modal after successful sign-in
      } catch (error) {
        setErrorMessage(error.message);
      }
      setIsRegistering(false);
    }
    // Send form data to parent component
  };

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      footer={null}
      centered
      maskClosable={false}
      width={450}
      style={{ top: '5%' }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
    >
          <div className="text-center mb-6">
            <div className="mt-2">
              <h3 className="text-gray-800 text-xl font-semibold sm:text-2xl">Create a New Account</h3>
            </div>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
              <div>
                  <label className="text-sm text-gray-600 font-bold">
                      Email
                  </label>
                  <input
                      type="email"
                      autoComplete='email'
                      required
                      value={email} onChange={(e) => { setEmail(e.target.value) }}
                      className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                  />
              </div>

              <div className="relative">
                <label className="text-sm text-gray-600 font-bold">
                  Password
                </label>
                <input
                  disabled={isRegistering}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  required
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value) }}
                  className="w-full mt-2 px-3 py-2 pr-10 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute top-8 inset-y-0 right-0 px-5 flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="relative">
                <label className="text-sm text-gray-600 font-bold">
                Confirm Password
                </label>
                <input
                  disabled={isRegistering}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value) }}
                  className="w-full mt-2 px-3 py-2 pr-10 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute top-8 inset-y-0 right-0 px-5 flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <button
                  type="submit"
                  disabled={isRegistering}
                  className={`w-full px-4 py-2 text-white font-medium rounded-lg ${isRegistering ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300'}`}
              >
                  {isRegistering ? 'Signing Up...' : 'Sign Up'}
              </button>
        </form>
          <div className="text-sm text-center">
            Already have an account? {'   '}
            <button className="text-center text-sm hover:underline font-bold" onClick={onSwitchToLogin}>
              Continue
            </button>
          </div>
          {errorMessage && (<span className='text-red-600 font-bold'>{errorMessage}</span>)}  
    </Modal>
  );
};

export default RegistrationForm;