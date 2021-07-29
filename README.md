# CityScopeJS

CityScopeJS is a unified front-end system for the CityScope project. 
Documentation are here: https://cityscope.media.mit.edu/docs/frontend/CityScopeJS

## Installation
```bash
npm install
```
## Usage
To use Express API
```bash
cd src/Express
node index.js
```
Custom the settings in `.env` file

## Deploy
```bash
npm run build
```
• Using `pm2` to start `Express API`
```bash
pm2 start ./src/Express/index.js
```
• Config listen API port in nginx:
```bash
 location /api/ {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_pass http://localhost:<express_port>/;
  }
```
• API will be: `<domain>/api/get-option`