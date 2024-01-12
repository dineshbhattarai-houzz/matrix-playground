FROM docker.io/node:lts-bullseye as builder
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM docker.io/node:lts-bullseye
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY --from=builder /usr/src/app/dist ./dist
EXPOSE 3000
USER node
CMD [ "node", "dist/index.js" ]
