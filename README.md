# UProspectKit

UProspectKit is an AI-powered tool designed to help freelancers generate high-quality, personalized Upwork proposals. By leveraging advanced AI models, it streamlines the proposal writing process, allowing you to focus on delivering great work.

## Features

- **AI-Powered Proposals**: Generate tailored proposals based on job descriptions and your profile.
- **Modern UI**: A sleek, responsive interface built with Next.js and Tailwind CSS.
- **Fast & Efficient**: Optimized for performance and ease of use.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI Integration**: [OpenAI](https://openai.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AstrofaceLab/UProspectKit.git
   cd UProspectKit
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com). Simply connect your GitHub repository to Vercel and it will automatically handle the build and deployment.

### Environment Variables

Ensure you add the `OPENAI_API_KEY` to your Vercel project settings under "Environment Variables".

## License

MIT
