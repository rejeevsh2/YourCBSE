# YourTeacher Production Deployment

Primary website:
https://yourteacher.co.in

Frontend:
TanStack Start / Node.js

Production start:
node .output/server/index.mjs

Backend:
Laravel / PHP
https://api.yourteacher.co.in

Database:
MySQL

Important:
- Never commit the real production backend .env.
- Never store database, SMTP, API or other production passwords in GitHub.
- APP_DEBUG must remain false in production.
- SSL/HTTPS must be enabled before public launch.
- Generate the production APP_KEY on the server.
- Create production database credentials on the server.
- Configure real SMTP credentials on the server.
