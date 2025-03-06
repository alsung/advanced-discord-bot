# ProjectManagerBot

## Overview
**ProjectManagerBot** is an advanced Discord bot designed to streamline task management, user administration, and productivity within Discord communities or teams. Leveraging powerful technologies such as TypeScript, Supabase, Redis, and Railway for deployment, this bot provides robust command-driven functionality to manage tasks efficiently.

## Tech Stack
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Caching**: Redis
- **Deployment**: Railway
- **Containerization**: Docker, Docker Compose

## Features

### User Management
- Promote and demote users between admin and member roles (`/promote`, `/demote`)
- Bulk add server members to the database (`/add-all-users`)

### Task Management
- Create tasks with optional assignee and due date (`/task-create`)
- Update task descriptions and details (`/task-update`)
- Assign tasks to different users (`/task-assign`)
- Set and check task status (`/task-status`)
- Mark tasks as completed or reopen completed tasks (`/task-complete`, `/task-reopen`)
- Delete tasks with permissions control (`/task-delete`)
- View task lists and task overviews grouped by status (`/task-list`, `/task-overview`)
- Manage and set due dates for tasks (`/task-due`)
- Remind users about upcoming or overdue tasks (`/task-remind`)

### Performance & Scalability
- Utilizes Redis caching for improved performance
- Conditional logging controlled by `DEBUG_MODE`


## Project Structure

```
advanced-discord-bot/
├── src/
│   ├── commands/                  # Discord commands
│   ├── database/                  # Database interaction layer
│   ├── types/                     # TypeScript definitions
│   │   ├── client.ts
│   │   └── command.ts
│   ├── utils/
│   │   └── logger.ts              # Logging utilities
│   ├── redisClient.ts             # Redis configuration
│   ├── clearCommands.ts           # Utility to clear Discord commands
│   ├── listCommands.ts            # Utility to list Discord commands
│   └── index.ts                   # Bot entry point
├── .env                           # Environment variables
├── docker-compose.yml             # Docker setup for local development
├── Dockerfile                     # Docker image build configuration
├── package.json                   # Project dependencies
└── tsconfig.json                  # TypeScript configuration
```

## Setup & Deployment

### Local Development

1. Clone repository:
```
git clone <repo_url>
cd advanced-discord-bot
```

2. Install dependencies:
```
npm install
```

3. Configure environment variables in .env:
```
DISCORD_BOT_TOKEN=<your_discord_bot_token>
CLIENT_ID=<discord_client_id>
SUPABASE_URL=<supabase_url>
SUPABASE_ANON_KEY=<supabase_anon_key>
REDIS_URL=redis://localhost:6379
DEBUG_MODE=true
```

4. Start local services:
```
docker compose up
```

### Deploying to Railway
1. Create a Railway project and connect your repository.
2. Add Redis and PostgreSQL (Supabase) integrations on Railway.
3. Configure Railway environment variables to match your setup.

## Commands Reference

| Command | Description |
| ------ | -------- |
| `/promote` | Promote a member to admin |
| `/demote` | Demote an admin to member |
| `/add-all-users` | Add all users in the Discord server to the DB |
| `/task-create` | Create a new task |
| `/task-update` | Update task description |
| `/task-assign` | Reassign a task to another user |
| `/task-complete` | Mark a task as complete |
| `/task-reopen` | Reopen a completed task |
| `/task-delete` | Delete a task |
| `/task-list` | List tasks assigned to you |
| `/task-overview` | Show overview of tasks by status |
| `/task-due` | Set or update a task due date |
| `/task-remind` | Send reminders for upcoming or overdue tasks |

## Challenges
- Resolving Redis connection issues during deployment.
- Managing environment variables between local and production setups.
- Ensuring robust cache invalidation strategies for task updates.

## Resolutions
- Updated Redis configuration to correctly reference Railway's Redis instance.
- Clearly documented and structured environment variables for seamless deployment.
- Implemented systematic cache invalidation across CRUD operations for data consistency.

## Takeaways
- Importance of thorough logging and conditional debug statements for troubleshooting.
- Advantage of containerization for consistent local and production environments.
- Effective use of caching significantly improves performance and user experience.

## Future Improvements
- Enhanced task reporting and analytics
- Integration with other project management tools
- Improved administrative dashboards

## License
This project is open-source under the [MIT License](LICENSE).