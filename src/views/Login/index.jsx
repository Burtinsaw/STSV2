import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Card, CardContent, Typography, Grid } from '@mui/material';

// project import
import AuthLogin from './AuthLogin';

// assets
import Logo from 'assets/images/logo-with-text.png';

// ==============================|| LOGIN ||============================== //

const Login = () => {
  const theme = useTheme();

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
                      Giriş Yap
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Satın Alma Takip Sistemi
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <RouterLink to="/">
                      <img 
                        alt="Satın Alma Takip" 
                        src={Logo} 
                        style={{ 
                          width: '120px', 
                          height: 'auto',
                          maxWidth: '100%'
                        }} 
                      />
                    </RouterLink>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <AuthLogin />
              </Grid>
              <Grid container justifyContent="flex-start" sx={{ mt: theme.spacing(2), mb: theme.spacing(1) }}>
                <Grid item>
                  <Typography
                    variant="subtitle2"
                    color="secondary"
                    component={RouterLink}
                    to="/register"
                    sx={{ textDecoration: 'none', pl: 2 }}
                  >
                    Hesap Oluştur
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Login;
