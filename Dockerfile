# ─── 阶段 1：构建前端 ────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend ./
RUN npm run build

# ─── 阶段 2：生产镜像 ────────────────────────────────────────────
FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production

# HEIF 瓦片拼图需系统 ffmpeg（优先于 ffmpeg-static）
RUN apk add --no-cache ffmpeg

# 安装后端依赖
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm install --omit=dev

# 拷贝后端源码与种子数据
COPY backend/src ./backend/src
COPY backend/scripts ./backend/scripts
COPY backend/data ./backend/data

# 前端构建产物 → backend/public（后端同时提供 /api 与静态页）
COPY --from=build /app/frontend/dist ./backend/public

ENV PORT=3002
ENV DATA_FILE=/data/collections.json
EXPOSE 3002

# Railway 禁用 Dockerfile 内 VOLUME；如需持久化 DATA_FILE 请在 Railway 挂 Volume 到 /data
RUN mkdir -p /data

CMD ["node", "backend/scripts/deploy-start.mjs"]
