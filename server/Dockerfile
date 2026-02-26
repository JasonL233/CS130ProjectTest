FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# App listens on 4000
EXPOSE 4000

# Dev command
CMD ["npm", "run", "dev"]