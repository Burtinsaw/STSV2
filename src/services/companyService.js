import axios from 'utils/axios'; // Projenizdeki yapılandırılmış axios'u kullanın

const companyService = {
  // GET /api/companies -> Tüm firmaları listeler
  getAllCompanies: () => axios.get('/api/companies'),

  // POST /api/companies -> Yeni bir firma oluşturur
  createCompany: (companyData) => axios.post('/api/companies', companyData),

  // PUT /api/companies/:id -> Belirli bir firmanın bilgilerini günceller
  updateCompany: (id, updateData) => axios.put(`/api/companies/${id}`, updateData),

  // DELETE /api/companies/:id -> Belirli bir firmayı siler
  deleteCompany: (id) => axios.delete(`/api/companies/${id}`),
};

export default companyService;
