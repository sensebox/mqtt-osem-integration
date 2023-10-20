# --------------> The build image
FROM node:21.0.0-bullseye-slim as build

RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends git dumb-init

WORKDIR /usr/src/app

# copy in main package.json and package-lock.lock
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/

RUN npm ci --only=production

COPY . /usr/src/app

# --------------> The production image
FROM node:21.0.0-bullseye-slim

ENV NODE_ENV=production
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
USER node

WORKDIR /usr/src/app

COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node . /usr/src/app

CMD ["dumb-init", "node", "src/index.js"]
