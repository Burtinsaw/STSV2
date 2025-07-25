import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Divider,
  FormHelperText,
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Alert,
  Checkbox,        
  FormControlLabel
} from '@mui/material';

//  third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Google from 'assets/images/social-google.svg';

// AUTH CONTEXT
import { useAuth } from 'contexts/AuthContext';

// ==============================|| API LOGIN ||============================== //

const AuthLogin = ({ ...rest }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // LOGIN FORM SUBMIT
  const handleLogin = async (values, { setSubmitting, setFieldError }) => {
    try {
      const result = await login({
        username: values.email,
        password: values.password,
        rememberMe: values.rememberMe
      });

      if (result.success) {
        // İlk giriş kontrolü (admin kullanıcısı ve varsayılan şifre)
        if (values.email === 'admin' && values.password === 'admin123') {
          navigate('/first-login');
        } else {
          navigate('/dashboard');
        }
      } else {
        setFieldError('submit', result.error || 'Giriş başarısız');
      }
    } catch (error) {
      setFieldError('submit', 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Grid container justifyContent="center">
        <Grid item xs={12}>
          <Button
            fullWidth={true}
            sx={{
              fontSize: { md: '1rem', xs: '0.875rem' },
              fontWeight: 500,
              backgroundColor: theme.palette.grey[50],
              color: theme.palette.grey[600],
              textTransform: 'capitalize',
              '&:hover': {
                backgroundColor: theme.palette.grey[100]
              }
            }}
            size="large"
            variant="contained"
            disabled
          >
            <img
              src={Google}
              alt="google"
              width="20px"
              style={{
                marginRight: '16px',
                '@media (maxWidth:899.95px)': {
                  marginRight: '8px'
                }
              }}
            />{' '}
            Google ile Giriş (Yakında)
          </Button>
        </Grid>
      </Grid>

      <Box alignItems="center" display="flex" mt={2}>
        <Divider sx={{ flexGrow: 1 }} orientation="horizontal" />
        <Typography color="textSecondary" variant="h5" sx={{ m: theme.spacing(2) }}>
          VEYA
        </Typography>
        <Divider sx={{ flexGrow: 1 }} orientation="horizontal" />
      </Box>

      {/* HATA MESAJI */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Formik
        initialValues={{
          email: '',
          password: '',
          rememberMe: false,
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().max(255).required('Kullanıcı adı gerekli'),
          password: Yup.string().max(255).required('Şifre gerekli')
        })}
        onSubmit={handleLogin}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit} {...rest}>
            <TextField
              error={Boolean(touched.email && errors.email)}
              fullWidth
              helperText={touched.email && errors.email}
              label="Kullanıcı Adı"
              margin="normal"
              name="email"
              onBlur={handleBlur}
              onChange={handleChange}
              type="text"
              value={values.email}
              variant="outlined"
            />

            <FormControl fullWidth error={Boolean(touched.password && errors.password)} sx={{ mt: theme.spacing(3), mb: theme.spacing(1) }}>
              <InputLabel htmlFor="outlined-adornment-password">Şifre</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                name="password"
                onBlur={handleBlur}
                onChange={handleChange}
                label="Şifre"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      size="large"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              {touched.password && errors.password && (
                <FormHelperText error id="standard-weight-helper-text">
                  {errors.password}
                </FormHelperText>
              )}
            </FormControl>

            <FormControlLabel
              control={<Checkbox checked={values.rememberMe || false} onChange={handleChange} name="rememberMe" color="primary" />}
              label="Beni Hatırla"
              sx={{ mt: 1, mb: 1 }}
            />

            <Grid container justifyContent="flex-end">
              <Grid item>
                <Typography 
                  component={Link} 
                  to="/forgot-password"
                  variant="subtitle2" 
                  color="primary" 
                  sx={{ textDecoration: 'none', cursor: 'pointer' }}
                >
                  Şifremi Unuttum?
                </Typography>
              </Grid>
            </Grid>

            {errors.submit && (
              <Box mt={3}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Box>
            )}

            <Box mt={2}>
              <Button color="primary" disabled={isSubmitting || isLoading} fullWidth size="large" type="submit" variant="contained">
                {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </Button>
            </Box>

            <Box mt={2} textAlign="center">
              <Typography variant="body2">
                Hesabınız yok mu?{' '}
                <Typography 
                  component={Link} 
                  to="/register"
                  variant="subtitle2" 
                  color="primary" 
                  sx={{ textDecoration: 'none', cursor: 'pointer' }}
                >
                  Kayıt Ol
                </Typography>
              </Typography>
            </Box>
          </form>
        )}
      </Formik>
    </>
  );
};

export default AuthLogin;
