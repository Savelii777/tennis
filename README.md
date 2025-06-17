# Tennis App Backend

## Overview
This project is a backend application for a tennis management system built using NestJS. It provides functionalities for user authentication, match scheduling, training sessions, tournaments, and more, adhering to clean architecture principles and Domain-Driven Design (DDD).

## Technologies Used
- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **PostgreSQL**: A powerful, open-source relational database system.
- **Prisma ORM**: A modern database toolkit for TypeScript and Node.js.
- **Telegram OAuth**: For user authentication via Telegram.
- **JWT**: For securing routes and managing user sessions.
- **class-validator**: For validating incoming data.
- **Swagger**: For API documentation.
- **Docker**: For containerization and deployment.
- **Jest**: For testing the application.

## Project Structure
```
tennis-app-backend
├── src
│   ├── main.ts
│   ├── app.module.ts
│   ├── common
│   ├── config
│   ├── modules
│   ├── prisma
│   └── shared
├── test
├── .env.dev
├── .env.prod
├── .env.test
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── jest.config.js
├── nest-cli.json
├── package.json
├── README.md
├── tsconfig.build.json
└── tsconfig.json
```

## Features
- **User Management**: Create, update, and retrieve user profiles.
- **Match Scheduling**: Create and manage matches, including responses and score submissions.
- **Training Sessions**: Schedule and manage training sessions.
- **Tournaments**: Create and manage tournaments with participant registration and result input.
- **Invitations**: Send and manage invitations for matches and training sessions.
- **Notifications**: Integration with Telegram for sending notifications about events.
- **Ratings**: Update and retrieve user ratings based on match results.

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   cd tennis-app-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Create a `.env.dev` file based on the `.env.example` template.

4. Run the application:
   ```
   npm run start:dev
   ```

5. Access the API documentation at `http://localhost:3000/api/docs`.

## Testing
To run tests, use:
```
npm run test
```

## Docker
To build and run the application using Docker:
```
docker-compose up --build
```

## Contribution
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License. See the LICENSE file for details.# tennis



docker-compose up --build -d