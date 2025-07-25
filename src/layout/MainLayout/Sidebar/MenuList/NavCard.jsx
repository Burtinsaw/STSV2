// material-ui
import { Button, Card, CardMedia, CardContent, Link, Stack, Typography } from '@mui/material';

// assets
import avatar from 'assets/images/logo-with-text.png';

// ==============================|| DRAWER CONTENT - NAVIGATION CARD ||============================== //

const NavCard = () => {
  return (
    <Card sx={{ bgcolor: 'rgb(250, 250, 250)', border: '1px solid rgb(230, 235, 241)', m: 2 }}>
      <CardContent>
        <Stack alignItems="center" spacing={2.5}>
          <CardMedia 
            component="img" 
            image={avatar} 
            sx={{ 
              width: 120,
              height: 'auto',
              objectFit: 'contain'
            }} 
          />
          <Stack alignItems="center">
            <Typography variant="h6" color="primary" textAlign="center" sx={{ fontWeight: 600 }}>
              Profesyonel Satın Alma Yönetimi
            </Typography>
            <Typography variant="body2" color="secondary" textAlign="center">
              Güvenli ve Verimli Takip Sistemi
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            disabled
            sx={{ width: '100%' }}
          >
            v1.0.0
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default NavCard;
