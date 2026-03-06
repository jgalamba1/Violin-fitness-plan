# 🎻 Violin Gym Tracker

A workout tracking app for violinists, with a lotus position flexibility progression. Built by ClaudeAI with React + Capacitor.

## Building the Android APK via GitHub Actions

1. Upload this entire folder to a GitHub repository
2. Go to the **Actions** tab
3. The **Build Android APK** workflow will run automatically on push
4. When complete (~10–15 min), download the APK from the **Artifacts** section
5. Install on Android: allow "unknown sources" in Settings, then tap the APK

## Running locally (web)

```bash
npm install
npm run dev
```

## Building locally (requires Android Studio)

```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
# Then build from Android Studio
```
