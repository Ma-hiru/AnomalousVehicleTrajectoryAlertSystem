FROM node:latest AS frontend
LABEL authors="Ma-hiru"
WORKDIR /app
RUN npm config set registry=https://registry.npmmirror.com
RUN npm install -g pnpm
RUN pnpm config set registry=https://registry.npmmirror.com
COPY client/package.json .
COPY client/pnpm-lock.yaml .
RUN pnpm i
COPY client/. .
RUN pnpm build

FROM golang:latest AS backend-api
WORKDIR /app
COPY server/api/go.mod server/api/go.sum ./
RUN go mod download
COPY server/api/. .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o api main.go

FROM golang:latest AS backend-video
WORKDIR /app
COPY server/video/go.mod server/video/go.sum ./
RUN go mod download
COPY server/video/. .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o video main.go

FROM alpine:latest AS build
WORKDIR /app
COPY --from=frontend /app/dist ./www
COPY --chmod=755 --from=backend-api /app/api .
COPY --chmod=755 --from=backend-video /app/video .
EXPOSE 443
ENTRYPOINT ["sh", "-c", "nohup ./api --ssl --mode > console.api.log 2>&1 & nohup ./video > console.video.log 2>&1 & tail -f /dev/null"]
