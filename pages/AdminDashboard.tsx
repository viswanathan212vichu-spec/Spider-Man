import React, { useState } from 'react';
import { useStore } from '../store';
import { Event } from '../types';
import { Button, Input, Modal, Badge, Card } from '../components/UI';
import { Plus, Trash2, Calendar, MapPin, Monitor, Edit2, IndianRupee, TrendingUp } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent, bookings } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Calculate Total Revenue from confirmed bookings
  const totalRevenue = bookings
    .filter(b => b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  // Form State with rows as strings for easier editing
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    location: '',
    mode: 'In-Person' as 'In-Person' | 'Online',
    category: 'General',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    tiers: [
      { name: 'Gold', price: 2000, rows: 'A, B' },
      { name: 'Silver', price: 1000, rows: 'C, D' },
      { name: 'Bronze', price: 500, rows: 'E, F' }
    ]
  });

  const handleTierChange = (index: number, field: string, value: any) => {
    const newTiers = [...formData.tiers];
    // @ts-ignore
    newTiers[index][field] = value;
    setFormData({ ...formData, tiers: newTiers });
  };

  const openCreateModal = () => {
    setEditingEventId(null);
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      location: '',
      mode: 'In-Person',
      category: 'General',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      tiers: [
        { name: 'Gold', price: 2000, rows: 'A, B' },
        { name: 'Silver', price: 1000, rows: 'C, D' },
        { name: 'Bronze', price: 500, rows: 'E, F' }
      ]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEventId(event.id);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      mode: event.mode,
      category: event.category,
      image: event.image,
      tiers: event.tiers.map(t => ({
        name: t.name,
        price: t.price,
        rows: t.rows.join(', ')
      }))
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Transform rows string back to array
    const tiersPayload = formData.tiers.map(t => ({
      name: t.name as 'Gold' | 'Silver' | 'Bronze',
      price: Number(t.price),
      rows: t.rows.split(',').map(s => s.trim()).filter(s => s.length > 0)
    }));

    const payload = {
      ...formData,
      tiers: tiersPayload
    };

    if (editingEventId) {
      updateEvent({ ...payload, id: editingEventId } as Event);
    } else {
      addEvent(payload as Omit<Event, 'id' | 'totalSeats'>);
    }
    setIsModalOpen(false);
  };

  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500">Manage your GalaPass events and pricing.</p>
        </div>
        <Button onClick={openCreateModal} icon={Plus} className="bg-indigo-600 hover:bg-indigo-700">Create New Event</Button>
      </div>

      {/* Revenue Stats */}
      <Card className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl border-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <TrendingUp className="h-32 w-32 text-white" />
        </div>
        <div className="relative z-10 flex items-center gap-6">
           <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner">
             <IndianRupee className="h-10 w-10 text-white" />
           </div>
           <div>
             <p className="text-indigo-100 font-medium text-lg mb-1">Total Revenue Generated</p>
             <h2 className="text-4xl font-extrabold tracking-tight">₹{totalRevenue.toLocaleString('en-IN')}</h2>
           </div>
        </div>
      </Card>

      <div className="grid gap-6">
        {sortedEvents.map(event => (
          <Card key={event.id} className="flex flex-col md:flex-row p-0 transition-all hover:shadow-md group">
            <div className="w-full md:w-56 h-48 md:h-auto relative overflow-hidden shrink-0">
               <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               <div className="absolute top-2 left-2">
                 <Badge variant="neutral">{event.mode}</Badge>
               </div>
            </div>
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{event.title}</h3>
                    <p className="text-sm text-slate-500 font-medium">{event.category}</p>
                  </div>
                </div>
                
                <p className="text-slate-600 text-sm line-clamp-2">{event.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    {event.mode === 'Online' ? <Monitor className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                    {event.location}
                  </div>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-2">
                   {event.tiers.map(t => (
                     <span key={t.name} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                       {t.name} ({t.rows.join(',')}): ₹{t.price}
                     </span>
                   ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <Button variant="secondary" size="sm" icon={Edit2} onClick={() => openEditModal(event)}>Edit</Button>
                <Button variant="danger" size="sm" icon={Trash2} onClick={() => handleDelete(event.id)}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEventId ? "Edit Event" : "Create New Event"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <Input 
            label="Event Title" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            required 
          />
           <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Image URL</label>
             <Input 
              value={formData.image} 
              onChange={e => setFormData({...formData, image: e.target.value})} 
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <Input 
              label="Date" 
              type="date" 
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})} 
              required 
            />
             <Input 
              label="Time" 
              type="time" 
              value={formData.time} 
              onChange={e => setFormData({...formData, time: e.target.value})} 
              required 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Mode</label>
              <select 
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                value={formData.mode}
                onChange={e => setFormData({...formData, mode: e.target.value as any})}
              >
                <option value="In-Person">In-Person</option>
                <option value="Online">Online</option>
              </select>
            </div>
             <Input 
              label="Venue / Link" 
              value={formData.location} 
              onChange={e => setFormData({...formData, location: e.target.value})} 
              required 
            />
          </div>

          <Input 
            label="Category" 
            value={formData.category} 
            onChange={e => setFormData({...formData, category: e.target.value})} 
            placeholder="e.g. Technology, Music"
            required 
          />
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
            <h4 className="font-semibold text-sm text-slate-800">Ticket Tiers & Seating</h4>
            <p className="text-xs text-slate-500 -mt-2 mb-2">Define price and assign rows (e.g. "A, B") for each tier. Seats 1-10 are auto-generated per row.</p>
            {formData.tiers.map((tier, index) => (
              <div key={tier.name} className="p-3 bg-white rounded border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-bold text-sm ${tier.name === 'Gold' ? 'text-amber-600' : tier.name === 'Silver' ? 'text-slate-500' : 'text-orange-700'}`}>
                      {tier.name} Tier
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Price (₹)</label>
                      <input 
                        type="number" 
                        value={tier.price}
                        onChange={(e) => handleTierChange(index, 'price', Number(e.target.value))}
                        className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Rows (comma separated)</label>
                      <input 
                        type="text" 
                        value={tier.rows}
                        onChange={(e) => handleTierChange(index, 'rows', e.target.value)}
                        className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-indigo-500 outline-none"
                        placeholder="e.g. A, B"
                      />
                    </div>
                  </div>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500"
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">{editingEventId ? "Update Event" : "Publish Event"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
