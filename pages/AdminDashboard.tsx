import React, { useState, useEffect } from 'react';
import { Event, getEvents, createEvent, updateEvent, deleteEvent } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import EventForm from '../components/EventForm';
import { Button, Card, Badge, Modal } from '../components/UI';
import { Plus, Trash2, Calendar, MapPin, Edit2, DollarSign, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedEvents = await getEvents();
      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'bookedCount' | 'createdBy'>) => {
    if (!user) return;

    setFormLoading(true);
    setError('');
    try {
      await createEvent(eventData, user.uid);
      await fetchEvents();
      setIsFormOpen(false);
      setSuccessMessage('Event created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'bookedCount' | 'createdBy'>) => {
    if (!editingEvent?.id) return;

    setFormLoading(true);
    setError('');
    try {
      await updateEvent(editingEvent.id, eventData);
      await fetchEvents();
      setEditingEvent(null);
      setIsFormOpen(false);
      setSuccessMessage('Event updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Failed to update event. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setError('');
    try {
      await deleteEvent(eventId);
      await fetchEvents();
      setSuccessMessage('Event deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event. Please try again.');
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const closeModal = () => {
    setIsFormOpen(false);
    setEditingEvent(null);
  };

  // Format date for display
  const formatDate = (date: Timestamp | Date | undefined) => {
    if (!date) return 'TBD';
    const dateObj = date instanceof Timestamp ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate stats
  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === 'active').length;
  const totalCapacity = events.reduce((sum, e) => sum + (e.capacity || 0), 0);
  const totalBooked = events.reduce((sum, e) => sum + (e.bookedCount || 0), 0);

  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
    const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500">Manage your GalaPass events.</p>
        </div>
        <Button onClick={openCreateModal} icon={Plus} className="bg-indigo-600 hover:bg-indigo-700">
          Create New Event
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-indigo-100 text-sm">Total Events</p>
              <p className="text-2xl font-bold">{totalEvents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-green-100 text-sm">Active Events</p>
              <p className="text-2xl font-bold">{activeEvents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-purple-100 text-sm">Total Capacity</p>
              <p className="text-2xl font-bold">{totalCapacity}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-orange-100 text-sm">Tickets Booked</p>
              <p className="text-2xl font-bold">{totalBooked}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <Card className="p-12 text-center">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Events Yet</h3>
          <p className="text-slate-500 mb-4">Create your first event to get started.</p>
          <Button onClick={openCreateModal} icon={Plus} className="bg-indigo-600 hover:bg-indigo-700">
            Create Event
          </Button>
        </Card>
      )}

      {/* Event List */}
      {!loading && events.length > 0 && (
        <div className="grid gap-4">
          {sortedEvents.map(event => (
            <Card key={event.id} className="flex flex-col md:flex-row p-0 transition-all hover:shadow-md group overflow-hidden">
              {/* Event Image */}
              <div className="w-full md:w-56 h-48 md:h-auto relative overflow-hidden shrink-0 bg-slate-100">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-slate-300" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge variant={event.status === 'active' ? 'success' : event.status === 'cancelled' ? 'danger' : 'neutral'}>
                    {event.status}
                  </Badge>
                </div>
              </div>

              {/* Event Details */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{event.title}</h3>
                    </div>
                    <span className="text-lg font-bold text-indigo-600">${event.price}</span>
                  </div>

                  <p className="text-slate-600 text-sm line-clamp-2">{event.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.venue}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {event.bookedCount || 0} / {event.capacity} booked
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                  <Button variant="secondary" size="sm" icon={Edit2} onClick={() => openEditModal(event)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" icon={Trash2} onClick={() => event.id && handleDeleteEvent(event.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeModal}
        title={editingEvent ? "Edit Event" : "Create New Event"}
      >
        <EventForm
          initialData={editingEvent || undefined}
          onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
          onCancel={closeModal}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
};
