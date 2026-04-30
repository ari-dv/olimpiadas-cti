# Etapa 1: Construcción
FROM node:20-alpine AS build

WORKDIR /app

# Copiar archivos de configuración
COPY package.json package-lock.json ./

# Instalar dependencias de forma limpia
RUN npm ci

# Copiar el resto del código
COPY . .

# Ejecutar el build de Vite
RUN npm run build

# Etapa 2: Servidor Nginx
FROM nginx:stable-alpine

# Copiar los archivos generados (Vite por defecto usa 'dist')
# Si tu proyecto usa 'build', cambia /app/dist por /app/build
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx para React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]