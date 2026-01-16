import { useState, useEffect } from 'react';
import { usersAPI } from '../services/users';
import { 
  Users, UserPlus, Edit2, Trash2, Shield, User as UserIcon, 
  Search, ShieldCheck, Mail, Calendar, AlertCircle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';

const UserManagement = ({ profile }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    lineUserId: '',
    displayName: '',
    email: '',
    role: 'technician'
  });

  useEffect(() => {
    if (profile?.userId) {
      loadUsers();
    }
  }, [profile]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.list(profile.userId);
      setUsers(response.users || []);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    alert(`${type === 'error' ? 'Error: ' : ''}${message}`);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await usersAPI.add(profile.userId, formData);
      showToast('เพิ่มผู้ใช้สำเร็จ', 'success');
      setShowAddModal(false);
      setFormData({ lineUserId: '', displayName: '', email: '', role: 'technician' });
      loadUsers();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await usersAPI.update(profile.userId, selectedUser.id, {
        displayName: formData.displayName,
        email: formData.email,
        role: formData.role
      });
      showToast('อัพเดทข้อมูลสำเร็จ', 'success');
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ lineUserId: '', displayName: '', email: '', role: 'technician' });
      loadUsers();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?')) return;
    
    try {
      await usersAPI.delete(profile.userId, userId);
      showToast('ลบผู้ใช้สำเร็จ', 'success');
      loadUsers();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      lineUserId: user.line_user_id,
      displayName: user.display_name,
      email: user.email || '',
      role: user.role
    });
    setShowEditModal(true);
  };

  const getRoleBadge = (role) => {
    const badges = {
      moderator: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      technician: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      supervisor: 'bg-green-500/20 text-green-400 border-green-500/30',
      user: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return badges[role] || badges.technician;
  };

  const getRoleIcon = (role) => {
    return role === 'moderator' ? <Shield className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />;
  };

  const filteredUsers = users.filter(user => 
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.line_user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="p-12 text-center border-dashed">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-4 text-gray-500 font-medium">กำลังโหลดรายชื่อผู้ใช้...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="text-green-500" size={28} />
            User Management
          </h2>
          <p className="text-gray-400 text-sm mt-1">จัดการรายชื่อผู้ใช้งานและกำหนดสิทธิ์</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 py-6 font-bold shadow-lg shadow-purple-500/20 flex items-center gap-2"
        >
          <UserPlus size={20} />
          เพิ่มผู้ใช้ใหม่
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-500 group-focus-within:text-green-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="ค้นหาด้วยชื่อ, Line ID หรือ อีเมล..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-11 pr-4 py-4 bg-gray-900 border border-gray-800 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-xl"
        />
      </div>

      {/* Users Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/50 border-b border-gray-800">
                <th className="px-6 py-4 text-sm font-semibold text-gray-300">ผู้ใช้งาน</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-300">สิทธิ์ / บทบาท</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-300 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-20 text-center bg-gray-950/50 border-dashed border-gray-800">
                    <AlertCircle className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <CardTitle className="text-gray-600 text-lg">ไม่พบรายชื่อผู้ใช้</CardTitle>
                    <p className="text-gray-500 text-sm mt-1">ลองใช้คำสำคัญอื่นในการค้นหา</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center border border-gray-700 group-hover:border-green-500/50 transition-colors overflow-hidden">
                            {user.picture_url ? (
                              <img src={user.picture_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <UserIcon className="text-gray-500" size={24} />
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-green-400 transition-colors">{user.display_name}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">{user.line_user_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadge(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2.5 text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all hover:scale-110"
                          title="แก้ไข"
                        >
                          <Edit2 size={18} />
                        </button>
                        {user.id !== profile?.userId && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all hover:scale-110"
                            title="ลบ"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full border-gray-800 shadow-2xl animate-in fade-in zoom-in duration-200">
            <CardHeader className="border-b border-gray-800 pb-4">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-purple-400" />
                เพิ่มผู้ใช้ใหม่
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">LINE User ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.lineUserId}
                    onChange={(e) => setFormData({ ...formData, lineUserId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">ชื่อแสดง *</label>
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="ชื่อผู้ใช้"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">สิทธิ์การใช้งาน *</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none"
                  >
                    <option value="technician">ช่างซ่อม</option>
                    <option value="supervisor">หัวหน้างาน</option>
                    <option value="moderator">ผู้ดูแลระบบ</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 rounded-xl h-12 font-bold"
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 font-bold"
                  >
                    บันทึกข้อมูล
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full border-gray-800 shadow-2xl animate-in fade-in zoom-in duration-200">
            <CardHeader className="border-b border-gray-800 pb-4">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Edit2 className="w-6 h-6 text-blue-400" />
                แก้ไขข้อมูลผู้ใช้
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="space-y-2 opacity-60">
                  <label className="text-sm font-semibold text-gray-400">LINE User ID</label>
                  <input
                    type="text"
                    disabled
                    value={formData.lineUserId}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">ชื่อแสดง *</label>
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">สิทธิ์การใช้งาน *</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    disabled={selectedUser.role === 'moderator' && selectedUser.id === profile?.userId}
                  >
                    <option value="technician">ช่างซ่อม</option>
                    <option value="supervisor">หัวหน้างาน</option>
                    <option value="moderator">ผู้ดูแลระบบ</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                        setShowEditModal(false);
                        setSelectedUser(null);
                    }}
                    className="flex-1 rounded-xl h-12 font-bold"
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold"
                  >
                    บันทึก
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
