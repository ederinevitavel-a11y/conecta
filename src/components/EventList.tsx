import { useState } from 'react';
import { CommunityEvent } from '../types';
import {
  Search,
  Calendar,
  DollarSign,
  Users,
  Edit3,
  Trash2,
  ExternalLink,
  Plus,
  Compass,
  AlertTriangle,
  Flame,
  BadgeCheck
} from 'lucide-react';

interface EventListProps {
  events: CommunityEvent[];
  onEdit: (event: CommunityEvent) => void;
  onDelete: (event: CommunityEvent) => Promise<void>;
  onAddNewClick: () => void;
  onSeed?: () => Promise<void>;
}

export default function EventList({ events, onEdit, onDelete, onAddNewClick, onSeed }: EventListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThemeFilter, setSelectedThemeFilter] = useState<string>('Todos');

  // Check if event is within 14 days from now (coming soon)
  const isEventSoon = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    // Reset hours to avoid subtle timezone mismatches
    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const timeDiff = eventDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff >= 0 && daysDiff <= 14;
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  // Format Currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Filtering events
  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTheme = selectedThemeFilter === 'Todos' || e.theme === selectedThemeFilter;
    
    return matchesSearch && matchesTheme;
  });

  const handleDeleteClick = async (event: CommunityEvent) => {
    const confirmed = window.confirm(
      `Você tem certeza de que deseja remover o evento "${event.title}"?\n${
        event.calendarEventId ? 'Aviso: O registro correspondente na Agenda do Google também será removido!' : ''
      }`
    );
    if (confirmed) {
      await onDelete(event);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtering and Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-xs transition-colors duration-200">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar eventos bimestrais..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all duration-150 text-sm text-slate-800 dark:text-slate-200"
          />
        </div>

        {/* Filter Selection and Add New Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Theme Dropdown */}
          <select
            value={selectedThemeFilter}
            onChange={(e) => setSelectedThemeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-900 outline-none cursor-pointer transition-all duration-150"
          >
            <option value="Todos">Todos os Temas</option>
            <option value="Festival de Inverno">Festival de Inverno</option>
            <option value="Cine Central">Cine Central</option>
            <option value="Almoço Tropical">Almoço Tropical</option>
            <option value="Outro">Outro Tema</option>
          </select>

          {/* Add New Event Button */}
          <button
            onClick={onAddNewClick}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 text-white text-sm font-medium rounded-xl transition-all duration-150 cursor-pointer shadow-xs border dark:border-slate-700"
          >
            <Plus className="w-4.5 h-4.5 text-emerald-400" />
            <span>Novo Encontro</span>
          </button>
        </div>
      </div>

      {/* Grid of Events */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const soon = isEventSoon(event.date);
            const netProfit = event.revenue - event.expense;

            return (
              <div
                key={event.id}
                className={`relative bg-white dark:bg-slate-900 rounded-2xl border ${
                  soon ? 'border-orange-200 dark:border-orange-900 shadow-sm' : 'border-gray-150 dark:border-slate-800'
                } hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col`}
              >
                {/* Coming Soon Alert Header */}
                {soon && (
                  <div className="bg-orange-500 text-white px-4 py-1 flex items-center justify-center space-x-1 text-xs font-semibold uppercase tracking-wider">
                    <Flame className="w-3.5 h-3.5 animate-pulse" />
                    <span>Acontece em Breve!</span>
                  </div>
                )}

                {/* Event Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  
                  {/* Title and Theme */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                        {event.theme}
                      </span>
                      {event.revenue === 0 && event.expense === 0 && event.attendees === 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
                          📝 Planejado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                          ✅ Resultados
                        </span>
                      )}
                      {event.calendarEventId && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40 font-mono">
                          <BadgeCheck className="w-3 h-3 text-indigo-500 dark:text-indigo-400 mr-1" />
                          Agenda
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold font-display text-slate-900 dark:text-white leading-tight pt-1">
                      {event.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-medium flex items-center">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 mr-1 shrink-0" />
                      {formatDate(event.date)}
                    </p>
                  </div>

                  {/* Description */}
                  {event.description && (
                    <p className="text-xs text-gray-600 dark:text-slate-300 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  {/* Financial & Engagement Metrics Box */}
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl space-y-2 border border-slate-100 dark:border-slate-850/60 font-mono text-xs relative">
                    {/* Revenue */}
                    <div className="flex items-center justify-between text-gray-500 dark:text-slate-400">
                      <span>Receita Bruta:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{event.revenue > 0 ? formatCurrency(event.revenue) : '—'}</span>
                    </div>
                    {/* Expense */}
                    <div className="flex items-center justify-between text-gray-500 dark:text-slate-400">
                      <span>Despesas:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{event.expense > 0 ? formatCurrency(event.expense) : '—'}</span>
                    </div>
                    {/* Profit */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 dark:border-slate-800">
                      <span className="font-sans font-medium text-slate-700 dark:text-slate-300">Lucro Líquido:</span>
                      <span className={`font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {event.revenue > 0 || event.expense > 0 ? formatCurrency(netProfit) : '—'}
                      </span>
                    </div>
                    {/* Attendance */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 dark:border-slate-800 text-gray-500 dark:text-slate-400">
                      <span className="font-sans font-medium text-slate-700 dark:text-slate-300 flex items-center">
                        <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mr-1" /> Participantes:
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{event.attendees > 0 ? event.attendees : '—'}</span>
                    </div>

                    {event.revenue === 0 && event.expense === 0 && event.attendees === 0 && (
                      <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 mt-1">
                        <button
                          onClick={() => onEdit(event)}
                          className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/45 text-indigo-700 dark:text-indigo-400 font-bold rounded-lg text-[10px] font-sans transition-all duration-150 flex items-center justify-center space-x-1 cursor-pointer border border-indigo-150 dark:border-indigo-900/40"
                        >
                          <Plus className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                          <span>Preencher Resultados / Finanças</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Creator and Actions Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono truncate max-w-[150px]" title={`Criado por: ${event.creatorEmail}`}>
                      Autor: {event.creatorEmail.split('@')[0]}
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEdit(event)}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors duration-150 cursor-pointer flex items-center justify-center"
                        title="Editar Evento"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(event)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors duration-150 cursor-pointer flex items-center justify-center"
                        title="Excluir Evento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : events.length === 0 ? (
        <div className="py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-150 dark:border-slate-800 text-center flex flex-col items-center justify-center space-y-4 px-6 shadow-xs">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
            <Compass className="w-8 h-8 animate-pulse text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold font-display text-slate-800 dark:text-slate-200">
              Nenhum Encontro Bimestral Cadastrado
            </h4>
            <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
              Seu painel do Conecta Central está vazio! Deseja carregar os encontros temáticos de demonstração planejados para <strong>ederlcs@hotmail.com</strong>?
            </p>
          </div>
          {onSeed && (
            <button
              onClick={onSeed}
              className="px-5 py-2.5 bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer border dark:border-indigo-800"
            >
              Carregar Eventos Temáticos de Demonstração
            </button>
          )}
        </div>
      ) : (
        <div className="py-12 bg-white dark:bg-slate-900 rounded-2xl border border-gray-150 dark:border-slate-800 text-center flex flex-col items-center justify-center space-y-3 px-4">
          <Compass className="w-12 h-12 text-slate-300 dark:text-slate-600 animate-bounce" />
          <h4 className="text-base font-bold font-display text-slate-800 dark:text-slate-200">
            Nenhum encontro localizado
          </h4>
          <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm">
            Nenhum evento corresponde à pesquisa ou filtro selecionados. Toque em "Novo Encontro" para adicionar ou mude o filtro.
          </p>
        </div>
      )}
    </div>
  );
}
