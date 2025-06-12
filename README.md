
# PromptPilot: Guided Prompt Constructor

## About The Project

PromptPilot is an innovative Next.js application designed to empower users in crafting highly effective and detailed prompts for Large Language Models (LLMs) and specialized AI services. It simplifies the prompt engineering process through a user-friendly, tabbed interface, catering to different needs:

*   **Document Prompts:** A guided, step-by-step form for constructing prompts aimed at extracting information from various document types.
*   **Gmail Prompts:** A scenario-based constructor for generating prompts to query Gmail inboxes using AI models with Gmail integration (like Gemini).

Whether you're looking to parse invoices, summarize bank statements, or efficiently search your emails, PromptPilot provides the tools to build the perfect prompt.

## Key Features

*   **Tabbed Interface for Specialized Prompt Construction:**
    *   **Document Prompts Tab:**
        *   Guided form: Select document types, define primary goals, choose standard extraction details, and add custom ones.
        *   Select output formats (e.g., CSV, structured list, bullet points).
        *   AI-powered prompt engineering: Refines custom instructions and optimizes the final prompt for LLMs.
        *   Feature Creator: Define and save new document types, goals, and suggested details locally.
        *   Context-Aware AI Suggestions: Get AI-driven recommendations for relevant details based on current selections.
    *   **Gmail Prompts Tab:**
        *   Scenario-based constructor: Choose from predefined scenarios for common Gmail tasks (e.g., extracting attachments, summarizing emails, finding client communications).
        *   Dynamic input fields: Provide necessary details specific to the chosen Gmail scenario.
        *   Generates specialized prompts tailored for AI models with Gmail access.
*   **Engineered Prompt Display:** View the final AI-optimized or constructed prompt with a convenient one-click copy feature.
*   **Customization & Extensibility:**
    *   Locally save custom document type workflows.
    *   (Future) Save client-specific Gmail prompt templates.
*   **Modern UI/UX:**
    *   Built with ShadCN UI components and Tailwind CSS.
    *   Theme switching: Supports Light and Dark modes.

## Tech Stack

*   **Frontend**: Next.js (App Router), React, TypeScript
*   **UI Components**: ShadCN UI
*   **Styling**: Tailwind CSS
*   **AI Integration**: Genkit (with Google AI)
*   **State Management**: React Hooks (useState, useEffect, useContext, useReducer)
*   **Linting/Formatting**: ESLint, Prettier (implicitly, via Next.js defaults)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Node.js**: Version 18.x or later (includes npm). You can download it from [nodejs.org](https://nodejs.org/).
*   **Git**: For cloning the repository.

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
    Copy the example environment file to create your own local configuration (if an `.env.example` is provided; otherwise, create an empty `.env` file):
    ```bash
    # If .env.example exists:
    # cp .env.example .env
    # Otherwise, create an empty .env file:
    touch .env
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
    *   **`GOOGLE_API_KEY`**: Your API key for Google AI services (e.g., Gemini). You can obtain this from the [Google Cloud Console](https://console.cloud.google.com/) or [Google AI Studio](https://aistudio.google.com/app/apikey).

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
    In a separate terminal window or tab, start the Genkit server. This server handles the AI logic (flows) for features like prompt engineering and context-aware suggestions.
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

*   `npm run dev`: Starts the Next.js development server (Turbopack enabled, port 9002).
*   `npm run genkit:dev`: Starts the Genkit development server.
*   `npm run genkit:watch`: Starts the Genkit development server with file watching.
*   `npm run build`: Builds the Next.js application for production.
*   `npm run start`: Starts the Next.js production server.
*   `npm run lint`: Runs ESLint to check for code quality issues.
*   `npm run typecheck`: Runs TypeScript compiler to check for type errors.

## Contributing

Contributions are welcome! Please follow the standard GitHub flow:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
5.  Push to the branch (`git push origin feature/AmazingFeature`).
6.  Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
