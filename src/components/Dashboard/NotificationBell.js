import React, { useState } from 'react';
import { Badge, IconButton, Popover, Box, Typography, Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNotifications } from './NotificationContext';

const NotificationBell = () => {
  const { notifications, markAsRead } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <div>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, minWidth: 300 }}>
          <Typography variant="h6">Notifications</Typography>
          {notifications.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              No notifications yet.
            </Typography>
          ) : (
            notifications.map((notification) => (
              <Box
                key={notification._id}
                sx={{
                  p: 1,
                  borderBottom: '1px solid #ddd',
                  backgroundColor: notification.read ? '#f9f9f9' : '#fff',
                }}
              >
                <Typography variant="body2">{notification.message}</Typography>
                {!notification.read && (
                  <Button
                    size="small"
                    onClick={() => markAsRead(notification._id)}
                  >
                    Mark as Read
                  </Button>
                )}
              </Box>
            ))
          )}
        </Box>
      </Popover>
    </div>
  );
};

export default NotificationBell;
