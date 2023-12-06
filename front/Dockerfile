# Étape 1: Construire l'application React
FROM node:alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . ./
RUN npm run build

# Étape 2: Servir l'application avec un serveur web léger
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html  
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
