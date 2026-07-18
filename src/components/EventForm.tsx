import React, { useState, useEffect } from 'react';
import { CommunityEvent } from '../types';
import { X, Calendar, DollarSign, Users, Sparkles, FileText, Check } from 'lucide-react';

interface EventFormProps {
  eventToEdit?: CommunityEvent | null;
  onSave: (eventData: Omit<CommunityEvent, 'id' | 'creatorUid' | 'creatorEmail'>, syncToCalendar: boolean) => Promise<void>;
  onClose: () => void;
  hasCalendarToken: boolean;
}

export default function EventForm({ eventToEdit, onSave, onClose, hasCalendarToken }: EventFormProps) {
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState<CommunityEvent['theme']>('Festival de Inverno');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [revenue, setRevenue] = useState(0);
  const [expense, setExpense] = useState(0);
  const [attendees, setAttendees] = useState(0);
  const [isPlanningOnly, setIsPlanningOnly] = useState(true);
  const [syncToCalendar, setSyncToCalendar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load values if we are editing an event
  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setTheme(eventToEdit.theme);
      setDescription(eventToEdit.description);
      setDate(eventToEdit.date);
      setRevenue(eventToEdit.revenue);
      setExpense(eventToEdit.expense);
      setAttendees(eventToEdit.attendees);
      setSyncToCalendar(!!eventToEdit.calendarEventId);
      if (eventToEdit.revenue > 0 || eventToEdit.expense > 0 || eventToEdit.attendees > 0) {
        setIsPlanningOnly(false);
      } else {
        setIsPlanningOnly(true);
      }
    } else {
      // Default date to today's date
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setIsPlanningOnly(true);
    }
  }, [eventToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validations
    if (!title.trim() || title.length < 3) {
      setError('O título deve ter pelo menos 3 caracteres.');
      return;
    }
    if (!date) {
      setError('Por favor, selecione uma data para o evento.');
      return;
    }
    if (!isPlanningOnly && (revenue < 0 || expense < 0 || attendees < 0)) {
      setError('Valores financeiros e de participantes devem ser maiores ou iguais a zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (syncToCalendar && !hasCalendarToken) {
        // Double check token if calendar is checked
        const confirmed = window.confirm(
          "A sincronização com o Google Calendar requer autorização. Deseja prosseguir?"
        );
        if (!confirmed) {
          setIsSubmitting(false);
          return;
        }
      }

      await onSave({
        title: title.trim(),
        theme,
        description: description.trim(),
        date,
        revenue: isPlanningOnly ? 0 : revenue,
        expense: isPlanningOnly ? 0 : expense,
        attendees: isPlanningOnly ? 0 : attendees,
      }, syncToCalendar);
      
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Ocorreu um erro ao salvar o evento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 transition-colors duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh] transition-all duration-150 animate-fade-in">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-bold text-lg">
              {eventToEdit ? 'Editar Evento Bimestral' : 'Novo Evento Bimestral'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors duration-150 rounded-lg p-1.5 hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-slate-800 dark:text-slate-100">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start space-x-2">
              <span className="font-bold shrink-0">Erro:</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Título do Evento
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: 5ª Edição do Festival de Inverno"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all duration-200 text-sm text-slate-950 dark:text-slate-100 font-medium"
                />
              </div>
            </div>

            {/* Theme & Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Theme */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Tema Principal
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as CommunityEvent['theme'])}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all duration-200 text-sm text-slate-950 dark:text-slate-100 font-medium cursor-pointer"
                >
                  <option value="Festival de Inverno">Festival de Inverno</option>
                  <option value="Cine Central">Cine Central</option>
                  <option value="Almoço Tropical">Almoço Tropical</option>
                  <option value="Outro">Outro (Customizado)</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Data do Encontro
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all duration-200 text-sm text-slate-950 dark:text-slate-100 font-mono font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Descrição Detalhada
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes sobre a programação, atrações, cardápio, objetivos comunitários..."
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all duration-200 text-sm text-slate-950 dark:text-slate-100"
              />
            </div>

            {/* Stage/Workflow selection */}
            <div className="border-t border-gray-100 dark:border-slate-800 pt-4 space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Fluxo de Cadastro do Evento
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsPlanningOnly(true)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer text-center ${
                    isPlanningOnly
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  📝 Planejamento Inicial
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlanningOnly(false)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer text-center ${
                    !isPlanningOnly
                      ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  📊 Resultados & Finanças
                </button>
              </div>
            </div>

            {/* Finance & Engagement Grid */}
            <div className="border-t border-gray-100 dark:border-slate-800 pt-4 space-y-4">
              {isPlanningOnly ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850/60 rounded-xl space-y-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                    <Sparkles className="w-4 h-4 text-amber-500 mr-1.5 shrink-0" />
                    Modo Planejamento Ativo
                  </p>
                  <p>
                    As métricas de <strong>Receita</strong>, <strong>Despesas</strong> e <strong>Participantes</strong> serão salvas automaticamente como <strong>zero</strong> neste primeiro momento.
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                    Isso permite que você defina a data, tema e descrição agora, e preencha os resultados financeiros consolidados mais tarde clicando em <strong>"Preencher Resultados"</strong> diretamente no card do evento.
                  </p>
                </div>
              ) : (
                <>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                    Métricas e Finanças do Evento
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Revenue */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Receita Bruta (R$)
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={revenue || ''}
                          onChange={(e) => setRevenue(Math.max(0, parseFloat(e.target.value) || 0))}
                          placeholder="0.00"
                          className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all duration-200 text-sm text-slate-950 dark:text-slate-100 font-mono"
                        />
                      </div>
                    </div>

                    {/* Expense */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Despesa Total (R$)
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={expense || ''}
                          onChange={(e) => setExpense(Math.max(0, parseFloat(e.target.value) || 0))}
                          placeholder="0.00"
                          className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all duration-200 text-sm text-slate-950 dark:text-slate-100 font-mono"
                        />
                      </div>
                    </div>

                    {/* Attendees */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Participantes
                      </label>
                      <div className="relative">
                        <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={attendees || ''}
                          onChange={(e) => setAttendees(Math.max(0, parseInt(e.target.value) || 0))}
                          placeholder="0"
                          className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all duration-200 text-sm text-slate-950 dark:text-slate-100 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Automatic Profit Calculator Box */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850/60 flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-500 dark:text-slate-400 font-sans font-medium">Lucro Líquido Calculado:</span>
                    <span className={`font-bold font-display text-sm ${revenue - expense >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(revenue - expense)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Google Calendar Sync Option */}
            {!eventToEdit && (
              <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
                <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/10 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 transition-colors duration-150 select-none">
                  <input
                    type="checkbox"
                    checked={syncToCalendar}
                    onChange={(e) => setSyncToCalendar(e.target.checked)}
                    className="mt-1 h-4.5 w-4.5 rounded-sm border-indigo-300 dark:border-indigo-850 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 font-display block">
                      Agendar no Google Calendar
                    </span>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-400 leading-tight">
                      Cria e salva este evento automaticamente na sua agenda primária do Google com alertas de notificação habilitados.
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl transition-colors duration-150 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 disabled:bg-slate-400 dark:disabled:bg-slate-700 text-white text-sm font-medium rounded-xl transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer shadow-md border dark:border-slate-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{eventToEdit ? 'Salvar Alterações' : 'Criar Encontro'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
