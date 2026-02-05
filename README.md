# Furniture Designer App

A Java Swing application for designing furniture.

## Project Structure

```
FurnitureDesignerApp/
 ├─ src/
 │   ├─ frontend/          ← Java Swing (UI)
 │   │   └─ LoginFrame.java
 │   │
 │   ├─ backend/           ← Logic / validation / data
 │   │   └─ AuthService.java
 │   │
 │   └─ main/
 │       └─ App.java       ← Entry point
 │
 ├─ out/                   ← compiled files (auto-created)
 ├─ README.md
 └─ .gitignore
```

## Requirements

- Java JDK 11 or higher

## How to Compile

```bash
# Create output directory
mkdir out

# Compile all Java files
javac -d out src/backend/*.java src/frontend/*.java src/main/*.java
```

## How to Run

```bash
# Run the application
java -cp out main.App
```

## Default Login Credentials

For testing purposes:
- Username: `admin` | Password: `admin123`
- Username: `designer` | Password: `design456`

## Features

- User authentication with login form
- Clean and simple UI using Java Swing
- Modular architecture separating frontend and backend
