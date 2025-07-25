import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
import Logo from 'assets/images/logo-with-text.png';

// API
import { sendPasswordResetEmail } from 'services/api';

// ==============================|| FORGOT PASSWORD ||============================== //

const ForgotPassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // FORGOT PASSWORD FORM SUBMIT
  const handleForgotPassword = async (values, { setSubmitting, setFieldError }) => {
    try {
      setIsLoading(true);
      
      // Gerçek API çağrısı
      const result = await sendPasswordResetEmail(values.email);
      
      if (result.success) {
        setEmailSent(true);
        console.log('✅ Şifre sıfırlama e-postası gönderildi:', result.messageId);
      } else {
        setFieldError('submit', result.message || 'E-posta gönderilirken hata oluştu');
      }
      
    } catch (error) {
      console.error('❌ Şifre sıfırlama hatası:', error);
      setFieldError('submit', error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ backgroundColor: theme.palette.common.black, height: '100%', minHeight: '100vh' }}
      >
        <Grid item xs={11} sm={7} md={6} lg={4}>
          <Card
            sx={{
              overflow: 'visible',
              display: 'flex',
              position: 'relative',
              '& .MuiCardContent-root': {
                flexGrow: 1,
                flexBasis: '50%',
                width: '50%'
              },
              maxWidth: '475px',
              margin: '24px auto'
            }}
          >
            <CardContent sx={{ p: theme.spacing(5, 4, 3, 4) }}>
              <Grid container direction="column" spacing={4} justifyContent="center">
                <Grid item xs={12}>
                  <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item xs={8}>
                      <Typography color="primary" gutterBottom variant="h2">
                        ✅ E-posta Gönderildi!
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
                      </Typography>
                    </Grid>
                    <Grid item xs={4} sx={{ textAlign: 'right' }}>
                      <img 
                        alt="Satın Alma Takip" 
                        src={Logo} 
                        style={{ 
                          width: '120px', 
                          height: 'auto',
                          maxWidth: '100%'
                        }} 
                      />
                    </Grid>
                  </Grid>
                </Grid>
                
                <Grid item xs={12}>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>E-posta başarıyla gönderildi!</strong><br/>
                      Gelen kutunuzu kontrol edin ve şifre sıfırlama bağlantısına tıklayın.
                    </Typography>
                  </Alert>
                  
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Önemli Notlar:</strong><br/>
                      • Bağlantı 1 saat geçerlidir<br/>
                      • E-posta gelmezse spam klasörünü kontrol edin<br/>
                      • Sorun devam ederse sistem yöneticisine başvurun
                    </Typography>
                  </Alert>
                </Grid>

                <Grid item xs={12}>
                  <Box mt={2}>
                    <Button
                      fullWidth
                      size="large"
                      variant="contained"
                      onClick={() => navigate('/login')}
                    >
                      Giriş Sayfasına Dön
                    </Button>
                  </Box>
                  
                  <Box mt={2}>
                    <Button
                      fullWidth
                      size="large"
                      variant="outlined"
                      onClick={() => setEmailSent(false)}
                    >
                      Tekrar E-posta Gönder
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{ backgroundColor: theme.palette.common.black, height: '100%', minHeight: '100vh' }}
    >
      <Grid item xs={11} sm={7} md={6} lg={4}>
        <Card
          sx={{
            overflow: 'visible',
            display: 'flex',
            position: 'relative',
            '& .MuiCardContent-root': {
              flexGrow: 1,
              flexBasis: '50%',
              width: '50%'
            },
            maxWidth: '475px',
            margin: '24px auto'
          }}
        >
          <CardContent sx={{ p: theme.spacing(5, 4, 3, 4) }}>
            <Grid container direction="column" spacing={4} justifyContent="center">
              <Grid item xs={12}>
                <Grid container justifyContent="space-between" alignItems="center">
                  <Grid item xs={8}>
                    <Typography color="textPrimary" gutterBottom variant="h2">
                      Şifremi Unuttum
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <img 
                      alt="Satın Alma Takip" 
                      src={Logo} 
                      style={{ 
                        width: '120px', 
                        height: 'auto',
                        maxWidth: '100%'
                      }} 
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Formik
                  initialValues={{
                    email: ''
                  }}
                  validationSchema={Yup.object().shape({
                    email: Yup.string()
                      .email('Geçerli bir e-posta adresi giriniz')
                      .max(255)
                      .required('E-posta adresi gereklidir')
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
                        disabled={isSubmitting || isLoading}
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
                          <Typography 
                            component={Link} 
                            to="/login"
                            variant="subtitle2" 
                            color="primary" 
                            sx={{ textDecoration: 'none', cursor: 'pointer' }}
                          >
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

