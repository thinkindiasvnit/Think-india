"use client";

import { useEffect, useState } from "react";
import AdminNav from "../../../components/AdminNav";
import { getQueries, updateQueryStatus, deleteQuery, ContactQuery } from "../../../lib/queriesService";

export default function QueriesAdminPage() {
  const [queries, setQueries] = useState<ContactQuery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const data = await getQueries();
      setQueries(data);
    } catch (error) {
      console.error("Failed to fetch queries", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (query: ContactQuery) => {
    if (!query.id) return;
    const newStatus = query.status === "pending" ? "resolved" : "pending";
    try {
      await updateQueryStatus(query.id, newStatus);
      setQueries(queries.map(q => q.id === query.id ? { ...q, status: newStatus } : q));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this query?")) {
      try {
        await deleteQuery(id);
        setQueries(queries.filter(q => q.id !== id));
      } catch (error) {
        console.error("Failed to delete query", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-orange-glow-radial-light bg-amber-grid-pattern-light text-slate-950 font-sans pt-32 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Admin Sub-nav ── */}
        <AdminNav />

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-300 pb-6 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 font-heading">
              Contact Queries
            </h1>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              Manage messages sent from the Contact Us page.
            </p>
          </div>
          <button 
            onClick={fetchQueries} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20 transition-all duration-200"
          >
            Refresh Queries
          </button>
        </div>

        {/* ── Table Container ── */}
        <div className="bg-white border border-amber-300 rounded-3xl shadow-xl overflow-hidden">
          
          {/* Table toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-b border-amber-200">
            <p className="text-sm font-semibold text-slate-700">
              {queries.length} quer{queries.length !== 1 ? "ies" : "y"}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
              <span className="mt-4 text-sm font-bold text-slate-800">Loading queries...</span>
            </div>
          ) : queries.length === 0 ? (
            <div className="text-center py-16 text-slate-700">
              <p className="text-lg font-bold text-slate-950 font-heading">No queries found yet.</p>
              <p className="text-sm mt-1">Wait for someone to contact you through the form.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-amber-100/70 border-b border-amber-300 text-xs font-black uppercase text-amber-950 tracking-wider font-heading">
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Details</th>
                    <th className="py-4 px-6">Query</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-200 text-sm text-slate-900 font-semibold">
                  {queries.map((q) => (
                    <tr key={q.id} className="hover:bg-amber-50/60 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap text-slate-700">
                        {new Date(q.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-slate-950 font-heading">{q.name}</div>
                        <a href={`mailto:${q.email}`} className="text-amber-700 hover:underline">{q.email}</a>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-slate-800 max-w-sm whitespace-pre-wrap">{q.query}</div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 text-xs font-black uppercase rounded shadow-sm ${
                          q.status === 'resolved' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => handleToggleStatus(q)}
                          className="px-3 py-1 text-xs font-bold border border-slate-300 hover:bg-slate-100 rounded transition-colors text-slate-700"
                        >
                          Mark {q.status === 'pending' ? 'Resolved' : 'Pending'}
                        </button>
                        <button
                          onClick={() => q.id && handleDelete(q.id)}
                          className="px-3 py-1 text-xs font-bold border border-red-300 bg-red-50 hover:bg-red-100 rounded transition-colors text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
