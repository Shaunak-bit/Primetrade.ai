'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Cpu,
  Activity,
  Terminal,
  Shield,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  Zap,
  PowerOff
} from 'lucide-react';

// Regex pattern to validate RFC4122 UUID format (e.g. 8-4-4-4-12 hex chars)
const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Instructions State (backend tasks maps to instructions)
  const [instructions, setInstructions] = useState([]);
  const [loadingInstructions, setLoadingInstructions] = useState(true);

  // Modals and Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [activeInstructionId, setActiveInstructionId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending'); // backend maps status 'pending' to 'Active', 'completed' to 'Suspended'
  const [targetUserId, setTargetUserId] = useState('');

  // Notifications State
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', message: '' }

  // Redirect guest users instantly
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Fetch instructions
  const fetchInstructions = async () => {
    try {
      setLoadingInstructions(true);
      const response = await api.get('/tasks');
      if (response.data?.success) {
        setInstructions(response.data.tasks);
      }
    } catch (error) {
      console.error('Failed to load strategy nodes:', error);
      showNotification('error', error.response?.data?.message || 'Could not fetch instructions from cluster.');
    } finally {
      setLoadingInstructions(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInstructions();
    }
  }, [user]);

  // Auto-hide notifications after 4 seconds
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Open modal for dispatching new instruction
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setActiveInstructionId(null);
    setTitle('');
    setDescription('');
    setStatus('pending');
    setTargetUserId('');
    setIsModalOpen(true);
  };

  // Open modal for editing existing instruction
  const handleOpenEditModal = (task) => {
    setModalMode('edit');
    setActiveInstructionId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setTargetUserId(task.userId || '');
    setIsModalOpen(true);
  };

  // Submit modal form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showNotification('error', 'Instruction Header is required.');
      return;
    }

    // Client-side UUID format validation on Target Agent ID if provided
    if (targetUserId.trim() !== '' && !UUID_REGEX.test(targetUserId.trim())) {
      showNotification('error', 'Target Agent ID must be a valid system UUID.');
      return;
    }

    try {
      const payload = {
        title,
        description,
        status,
        ...(user.role === 'admin' && targetUserId.trim() && { userId: targetUserId.trim() })
      };

      if (modalMode === 'create') {
        const response = await api.post('/tasks', payload);
        if (response.data?.success) {
          showNotification('success', 'Strategy instruction dispatched successfully.');
          fetchInstructions();
        }
      } else {
        const response = await api.put(`/tasks/${activeInstructionId}`, payload);
        if (response.data?.success) {
          showNotification('success', 'Strategy instruction updated successfully.');
          fetchInstructions();
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Submit failed:', error);
      showNotification('error', error.response?.data?.message || 'An error occurred while dispatching configuration.');
    }
  };

  // Terminate/Delete Instruction
  const handleDeleteInstruction = async (id) => {
    if (!window.confirm('Are you sure you want to terminate this strategy node?')) return;

    try {
      const response = await api.delete(`/tasks/${id}`);
      if (response.data?.success) {
        showNotification('success', 'Strategy node terminated successfully.');
        setInstructions(prev => prev.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Termination failed:', error);
      showNotification('error', error.response?.data?.message || 'Failed to terminate strategy node.');
    }
  };

  // Quick toggle status directly from the list item (Active <-> Suspended)
  const handleQuickToggleStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const response = await api.put(`/tasks/${task.id}`, { status: nextStatus });
      if (response.data?.success) {
        setInstructions(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
        showNotification('success', `Strategy state modified to ${nextStatus === 'pending' ? 'Active' : 'Suspended'}.`);
      }
    } catch (error) {
      console.error('Quick toggle failed:', error);
      showNotification('error', error.response?.data?.message || 'Failed to modify node execution state.');
    }
  };

  // Compute stats for KPI counters
  const totalCount = instructions.length;
  const activeCount = instructions.filter(t => t.status === 'pending').length;
  const suspendedCount = totalCount - activeCount;

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-mono tracking-wider">SECURE SHIELD INITIALIZING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500/30 selection:text-brand-200">
      
      {/* Top Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-extrabold bg-gradient-to-r from-brand-400 to-emerald-400 bg-clip-text text-transparent">
              Primetrade.ai
            </span>
            <span className="h-5 w-px bg-slate-800 hidden sm:inline-block"></span>
            <span className="text-xs text-slate-500 hidden sm:inline-block font-mono uppercase tracking-widest">
              AI Trading Operations Center
            </span>
          </div>

          <div className="flex items-center space-x-4">
            
            {/* Account Details */}
            <div className="flex items-center space-x-2.5">
              {user.role === 'admin' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  <Shield className="w-3.5 h-3.5" />
                  Cluster Admin
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <User className="w-3.5 h-3.5" />
                  Trader Node
                </span>
              )}
              <span className="text-sm text-slate-400 hidden md:inline font-mono">{user.email}</span>
            </div>

            <button
              onClick={logout}
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all focus:outline-none"
              title="Terminate Operations Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        
        {/* Floating Success / Error Toasts */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce">
            <div className={`p-4 rounded-xl border shadow-2xl flex items-center gap-3 glass-premium max-w-sm ${
              notification.type === 'success'
                ? 'border-emerald-500/40 text-emerald-400'
                : 'border-red-500/40 text-red-400'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm font-semibold font-mono tracking-wide">{notification.message}</span>
            </div>
          </div>
        )}

        {/* View Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
              {user.role === 'admin' ? 'Global System Monitor Matrix' : 'Personal Active Strategy Nodes'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {user.role === 'admin'
                ? 'Consolidated operational console to inspect and supervise running strategy codes.'
                : 'Manage and trigger real-time AI execution instructions for trade configurations.'}
            </p>
          </div>
          
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold text-sm py-3.5 px-5 shadow-lg shadow-brand-500/20 transition-all focus:outline-none"
          >
            <Plus className="w-4 h-4" />
            Dispatch Agent Instruction
          </button>
        </div>

        {/* Operation Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Total */}
          <div className="glass rounded-2xl p-6 relative overflow-hidden border border-slate-900">
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.03]">
              <Terminal className="w-32 h-32 text-slate-400" />
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Dispatched Strategies</p>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-2 font-mono">{loadingInstructions ? '...' : totalCount}</h3>
          </div>

          {/* Card 2: Active */}
          <div className="glass rounded-2xl p-6 relative overflow-hidden border border-slate-900">
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.03]">
              <Activity className="w-32 h-32 text-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Active Nodes</p>
            <h3 className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono flex items-center gap-2">
              {loadingInstructions ? '...' : activeCount}
              {!loadingInstructions && activeCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              )}
            </h3>
          </div>

          {/* Card 3: Suspended */}
          <div className="glass rounded-2xl p-6 relative overflow-hidden border border-slate-900">
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.03]">
              <Cpu className="w-32 h-32 text-amber-400" />
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Suspended Nodes</p>
            <h3 className="text-3xl font-extrabold text-amber-500 mt-2 font-mono">{loadingInstructions ? '...' : suspendedCount}</h3>
          </div>

        </div>

        {/* Matrix Console */}
        <div className="glass rounded-2xl overflow-hidden shadow-2xl border border-slate-900">
          {loadingInstructions ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500 font-mono">RETRIEVING NODE CONFIGS...</p>
            </div>
          ) : instructions.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-500">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-300 font-mono">No strategy instructions configured</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm font-sans">
                {user.role === 'admin' 
                  ? 'There are currently no active system instructions in the cluster.'
                  : 'Get started by dispatching your first strategy node to the cluster.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 bg-slate-900/40">
                    <th className="p-5 text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Execution State</th>
                    <th className="p-5 text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Strategy & Operational Bounds</th>
                    
                    {/* Admin Specific Column Header */}
                    {user.role === 'admin' && (
                      <th className="p-5 text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Trader Account Context (UUID)</th>
                    )}

                    <th className="p-5 text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Dispatched Time</th>
                    <th className="p-5 text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono text-right">Control Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/50">
                  {instructions.map(instruction => (
                    <tr key={instruction.id} className="hover:bg-slate-900/30 transition-colors">
                      
                      {/* State column */}
                      <td className="p-5">
                        <button
                          onClick={() => handleQuickToggleStatus(instruction)}
                          className="flex items-center focus:outline-none"
                          title={`Click to ${instruction.status === 'completed' ? 'Activate' : 'Suspend'} Strategy`}
                        >
                          {instruction.status === 'pending' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                              Suspended
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Info & Bounds Column */}
                      <td className="p-5">
                        <div>
                          <p className={`text-sm font-semibold font-mono ${
                            instruction.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-200'
                          }`}>
                            {instruction.title}
                          </p>
                          {instruction.description && (
                            <p className="text-xs text-slate-400 mt-1.5 font-sans leading-relaxed max-w-md truncate">
                              {instruction.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Admin Specific Column Data */}
                      {user.role === 'admin' && (
                        <td className="p-5">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-300 font-mono">
                              {instruction.user?.email || 'System Account'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono mt-1 select-all border border-slate-900 bg-slate-950 py-0.5 px-1.5 rounded w-max">
                              {instruction.userId}
                            </span>
                          </div>
                        </td>
                      )}

                      {/* Dispatched Time Column */}
                      <td className="p-5 text-xs text-slate-500 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-600" />
                          {new Date(instruction.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>

                      {/* Control Actions buttons */}
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(instruction)}
                            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 hover:border-slate-700 transition-all focus:outline-none"
                            title="Edit strategy bounds"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteInstruction(instruction.id)}
                            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-950/20 hover:border-red-900/50 transition-all focus:outline-none"
                            title="Terminate strategy node"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      {/* Modal - Dispatch Agent Instruction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="glass-premium rounded-2xl w-full max-w-lg shadow-2xl relative border border-slate-850 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-900 flex items-center justify-between">
              <h3 className="text-md font-bold text-slate-100 font-mono tracking-wider flex items-center gap-2">
                {modalMode === 'create' ? (
                  <>
                    <Zap className="w-4 h-4 text-brand-400" />
                    Dispatch Agent Instruction
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4 text-brand-400" />
                    Modify Strategy Code
                  </>
                )}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              
              {/* Title / Strategy Header */}
              <div>
                <label htmlFor="strategy-title" className="block text-xs font-semibold text-slate-300 uppercase tracking-widest font-mono mb-2">
                  Instruction Header / Strategy Title
                </label>
                <input
                  id="strategy-title"
                  type="text"
                  required
                  placeholder="e.g. BTC Momentum Breakout"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 text-slate-100 placeholder-slate-500 rounded-xl py-3 px-4 text-sm font-mono focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>

              {/* Description / Bounds */}
              <div>
                <label htmlFor="strategy-description" className="block text-xs font-semibold text-slate-300 uppercase tracking-widest font-mono mb-2">
                  Operational Parameters / Strategy Bounds
                </label>
                <textarea
                  id="strategy-description"
                  rows="3"
                  placeholder="e.g. Execute long if volume spikes 20% over 5m SMA"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 text-slate-100 placeholder-slate-500 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand-500 transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Selectors grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* State selector */}
                <div>
                  <label htmlFor="strategy-status" className="block text-xs font-semibold text-slate-300 uppercase tracking-widest font-mono mb-2">
                    Execution State
                  </label>
                  <select
                    id="strategy-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 text-slate-100 rounded-xl py-3 px-4 text-sm font-mono focus:outline-none focus:border-brand-500 transition-all"
                  >
                    <option value="pending">Active</option>
                    <option value="completed">Suspended</option>
                  </select>
                </div>

                {/* Admin Assignment Input */}
                {user.role === 'admin' && (
                  <div>
                    <label htmlFor="target-agent-id" className="block text-xs font-semibold text-slate-300 uppercase tracking-widest font-mono mb-2">
                      Target Agent ID (Optional UUID)
                    </label>
                    <input
                      id="target-agent-id"
                      type="text"
                      placeholder="Paste System UUID..."
                      value={targetUserId}
                      onChange={(e) => setTargetUserId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 text-slate-100 placeholder-slate-650 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand-500 transition-all font-mono"
                    />
                  </div>
                )}

              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-900 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-850 hover:bg-slate-850 transition-all focus:outline-none font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl px-6 py-3 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all focus:outline-none font-mono flex items-center gap-1.5"
                >
                  {modalMode === 'create' ? (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      Dispatch
                    </>
                  ) : (
                    <>
                      <PowerOff className="w-3.5 h-3.5" />
                      Save
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
