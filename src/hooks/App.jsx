import { useState, useEffect } from 'react';
import useLiff from './hooks/useLiff';
import MaintenanceList from './components/MaintenanceList';
import MaintenanceForm from './components/MaintenanceForm';
import Header from './components/Header';

function App() {
  const { isLoggedIn, isLoading, profile, error, logout } = useLiff();
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateSuccess = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1); // Refresh list
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-red-600 text-center">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">เกิดข้อผิดพลาด</h2>
            <p className="text-gray-600 whitespace-pre-line text-left">{error}</p>
            {error.includes('permission') || error.includes('scope') ? (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                <p className="text-sm text-yellow-800 font-semibold mb-2">วิธีแก้ไข:</p>
                <ol className="text-xs text-yellow-700 space-y-1 list-decimal list-inside">
                  <li>ไปที่ <a href="https://developers.line.biz/console/" target="_blank" className="underline">LINE Developers Console</a></li>
                  <li>เลือก Provider และ Channel ของคุณ</li>
                  <li>ไปที่แท็บ <strong>LIFF</strong></li>
                  <li>แก้ไข LIFF app ของคุณ</li>
                  <li>เพิ่ม Scopes: <strong>profile</strong>, <strong>openid</strong></li>
                  <li>กด Save</li>
                  <li>Refresh หน้านี้อีกครั้ง</li>
                </ol>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-4">
                กรุณาติดต่อผู้ดูแลระบบหากคุณควรมีสิทธิ์เข้าถึง
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">กำลังเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header profile={profile} onLogout={logout} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            ระบบบันทึกการ Maintenance
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-200"
          >
            {showForm ? 'ปิดฟอร์ม' : '+ เพิ่มรายการใหม่'}
          </button>
        </div>

        {showForm && (
          <div className="mb-6">
            <MaintenanceForm 
              userId={profile.userId} 
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <MaintenanceList key={refreshKey} />
      </main>
    </div>
  );
}

export default App;
