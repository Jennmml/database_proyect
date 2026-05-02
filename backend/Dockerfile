# Imagen base de Node.js
FROM node:18

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto del código fuente
COPY . .

# Expone el puerto (ajústalo si usas otro)
EXPOSE 3100

# Comando para ejecutar el servidor
CMD ["node", "server.js"]
