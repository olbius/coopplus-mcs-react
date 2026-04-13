import { type FC, useState } from 'react';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Drawer,
  Menu, MenuItem, ListItemIcon, ListItemText, Chip, Divider,
} from '@mui/material';
import { Menu as MenuIcon, KeyboardArrowDown, Apps as AppsIcon } from '@mui/icons-material';
import { Outlet } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { modules } from '../../config/navigation';
import { NavigationMenu } from './NavigationMenu';
import { UserMenu } from './UserMenu';

const drawerWidth = 260;

export const AppLayout: FC = () => {
  const { sidebarOpen, toggleSidebar, selectedModuleId, setSelectedModule, saveModuleToServer } = useUIStore();
  const { getUserPermissions } = useAuthStore();
  const [moduleAnchor, setModuleAnchor] = useState<HTMLElement | null>(null);

  const userPermissions = getUserPermissions();
  const visibleModules = modules.filter(
    (m) => m.id !== 'dashboard' && (userPermissions.includes(m.permission) || userPermissions.includes('ADMIN')),
  );
  const selectedModule = selectedModuleId ? modules.find((m) => m.id === selectedModuleId) : null;

  const handleModuleSelect = (moduleId: string | null) => {
    setSelectedModule(moduleId);
    saveModuleToServer(moduleId);
    setModuleAnchor(null);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={toggleSidebar} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ mr: 1 }}>CoopPlus</Typography>
          <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'rgba(255,255,255,0.3)' }} />

          {/* Module Selector */}
          <Chip
            icon={selectedModule
              ? (() => { const Icon = selectedModule.icon; return <Icon sx={{ fontSize: 18, color: 'inherit !important' }} />; })()
              : <AppsIcon sx={{ fontSize: 18, color: 'inherit !important' }} />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedModule ? selectedModule.label : 'All Modules'}
                </Typography>
                <KeyboardArrowDown sx={{ fontSize: 18 }} />
              </Box>
            }
            onClick={(e) => setModuleAnchor(e.currentTarget)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)', color: 'white', height: 32,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
              '& .MuiChip-icon': { color: 'white' },
            }}
          />

          <Box sx={{ flexGrow: 1 }} />
          <UserMenu />
        </Toolbar>
      </AppBar>

      {/* Module Selector Dropdown */}
      <Menu
        anchorEl={moduleAnchor}
        open={!!moduleAnchor}
        onClose={() => setModuleAnchor(null)}
        slotProps={{ paper: { sx: { minWidth: 220, mt: 0.5 } } }}
      >
        <MenuItem onClick={() => handleModuleSelect(null)} selected={!selectedModuleId}>
          <ListItemIcon><AppsIcon fontSize="small" /></ListItemIcon>
          <ListItemText>All Modules</ListItemText>
        </MenuItem>
        <Divider />
        {visibleModules.map((module) => {
          const ModIcon = module.icon;
          return (
            <MenuItem key={module.id} onClick={() => handleModuleSelect(module.id)} selected={selectedModuleId === module.id}>
              <ListItemIcon><ModIcon fontSize="small" /></ListItemIcon>
              <ListItemText>{module.label}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>

      <Drawer
        variant="persistent"
        open={sidebarOpen}
        sx={{
          width: drawerWidth, flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', height: 'calc(100vh - 64px)' }}>
          <NavigationMenu />
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
          height: '100vh', overflow: 'hidden',
          ml: sidebarOpen ? 0 : `-${drawerWidth}px`,
          transition: 'margin 225ms cubic-bezier(0.4, 0, 0.6, 1)',
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
