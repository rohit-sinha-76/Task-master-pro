document.addEventListener('DOMContentLoaded', () => {
    try {
        loadTasks();
    } catch (error) {
        console.error('Error loading tasks:', error);
        alert('Failed to load tasks. Please try refreshing the page.');
    }
});

function addTask() {
    try {
        const taskInput = document.getElementById('taskInput');
        const deadlineInput = document.getElementById('deadlineInput');
        const priorityInput = document.getElementById('priorityInput');
        
        if (!taskInput || !deadlineInput || !priorityInput) {
            throw new Error('Input elements not found');
        }

        const taskText = taskInput.value.trim();
        if (taskText === '') return;

        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            deadline: deadlineInput.value ? new Date(deadlineInput.value).toISOString() : null,
            priority: priorityInput.value || 'normal',
            created: new Date().toISOString()
        };

        saveTask(task);
        renderTask(task);
        
        taskInput.value = '';
        deadlineInput.value = '';
        priorityInput.value = 'normal';
    } catch (error) {
        console.error('Error adding task:', error);
        alert('Failed to add task. Please try again.');
    }
}

function saveTask(task) {
    try {
        if (!task || typeof task !== 'object') {
            throw new Error('Invalid task object');
        }
        let tasks = getTasks();
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving task:', error);
        throw error;
    }
}

function getTasks() {
    try {
        const tasks = localStorage.getItem('tasks');
        return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
        console.error('Error getting tasks:', error);
        return [];
    }
}

function loadTasks() {
    const tasks = getTasks();
    tasks.forEach(task => {
        try {
            renderTask(task);
        } catch (error) {
            console.error('Error rendering task:', error);
        }
    });
}

function renderTask(task) {
    try {
        const taskList = document.getElementById('taskList');
        if (!taskList) throw new Error('Task list element not found');

        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''} ${task.priority || 'normal'}`;
        taskItem.setAttribute('data-id', task.id);

        const deadlineDate = task.deadline ? new Date(task.deadline) : null;
        const isOverdue = deadlineDate && !task.completed && deadlineDate < new Date();

        taskItem.innerHTML = `
            <div class="task-content">
                <span class="task-text" onclick="toggleTask(${task.id})">${task.text || 'Untitled Task'}</span>
                <div class="priority">Priority: ${task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Normal'}</div>
                ${task.deadline && deadlineDate instanceof Date && !isNaN(deadlineDate) ? `
                    <div class="deadline ${isOverdue ? 'overdue' : ''}">
                        Due: ${deadlineDate.toLocaleString()}
                    </div>
                ` : ''}
            </div>
            <div class="task-actions">
                <button onclick="toggleTask(${task.id})">${task.completed ? 'Undo' : 'Complete'}</button>
                <button onclick="editTask(${task.id})">Edit</button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;

        taskList.appendChild(taskItem);
    } catch (error) {
        console.error('Error rendering task:', error);
        throw error;
    }
}

function toggleTask(id) {
    try {
        let tasks = getTasks();
        tasks = tasks.map(task => {
            if (task.id === id) {
                task.completed = !task.completed;
            }
            return task;
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        refreshTasks();
    } catch (error) {
        console.error('Error toggling task:', error);
        alert('Failed to update task status. Please try again.');
    }
}

function editTask(id) {
    try {
        let tasks = getTasks();
        const task = tasks.find(t => t.id === id);
        if (!task) throw new Error('Task not found');

        const newText = prompt('Edit task:', task.text) || '';
        if (newText.trim() === '') return;

        const newDeadline = prompt('Edit deadline (YYYY-MM-DD HH:MM)', 
            task.deadline ? new Date(task.deadline).toISOString().slice(0,16) : '');
        const newPriority = prompt('Edit priority (high/normal/low)', task.priority);

        tasks = tasks.map(t => {
            if (t.id === id) {
                t.text = newText.trim();
                t.deadline = newDeadline && !isNaN(new Date(newDeadline)) 
                    ? new Date(newDeadline).toISOString() 
                    : task.deadline;
                t.priority = ['high', 'normal', 'low'].includes(newPriority?.toLowerCase()) 
                    ? newPriority.toLowerCase() 
                    : task.priority;
            }
            return t;
        });
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
        refreshTasks();
    } catch (error) {
        console.error('Error editing task:', error);
        alert('Failed to edit task. Please try again.');
    }
}

function deleteTask(id) {
    try {
        let tasks = getTasks();
        tasks = tasks.filter(task => task.id !== id);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        refreshTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
    }
}

function clearAllTasks() {
    try {
        if (confirm('Are you sure you want to clear all tasks?')) {
            localStorage.removeItem('tasks');
            refreshTasks();
        }
    } catch (error) {
        console.error('Error clearing tasks:', error);
        alert('Failed to clear tasks. Please try again.');
    }
}

function sortTasks(criteria) {
    try {
        let tasks = getTasks();
        if (criteria === 'deadline') {
            tasks.sort((a, b) => {
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline) - new Date(b.deadline);
            });
        } else if (criteria === 'priority') {
            const priorityOrder = { 'high': 3, 'normal': 2, 'low': 1 };
            tasks.sort((a, b) => (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2));
        }
        localStorage.setItem('tasks', JSON.stringify(tasks));
        refreshTasks();
    } catch (error) {
        console.error('Error sorting tasks:', error);
        alert('Failed to sort tasks. Please try again.');
    }
}

function refreshTasks() {
    try {
        const taskList = document.getElementById('taskList');
        if (!taskList) throw new Error('Task list element not found');
        taskList.innerHTML = '';
        loadTasks();
    } catch (error) {
        console.error('Error refreshing tasks:', error);
        throw error;
    }
}

document.addEventListener('keypress', function(e) {
    try {
        const taskInput = document.getElementById('taskInput');
        if (e.target === taskInput && e.key === 'Enter') {
            addTask();
        }
    } catch (error) {
        console.error('Error handling keypress:', error);
    }
});