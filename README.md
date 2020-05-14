## About The Project
This repository contains all frontend and backend code used for creating hiveonboard.com - a landing page for people who are interested in the HIVE blockchain project and want to get involved. One of most important use cases is a simple to use account creation flow.

The app is build on ReactJS for frontend, NodeJS for backend and makes use of several open source libs - covered at the end of this file.

More about the project is covered on @hiveonboard blog on HIVE: https://peakd.com/@hiveonboard

## Getting Started
### Prerequisites
This project uses [Firebase](https://firebase.google.com/) for easy deployable and scalable infrastructure.
In order to deploy this project you have to create a free acount.

It's also possible to run this app on a linux machine with self hosted webserver, db and nodejs backend.
Feel free to make a fork and adjust it to your needs.

### Installation
- Fork the repository
````
git clone https://github.com/christianfuerst/hiveonboard
````

- Install frontend dependencies
````
cd hiveonboard
npm install
````

- Install backend dependencies
````
cd functions
npm install
````

- Change back to root directory and install Firebase CLI
````
cd ..
npm install -g firebase-tools
````
- Sign into Firebase using your Google account
````
firebase login
````
- Go to Firebase console -> Create new project

- Go to Firebase project -> Create Web-App and follow the instructions

- Create a new file ``/config/firebase.json`` using the template file in the same folder

- Put in your settings from the Web-App you just created

- Go to Firebase project -> Database and create a cloud firestore instance in your region

- Go to Firebase project -> Authentication and enable Phone Sign-In

- Create file `.firebaserc` on root folder using this template and insert your project name
````
{
  "projects": {
    "default": "your-project-name"
  }
}
````

### Configuration
- Create a new file ``/functions/config.json`` from the template file in the same folder
````
{
  "account": "INSERT-HIVE-ACCOUNT",
  "password": "INSERT-HIVE-ACTIVE-KEY",
  "rcThreshold": 30,
  "creator_instances": [
    {
      "creator": "NAME-OF-WHALE-ACCOUNT",
      "endpoint": "ENDPOINT-URI",
      "apiKey": "YOUR-API-KEY"
    }
  ]
}
````
- The file contains the HIVE account which will be used to claim account creation tickets and create accounts from this tickets
- Optional: Add API enabled https://github.com/fbslo/creator instances to use additional account, where keys aren't under your control. If no instance is available leave an empty array `[]`.

### Build and Deploy
- Build a production build for the React app
````
npm run build
````

- Deploy to Firebase
````
firebase deploy
````

### Run the app in development mode
````
npm start
````

## Dependencies (frontend)
- [@hiveio/hive-js](https://ghub.io/@hiveio/hive-js): Hive.js the JavaScript API for Hive blockchain
- [@material-ui/core](https://ghub.io/@material-ui/core): React components that implement Google&#39;s Material Design.
- [@material-ui/lab](https://ghub.io/@material-ui/lab): Material-UI Lab - Incubator for Material-UI React components.
- [@mui-treasury/components](https://ghub.io/@mui-treasury/components): 
- [@testing-library/jest-dom](https://ghub.io/@testing-library/jest-dom): Custom jest matchers to test the state of the DOM
- [@testing-library/react](https://ghub.io/@testing-library/react): Simple and complete React DOM testing utilities that encourage good testing practices.
- [@testing-library/user-event](https://ghub.io/@testing-library/user-event): Simulate user events for react-testing-library
- [clsx](https://ghub.io/clsx): A tiny (229B) utility for constructing className strings conditionally.
- [firebase](https://ghub.io/firebase): Firebase JavaScript library for web and Node.js
- [formik](https://ghub.io/formik): Forms in React, without tears
- [lodash](https://ghub.io/lodash): Lodash modular utilities.
- [react](https://ghub.io/react): React is a JavaScript library for building user interfaces.
- [react-dom](https://ghub.io/react-dom): React package for working with the DOM.
- [react-phone-input-2](https://ghub.io/react-phone-input-2): A react component to format phone numbers
- [react-router-dom](https://ghub.io/react-router-dom): DOM bindings for React Router
- [react-scripts](https://ghub.io/react-scripts): Configuration and scripts for Create React App.
- [reactfire](https://ghub.io/reactfire): Firebase library for React
- [yup](https://ghub.io/yup): Dead simple Object schema validation

## Dependencies (backend)

- [@hivechain/dhive](https://ghub.io/@hivechain/dhive): Hive blockchain RPC client library
- [axios](https://ghub.io/axios): Promise based HTTP client for the browser and node.js
- [firebase-admin](https://ghub.io/firebase-admin): Firebase admin SDK for Node.js
- [firebase-functions](https://ghub.io/firebase-functions): Firebase SDK for Cloud Functions
- [lodash](https://ghub.io/lodash): Lodash modular utilities.