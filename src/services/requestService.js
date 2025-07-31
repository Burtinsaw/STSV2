import axios from 'utils/axios'; // Projenizdeki yapılandırılmış axios'u kullanıyoruz

const requestService = {
  /**
   * Yeni bir talep oluşturmak için backend'e POST isteği atar.
   * @param {object} payload - Talep verilerini içeren obje.
   */
  createRequest: (payload) => {
    // Backend rotanız: POST /api/talepler
    return axios.post('/api/talepler', payload);
  },

  /**
   * Mevcut tüm firmaları/müşterileri getirmek için.
   */
  getCompanies: () => {
    // Backend rotanız: GET /api/talepler/companies
    return axios.get('/api/talepler/companies'); 
  }
};

// Fonksiyonları içeren objeyi varsayılan olarak dışa aktarıyoruz.
export default requestService;
