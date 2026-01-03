import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password || !confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await register(name, email, password);
            toast.success('Account created successfully!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-500 flex items-center justify-center px-4 pt-20 pb-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2">
                        <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">M</span>
                        </div>
                        <span className="text-2xl font-bold text-white">Movie<span className="text-red-500">Info</span></span>
                    </Link>
                </div>
                <div className="glass-card p-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-gray-400 mb-8">Join the movie community</p>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                            <div className="relative">
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input-dark pl-12" />
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                            <div className="relative">
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="input-dark pl-12" />
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create password" className="input-dark pl-12 pr-12" />
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
                            <div className="relative">
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="input-dark pl-12" />
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 flex items-center justify-center gap-2">
                            {loading ? <><FiLoader className="animate-spin" /> Creating...</> : 'Create Account'}
                        </button>
                    </form>
                    <p className="text-center text-gray-400 mt-8">
                        Already have an account? <Link to="/login" className="text-red-400 font-medium">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
