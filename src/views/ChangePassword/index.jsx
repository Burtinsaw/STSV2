import React from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
  Card,
  CardContent,
  FormHelperText,
  Grid,
  TextField,
  Typography,
  Alert
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// assets
import Logo from 'assets/images/logo-with-text.png';

// API
import { authAPI } from 'services/api';
import { useAuth } from 'contexts/AuthContext';

// ==============================|| CHANGE PASSWORD ||============================== //

const ChangePassword = ({ isFirstLogin = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Mevcut kullanıcı bilgilerini al

  const [passwordChanged, setPasswordChanged] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // isFirstLogin durumuna göre dinamik metinler ve form yapısı
  const pageTitle = isFirstLogin ? 'Yeni Şifre Oluştur' : 'Şifre Değiştir';
  const pageDescription = isFirstLogin
    ? 'Güvenliğiniz için lütfen hesabınıza yeni bir şifre belirleyin.'
    : 'Mevcut şifrenizi ve yeni şifrenizi girerek güncelleme yapabilirsiniz.';
  
  // Formik için başlangıç değerleri
  const initialValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    submit: null
  };

  // Formik için validasyon şeması
  const validationSchema = Yup.object().shape({
    // isFirstLogin değilse, mevcut şifre alanı zorunludur.
    currentPassword: isFirstLogin 
      ? Yup.string() 
      : Yup.string().required('Mevcut şifre gereklidir'),
    newPassword: Yup.string().min(8, 'Şifre en az 8 karakter olmalı').max(255).required('Yeni şifre gereklidir'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Şifreler eşleşmelidir')
      .required('Yeni şifre tekrarı gereklidir')
  });

  // Form gönderimini yöneten fonksiyon
  const handleSubmit = async (values, { setErrors, setStatus, setSubmitting }) => {
    setIsLoading(true);
    try {
      const payload = {
        // API'nizin beklediği parametreler farklı olabilir, gerekirse güncelleyin
        email: user.email,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      };
      
      // isFirstLogin durumunda currentPassword'ı göndermeyebiliriz, bu backend'inize bağlıdır.
      // Şimdilik gönderiyoruz, backend'iniz bu durumu yönetmelidir.
      const result = await authAPI.changePassword(payload);

      if (result.success) {
        setPasswordChanged(true);
        setTimeout(() => {
          navigate('/dashboard/default');
        }, 3000);
      } else {
        setErrors({ submit: result.message || 'Şifre değiştirilirken bir hata oluştu.' });
      }
      setStatus({ success: true });
    } catch (err) {
      setStatus({ success: false });
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  // Şifre başarıyla değiştirildikten sonra gösterilecek ekran
  if (passwordChanged) {
    return (
     <Grid container justifyContent="center" alignItems="center" sx={{ height: '100vh' }}>
       <Grid item xs={11} sm={7} md={6} lg={4}>
           <Card sx={{ p: 4 }}>
             <CardContent>
               <Grid container direction="column" spacing={2} justifyContent="center" alignItems="center" textAlign="center">
                 <Grid item xs={12}>
                   <Typography color="primary" variant="h2">✅ Şifre Değiştirildi!</Typography>
                 </Grid>
                 <Grid item xs={12}>
                   <Alert severity="success">
                     Şifreniz başarıyla güncellendi. Ana sayfaya yönlendiriliyorsunuz...
                   </Alert>
                 </Grid>
               </Grid>
             </CardContent>
           </Card>
       </Grid>
     </Grid>
   );
 }

  // Ana Form Ekranı
  return (
    <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: 'calc(100vh - 68px)' }}>
      <Grid item xs={11} sm={7} md={6} lg={4}>
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <CardContent>
            <Grid container direction="column" spacing={2} justifyContent="center">
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <img alt="Logo" src={Logo} style={{ width: '180px', marginBottom: '16px' }} />
                <Typography color="textPrimary" gutterBottom variant="h2">{pageTitle}</Typography>
                <Typography variant="body2" color="textSecondary">{pageDescription}</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                    <form noValidate onSubmit={handleSubmit}>
                      
                      {!isFirstLogin && (
                        <TextField
                          error={Boolean(touched.currentPassword && errors.currentPassword)}
                          fullWidth
                          helperText={touched.currentPassword && errors.currentPassword}
                          label="Mevcut Şifre"
                          margin="normal"
                          name="currentPassword"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="password"
                          value={values.currentPassword}
                          variant="outlined"
                        />
                      )}

                      <TextField
                        error={Boolean(touched.newPassword && errors.newPassword)}
                        fullWidth
                        helperText={touched.newPassword && errors.newPassword}
                        label="Yeni Şifre"
                        margin="normal"
                        name="newPassword"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="password"
                        value={values.newPassword}
                        variant="outlined"
                      />
                      <TextField
                        error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                        fullWidth
                        helperText={touched.confirmPassword && errors.confirmPassword}
                        label="Yeni Şifre (Tekrar)"
                        margin="normal"
                        name="confirmPassword"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="password"
                        value={values.confirmPassword}
                        variant="outlined"
                      />

                      {errors.submit && (
                        <Box mt={3}>
                          <FormHelperText error>{errors.submit}</FormHelperText>
                        </Box>
                      )}

                      <Box mt={2}>
                        <Button
                          color="primary"
                          disabled={isSubmitting || isLoading}
                          fullWidth
                          size="large"
                          type="submit"
                          variant="contained"
                        >
                          {isLoading ? 'İşleniyor...' : 'Şifreyi Güncelle'}
                        </Button>
                      </Box>
                    </form>
                  )}
                </Formik>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ChangePassword;
