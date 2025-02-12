# Next.js Bot Project

This project is a sophisticated chatbot application built with [Next.js](https://nextjs.org), bootstrapped using [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). The chatbot is designed to interact with users and store conversation data using Supabase.

## Getting Started

To get started with this project, follow these steps:

1. **Clone the repository**
   ```bash
   git clone https://github.com/ruizTechServices/nextjs_bot.git
   cd nextjs_bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add the following environment variables:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   PROJECT_ID=your_project_id
   ORGANIZATION_ID=your_organization_id
   BRAVE_API_KEY=your_brave_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the chatbot in action.

## Features

- **Chatbot Functionality**: The chatbot can engage in conversations and respond to user inputs.
- **Supabase Integration**: Conversations are stored in a Supabase database, specifically in a table named `conversations` with columns: `id`, `conversation_id`, `position_id`, `timestamp`, `role`, and `message`.
- **Real-time Updates**: The application provides real-time updates to the chat interface.

## Learn More

To learn more about Next.js and Supabase, consider the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API.
- [Supabase Documentation](https://supabase.io/docs) - Learn how to use Supabase for database management.

## Deploy on Vercel

Deploy your Next.js app using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) for seamless integration and deployment.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
