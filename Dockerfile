FROM node:16

COPY . /app
WORKDIR /app

RUN npm install --legacy-peer-deps
RUN npm run full-build

FROM busybox:latest
COPY --from=0 /app/build /build
