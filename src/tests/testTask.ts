// import dotenv from 'dotenv';
// dotenv.config();
// import { createTask, getUserTasks, updateTask, deleteTask } from '../database/task.js';
// import { v4 as uuidv4 } from 'uuid';
// import { getOrCreateUser } from '../database/userService.js';

// async function test() {
//     const userId = await getOrCreateUser('123456789', 'testUser');
//     console.log('Retrieved or created user ID:', userId);
// }

// test();

// // Sample user_id for testing
// const testUser = '80d3b570-c6be-4806-8c61-d04f4039118b';
// console.log('Test user ID:', testUser);
// const TEST_USER_ID = testUser;
// const TEST_ASSIGNEE = 'newUser';

// async function runTests() {
//     try {
//         console.log('Creating a new task...');
//         const newTask = await createTask("123456789", "testUser", "Test task description", "987654321", TEST_ASSIGNEE);
//         console.log('Task created:', newTask);

//         console.log('Fetching all tasks for a user...');
//         const tasks = await getUserTasks(TEST_USER_ID);
//         console.log('User tasks:', tasks);

//         if (tasks.length > 0) {
//             const taskId = tasks[0].id;

//             console.log('Updating the first task...');
//             const updatedTask = await updateTask(taskId, 'Updated task description');
//             console.log('Task updated:', updatedTask);

//             console.log('Deleting the first task...');
//             const deleteResponse = await deleteTask(taskId);
//             console.log('Task deleted:', deleteResponse);
//         }

//         console.log('\n All CRUD tests completed successfully!');
//     } catch (error) {
//         console.error('Error during testing:', error);
//     }
// }

// runTests();