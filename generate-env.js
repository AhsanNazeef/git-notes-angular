const fs = require('fs');

// Create the environment.ts file
const environmentFileContent = `
export const environment = {
  production: ${process.env.NODE_ENV === 'production'},
  firebase: {
    apiKey: '${process.env.FIREBASE_API_KEY}',
    authDomain: '${process.env.FIREBASE_AUTH_DOMAIN}',
    projectId: '${process.env.FIREBASE_PROJECT_ID}',
    storageBucket: '${process.env.FIREBASE_STORAGE_BUCKET}',
    messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER_ID}',
    appId: '${process.env.FIREBASE_APP_ID}',
    measurementId: '${process.env.FIREBASE_MEASUREMENT_ID}'
  }
};
`;

// Ensure the environments directory exists
const envDir = './src/environments';
if (!fs.existsSync(envDir)){
  fs.mkdirSync(envDir, { recursive: true });
}

// Write the environment files
fs.writeFileSync('./src/environments/environment.ts', environmentFileContent);
console.log('Environment files generated');