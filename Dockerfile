FROM node:10-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install react-scripts -g --silent
RUN yarn install
RUN yarn run build

FROM node:10-alpine
RUN yarn global add serve
WORKDIR /app
COPY --from=builder /app/build .
COPY scripts/docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["serve", "-p", "3000", "-s", "."]doc
