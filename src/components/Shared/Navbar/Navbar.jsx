import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../../hooks/useAuth';
import LoadingSpinner from '../Spinner/LoadingSpinner';
import SideLogo from '../../Sidebar/SideLogo';

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const { user, logOut, loading } = useAuth();
    const [photoURL, setPhotoURL] = useState(null);

    // Update photoURL immediately and handle async updates
    useEffect(() => {
        if (user) {
            setPhotoURL(user?.photoURL); // Fallback if photoURL is null
        } else {
            setPhotoURL(null);
        }
    }, [user]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Blogs', path: '/blogs' },
        { name: 'All Policies', path: '/policies' },
        // { name: 'Agents', path: '/agents' },
        // { name: 'FAQs', path: '/faqs' },
    ];

    const mobileMenuVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
    };

    // if (loading) return ;

    return (
        <nav className="bg-white shadow-2xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                {/* Logo */}
                <SideLogo></SideLogo>
                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-6 items-center">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `text-base font-medium transition-colors duration-300 ${isActive
                                    ? 'text-teal-500 border-b-2 border-teal-500'
                                    : 'text-gray-700 hover:text-teal-500 hover:border-b-2 hover:border-teal-300'
                                }`
                            }
                        >
                            {link.name}
                        </NavLink>
                    ))}

                    {user ? (
                        <>
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) =>
                                    `text-base font-medium transition-colors duration-300 ${isActive
                                        ? 'text-teal-500'
                                        : 'text-gray-700 hover:text-teal-500'
                                    }`
                                }
                            >
                                Dashboard
                            </NavLink>

                            {/* Profile Image with Tooltip */}
                            <div className="group relative">
                                <NavLink to="/profile" className="flex items-center space-x-2">

                                    <motion.img
                                        src={photoURL}
                                        alt={user?.displayName || 'User'}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-teal-500 hover:border-teal-600 transition-all duration-200"
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.2 }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    />
                                </NavLink>
                                <motion.div
                                    className="absolute hidden group-hover:block bg-gray-800 text-white text-sm font-medium px-3 py-1 rounded-lg -bottom-10 left-1/2 transform -translate-x-1/2"
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {user?.displayName?.split(' ')[0] || 'User'}
                                </motion.div>
                            </div>

                            <motion.button
                                onClick={logOut}
                                className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-xl font-medium hover:from-red-600 hover:to-rose-600 shadow-lg hover:shadow-xl transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Logout
                            </motion.button>
                        </>
                    ) : (
                        <NavLink
                            to="/login"
                            className="bg-gradient-to-r from-green-600 to-teal-500 text-white px-4 py-2 rounded-xl font-medium hover:from-green-700 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            Login
                        </NavLink>
                    )}
                </div>

                {/* Mobile Toggle */}
                <div className="md:hidden text-2xl text-gray-700">
                    <motion.button onClick={() => setOpen(!open)} whileTap={{ scale: 0.9 }}>
                        {open ? <FaTimes /> : <FaBars />}
                    </motion.button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        className="md:hidden bg-white shadow-lg px-4 pb-4"
                        variants={mobileMenuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) =>
                                    `block py-3 text-base font-medium ${isActive
                                        ? 'text-teal-500'
                                        : 'text-gray-700 hover:text-teal-500'
                                    }`
                                }
                                onClick={() => setOpen(false)}
                            >
                                {link.name}
                            </NavLink>
                        ))}
                        {user ? (
                            <>
                                <NavLink
                                    to="/dashboard"
                                    className="block py-3 text-base font-medium text-gray-700 hover:text-teal-500"
                                    onClick={() => setOpen(false)}
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    to="/profile"
                                    className="block py-3 text-base font-medium text-gray-700 hover:text-teal-500"
                                    onClick={() => setOpen(false)}
                                >
                                    Profile
                                </NavLink>
                                <button
                                    onClick={() => {
                                        logOut();
                                        setOpen(false);
                                    }}
                                    className="block py-3 text-base font-medium text-red-500 hover:text-red-600"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink
                                    to="/login"
                                    className="block py-3 text-base font-medium text-gray-700 hover:text-teal-500"
                                    onClick={() => setOpen(false)}
                                >
                                    Login
                                </NavLink>
                                <NavLink
                                    to="/register"
                                    className="block py-3 text-base font-medium text-gray-700 hover:text-teal-500"
                                    onClick={() => setOpen(false)}
                                >
                                    Register
                                </NavLink>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;