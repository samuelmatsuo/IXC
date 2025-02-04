FROM node:20

EXPOSE 3000

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

CMD ["sh", "-c", "npm start"]
