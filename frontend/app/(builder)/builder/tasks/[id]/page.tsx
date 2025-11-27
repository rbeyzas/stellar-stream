'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Task, KPI } from '@/types/task';

export default function BuilderTaskDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/tasks/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTask(data);
        }
      } catch (e) {
        console.error('Error loading task', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Task not found</p>
        <Link href="/builder/tasks" className="inline-block mt-4">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border hover:bg-gray-200">
            Back to Tasks
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
          <p className="text-gray-500 mt-1">
            {task.type} • {task.status}
          </p>
        </div>
        <Link href="/builder/tasks">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border hover:bg-gray-200">
            Back
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {task.description}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            {task.location && (
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{task.location}</span>
              </div>
            )}
            {task.date && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(task.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span className="font-semibold">${task.budget}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
            <TrendingUp className="w-4 h-4" />
            <span>KPIs</span>
          </div>
          <div className="space-y-2">
            {(task.kpis ?? []).length === 0 ? (
              <div className="text-gray-500 text-sm">No KPIs specified.</div>
            ) : (
              (task.kpis ?? []).map((kpi: KPI, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="text-gray-900 font-medium">{kpi.name}</div>
                  <div className="text-gray-600 text-sm">Target: {kpi.target}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
