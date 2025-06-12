
# PromptPilot: Guided Prompt Constructor

PromptPilot is a Next.js application designed to help users construct detailed and effective prompts for Large Language Models (LLMs). It features a step-by-step guided form, AI-powered prompt engineering, and the ability for users to create and save their own document type workflows.

## Features

- **Guided Prompt Construction**: Step-by-step form to select document types, goals, details, and output formats.
- **AI-Powered Prompt Engineering**:
    - AI refinement of user-provided custom instructions.
    - AI engineering of the complete prompt for optimal LLM performance.
- **Engineered Prompt Display**: Shows the final AI-optimized prompt with a one-click copy feature.
- **New Feature Creator**: Allows users to define new document types, primary goals, and suggested details, which are saved locally.
- **Context-Aware Suggestions**: AI suggests relevant next steps or details based on current input.
- **Theme Switching**: Light and Dark mode support.

## Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript
- **UI Components**: ShadCN UI
- **Styling**: Tailwind CSS
- **AI Integration**: Genkit (with Google AI)
- **State Management**: React Hooks (useState, useEffect, useContext, useReducer)
- **Linting/Formatting**: ESLint, Prettier (implicitly, via Next.js defaults)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 18.x or later (includes npm). You can download it from [nodejs.org](https://nodejs.org/).
- **Git**: For cloning the repository.

## Getting Started

Follow these steps to get your development environment set up:

1.  **Clone the Repository**
    Open your terminal and run the following command to clone the project:
    ```bash
    git clone <your-repository-url> # Replace <your-repository-url> with the actual URL
    cd PromptPilot # Or your project's directory name
    ```

2.  **Install Dependencies**
    Install the project dependencies using npm (or yarn if you prefer):
    ```bash
    npm install
    ```
    Alternatively, with yarn:
    ```bash
    yarn install
    ```

## Environment Setup

The application uses environment variables for configuration, particularly for AI services.

1.  **Create a `.env` file**
    Copy the example environment file to create your own local configuration:
    ```bash
    cp .env.example .env
    ```

2.  **Configure Environment Variables**
    Open the newly created `.env` file and add the necessary values. For Genkit with Google AI, you'll typically need a Google API key.

    ```dotenv
    # .env

    # Example for Google AI (Gemini)
    # Ensure you have enabled the "Vertex AI API" or "Generative Language API" in your Google Cloud project
    # and have an API key with permissions for these services.
    GOOGLE_API_KEY="YOUR_GOOGLE_AI_API_KEY"

    # Other variables if needed by your application
    ```
    - **`GOOGLE_API_KEY`**: Your API key for Google AI services (e.g., Gemini). You can obtain this from the [Google Cloud Console](https://console.cloud.google.com/) or [Google AI Studio](https://aistudio.google.com/app/apikey).

    **Note**: Using Genkit with Google AI might also work with Application Default Credentials (ADC) if you are running in a Google Cloud environment or have the gcloud CLI configured. If using ADC, you might not need to explicitly set `GOOGLE_API_KEY` in the `.env` file, but it's often more straightforward for local development to use an API key.

## Running the Application

PromptPilot consists of two main parts that need to be run concurrently in development: the Next.js frontend application and the Genkit AI flows server.

1.  **Start the Next.js Development Server**
    This command starts the frontend application.
    ```bash
    npm run dev
    ```
    By default, the Next.js app will be available at [http://localhost:9002](http://localhost:9002).

2.  **Start the Genkit Development Server**
    In a separate terminal window or tab, start the Genkit server. This server handles the AI logic (flows).
    ```bash
    npm run genkit:dev
    ```
    Or, to have Genkit automatically restart when AI flow files change:
    ```bash
    npm run genkit:watch
    ```
    The Genkit development server typically starts on port `3400` and provides a UI for inspecting flows at [http://localhost:3400/flows](http://localhost:3400/flows) (or the port specified if `genkit start` is configured differently).

    Ensure both servers are running to use all features of the application, especially those involving AI.

## Building for Production

To create a production-ready build of the Next.js application:
```bash
npm run build
```
This command compiles the Next.js app into static assets and optimized code in the `.next` folder. To run the production build locally:
```bash
npm run start
```

For deploying Genkit flows, refer to the [Genkit documentation](https://firebase.google.com/docs/genkit) on deploying flows, as it often involves specific cloud provider configurations (e.g., Firebase Cloud Functions, Google Cloud Run).

## Scripts Overview

- `npm run dev`: Starts the Next.js development server (Turbopack enabled, port 9002).
- `npm run genkit:dev`: Starts the Genkit development server.
- `npm run genkit:watch`: Starts the Genkit development server with file watching.
- `npm run build`: Builds the Next.js application for production.
- `npm run start`: Starts the Next.js production server.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run typecheck`: Runs TypeScript compiler to check for type errors.

## Contributing

Details on contributing to the project (if applicable).

## License

This project is licensed under the [MIT License](LICENSE.md) (assuming, create a LICENSE.md if needed).
