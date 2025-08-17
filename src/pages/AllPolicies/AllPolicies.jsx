import React, { useState, useEffect } from 'react';
import { axiosSecure } from '../../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import LoadingSpinner from '../../components/Shared/Spinner/LoadingSpinner';

const AllPolicies = () => {
    const [page, setPage] = useState(1);
    const [category, setCategory] = useState('');
    const [search, setSearch] = useState('');
    const limit = 9;

    // Refetch when filters change (page/category/search)
    const { data, isLoading } = useQuery({
        queryKey: ['policies', page, category, search],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', limit);
            if (category) params.append('category', category);
            if (search) params.append('search', search);

            const res = await axiosSecure.get(`/policies?${params.toString()}`);
            return res.data;
        },
        keepPreviousData: true,
    });

    // Reset page to 1 if category or search changes
    useEffect(() => {
        setPage(1);

    }, [category, search]);

    if (isLoading && data) {
        return <LoadingSpinner></LoadingSpinner>
    }

    const categories = ['All', 'Travel', 'Family', 'Senior', 'Term', 'Education', 'Disability', 'Health', 'Pilgrimage'];
    const totalPages = Math.ceil((data?.total || 0) / limit);

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 ">
            <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-6 text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-500">
                All Life Insurance Policies
            </h2>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
                {/* Search input */}
                <input
                    type="text"
                    placeholder="Search policies..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-1/3 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />

                {/* Category filter buttons */}
                <div className="flex flex-wrap justify-center gap-3">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat === 'All' ? '' : cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium border ${category === cat || (cat === 'All' && !category)
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-700 border-gray-300'
                                } transition-all duration-200`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Policies Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {data?.policies?.length > 0 ? (
                    data.policies.map((policy) => (
                        <div
                            key={policy._id}
                            className="relative bg-white shadow-xl rounded-2xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group"
                        >
                            <div className="relative">
                                <img
                                    src={policy.image}
                                    alt={policy.title}
                                    className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="inline-block px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-full uppercase tracking-wide">
                                        {policy.category}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                                    {policy.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                    {policy.description}
                                </p>
                                <Link
                                    to={`/policyDetails/${policy._id}`}
                                    className="inline-block mt-4 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-teal-500 rounded-lg hover:from-green-700 hover:to-teal-600 transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    // <p className="text-center text-gray-600 col-span-full">No policies found.</p>
                    <p></p>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10 flex-wrap">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`w-10 h-10 rounded-full text-sm font-medium ${page === i + 1 ? 'bg-green-600 text-white' : 'bg-white text-gray-800 border border-gray-300'
                                } transition-all`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllPolicies;


