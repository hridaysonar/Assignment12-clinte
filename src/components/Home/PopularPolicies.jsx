import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { axiosSecure } from '../../hooks/useAxiosSecure';

// Card animation variants
const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const PopularPolicies = () => {
    // Fetch policies using React Query
    const { data: policies = [], isLoading, error } = useQuery({
        queryKey: ['popularPolicies'],
        queryFn: async () => {
            const response = await axiosSecure.get('/policies');
            // Ensure response.data is an array before sorting
            const data = Array.isArray(response.data)
                ? response.data
                : response.data.policies || [];
            // Sort by purchaseCount in descending order and take top 6
            return data
                .sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0))
                .slice(0, 6);
        },
    });



    if (error) {
        return (
            <div className="text-center text-red-500 font-medium">
                Error loading policies: {error.message}
            </div>
        );
    }

    if (!policies.length) {
        return (
            <div className="text-center text-gray-500 font-medium">
                No policies available at the moment.
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 bg-gradient-to-b from-gray-50 to-white">
            <h2 className="text-4xl font-extrabold text-center mb-10 text-gray-800 tracking-tight">
                Most Popular Policies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {policies.map((policy) => (
                    <motion.div
                        key={policy._id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        className="relative bg-white rounded-2xl shadow-xl overflow-hidden transform hover:shadow-2xl transition-all duration-300"
                    >
                        <div className="relative">
                            <img
                                src={policy.image || policy.imageUrl}
                                alt={policy.title}
                                className="w-full h-56 object-cover transition-transform duration-300 hover:scale-105"
                                onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">{policy.title}</h3>
                            <div className="space-y-3 text-gray-600">
                                <p>
                                    <span className="font-medium text-gray-700">Coverage:</span>{' '}
                                    {policy.coverageRange}
                                </p>
                                <p>
                                    <span className="font-medium text-gray-700">Term Options:</span>{' '}
                                    {policy.durationOptions?.join(', ') || 'N/A'} years
                                </p>
                                <p>
                                    <span className="font-medium text-gray-700">Popularity:</span>{' '}
                                    <span className="text-indigo-600 font-semibold">
                                        {policy.purchaseCount || 0}{' '}
                                        {policy.purchaseCount === 1 ? 'purchase' : 'purchases'}
                                    </span>
                                </p>
                            </div>
                            <Link
                                to={`/policyDetails/${policy._id}`}
                                className="mt-5 inline-block w-full text-center bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 transform hover:scale-105"
                            >
                                View Details
                            </Link>
                        </div>
                        <div className="absolute top-4 right-4 bg-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full">
                            {policy.category}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default PopularPolicies;