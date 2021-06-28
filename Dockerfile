FROM node:alpine AS build

ARG buildcmd="npm run build:prod"

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN ${buildcmd}
##################################################
FROM node:alpine AS package

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=prod
RUN npm cache clean --force
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000

USER node
CMD node dist/main