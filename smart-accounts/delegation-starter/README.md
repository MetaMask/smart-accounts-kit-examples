# Delegation Starter

This is a MetaMask Smart Accounts delegation starter example created with [@metamask/create-gator-app](https://www.npmjs.com/package/@metamask/create-gator-app).

Learn more about [Metamask Smart Accounts Kit](https://metamask.io/developer/smart-accounts-kit).

## Prerequisites

1. **Pimlico API Key**: In this template, we use Pimlico’s Bundler and Paymaster services to submit user operations and sponsor transactions, respectively. You can retrieve the required API key from [Pimlico’s Dashboard](https://dashboard.pimlico.io/apikeys).

## Project Structure

```bash
nextjs-starter/
├── public/ # Static assets
├── src/
│ ├── app/ # App router pages
│ ├── components/ # UI Components
│ ├── hooks/ # Custom React hooks
│ ├── providers/ # Custom React Context Provider
│ ├── connectors(optional)/ # Web3Auth connector for Wagmi
│ └── utils/ # Utils for the starter
├── .env # Environment variables
├── .gitignore # Git ignore rules
├── next.config.ts # Next.js configuration
└── tsconfig.json # TypeScript configuration
```

## Setup Enviroment Variables

Update the following environment variables in the `.env` file located in your project's root directory.

```
NEXT_PUBLIC_PIMLICO_API_KEY =
```

## Getting Started

First, start the development server using the package manager you selected during setup.

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about the MetaMask Smart Accounts Kit, take a look at the following resources:

- [Smart Accoutns Kit Documentation](https://docs.metamask.io/smart-accounts-kit/) - Lean more about Smart Accounts Kit features and API.

