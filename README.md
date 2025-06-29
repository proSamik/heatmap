## Installation Guidelines

1. Install the necessary dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

2. Set up your database connection:
   - Use a PostgreSQL database and provide the database URL in your environment variables.

3. Install the SQL scripts:
   - Navigate to the [scripts](./scripts) directory and run the SQL scripts to set up your database schema.

4. Configure environment variables:
   - Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

5. Deploy your application:
   - After test, deploy it to vercel from the github. 

Make sure to follow these steps to ensure a smooth setup process.

See you, 
Samik
