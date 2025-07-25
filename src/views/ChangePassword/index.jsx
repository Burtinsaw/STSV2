// src/views/ChangePassword/index.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

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
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Alert
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// AUTH CONTEXT
import { useAuth } from 'contexts/AuthContext';

// ==============================|| CHANGE PASSWORD ||============================== //

const ChangePassword = ({ isFirstLogin = false }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleClickShowCurrentPassword = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };

  const handleClickShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // CHANGE PASSWORD SUBMIT
  const handleChangePassword = async (values, { setSubmitting, setFieldError }) => {
    try {
      // Burada şifre değiştirme API'si çağrılacak
      console.log('Şifre değiştirme:', values);
      
      // Simüle edilmiş başarılı işlem
      setTimeout(() => {
        alert('Şifreniz başarıyla değiştirildi!');
        if (isFirstLogin) {
          navigate('/dashboard');
        } else {
          navigate(-1); // Önceki sayfaya dön
        }
        setSubmitting(false);
      }, 1000);
      
    } catch (error) {
      setFieldError('submit', 'Bir hata oluştu. Lütfen tekrar deneyin.');
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          {isFirstLogin && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>İlk Giriş Uyarısı:</strong> Güvenliğiniz için lütfen şifrenizi değiştirin.
              </Typography>
            </Alert>
          )}

          <Typography variant="h3" sx={{ mb: 1 }}>
            {isFirstLogin ? 'Şifrenizi Belirleyin' : 'Şifre Değiştir'}
          </Typography>
          
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            {isFirstLogin 
              ? 'Güvenli bir şifre belirleyerek hesabınızı koruyun.'
              : 'Mevcut şifrenizi girerek yeni şifrenizi belirleyin.'
            }
          </Typography>

          <Formik
            initialValues={{
              currentPassword: isFirstLogin ? 'admin123' : '',
              newPassword: '',
              confirmPassword: '',
              submit: null
            }}
            validationSchema={Yup.object().shape({
              currentPassword: isFirstLogin 
                ? Yup.string().required('Mevcut şifre gerekli')
                : Yup.string().required('Mevcut şifre gerekli'),
              newPassword: Yup.string()
                .min(6, 'Yeni şifre en az 6 karakter olmalı')
                .max(255)
                .required('Yeni şifre gerekli'),
              confirmPassword: Yup.string()
                .oneOf([Yup.ref('newPassword'), null], 'Şifreler eşleşmiyor')
                .required('Şifre tekrarı gerekli')
            })}
            onSubmit={handleChangePassword}
          >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
              <form noValidate onSubmit={handleSubmit}>
                {/* Mevcut Şifre */}
                <FormControl 
                  fullWidth 
                  error={Boolean(touched.currentPassword && errors.currentPassword)} 
                  sx={{ mb: 2 }}
                >
                  <InputLabel htmlFor="current-password">
                    {isFirstLogin ? 'Varsayılan Şifre' : 'Mevcut Şifre'}
                  </InputLabel>
                  <OutlinedInput
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={values.currentPassword}
                    name="currentPassword"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    label={isFirstLogin ? 'Varsayılan Şifre' : 'Mevcut Şifre'}
                    disabled={isFirstLogin}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowCurrentPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          size="large"
                        >
                          {showCurrentPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  {touched.currentPassword && errors.currentPassword && (
                    <FormHelperText error>{errors.currentPassword}</FormHelperText>
                  )}
                </FormControl>

                {/* Yeni Şifre */}
                <FormControl 
                  fullWidth 
                  error={Boolean(touched.newPassword && errors.newPassword)} 
                  sx={{ mb: 2 }}
                >
                  <InputLabel htmlFor="new-password">Yeni Şifre</InputLabel>
                  <OutlinedInput
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={values.newPassword}
                    name="newPassword"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    label="Yeni Şifre"
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowNewPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          size="large"
                        >
                          {showNewPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  {touched.newPassword && errors.newPassword && (
                    <FormHelperText error>{errors.newPassword}</FormHelperText>
                  )}
                </FormControl>

                {/* Şifre Tekrarı */}
                <FormControl 
                  fullWidth 
                  error={Boolean(touched.confirmPassword && errors.confirmPassword)} 
                  sx={{ mb: 3 }}
                >
                  <InputLabel htmlFor="confirm-password">Yeni Şifre Tekrarı</InputLabel>
                  <OutlinedInput
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={values.confirmPassword}
                    name="confirmPassword"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    label="Yeni Şifre Tekrarı"
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowConfirmPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          size="large"
                        >
                          {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <FormHelperText error>{errors.confirmPassword}</FormHelperText>
                  )}
                </FormControl>

                {errors.submit && (
                  <Box mb={2}>
                    <FormHelperText error>{errors.submit}</FormHelperText>
                  </Box>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      size="large"
                      variant="outlined"
                      onClick={() => navigate(isFirstLogin ? '/dashboard' : -1)}
                      disabled={isSubmitting}
                    >
                      {isFirstLogin ? 'Daha Sonra' : 'İptal'}
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      color="primary"
                      disabled={isSubmitting}
                      fullWidth
                      size="large"
                      type="submit"
                      variant="contained"
                    >
                      {isSubmitting ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ChangePassword;
