FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

RUN apk update
RUN apk add --no-cache sqlite

EXPOSE 5124

CMD ["npm", "start"] 