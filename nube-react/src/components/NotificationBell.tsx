import React, { useState } from 'react';
import { IconButton, Badge, Menu, MenuItem, Typography, Box, Avatar, Divider,
    CircularProgress, ListItemText, ListItemAvatar } from '@mui/material';
import { Notifications, NotificationsNone, ThumbUp, ThumbDown, Warning, Comment } from '@mui/icons-material';
import {useNotificationContext} from "./NotificationProvider.tsx";

export const NotificationBell: React.FC = () => {
    const {
        notifications,
        loading,
        unreadCount,
        markAsRead,
        loadNotifications
    } = useNotificationContext();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        loadNotifications();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notificationId: string, isRead: boolean) => {
        if (!isRead) {
            await markAsRead(notificationId);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'like':
                return <ThumbUp color="primary" fontSize="small" />;
            case 'dislike':
                return <ThumbDown color="error" fontSize="small" />;
            case 'moderation':
                return <Warning color="warning" fontSize="small" />;
            case 'comment':
                return <Comment color="info" fontSize="small" />;
            default:
                return <Notifications fontSize="small" />;
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;

        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <>
            <IconButton
                onClick={handleClick}
                size="large"
                aria-label={`${unreadCount} notificaciones no leídas`}
                color="inherit"
            >
                <Badge badgeContent={unreadCount} color="error">
                    {unreadCount > 0 ? <Notifications /> : <NotificationsNone />}
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        width: 400,
                        maxHeight: 500,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="h6" component="div">
                        Notificaciones
                    </Typography>
                    {unreadCount > 0 && (
                        <Typography variant="caption" color="text.secondary">
                            {unreadCount} sin leer
                        </Typography>
                    )}
                </Box>
                <Divider />

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            No tienes notificaciones
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {notifications.slice(0, 10).map((notification) => (
                            <MenuItem
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification.id, notification.read)}
                                sx={{
                                    px: 2,
                                    py: 1.5,
                                    backgroundColor: notification.read ? 'transparent' : 'action.hover',
                                    '&:hover': {
                                        backgroundColor: 'action.selected',
                                    },
                                }}
                            >
                                <ListItemAvatar>
                                    {notification.fromUserPhoto && notification.type !== 'moderation' ? (
                                        <Avatar
                                            src={notification.fromUserPhoto}
                                            sx={{ width: 40, height: 40 }}
                                        />
                                    ) : (
                                        <Avatar sx={{ width: 40, height: 40 }}>
                                            {getNotificationIcon(notification.type)}
                                        </Avatar>
                                    )}
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: notification.read ? 'normal' : 'bold',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            {notification.message}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDate(notification.createdAt)}
                                        </Typography>
                                    }
                                />
                                {!notification.read && (
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            backgroundColor: 'primary.main',
                                            ml: 1
                                        }}
                                    />
                                )}
                            </MenuItem>
                        ))}
                    </Box>
                )}

                {notifications.length > 10 && (
                    <>
                        <Divider />
                        <MenuItem
                            onClick={handleClose}
                            sx={{ justifyContent: 'center', py: 1 }}
                        >
                            <Typography variant="body2" color="primary">
                                Ver todas las notificaciones
                            </Typography>
                        </MenuItem>
                    </>
                )}
            </Menu>
        </>
    );
};