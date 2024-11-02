// src/components/Dashboard/TaskList.js
import React from 'react';
import { List, ListItem, ListItemText, Divider } from '@mui/material';

const TaskList = ({ tasks }) => {
  return (
    <List>
      {tasks.map((task) => (
        <React.Fragment key={task._id}>
          <ListItem>
            <ListItemText
              primary={task.title}
              secondary={`${task.description} - Due: ${new Date(task.deadline).toLocaleDateString()}`}
            />
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );
};

export default TaskList;
