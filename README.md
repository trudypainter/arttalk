# File Structure

- /prisma
  - schema.prisma
- /public
  - /models
    - hand_landmarker.task
- src/
  - components/
    - AudioFeedback.tsx
    - CanvasWithGuesture.tsx
    - Feedback.tsx
    - Heatmap.tsx
    - StringCarousel.tsx
  - constants/
    - constant.tsx
  - lib/
    - prisma.ts
  - pages/
    - api/
    - \_app.tsx
    - heatmap.tsx
    - index.tsx
    - test.tsx
  - server/
    - db.ts
  - styles/
    - global.css
- .env
- .env.example
- .eslintrc.js
- .gitignore
- next.config.mjs
- package-lock.json
- package.json
- postcss.config.cjs
- prettier.config.cjs
- README.md
- tailwind.config.ts
- tsconfig.json

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
