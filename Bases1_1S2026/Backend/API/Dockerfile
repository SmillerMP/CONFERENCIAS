FROM node:22-bookworm-slim

WORKDIR /app

RUN npm install -g pnpm@10.16.0

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3001

CMD ["node", "src/index.js"]
