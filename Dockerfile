FROM node@sha256:426f843809ae05f324883afceebaa2b9cab9cb697097dbb1a2a7a41c5701de72

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --production=true

COPY ./dist ./dist/

COPY .env ./

USER node

CMD [ "yarn", "start" ]