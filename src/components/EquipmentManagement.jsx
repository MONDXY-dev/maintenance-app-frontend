import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Search, Package, CheckCircle, XCircle, AlertTriangle, RefreshCcw } from 'lucide-react';
import { equipmentAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';

const EquipmentManagement = ({ profile }) => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [formData, setFormData] = useState({
    equipment_code: '',
    equipment_type: '',
    equipment_name: '',
    description: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const equipmentTypes = [
    { value: 'conveyor', label: 'Conveyor / สายพาน' },
    { value: 'crusher', label: 'Crusher / เครื่องบด' },
    { value: 'feeder', label: 'Feeder / เครื่องป้อน' },
    { value: 'screen', label: 'Screen / ตะแกรง' },
    { value: 'pump', label: 'Pump / ปั๊ม' },
    { value: 'motor', label: 'Motor / มอเตอร์' },
    { value: 'generator', label: 'Generator / เครื่องปั่นไฟ' },
    { value: 'compressor', label: 'Compressor / เครื่องอัด' },
    { value: 'other', label: 'Other / อื่นๆ' }
  ];

  useEffect(() => {
    fetchEquipment();
  }, [showInactive]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const data = await equipmentAPI.getAll(showInactive);
      setEquipment(data.equipment || []);
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (editingEquipment) {
        await equipmentAPI.update(editingEquipment.equipment_id, formData);
      } else {
        await equipmentAPI.create(formData);
      }
      
      setShowModal(false);
      resetForm();
      fetchEquipment();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingEquipment(item);
    setFormData({
      equipment_code: item.equipment_code || '',
      equipment_type: item.equipment_type || '',
      equipment_name: item.equipment_name || '',
      description: item.description || '',
      location: item.location || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    if (!confirm(`คุณต้องการลบเครื่องจักร "${item.equipment_name || item.equipment_code}" หรือไม่?`)) {
      return;
    }

    try {
      await equipmentAPI.delete(item.equipment_id);
      fetchEquipment();
    } catch (err) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      equipment_code: '',
      equipment_type: '',
      equipment_name: '',
      description: '',
      location: ''
    });
    setEditingEquipment(null);
    setError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const filteredEquipment = equipment.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.equipment_code?.toLowerCase().includes(searchLower) ||
      item.equipment_name?.toLowerCase().includes(searchLower) ||
      item.equipment_type?.toLowerCase().includes(searchLower) ||
      item.location?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <Card className="p-12 text-center border-dashed">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-4 text-gray-500 font-medium">กำลังโหลดข้อมูลเครื่องจักร...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-500" />
            จัดการเครื่องจักร
          </h1>
          <p className="text-gray-400 mt-1">เพิ่ม แก้ไข และจัดการรายการเครื่องจักรในระบบ</p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มเครื่องจักร
        </Button>
      </div>

      {/* Search & Filters */}
      <Card className="p-4 bg-gray-900/50 border-gray-800">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="ค้นหาเครื่องจักร..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 text-white pl-10 pr-4 py-2.5 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-700 bg-gray-900 text-blue-500 focus:ring-blue-500"
            />
            แสดงเครื่องจักรที่ปิดใช้งาน
          </label>
          <Button variant="ghost" size="sm" onClick={fetchEquipment}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            รีเฟรช
          </Button>
        </div>
      </Card>

      {/* Equipment List */}
      <div className="grid gap-4">
        {filteredEquipment.length === 0 ? (
          <Card className="p-16 text-center bg-gray-950/50 border-dashed border-gray-800">
            <Package className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <CardTitle className="text-gray-600">ไม่พบเครื่องจักร</CardTitle>
            <p className="text-gray-500 text-sm mt-1">
              {searchTerm ? 'ไม่พบเครื่องจักรที่ตรงกับคำค้นหา' : 'ยังไม่มีเครื่องจักรในระบบ'}
            </p>
            {!searchTerm && (
              <Button onClick={openCreateModal} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มเครื่องจักรใหม่
              </Button>
            )}
          </Card>
        ) : (
          filteredEquipment.map((item) => (
            <Card
              key={item.equipment_id}
              className={`group hover:border-gray-700 transition-all border-gray-800 ${
                !item.is_active ? 'opacity-60' : ''
              }`}
            >
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${item.is_active ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-800 text-gray-500'}`}>
                      <Package size={24} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-white text-lg">
                          {item.equipment_name || item.equipment_code}
                        </h3>
                        <Badge variant="outline" className="text-gray-500 bg-transparent border-gray-700">
                          {item.equipment_code}
                        </Badge>
                        {!item.is_active && (
                          <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">
                            ปิดใช้งาน
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="text-gray-600">ประเภท:</span>
                          <span className="text-gray-400">{item.equipment_type}</span>
                        </span>
                        {item.location && (
                          <span className="flex items-center gap-1">
                            <span className="text-gray-600">สถานที่:</span>
                            <span className="text-gray-400">{item.location}</span>
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-gray-500 text-sm line-clamp-1">{item.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
                    >
                      <Pencil size={16} className="mr-1" />
                      แก้ไข
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item)}
                      className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 size={16} className="mr-1" />
                      ลบ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="flex justify-center gap-6 py-4 text-sm text-gray-500">
        <span>ทั้งหมด: <strong className="text-white">{equipment.length}</strong></span>
        <span>ใช้งาน: <strong className="text-green-400">{equipment.filter(e => e.is_active).length}</strong></span>
        <span>ปิดใช้งาน: <strong className="text-red-400">{equipment.filter(e => !e.is_active).length}</strong></span>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="max-w-lg w-full border-gray-800 shadow-2xl animate-in zoom-in-95">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-bold">
                    {editingEquipment ? 'แก้ไขเครื่องจักร' : 'เพิ่มเครื่องจักรใหม่'}
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    {editingEquipment ? `แก้ไข ${editingEquipment.equipment_code}` : 'กรอกข้อมูลเครื่องจักร'}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X size={24} />
                </Button>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-5 bg-gray-950">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                    <AlertTriangle size={20} />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      รหัสเครื่องจักร *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.equipment_code}
                      onChange={(e) => setFormData({ ...formData, equipment_code: e.target.value.toUpperCase() })}
                      placeholder="เช่น CV-001"
                      className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      ประเภท *
                    </label>
                    <select
                      required
                      value={formData.equipment_type}
                      onChange={(e) => setFormData({ ...formData, equipment_type: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    >
                      <option value="">เลือกประเภท</option>
                      {equipmentTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    ชื่อเครื่องจักร
                  </label>
                  <input
                    type="text"
                    value={formData.equipment_name}
                    onChange={(e) => setFormData({ ...formData, equipment_name: e.target.value })}
                    placeholder="ระบุชื่อเครื่องจักร"
                    className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    สถานที่ตั้ง
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="เช่น Production Line A"
                    className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    รายละเอียด
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                    rows={3}
                    className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                  />
                </div>
              </CardContent>

              <div className="flex gap-3 p-6 pt-0 bg-gray-950 rounded-b-lg">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  className="flex-[2] bg-blue-600 hover:bg-blue-500"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      กำลังบันทึก...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle size={18} />
                      {editingEquipment ? 'บันทึกการแก้ไข' : 'เพิ่มเครื่องจักร'}
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EquipmentManagement;
