# Celestial Architect 🌌

A hand-controlled, procedural galaxy simulation running in your browser. Create solar systems, explore distinct galaxy types, and play with fluid physics using hand gestures or your mouse.

## 📋 Prerequisites

Before you begin, ensure you have the following:

1.  **Node.js**: Required to run the development server.
    -   [Download Node.js](https://nodejs.org/) (LTS version recommended).
2.  **Web Browser**: A modern browser with WebGL and Camera support.
    -   **Recommended**: Google Chrome, Microsoft Edge, or Firefox.
3.  **Hardware**:
    -   **Webcam** (Highly Recommended): For the full hand-tracking experience.
    -   **Mouse**: Supported as a fallback if no camera is available.

## 🚀 Installation

1.  **Unzip/Clone** this project folder to your computer.
2.  **Open a Terminal** (Command Prompt, PowerShell, or Terminal) in the project folder.
3.  **Install Dependencies**:
    Run the following command to install the necessary libraries (Three.js, Vite, etc.):
    ```bash
    npm install
    ```

## ▶️ How to Run

1.  **Start the Server**:
    In the terminal, run:
    ```bash
    npm run dev
    ```
2.  **Open the App**:
    -   The terminal will show a URL, usually `http://localhost:5173`.
    -   Ctrl+Click the link or copy-paste it into your browser.
3.  **Initialize**:
    -   Click the **"INITIALIZE SYSTEM"** button on the screen to start audio and camera systems.
    -   **Allow Camera Access** if prompted.

## 🎮 Controls

| Action | Hand Gesture | Mouse Action |
| :--- | :--- | :--- |
| **Move Cursor** | Index Finger | Move Mouse |
| **Select / Click** | Pinch (Thumb + Index) | Left Click |
| **Rotate Camera** | Open Palm (Left Hand) | *N/A* |
| **Zoom** | Pinch (Right Hand) | *N/A* |
| **Black Hole** | Fist (Right Hand) | *N/A* |
| **Time Freeze** | V-Sign (Right Hand) | *N/A* |

## 🌟 Features

-   **Explore Galaxy**: Choose between **Spiral**, **Ring**, and **Nebula** types.
-   **Solar System**: Interact with planets and the sun.
-   **Sandbox Mode**: Draw with colorful fluids in 3D space.
-   **Procedural Audio**: Immersive sound effects generated in real-time.
