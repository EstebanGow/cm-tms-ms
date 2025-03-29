FROM node:20

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --production=true

COPY ./dist ./dist/
COPY .env ./

RUN ls -la ./dist/
RUN cat ./dist/index.js | head -n 10

EXPOSE 8080
USER node

CMD ["node", "./dist/index.js"]