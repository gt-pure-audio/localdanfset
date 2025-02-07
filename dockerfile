FROM node:20-bookworm
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD node app.js
