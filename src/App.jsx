import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Edit, Save, Search, AlertCircle } from 'lucide-react';

export default function App() {
  // --- STATE ---
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activities, setActivities] = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [planNote, setPlanNote] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  // --- MOCK DATA ---
  const MOCK_ACTIVITIES = [
    { id: 'act-1', title: 'DIY Water Filter', duration: '45 mins', materials: ['Plastic Bottles', 'Sand', 'Charcoal'], subject: 'Science' },
    { id: 'act-2', title: 'Simple Circuits', duration: '30 mins', materials: ['Batteries', 'Wire', 'Bulb'], subject: 'Physics' }
  ];

  // --- LIFECYCLE: LOCAL STORAGE (Backend replacement) ---
  useEffect(() => {
    // Load synthetic catalogue and saved plans from "database" (localStorage)
    setActivities(MOCK_ACTIVITIES);
    const storedPlans = JSON.parse(localStorage.getItem('stemmate_plans') || '[]');
    setSavedPlans(storedPlans);

    // Offline/Online Listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- ACTIONS ---
  const savePlanToDB = (plan) => {
    const updatedPlans = [...savedPlans, plan];
    setSavedPlans(updatedPlans);
    localStorage.setItem('stemmate_plans', JSON.stringify(updatedPlans));
    setStatusMsg("Draft saved locally on device.");
    setTimeout(() => setStatusMsg(""), 3000);
  };

  const updatePlanInDB = (id, newNote) => {
    const updatedPlans = savedPlans.map(p => p.id === id ? { ...p, notes: newNote } : p);
    setSavedPlans(updatedPlans);
    localStorage.setItem('stemmate_plans', JSON.stringify(updatedPlans));
    setEditingPlanId(null);
    setStatusMsg("Plan updated and saved locally.");
    setTimeout(() => setStatusMsg(""), 3000);
  };

  const handleSaveNewPlan = (activityTitle) => {
    const newPlan = {
      id: Date.now().toString(),
      title: `Plan for ${activityTitle}`,
      activity: activityTitle,
      notes: planNote,
      date: new Date().toISOString(),
      status: isOnline ? 'Synced' : 'Sync Pending'
    };
    savePlanToDB(newPlan);
    setPlanNote("");
  };

  const filteredActivities = activities.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-6">
      {/* HEADER & OFFLINE BANNER (Fixes A3 F4) */}
      <header className="mb-8 border-b pb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900">STEMMate Namibia</h1>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            {isOnline ? 'Online' : 'Offline Mode'}
          </div>
        </div>
        
        {/* Accessibility Live Region for Status Updates */}
        <div aria-live="polite" className="mt-2 text-sm text-blue-700 h-5 font-medium">
          {statusMsg}
        </div>

        {!isOnline && (
          <div className="mt-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 flex items-center gap-2" role="alert">
            <AlertCircle size={20} />
            <p>You are offline. Your work is saved on this device and will sync when you reconnect.</p>
          </div>
        )}
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* COLUMN 1: CATALOGUE */}
        <section aria-labelledby="catalogue-heading">
          <h2 id="catalogue-heading" className="text-xl font-semibold mb-4">Browse Activities</h2>
          
          <div className="mb-4 relative">
            <label htmlFor="search" className="sr-only">Search activities</label>
            <input 
              id="search"
              type="text" 
              placeholder="Search by title or subject..." 
              className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          </div>

          {/* Fixes A3 F3: No Results Message */}
          {filteredActivities.length === 0 ? (
            <div className="bg-white p-6 rounded-lg border text-center text-gray-500">
              <p>No activities match your search.</p>
              <button onClick={() => setSearchTerm("")} className="mt-2 text-blue-600 underline">Clear search</button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map(activity => (
                <div key={activity.id} className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="font-bold text-lg">{activity.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{activity.subject} | {activity.duration}</p>
                  
                  <div className="mb-4">
                    <label htmlFor={`note-${activity.id}`} className="block text-sm font-medium mb-1">Add a note to the plan (Optional)</label>
                    <input 
                      id={`note-${activity.id}`}
                      type="text" 
                      className="w-full p-2 border rounded text-sm"
                      placeholder="e.g., Need extra sand"
                      onChange={(e) => setPlanNote(e.target.value)}
                    />
                  </div>

                  <button 
                    onClick={() => handleSaveNewPlan(activity.title)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Save size={16} /> Save Plan Offline
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* COLUMN 2: SAVED PLANS & EDITING */}
        <section aria-labelledby="plans-heading">
          <h2 id="plans-heading" className="text-xl font-semibold mb-4">Your Saved Plans</h2>
          {savedPlans.length === 0 ? (
            <p className="text-gray-500 bg-white p-4 rounded border">No plans saved yet.</p>
          ) : (
            <div className="space-y-4">
              {savedPlans.map(plan => (
                <div key={plan.id} className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{plan.title}</h3>
                      <p className="text-xs text-gray-500">Status: {plan.status}</p>
                    </div>
                    {/* Fixes A3 F2: Edit capability */}
                    <button 
                      onClick={() => setEditingPlanId(plan.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      aria-label={`Edit note for ${plan.title}`}
                    >
                      <Edit size={18} />
                    </button>
                  </div>

                  {editingPlanId === plan.id ? (
                    <div className="mt-2">
                      <label htmlFor={`edit-${plan.id}`} className="sr-only">Edit notes</label>
                      <input 
                        id={`edit-${plan.id}`}
                        type="text" 
                        defaultValue={plan.notes}
                        className="w-full p-2 border rounded text-sm mb-2"
                        onChange={(e) => setPlanNote(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => updatePlanInDB(plan.id, planNote)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Save Changes</button>
                        <button onClick={() => setEditingPlanId(null)} className="bg-gray-200 px-3 py-1 rounded text-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      <strong>Note:</strong> {plan.notes || "No notes added."}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}