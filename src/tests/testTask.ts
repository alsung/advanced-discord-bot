import dotenv from 'dotenv';
dotenv.config();
import { createTask, getUserTasks, updateTask, deleteTask } from '../database/task.js';
import { v4 as uuidv4 } from 'uuid';

// Sample user_id for testing
const testUser = '80d3b570-c6be-4806-8c61-d04f4039118b';
console.log('Test user ID:', testUser);
const TEST_USER_ID = testUser;
const TEST_ASSIGNEE = 'test-assignee';

async function runTests() {
    try {
        console.log('Creating a new task...');
        const newTask = await createTask(TEST_USER_ID, 'Test task description', TEST_ASSIGNEE);
        console.log('Task created:', newTask);

        console.log('Fetching all tasks for a user...');
        const tasks = await getUserTasks(TEST_USER_ID);
        console.log('User tasks:', tasks);

        if (tasks.length > 0) {
            const taskId = tasks[0].id;

            console.log('Updating the first task...');
            const updatedTask = await updateTask(taskId, 'Updated task description');
            console.log('Task updated:', updatedTask);

            console.log('Deleting the first task...');
            const deleteResponse = await deleteTask(taskId);
            console.log('Task deleted:', deleteResponse);
        }

        console.log('\n All CRUD tests completed successfully!');
    } catch (error) {
        console.error('Error during testing:', error);
    }
}

runTests();