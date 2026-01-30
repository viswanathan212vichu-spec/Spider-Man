import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, DollarSign, Users, FileText, Image, X } from 'lucide-react';
import { Event } from '../services/eventService';
import { Timestamp } from 'firebase/firestore';

interface EventFormProps {
    initialData?: Event;
    onSubmit: (data: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'bookedCount' | 'createdBy'>) => Promise<void>;
    onCancel: () => void;
    loading: boolean;
}

export const EventForm: React.FC<EventFormProps> = ({ initialData, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        venue: '',
        price: 0,
        capacity: 1,
        imageUrl: '',
        status: 'active' as 'active' | 'cancelled' | 'completed',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Populate form with initial data when editing
    useEffect(() => {
        if (initialData) {
            // Convert Timestamp to datetime-local format
            let dateValue = '';
            if (initialData.date) {
                const dateObj = initialData.date instanceof Timestamp
                    ? initialData.date.toDate()
                    : new Date(initialData.date);
                dateValue = dateObj.toISOString().slice(0, 16);
            }

            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                date: dateValue,
                venue: initialData.venue || '',
                price: initialData.price || 0,
                capacity: initialData.capacity || 1,
                imageUrl: initialData.imageUrl || '',
                status: initialData.status || 'active',
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }
        if (!formData.date) {
            newErrors.date = 'Date and time are required';
        } else {
            const eventDate = new Date(formData.date);
            if (eventDate <= new Date()) {
                newErrors.date = 'Event date must be in the future';
            }
        }
        if (!formData.venue.trim()) {
            newErrors.venue = 'Venue is required';
        }
        if (formData.price < 0) {
            newErrors.price = 'Price cannot be negative';
        }
        if (formData.capacity < 1) {
            newErrors.capacity = 'Capacity must be at least 1';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        // Convert date string to Date object for Firestore
        const eventData = {
            ...formData,
            date: new Date(formData.date),
        };

        await onSubmit(eventData);
    };

    const inputClasses = "w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
    const errorClasses = "text-red-500 text-xs mt-1";

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {initialData ? 'Edit Event' : 'Create New Event'}
                </h2>
                <button
                    onClick={onCancel}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    type="button"
                >
                    <X className="h-5 w-5 text-gray-500" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div>
                    <label htmlFor="title" className={labelClasses}>Event Title *</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter event title"
                            className={inputClasses}
                        />
                    </div>
                    {errors.title && <p className={errorClasses}>{errors.title}</p>}
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className={labelClasses}>Description *</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe your event..."
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                    />
                    {errors.description && <p className={errorClasses}>{errors.description}</p>}
                </div>

                {/* Date & Time */}
                <div>
                    <label htmlFor="date" className={labelClasses}>Date & Time *</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="datetime-local"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>
                    {errors.date && <p className={errorClasses}>{errors.date}</p>}
                </div>

                {/* Venue */}
                <div>
                    <label htmlFor="venue" className={labelClasses}>Venue *</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            id="venue"
                            name="venue"
                            value={formData.venue}
                            onChange={handleChange}
                            placeholder="Event location"
                            className={inputClasses}
                        />
                    </div>
                    {errors.venue && <p className={errorClasses}>{errors.venue}</p>}
                </div>

                {/* Price and Capacity Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="price" className={labelClasses}>Price ($) *</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                className={inputClasses}
                            />
                        </div>
                        {errors.price && <p className={errorClasses}>{errors.price}</p>}
                    </div>

                    <div>
                        <label htmlFor="capacity" className={labelClasses}>Capacity *</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="number"
                                id="capacity"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleChange}
                                min="1"
                                className={inputClasses}
                            />
                        </div>
                        {errors.capacity && <p className={errorClasses}>{errors.capacity}</p>}
                    </div>
                </div>

                {/* Image URL */}
                <div>
                    <label htmlFor="imageUrl" className={labelClasses}>Image URL (optional)</label>
                    <div className="relative">
                        <Image className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="url"
                            id="imageUrl"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                            className={inputClasses}
                        />
                    </div>
                </div>

                {/* Status (for editing) */}
                {initialData && (
                    <div>
                        <label htmlFor="status" className={labelClasses}>Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        >
                            <option value="active">Active</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium disabled:bg-gray-400"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : (initialData ? 'Update Event' : 'Create Event')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EventForm;
