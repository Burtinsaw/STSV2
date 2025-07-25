import React from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { 
  Fade, 
  Button, 
  ClickAwayListener, 
  Paper, 
  Popper, 
  List, 
  ListItemText, 
  ListItemIcon, 
  ListItemButton, 
  Divider,
  Badge,
  Typography,
  Chip
} from '@mui/material';
import MenuItem from '@mui/material/MenuItem';

// assets
import PersonTwoToneIcon from '@mui/icons-material/PersonTwoTone';
import DraftsTwoToneIcon from '@mui/icons-material/DraftsTwoTone';
import LockOpenTwoTone from '@mui/icons-material/LockOpenTwoTone';
import SettingsTwoToneIcon from '@mui/icons-material/SettingsTwoTone';
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import MeetingRoomTwoToneIcon from '@mui/icons-material/MeetingRoomTwoTone';
import GroupTwoToneIcon from '@mui/icons-material/GroupTwoTone';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';

// AUTH CONTEXT
import { useAuth } from 'contexts/AuthContext';

// API
import axios from 'axios';

// ==============================|| PROFILE SECTION ||============================== //

const ProfileSection = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const [open, setOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const anchorRef = React.useRef(null);

  // Admin kontrolü
  const isAdmin = user?.role === 'admin' || user?.username === 'admin';

  // Okunmamış mesaj sayısını yükle
  const loadUnreadCount = async () => {
    try {
      const response = await axios.get('/api/messages/unread-count');
      const count = response.data?.count || 0;
      setUnreadCount(count);
    } catch (error) {
      setUnreadCount(0);
      // 404 hatası ise endpoint henüz hazır değil
    }
  };

  // Component mount olduğunda ve her 30 saniyede bir okunmamış mesaj sayısını yükle
  React.useEffect(() => {
    if (user) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleListItemClick = (event, index, action) => {
    setSelectedIndex(index);
    setOpen(false);

    // Menü aksiyonları
    switch (action) {
      case 'settings':
        navigate('/settings');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'messages':
        navigate('/messages');
        setUnreadCount(0);
        break;
      case 'user-management':
        navigate('/admin/users');
        break;
      case 'companies':
        navigate('/admin/companies');
        break;
      case 'lock':
        navigate('/lock-screen');
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      navigate('/login');
    }
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <Button
        sx={{ minWidth: { sm: 50, xs: 35 } }}
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        aria-label="Profile"
        onClick={handleToggle}
        color="inherit"
      >
        <Badge 
          badgeContent={unreadCount > 0 ? unreadCount : null} 
          color="error" 
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.75rem',
              height: '18px',
              minWidth: '18px'
            }
          }}
        >
          <AccountCircleTwoToneIcon sx={{ fontSize: '1.5rem' }} />
        </Badge>
      </Button>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[
          { name: 'offset', options: { offset: [0, 10] } },
          { name: 'preventOverflow', options: { altAxis: true } }
        ]}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <List
                  sx={{
                    width: '100%',
                    maxWidth: 350,
                    minWidth: 250,
                    backgroundColor: theme.palette.background.paper,
                    pb: 0,
                    borderRadius: '10px'
                  }}
                >

                  {/* --- KULLANICI BİLGİLERİ KURUMSAL STİL --- */}
                  <MenuItem
                    disabled
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      py: 1.5,
                      px: 2
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {user?.username}
                      {user?.role === 'admin' && (
                        <Chip
                          label="Admin"
                          color="primary"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                    {user?.role !== 'admin' && (
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 400 }}>
                        {user?.role}
                      </Typography>
                    )}
                  </MenuItem>
                  <Divider sx={{ my: 1 }} />

                  <ListItemButton 
                    selected={selectedIndex === 0} 
                    onClick={(event) => handleListItemClick(event, 0, 'settings')}
                  >
                    <ListItemIcon>
                      <SettingsTwoToneIcon />
                    </ListItemIcon>
                    <ListItemText primary="Settings" />
                  </ListItemButton>
                  
                  <ListItemButton 
                    selected={selectedIndex === 1} 
                    onClick={(event) => handleListItemClick(event, 1, 'profile')}
                  >
                    <ListItemIcon>
                      <PersonTwoToneIcon />
                    </ListItemIcon>
                    <ListItemText primary="Profile" />
                  </ListItemButton>
                  
                  <ListItemButton 
                    selected={selectedIndex === 2} 
                    onClick={(event) => handleListItemClick(event, 2, 'messages')}
                    sx={{
                      backgroundColor: unreadCount > 0 ? theme.palette.primary.light + '10' : 'transparent',
                      '&:hover': {
                        backgroundColor: unreadCount > 0 ? theme.palette.primary.light + '20' : theme.palette.action.hover
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Badge 
                        badgeContent={unreadCount > 0 ? unreadCount : null} 
                        color="error" 
                        max={99}
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.7rem',
                            height: '16px',
                            minWidth: '16px',
                            right: -3,
                            top: 3
                          }
                        }}
                      >
                        <DraftsTwoToneIcon />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>My Messages</span>
                          {unreadCount > 0 && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: theme.palette.error.main,
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }}
                            >
                              {unreadCount} yeni
                            </Typography>
                          )}
                        </div>
                      }
                    />
                  </ListItemButton>

                  {/* Admin Yönetim Menüleri - Sadece admin için */}
                  {isAdmin && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          px: 2, 
                          py: 1, 
                          display: 'block',
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          fontSize: '0.7rem'
                        }}
                      >
                        Yönetim
                      </Typography>
                      
                      <ListItemButton 
                        selected={selectedIndex === 5} 
                        onClick={(event) => handleListItemClick(event, 5, 'user-management')}
                        sx={{ 
                          backgroundColor: theme.palette.primary.light + '10',
                          '&:hover': {
                            backgroundColor: theme.palette.primary.light + '20'
                          }
                        }}
                      >
                        <ListItemIcon>
                          <GroupTwoToneIcon sx={{ color: theme.palette.primary.main }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="👥 Kullanıcı Yönetimi" 
                          sx={{ 
                            '& .MuiListItemText-primary': { 
                              color: theme.palette.primary.main,
                              fontWeight: 500
                            } 
                          }} 
                        />
                      </ListItemButton>

                      <ListItemButton 
                        selected={selectedIndex === 6} 
                        onClick={(event) => handleListItemClick(event, 6, 'companies')}
                        sx={{ 
                          backgroundColor: theme.palette.primary.light + '10',
                          '&:hover': {
                            backgroundColor: theme.palette.primary.light + '20'
                          }
                        }}
                      >
                        <ListItemIcon>
                          <BusinessOutlinedIcon sx={{ color: theme.palette.primary.main }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="🏢 Şirket Yönetimi" 
                          sx={{ 
                            '& .MuiListItemText-primary': { 
                              color: theme.palette.primary.main,
                              fontWeight: 500
                            } 
                          }} 
                        />
                      </ListItemButton>
                      <Divider sx={{ my: 1 }} />
                    </>
                  )}
                  
                  <ListItemButton 
                    selected={selectedIndex === 3} 
                    onClick={(event) => handleListItemClick(event, 3, 'lock')}
                  >
                    <ListItemIcon>
                      <LockOpenTwoTone />
                    </ListItemIcon>
                    <ListItemText primary="Lock Screen" />
                  </ListItemButton>
                  
                  <ListItemButton 
                    selected={selectedIndex === 4}
                    onClick={(event) => handleListItemClick(event, 4, 'logout')}
                  >
                    <ListItemIcon>
                      <MeetingRoomTwoToneIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </List>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default ProfileSection;
