# Random-Dice (Smart Dice)

An interactive, AI-powered multi-mode dice application built with Next.js, Genkit, and Tailwind CSS.

## Features

- **Standard Mode**: Roll for different categories (Game, Lucky, Decision, Yoga) with AI-powered "Dice Wisdom".
- **Tournament Mode**: Compete with 2-10 players. Set custom rolls-per-player and track live scores with a final ranked leaderboard.
- **Stone Paper Scissors**: A randomized 2-player battle mode with dramatic countdowns and simultaneous reveals.
- **Triple Six Rule**: Rolling a six gives a bonus turn, but three sixes in a row cancels the turn!
- **AI Integration**: Uses Google Genkit to provide witty interpretations of your rolls.

## Setup and Deployment

To push this project to your GitHub repository, you can use the following commands:

```bash
git init
git add .
git commit -m "Initial commit: 3-mode dice app with AI insights"
git branch -M main
git remote add origin https://github.com/faltu087/Random-Dice.git
git push -u origin main
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: Google Genkit
- **Styling**: Tailwind CSS & ShadCN UI
- **State Management**: Zustand
- **Animations**: Framer Motion & Tailwind Animate
