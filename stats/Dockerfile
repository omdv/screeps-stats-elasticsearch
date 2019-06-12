FROM node:11-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn install
COPY . .
CMD [ "node", "index.js" ]