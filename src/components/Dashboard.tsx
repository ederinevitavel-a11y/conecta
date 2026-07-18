import { CommunityEvent } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, DollarSign, Users, Award, Download, ShieldCheck, AlertCircle } from 'lucide-react';

interface DashboardProps {
  events: CommunityEvent[];
}

export default function Dashboard({ events }: DashboardProps) {
  // Financial computations
  const totalRevenue = events.reduce((sum, e) => sum + e.revenue, 0);
  const totalExpense = events.reduce((sum, e) => sum + e.expense, 0);
  const totalProfit = totalRevenue - totalExpense;
  const totalAttendees = events.reduce((sum, e) => sum + e.attendees, 0);
  const averageAttendees = events.length > 0 ? Math.round(totalAttendees / events.length) : 0;

  // Format currencies
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Export to CSV function
  const handleExportCSV = () => {
    if (events.length === 0) return;
    
    const headers = ['Titulo', 'Tema', 'Data', 'Receita Bruta (R$)', 'Despesas Totais (R$)', 'Lucro Liquido (R$)', 'Participantes'];
    const rows = events.map(e => [
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.theme}"`,
      e.date,
      e.revenue.toFixed(2),
      e.expense.toFixed(2),
      (e.revenue - e.expense).toFixed(2),
      e.attendees
    ]);
    
    // Add BOM for UTF-8 compatibility with Excel
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `conecta_central_relatorio_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Data for charts
  const chartData = events.map(e => ({
    name: e.title.length > 15 ? `${e.title.slice(0, 15)}...` : e.title,
    theme: e.theme,
    'Receita Bruta': e.revenue,
    'Despesa Total': e.expense,
    'Lucro Líquido': e.revenue - e.expense,
    'Participantes': e.attendees,
  })).reverse(); // Order from oldest to newest if needed

  return (
    <div className="space-y-8">
      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-xs flex items-start justify-between transition-colors duration-200">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono tracking-wider uppercase">
              Receita Bruta Total
            </span>
            <div className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Arrecadação total de todos os eventos
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-xs flex items-start justify-between transition-colors duration-200">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono tracking-wider uppercase">
              Despesas Totais
            </span>
            <div className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Custos e gastos operacionais
            </p>
          </div>
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40">
            <TrendingUp className="w-6 h-6 rotate-180" />
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-xs flex items-start justify-between transition-colors duration-200">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono tracking-wider uppercase">
              Lucro Líquido Acumulado
            </span>
            <div className={`text-2xl font-bold font-display ${totalProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {formatCurrency(totalProfit)}
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500">
              {totalProfit >= 0 ? 'Resultado positivo acumulado' : 'Atenção ao orçamento da comunidade'}
            </p>
          </div>
          <div className={`p-3 rounded-xl border ${totalProfit >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40' : 'bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 border-red-100 dark:border-red-900/40'}`}>
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Community Engagement */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-xs flex items-start justify-between transition-colors duration-200">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono tracking-wider uppercase">
              Alcance da Comunidade
            </span>
            <div className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              {totalAttendees.toLocaleString()}
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500">
              {averageAttendees > 0 ? `Média de ${averageAttendees} participantes por evento` : 'Nenhum participante ainda'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Charts & Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Finance Comparison Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-xs lg:col-span-2 space-y-4 transition-colors duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                Desempenho Financeiro Unificado
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Comparativo de Receita, Despesas e Lucro por Evento
              </p>
            </div>
            {events.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 text-white rounded-lg transition-colors duration-200 text-xs font-medium cursor-pointer shadow-xs border dark:border-slate-700 self-start sm:self-center"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Relatório</span>
              </button>
            )}
          </div>

          <div className="h-72 w-full pt-4">
            {events.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="opacity-40 dark:opacity-10" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', borderRadius: '12px', border: '1px solid var(--tooltip-border, #e2e8f0)', fontSize: '12px' }}
                    formatter={(value: any) => [formatCurrency(Number(value))]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Receita Bruta" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Despesa Total" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Lucro Líquido" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/40 border border-dashed border-gray-200 dark:border-slate-800 rounded-xl p-6 text-center text-gray-500 dark:text-slate-400">
                <AlertCircle className="w-8 h-8 text-gray-400 dark:text-slate-600 mb-2" />
                <p className="text-sm font-medium">Nenhum dado financeiro para exibir</p>
                <p className="text-xs">Cadastre novos eventos para preencher o gráfico.</p>
              </div>
            )}
          </div>
        </div>

        {/* Engagement Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-xs space-y-4 transition-colors duration-200">
          <div>
            <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
              Métricas de Adesão
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Volume de participantes por evento da comunidade
            </p>
          </div>

          <div className="h-72 w-full pt-4">
            {events.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAttendees" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="opacity-40 dark:opacity-10" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', borderRadius: '12px', border: '1px solid var(--tooltip-border, #e2e8f0)', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="Participantes" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorAttendees)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/40 border border-dashed border-gray-200 dark:border-slate-800 rounded-xl p-6 text-center text-gray-500 dark:text-slate-400">
                <Users className="w-8 h-8 text-gray-400 dark:text-slate-600 mb-2" />
                <p className="text-sm font-medium">Sem dados de engajamento</p>
                <p className="text-xs">Os gráficos de adesão aparecerão após adicionar os eventos.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Community Transparency Box */}
      <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/30 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-200">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0 border dark:border-emerald-900/40">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              Transparência Coletiva & Planejamento
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl mt-0.5 leading-relaxed">
              Este dashboard apoia o planejamento bimestral garantindo a viabilidade financeira de cada encontro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
