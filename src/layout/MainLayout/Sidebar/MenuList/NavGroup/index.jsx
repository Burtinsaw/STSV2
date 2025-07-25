import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { 
  List, 
  Typography, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Collapse,
  Box
} from '@mui/material';

// project import
import NavItem from '../NavItem';
import NavCollapse from '../NavCollapse';

// assets
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

// ==============================|| NAVGROUP ||============================== //

const NavGroup = ({ item }) => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(true); // Başlangıçta açık

  const handleClick = () => {
    setOpen(!open);
  };

  const items = item.children?.map((menu) => {
    switch (menu.type) {
      case 'collapse':
        return <NavCollapse key={menu.id} menu={menu} level={1} />;
      case 'item':
        return <NavItem key={menu.id} item={menu} level={1} />;
      default:
        return (
          <Typography key={menu.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  const Icon = item.icon;
  const menuIcon = item.icon ? <Icon /> : null;

  return (
    <Box sx={{ mb: 1 }}>
      {/* Ana Grup Başlığı - Tıklanabilir */}
      <ListItemButton
        onClick={handleClick}
        sx={{
          borderRadius: '8px',
          mb: 0.5,
          mx: 1,
          py: 1.5,
          transition: 'all 0.2s ease-in-out',
          backgroundColor: open ? theme.palette.action.selected : 'transparent',
          '&:hover': {
            backgroundColor: theme.palette.primary.light,
            color: theme.palette.primary.contrastText,
            transform: 'translateX(4px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '& .MuiListItemIcon-root': {
              color: theme.palette.primary.contrastText,
            },
            '& .MuiTypography-root': {
              color: theme.palette.primary.contrastText,
            }
          }
        }}
      >
        {menuIcon && (
          <ListItemIcon 
            sx={{ 
              minWidth: 40,
              color: open ? theme.palette.primary.main : 'inherit',
              transition: 'color 0.2s ease-in-out'
            }}
          >
            {menuIcon}
          </ListItemIcon>
        )}
        <ListItemText
          primary={
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: open ? 600 : 500,
                transition: 'font-weight 0.2s ease-in-out'
              }}
            >
              {item.title}
            </Typography>
          }
          secondary={
            item.caption && (
              <Typography 
                variant="caption" 
                sx={{ 
                  opacity: 0.7,
                  fontSize: '0.75rem'
                }}
              >
                {item.caption}
              </Typography>
            )
          }
        />
        <Box
          sx={{
            transition: 'transform 0.2s ease-in-out',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        >
          <ExpandMore />
        </Box>
      </ListItemButton>

      {/* Alt Menü İçeriği */}
      <Collapse 
        in={open} 
        timeout={300}
        unmountOnExit
      >
        <List 
          component="div" 
          disablePadding
          sx={{
            pl: 1,
            pr: 1,
            '& .MuiListItemButton-root': {
              borderRadius: '6px',
              mb: 0.3,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                transform: 'translateX(8px)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              }
            }
          }}
        >
          {items}
        </List>
      </Collapse>
    </Box>
  );
};

NavGroup.propTypes = {
  item: PropTypes.object,
  children: PropTypes.object,
  title: PropTypes.string,
  caption: PropTypes.string
};

export default NavGroup;

