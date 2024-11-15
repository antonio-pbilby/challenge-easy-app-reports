FROM node:20 AS build
WORKDIR /app
COPY ./backend .
RUN npm install
RUN npm run build

FROM node:20
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["npm", "run", "start"]