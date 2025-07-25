import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
  FormControlLabel,
  Checkbox
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Google from 'assets/images/social-google.svg';

// ==============================|| REGISTER ||============================== //

const AuthRegister = ({ ...rest }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [checked, setChecked] = React.useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // REGISTER FORM SUBMIT - YENİ EKLENEN
  const handleRegister = async (values, { setSubmitting, setFieldError }) => {
    try {
      // Şartlar ve koşullar kontrolü
      if (!checked) {
        setFieldError('submit', 'Şartlar ve koşulları kabul etmelisiniz');
        setSubmitting(false);
        return;
      }

      // Burada register API'si çağrılacak
      console.log('Kayıt:', values);
      
      // Simüle edilmiş başarılı kayıt
      setTimeout(() => {
        alert('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.');
        navigate('/login');
        setSubmitting(false);
      }, 1000);
      
    } catch (error) {
      setFieldError('submit', 'Bir hata oluştu. Lütfen tekrar deneyin.');
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
                '@media (maxWidth:900px)': {
                  marginRight: '8px'
                }
              }}
            />{' '}
            Google ile Kayıt (Yakında)
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

      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          firstName: Yup.string().max(255).required('Ad gerekli'),
          lastName: Yup.string().max(255).required('Soyad gerekli'),
          email: Yup.string().email('Geçerli bir e-posta adresi girin').max(255).required('E-posta gerekli'),
          password: Yup.string().min(6, 'Şifre en az 6 karakter olmalı').max(255).required('Şifre gerekli'),
          confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Şifreler eşleşmiyor')
            .required('Şifre tekrarı gerekli')
        })}
        onSubmit={handleRegister}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit} {...rest}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  error={Boolean(touched.firstName && errors.firstName)}
                  fullWidth
                  helperText={touched.firstName && errors.firstName}
                  label="Ad"
                  margin="normal"
                  name="firstName"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type="text"
                  value={values.firstName}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  error={Boolean(touched.lastName && errors.lastName)}
                  fullWidth
                  helperText={touched.lastName && errors.lastName}
                  label="Soyad"
                  margin="normal"
                  name="lastName"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type="text"
                  value={values.lastName}
                  variant="outlined"
                />
              </Grid>
            </Grid>

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
            />

            <FormControl
              fullWidth
              error={Boolean(touched.password && errors.password)}
              sx={{ mt: theme.spacing(3), mb: theme.spacing(1) }}
              variant="outlined"
            >
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

            <TextField
              error={Boolean(touched.confirmPassword && errors.confirmPassword)}
              fullWidth
              helperText={touched.confirmPassword && errors.confirmPassword}
              label="Şifre Tekrarı"
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

            <Box my={2}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={checked} 
                    onChange={(event) => setChecked(event.target.checked)} 
                    name="checked" 
                    color="primary" 
                  />
                }
                label={
                  <>
                    <Link to="#" style={{ textDecoration: 'none', color: theme.palette.primary.main }}>
                      Şartlar ve Koşulları
                    </Link>
                    {' '}okudum ve kabul ediyorum
                  </>
                }
              />
            </Box>

            <Box mt={2}>
              <Button 
                color="primary" 
                disabled={isSubmitting} 
                fullWidth 
                size="large" 
                type="submit" 
                variant="contained"
              >
                {isSubmitting ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </>
  );
};

export default AuthRegister;
