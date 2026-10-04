// src/utils/api.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface DefectItem {
  defect_id: string;
  type: string;
  confidence: number;
  severity: string;
  latitude: number;
  longitude: number;
  traffic_exposure: string;
  deterioration: string;
  risk_score: number;
  timestamp: string;
  status: string;
  action: string;
}

// Fetch stats for dashboard widgets
export async function fetchDashboardStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return await res.json();
  } catch (error) {
    console.warn('Backend unavailable, using fallback stats');
    return null;
  }
}

// Fetch defect list for Map and Table
export async function fetchDefects(): Promise<DefectItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/defects`);
    if (!res.ok) throw new Error('Failed to fetch defects');
    const data = await res.json();
    return data.defects;
  } catch (error) {
    console.warn('Backend unavailable, returning empty defect list');
    return [];
  }
}

// Upload road image to Python AI model
export async function uploadInspectionImage(imageFile: File, lat = 12.9249, lng = 80.1000) {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('latitude', lat.toString());
  formData.append('longitude', lng.toString());
  formData.append('traffic_exposure', 'HIGH');

  const res = await fetch(`${API_BASE_URL}/api/inspect`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Inspection upload failed');
  return await res.json();
}