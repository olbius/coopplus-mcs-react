import { useState, type FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Collapse, Box,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { modules, getVisibleFeatures, type Module, type Feature } from '../../config/navigation';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

export const NavigationMenu: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getUserPermissions } = useAuthStore();
  const { selectedModuleId } = useUIStore();
  const userPermissions = getUserPermissions();

  const [expandedFeatures, setExpandedFeatures] = useState<Record<string, boolean>>({});

  const visibleModules = modules.filter(module => {
    const hasPermission = userPermissions.includes(module.permission) || userPermissions.includes('ADMIN');
    if (!hasPermission) return false;
    if (selectedModuleId) {
      return module.id === 'dashboard' || module.id === selectedModuleId;
    }
    return true;
  });

  const handleModuleClick = (module: Module) => {
    if (module.path) navigate(module.path);
  };

  const handleFeatureClick = (feature: Feature, moduleId: string) => {
    if (feature.path) {
      navigate(feature.path);
    } else if (feature.children) {
      setExpandedFeatures(prev => ({
        ...prev,
        [`${moduleId}-${feature.id}`]: !prev[`${moduleId}-${feature.id}`],
      }));
    }
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <List sx={{ width: '100%', py: 0 }}>
      {visibleModules.map((module) => {
        const ModuleIcon = module.icon;
        const moduleFeatures = getVisibleFeatures(module.id, userPermissions);
        const isModuleActive = module.path ? isActive(module.path) : false;
        const isModuleExpanded = selectedModuleId ? true : module.id === 'dashboard';
        const showModuleHeader = !selectedModuleId || module.id === 'dashboard';

        return (
          <Box key={module.id}>
            {showModuleHeader && (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleModuleClick(module)}
                  selected={isModuleActive}
                  sx={{
                    py: 1.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main', color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '& .MuiListItemIcon-root': { color: 'white' },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}><ModuleIcon /></ListItemIcon>
                  <ListItemText primary={module.label} />
                </ListItemButton>
              </ListItem>
            )}

            {moduleFeatures.length > 0 && (
              <Collapse in={isModuleExpanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {moduleFeatures.map((feature) => {
                    const hasChildren = feature.children && feature.children.length > 0;
                    const isFeatureExpanded = expandedFeatures[`${module.id}-${feature.id}`];
                    const isFeatureActive = feature.path ? isActive(feature.path) : false;

                    return (
                      <Box key={feature.id}>
                        <ListItem disablePadding>
                          <ListItemButton
                            onClick={() => handleFeatureClick(feature, module.id)}
                            selected={isFeatureActive}
                            sx={{
                              pl: selectedModuleId ? 2 : 4, py: 1,
                              '&.Mui-selected': { bgcolor: 'action.selected' },
                            }}
                          >
                            {feature.icon && (
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                {(() => { const Icon = feature.icon; return <Icon fontSize="small" />; })()}
                              </ListItemIcon>
                            )}
                            <ListItemText
                              primary={feature.label}
                              slotProps={{ primary: { variant: 'body2', sx: { fontWeight: isFeatureActive ? 600 : 400 } } }}
                            />
                            {hasChildren && (isFeatureExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />)}
                          </ListItemButton>
                        </ListItem>

                        {hasChildren && (
                          <Collapse in={isFeatureExpanded} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                              {feature.children!.map((sub) => (
                                <ListItem key={sub.id} disablePadding>
                                  <ListItemButton
                                    onClick={() => sub.path && navigate(sub.path)}
                                    selected={sub.path ? isActive(sub.path) : false}
                                    sx={{
                                      pl: selectedModuleId ? 4 : 6, py: 0.75,
                                      '&.Mui-selected': {
                                        bgcolor: 'action.selected',
                                        borderLeft: '3px solid',
                                        borderColor: 'primary.main',
                                      },
                                    }}
                                  >
                                    <ListItemText
                                      primary={sub.label}
                                      slotProps={{ primary: { variant: 'body2', sx: { fontSize: '0.875rem' } } }}
                                    />
                                  </ListItemButton>
                                </ListItem>
                              ))}
                            </List>
                          </Collapse>
                        )}
                      </Box>
                    );
                  })}
                </List>
              </Collapse>
            )}
          </Box>
        );
      })}
    </List>
  );
};
