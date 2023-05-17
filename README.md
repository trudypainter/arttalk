# File Structure

- /prisma
  - schema.prisma &rarr; Database schema for storing comments in a database
- /public
  - /models
    - hand_landmarker.task &rarr; Model to determine hand landmark positions (from Google)
- src/
  - components/
    - AudioFeedback.tsx &rarr; Component for speaking feedback to user
    - CanvasWithGuesture.tsx &rarr; Painting component with landmark detection and gesture recognition (main view)
    - Feedback.tsx &rarr; Component for text based feedback (at bottom of screen)
    - Heatmap.tsx &rarr; Component to show heatmap of where comments are located
    - StringCarousel.tsx &rarr; Component to scroll through comments visually
  - constants/
    - constant.tsx &rarr; Datatype, graphics, and feedback text string constants
  - pages/
    - api/
      - createComment.tsx &rarr; API endpoint to add a new comment to the database
      - getAllPoints.tsx &rarr; API endpoint to retrieve all comments from database
      - getPointsAtLocation.tsx &rarr; API endpoint to get all comments from the database near a point
    - \_app.tsx &rarr; Next.js entry point (auto-generated)
    - heatmap.tsx &rarr; Web entry point for /heatmap
    - index.tsx &rarr; Web entry point for / (main page)
    - test.tsx &rarr; Web entry point for /test (finger position graph page)
  - server/
    - db.ts &rarr; Database variable setup
  - styles/
    - global.css &rarr; Global stylesheet
- .env &rarr; Contains DATABASE_URL for connecting to comments database (not available publicly)
- .eslintrc.js &rarr; ESLint config file
- .gitignore &rarr; Files to ignore for git
- next.config.mjs &rarr; Next.js config file
- package-lock.json &rarr; Dependency files
- package.json &rarr; Package list
- postcss.config.cjs &rarr; PostCSS config file
- prettier.config.cjs &rarr; Prettier (style formatting) config file
- README.md &rarr; This file
- tailwind.config.ts &rarr; Tailwind (also style) config file
- tsconfig.json &rarr; Typescript config file

# Instructions to view ArtTalk

ArtTalk is live on the internet! You do not need to run it locally if you do not want to.

[ArtTalk Main Page](https://arttalk.vercel.app/)

[Curator Heatmap](https://arttalk.vercel.app/heatmap)

[Finger Position Graph Page (used to determine algorithm for shake-to-undo)](https://arttalk.vercel.app/test)

Please use on Google Chrome, and make sure camera and microphone access is enabled.

# Instructions to run code (Created using node v18.12.1 on MacOS)

If you would prefer to run ArtTalk locally, follow these instructions.

First, you need to put the `.env` file in the main directory. Its location is listed in the table of contents.
This file will be emailed separately, as it is insecure to host on GitHub.

```
npm install
npm run dev
```

Please use on Google Chrome, and make sure camera and microphone access is enabled.
