"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const task_1 = require("../database/task");
// Sample user_id for testing
const TEST_USER_ID = 'test-user-123';
const TEST_ASSIGNEE = 'test-assignee';
async function runTests() {
    try {
        console.log('Creating a new task...');
        const newTask = await (0, task_1.createTask)(TEST_USER_ID, 'Test task description', TEST_ASSIGNEE);
        console.log('Task created:', newTask);
        console.log('Fetching all tasks for a user...');
        const tasks = await (0, task_1.getUserTasks)(TEST_USER_ID);
        console.log('User tasks:', tasks);
        if (tasks.length > 0) {
            const taskId = tasks[0].id;
            console.log('Updating the first task...');
            const updatedTask = await (0, task_1.updateTask)(taskId, 'Updated task description');
            console.log('Task updated:', updatedTask);
            console.log('Deleting the first task...');
            const deleteResponse = await (0, task_1.deleteTask)(taskId);
            console.log('Task deleted:', deleteResponse);
        }
        console.log('\n All CRUD tests completed successfully!');
    }
    catch (error) {
        console.error('Error during testing:', error);
    }
}
runTests();
