<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/fec2c876-8ea6-4429-b52f-9702278f42f8

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```
   *(If you see dependency errors, try `npm install --legacy-peer-deps`)*
2. Create a `.env.local` file in the root directory and add your API key:
   `VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here`
3. Run the app:
   ```bash
   npm run dev
   ```