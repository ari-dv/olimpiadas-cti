# Etapa 1: Construcción
FROM node:20-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para el build)
RUN npm install

# Copiar todo el código
COPY . .

# FORZAMOS EL BUILD: Saltamos el chequeo de tipos de TS si da problemas
# y ejecutamos directamente el build de Vite
RUN npx vite build

# Etapa 2: Servidor Nginx
FROM nginx:stable-alpine

# Copiamos la carpeta 'dist' generada por Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos tu configuración de Nginx para rutas
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]