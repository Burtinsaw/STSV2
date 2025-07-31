import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
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
import Logo from 'assets/images/logo-with-text.png'; // jsconfig.json'a göre yol

// API
// Yalnızca bu bileşenin ihtiyaç duyduğu fonksiyon import ediliyor.
import { sendPasswordResetEmail } from 'services/api'; 

// ==============================|| FORGOT PASSWORD ||============================== //

const ForgotPassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // FORGOT PASSWORD FORM SUBMIT
  const handleForgotPassword = async (values, { setErrors, setStatus, setSubmitting }) => {
    setIsLoading(true);
    try {
      const result = await sendPasswordResetEmail(values.email);
      
      if (result.success) {
        setEmailSent(true);
        setStatus({ success: true });
      } else {
        setStatus({ success: false });
        setErrors({ submit: result.message || 'E-posta gönderilirken bir hata oluştu' });
      }
    } catch (err) {
      setStatus({ success: false });
      setErrors({ submit: err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  // E-posta gönderildikten sonra gösterilecek olan başarı ekranı
  if (emailSent) {
    return (
      <Grid container justifyContent="center" alignItems="center" sx={{ height: '100vh' }}>
        <Grid item xs={11} sm={7} md={6} lg={4}>
            <Card sx={{ p: 4 }}>
              <CardContent>
                <Grid container direction="column" spacing={2} justifyContent="center" alignItems="center" textAlign="center">
                  <Grid item xs={12}>
                    <Typography color="primary" variant="h2">✅ E-posta Gönderildi!</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Alert severity="success">
                      Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.
                    </Alert>
                  </Grid>
                  <Grid item xs={12}>
                    <Button fullWidth variant="contained" onClick={() => navigate('/login')}>Giriş Sayfasına Dön</Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
        </Grid>
      </Grid>
    );
  }

  // Ana "Şifremi Unuttum" Formu
  return (
    <Grid container justifyContent="center" alignItems="center" sx={{ height: '100vh' }}>
      <Grid item xs={11} sm={7} md={6} lg={4}>
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <CardContent>
            <Grid container direction="column" spacing={2} justifyContent="center">
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                 <img alt="Logo" src={Logo} style={{ width: '180px', marginBottom: '16px' }} />
                <Typography color="textPrimary" gutterBottom variant="h2">Şifremi Unuttum</Typography>
                <Typography variant="body2" color="textSecondary">
                  E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Formik
                  initialValues={{ email: '', submit: null }}
                  validationSchema={Yup.object().shape({
                    email: Yup.string().email('Geçerli bir e-posta adresi giriniz').max(255).required('E-posta adresi gereklidir')
                  })}
                  onSubmit={handleForgotPassword}
                >
                  {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                    <form noValidate onSubmit={handleSubmit}>
                      <TextField
                        error={Boolean(touched.email && errors.email)}
                        fullWidth
                        helperText={touched.email && errors.email}
                        label="E-posta Adresi"
                        margin="normal"
                        name="email"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="email"
                        value={values.email}
                        variant="outlined"
                        autoComplete="email"
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
                          {isLoading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
                        </Button>
                      </Box>

                      <Box mt={2} textAlign="center">
                        <Typography variant="body2">
                          Şifrenizi hatırladınız mı?{' '}
                          <Typography component={RouterLink} to="/login" variant="subtitle2" color="primary" sx={{ textDecoration: 'none' }}>
                            Giriş Yap
                          </Typography>
                        </Typography>
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

export default ForgotPassword;
