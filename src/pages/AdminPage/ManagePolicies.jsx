// src/pages/ManagePolicies.jsx (Complete and self-contained file)

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Edit, Trash2, Loader2, Search, RotateCcw, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { axiosSecure } from '../../hooks/useAxiosSecure'; // Keep this external import
import { saveImgCloud } from '../../api/utils'; // Import saveImgCloud from utils.js


// =========================================================================
// usePolicyManagement Hook (embedded in this file)
// This hook encapsulates the data fetching and mutation logic for policies.
// It uses React Query for efficient data management and SweetAlert2 for notifications.
// =========================================================================
const usePolicyManagement = (page = 1, limit = 9, category = '', search = '') => {
    const queryClient = useQueryClient();

    // Query to fetch policies based on pagination, category, and search terms
    const { data: policiesData = { policies: [], total: 0 }, isLoading, error } = useQuery({
        queryKey: ['policies', page, limit, category, search], // Unique key for this query
        queryFn: async () => {
            const params = { page, limit };
            if (category) {
                params.category = category;
            }
            if (search) {
                params.search = search;
            }

            console.log("Fetching policies with params:", params);
            const res = await axiosSecure.get('/policies', { params });
            return res.data || { policies: [], total: 0 };
        },
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new
        staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes before re-fetching
    });

    const policies = policiesData.policies;
    const totalPolicies = policiesData.total;

    // Helper function to prepare policy data for submission, including image upload
    const preparePolicyData = async (data) => {
        let policyImageURL = data.image; // Assume existing image URL by default

        // If a new image file is provided, upload it using saveImgCloud
        if (data.imageFile) {
            try {
                // Correct usage: pass the File object to saveImgCloud
                const url = await saveImgCloud(data.imageFile);
                policyImageURL = url; // Assign the returned URL
                console.log("Image uploaded to:", policyImageURL);
            } catch (uploadError) {
                console.error("Failed to upload image:", uploadError);
                throw new Error("Failed to upload policy image."); // Propagate error to mutation's onError
            }
        }

        // Create the final payload for the backend, removing the temporary imageFile
        const finalPolicyData = {
            ...data,
            image: policyImageURL, // Use the new/existing URL
        };
        delete finalPolicyData.imageFile; // Clean up temporary field
        return finalPolicyData;
    };

    // Mutation for adding a new policy
    const addPolicyMutation = useMutation({
        mutationFn: async (newPolicyData) => {
            const dataWithImageUrl = await preparePolicyData(newPolicyData);
            console.log("Attempting to add policy:", dataWithImageUrl);
            const res = await axiosSecure.post('/policies', dataWithImageUrl);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['policies']); // Invalidate to refetch all policies after successful add
            Swal.fire({
                icon: 'success',
                title: 'Policy Added!',
                text: 'The new policy has been successfully added.',
                timer: 2000,
                showConfirmButton: false
            });
        },
        onError: (err) => {
            console.error('Error adding policy:', err);
            Swal.fire({
                icon: 'error',
                title: 'Failed to Add Policy',
                text: err.response?.data?.message || 'Something went wrong!',
            });
        },
    });

    // Mutation for updating an existing policy
    const updatePolicyMutation = useMutation({
        mutationFn: async (updatedPolicyData) => {
            const dataWithImageUrl = await preparePolicyData(updatedPolicyData);
            console.log("Attempting to update policy:", dataWithImageUrl);
            // Using the /policyUpdate/:id endpoint as per your backend
            const res = await axiosSecure.patch(`/policyUpdate/${updatedPolicyData._id}`, dataWithImageUrl);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['policies']); // Invalidate to refetch all policies after successful update
            Swal.fire({
                icon: 'success',
                title: 'Policy Updated!',
                text: 'The policy has been successfully updated.',
                timer: 2000,
                showConfirmButton: false
            });
        },
        onError: (err) => {
            console.error('Error updating policy:', err);
            Swal.fire({
                icon: 'error',
                title: 'Failed to Update Policy',
                text: err.response?.data?.message || 'Something went wrong!',
            });
        },
    });

    // Mutation for deleting a policy
    const deletePolicyMutation = useMutation({
        mutationFn: async (policyId) => {
            console.log("Attempting to delete policy:", policyId);
            // Corrected path to /policy/:id as per your backend route
            const res = await axiosSecure.delete(`/policy/${policyId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['policies']); // Invalidate to refetch all policies after successful delete
            Swal.fire({
                icon: 'success',
                title: 'Policy Deleted!',
                text: 'The policy has been successfully deleted.',
                timer: 2000,
                showConfirmButton: false
            });
        },
        onError: (err) => {
            console.error('Error deleting policy:', err);
            Swal.fire({
                icon: 'error',
                title: 'Failed to Delete Policy',
                text: err.response?.data?.message || 'Something went wrong!',
            });
        },
    });

    // Determine if any mutation is currently in progress
    const isMutating = addPolicyMutation.isPending || updatePolicyMutation.isPending || deletePolicyMutation.isPending;

    return {
        policies,
        totalPolicies,
        isLoading,
        error,
        addPolicy: addPolicyMutation.mutate,
        updatePolicy: updatePolicyMutation.mutate,
        deletePolicy: deletePolicyMutation.mutate,
        isAddingPolicy: addPolicyMutation.isPending,
        isUpdatingPolicy: updatePolicyMutation.isPending,
        isDeletingPolicy: deletePolicyMutation.isPending,
        isMutating,
    };
};


// =========================================================================
// PolicyModal Component (embedded in this file)
// This modal is used for both adding and editing policy details.
// =========================================================================
const PolicyModal = ({ isOpen, onClose, policyData, onSubmit, isMutating }) => {
    // Initialize formData based on whether policyData is provided (edit mode) or null (add mode)
    const [formData, setFormData] = useState(() => policyData ? {
        ...policyData,
        durationOptions: policyData.durationOptions || [],
        imageUrl: policyData.image || '', // For displaying existing image preview
        benefits: policyData.benefits && policyData.benefits.length > 0 ? policyData.benefits : [''],
    } : {
        title: '',
        category: '', // Re-added category field for new policies
        description: '',
        minAge: '',
        maxAge: '',
        coverageRange: '',
        durationOptions: [],
        basePremiumRate: '',
        imageUrl: '',
        benefits: [''],
        eligibility: '',
        premiumLogicNote: ''
    });

    // State to hold the actual image File object before upload
    const [imageFile, setImageFile] = useState(null);

    // Handles changes for text and number input fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'minAge' || name === 'maxAge' || name === 'basePremiumRate') {
            setFormData({ ...formData, [name]: Number(value) });
        } else if (name === 'durationOptions') {
            // Parse comma-separated durations into an array of numbers
            const durations = value.split(',').map(d => Number(d.trim())).filter(d => !isNaN(d) && d > 0);
            setFormData({ ...formData, [name]: durations });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Handles changes for the image file input
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file); // Store the actual file object for submission
        if (file) {
            setFormData({ ...formData, imageUrl: URL.createObjectURL(file) }); // Create a temporary URL for immediate preview
        } else {
            // If no file selected, revert image preview to existing URL or empty
            setFormData({ ...formData, imageUrl: policyData?.image || '' });
        }
    };

    // Handles changes for individual benefit input fields
    const handleBenefitChange = (index, value) => {
        const newBenefits = [...formData.benefits];
        newBenefits[index] = value;
        setFormData({ ...formData, benefits: newBenefits });
    };

    // Adds a new empty benefit input field
    const addBenefitField = () => {
        setFormData({ ...formData, benefits: [...formData.benefits, ''] });
    };

    // Removes a benefit input field at a specific index
    const removeBenefitField = (index) => {
        const newBenefits = formData.benefits.filter((_, i) => i !== index);
        setFormData({ ...formData, benefits: newBenefits.length > 0 ? newBenefits : [''] }); // Ensure at least one empty field remains
    };

    // Handles form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare data for submission, ensuring correct types and cleaning empty benefits
        const dataToSubmit = {
            ...formData,
            minAge: Number(formData.minAge),
            maxAge: Number(formData.maxAge),
            basePremiumRate: Number(formData.basePremiumRate),
            durationOptions: formData.durationOptions.map(Number),
            benefits: formData.benefits.filter(b => b.trim() !== '') // Filter out empty benefit strings
        };

        // Call the onSubmit prop with the prepared data and the image file
        onSubmit({
            ...dataToSubmit,
            imageFile: imageFile, // Pass the File object for upload
            image: policyData?.image // Pass existing image URL if no new file was selected
        });
    };

    // Closes the modal if the overlay (outside the modal content) is clicked
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    // Modal Overlay - Light gray with opacity, not black
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200 bg-opacity-50 p-4 overflow-y-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleOverlayClick} // Close on overlay click
                >
                    {/* Modal Content - Adjusted size and added internal scrolling */}
                    <motion.div
                        className="relative bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl transform overflow-y-auto max-h-[90vh]" // max-w-lg for smaller width, max-h-[90vh] for vertical fit
                        initial={{ scale: 0.9, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 50 }}
                        transition={{ duration: 0.3 }}
                        // Prevent event bubbling from content to overlay
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
                            {policyData ? 'Edit Policy' : 'Add New Policy'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Policy Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            {/* Category field re-added as per request */}
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="Term Life">Term Life</option>
                                    <option value="Senior">Senior</option>
                                    <option value="Family">Family</option>
                                    <option value="Health">Health</option>
                                    <option value="Education">Education</option>
                                    <option value="Travel">Travel</option> {/* Added Travel as an example category */}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="minAge" className="block text-sm font-medium text-gray-700 mb-1">Minimum Age</label>
                                    <input
                                        type="number"
                                        id="minAge"
                                        name="minAge"
                                        value={formData.minAge}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        required
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="maxAge" className="block text-sm font-medium text-gray-700 mb-1">Maximum Age</label>
                                    <input
                                        type="number"
                                        id="maxAge"
                                        name="maxAge"
                                        value={formData.maxAge}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        required
                                        min={formData.minAge || 0}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="coverageRange" className="block text-sm font-medium text-gray-700 mb-1">Coverage Range (e.g., 100000 – 5000000)</label>
                                <input
                                    type="text"
                                    id="coverageRange"
                                    name="coverageRange"
                                    value={formData.coverageRange}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    placeholder="e.g., 100000 – 5000000"
                                />
                            </div>

                            <div>
                                <label htmlFor="durationOptions" className="block text-sm font-medium text-gray-700 mb-1">Duration Options (comma-separated years, e.g., 5,10,15)</label>
                                <input
                                    type="text"
                                    id="durationOptions"
                                    name="durationOptions"
                                    value={formData.durationOptions.join(', ')}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    placeholder="e.g., 5,10,15"
                                />
                            </div>

                            <div>
                                <label htmlFor="basePremiumRate" className="block text-sm font-medium text-gray-700 mb-1">Base Premium Rate (e.g., 0.0003)</label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    id="basePremiumRate"
                                    name="basePremiumRate"
                                    value={formData.basePremiumRate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="policyImage" className="block text-sm font-medium text-gray-700 mb-1">Policy Image</label>
                                <input
                                    type="file"
                                    id="policyImage"
                                    name="policyImage"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {formData.imageUrl && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600 mb-1">Current/New Image Preview:</p>
                                        <img src={formData.imageUrl} alt="Policy Preview" className="w-32 h-32 object-cover rounded-lg shadow-md" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
                                {formData.benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-center gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={benefit}
                                            onChange={(e) => handleBenefitChange(index, e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholder={`Benefit ${index + 1}`}
                                        />
                                        {formData.benefits.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeBenefitField(index)}
                                                className="p-2 rounded-full text-red-500 hover:bg-red-100 transition"
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addBenefitField}
                                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    <PlusCircle className="mr-2 h-5 w-5" /> Add Benefit
                                </button>
                            </div>

                            <div>
                                <label htmlFor="eligibility" className="block text-sm font-medium text-gray-700 mb-1">Eligibility</label>
                                <textarea
                                    id="eligibility"
                                    name="eligibility"
                                    value={formData.eligibility}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                ></textarea>
                            </div>

                            <div>
                                <label htmlFor="premiumLogicNote" className="block text-sm font-medium text-gray-700 mb-1">Premium Logic Note</label>
                                <textarea
                                    id="premiumLogicNote"
                                    name="premiumLogicNote"
                                    value={formData.premiumLogicNote}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                ></textarea>
                            </div>

                            <motion.button
                                type="submit"
                                className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-teal-500 to-green-600 hover:from-teal-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isMutating}
                            >
                                {isMutating && <Loader2 className="h-5 w-5 mr-3 animate-spin" />}
                                {policyData ? (isMutating ? 'Updating Policy...' : 'Update Policy') : (isMutating ? 'Adding Policy...' : 'Add Policy')}
                            </motion.button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


// =========================================================================
// ManagePolicies Component (Main Component)
// This is the main page component that renders the policy management UI.
// =========================================================================
function ManagePolicies() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [policyToEdit, setPolicyToEdit] = useState(null); // Holds policy data when editing

    // --- State for Pagination, Filter, Search ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(9);
    const [selectedCategory, setSelectedCategory] = useState(''); // Category filter state
    const [searchTerm, setSearchTerm] = useState(''); // Search input state
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // Debounced search term for API calls

    // Debounce search term to prevent excessive API calls as user types
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timerId); // Cleanup on unmount or re-render
    }, [searchTerm]);


    // Use the custom usePolicyManagement hook to manage policy data and mutations
    const {
        policies,
        totalPolicies,
        isLoading,
        error,
        addPolicy,
        updatePolicy,
        deletePolicy,
        isMutating, // Indicates if any mutation (add, update, delete) is in progress
    } = usePolicyManagement(currentPage, itemsPerPage, selectedCategory, debouncedSearchTerm);


    // --- Pagination Logic ---
    const totalPages = Math.ceil(totalPolicies / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    };

    // --- Filter and Search Handlers ---
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setCurrentPage(1); // Reset to first page when category filter changes
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when search term changes
    };

    const handleClearFilters = () => {
        setSelectedCategory('');
        setSearchTerm('');
        setDebouncedSearchTerm(''); // Also clear the debounced term to ensure full reset
        setCurrentPage(1);
    };


    // --- Policy Management Handlers ---
    // Opens the modal for adding a new policy
    const handleAddPolicyClick = () => {
        setPolicyToEdit(null); // Set to null to indicate "add new" mode
        setIsModalOpen(true);
    };

    // Opens the modal for editing an existing policy
    const handleEditPolicyClick = (policy) => {
        setPolicyToEdit(policy); // Pass the policy data to populate the form
        setIsModalOpen(true);
    };

    // Handles policy deletion with SweetAlert2 confirmation
    const handleDeletePolicy = async (policyId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            deletePolicy(policyId); // Call the delete mutation from the hook
        }
    };

    // Handles form submission from the modal (either add or edit)
    const handlePolicyFormSubmit = (data) => {
        if (policyToEdit) {
            // If policyToEdit exists, it's an update operation
            updatePolicy({ _id: policyToEdit._id, ...data });
        } else {
            // Otherwise, it's an add operation
            addPolicy(data);
        }
        setIsModalOpen(false); // Close the modal after submission
        setPolicyToEdit(null); // Reset policyToEdit state

        // NEW: Clear the search term after adding/editing a policy
        setSearchTerm('');
        setDebouncedSearchTerm('');
    };

    // --- Loading and Error States for the main page ---
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
                <p className="text-gray-600 ml-3 text-lg">Loading policies...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <p className="text-red-600 text-xl">Error loading policies: {error.message}</p>
            </div>
        );
    }

    // Main component rendering
    return (
        <>
            <Helmet>
                <title>Manage Policies</title>
            </Helmet>
            <motion.div
                className="max-w-7xl mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">
                        Manage Policies
                    </h1>
                    <motion.button
                        onClick={handleAddPolicyClick}
                        className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
                        whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)' }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isMutating}
                    >
                        <PlusCircle className="mr-2 h-5 w-5" /> Add New Policy
                    </motion.button>
                </div>

                {/* Filter and Search Section */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    {/* Search Input */}
                    <div className="col-span-1 md:col-span-1">
                        <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-1">Search Policy</label>
                        <div className="relative">
                            <input
                                type="text"
                                id="search-input"
                                placeholder="Search by title or description..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                    </div>

                    {/* Category Filter (still present on main page for filtering policies) */}
                    <div className="col-span-1 md:col-span-1">
                        <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
                        <select
                            id="category-filter"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Categories</option>
                            <option value="Term Life">Term Life</option>
                            <option value="Senior">Senior</option>
                            <option value="Family">Family</option>
                            <option value="Health">Health</option>
                            <option value="Education">Education</option>
                            <option value="Travel">Travel</option>
                        </select>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="col-span-1 md:col-span-1">
                        {(selectedCategory || searchTerm) && (
                            <motion.button
                                onClick={handleClearFilters}
                                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-300"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <RotateCcw className="mr-2 h-4 w-4" /> Clear Filters
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Desktop Table Layout (hidden on small screens) */}
                <div className="overflow-x-auto hidden md:block">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Image</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Title</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Category</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Age Range</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Coverage</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Premium Rate</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {policies.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No policies found matching your criteria.</td>
                                </tr>
                            ) : (
                                policies.map(policy => (
                                    <tr key={policy._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <img src={policy.image} alt={policy.title} className="w-16 h-16 object-cover rounded-md shadow-sm" />
                                        </td>
                                        <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap">{policy.title}</td>
                                        <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                {policy.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-gray-700 whitespace-nowrap">{policy.minAge} - {policy.maxAge}</td>
                                        <td className="px-4 py-4 text-gray-700 whitespace-nowrap">Tk. {policy.coverageRange}</td>
                                        <td className="px-4 py-4 text-gray-700 whitespace-nowrap">{(policy.basePremiumRate * 100).toFixed(4)}%</td>
                                        <td className="px-4 py-4">
                                            <div className="flex gap-2 items-center">
                                                <motion.button
                                                    onClick={() => handleEditPolicyClick(policy)}
                                                    className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-all"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    disabled={isMutating}
                                                >
                                                    <Edit size={20} />
                                                </motion.button>
                                                <motion.button
                                                    onClick={() => handleDeletePolicy(policy._id)}
                                                    className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-all"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    disabled={isMutating}
                                                >
                                                    <Trash2 size={20} />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card Layout (hidden on large screens) */}
                <div className="md:hidden flex flex-col gap-4">
                    {policies.length === 0 ? (
                        <div className="py-8 text-center text-gray-500">No policies found matching your criteria.</div>
                    ) : (
                        policies.map(policy => (
                            <motion.div
                                key={policy._id}
                                className="w-full p-4 bg-white rounded-2xl shadow-lg border border-gray-100 transition-all hover:shadow-xl"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <img src={policy.image} alt={policy.title} className="w-20 h-20 object-cover rounded-lg shadow-md border border-gray-200" />
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-800 leading-tight">{policy.title}</h3>
                                        <span className="text-sm px-2 py-0.5 mt-1 font-medium rounded-full bg-blue-100 text-blue-800 inline-block">
                                            {policy.category}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{policy.description}</p>
                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
                                    <p><strong>Age:</strong> {policy.minAge}-{policy.maxAge}</p>
                                    <p><strong>Coverage:</strong> Tk. {policy.coverageRange}</p>
                                    <p><strong>Premium:</strong> {(policy.basePremiumRate * 100).toFixed(4)}%</p>
                                    <p><strong>Durations:</strong> {policy.durationOptions.join(', ')} Yrs</p>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <motion.button
                                        onClick={() => handleEditPolicyClick(policy)}
                                        className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-blue-500 text-white flex items-center justify-center gap-1 text-sm shadow hover:bg-blue-600 disabled:opacity-50"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={isMutating}
                                    >
                                        <Edit size={16} /> Edit
                                    </motion.button>
                                    <motion.button
                                        onClick={() => handleDeletePolicy(policy._id)}
                                        className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-red-500 text-white flex items-center justify-center gap-1 text-sm shadow hover:bg-red-600 disabled:opacity-50"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={isMutating}
                                    >
                                        <Trash2 size={16} /> Delete
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                        <motion.button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1 || isLoading || isMutating}
                            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Previous
                        </motion.button>
                        {[...Array(totalPages)].map((_, index) => (
                            <motion.button
                                key={index + 1}
                                onClick={() => handlePageChange(index + 1)}
                                className={`px-4 py-2 rounded-lg ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={isLoading || isMutating}
                            >
                                {index + 1}
                            </motion.button>
                        ))}
                        <motion.button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages || isLoading || isMutating}
                            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Next
                        </motion.button>
                    </div>
                )}

                {/* Policy Add/Edit Modal */}
                <PolicyModal
                    // Using key prop to force re-mount and reset state when switching between add/edit
                    key={policyToEdit?._id || 'new-policy'}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setPolicyToEdit(null); // Ensure policyToEdit is reset when modal closes
                    }}
                    policyData={policyToEdit} // Pass selected policy data for editing, or null for adding
                    onSubmit={handlePolicyFormSubmit} // Callback for form submission
                    isMutating={isMutating} // Pass mutation status to disable form during API calls
                />
            </motion.div>
        </>
    );
}

export default ManagePolicies;
