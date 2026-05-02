# Imagen base
FROM node:18

# Directorio de trabajo
WORKDIR /app

# Copia e instala dependencias
COPY package*.json ./
RUN npm install

# Copia el resto del código
COPY . .

# Construye la app
RUN npm run build

# Expone el puerto por defecto de Next.js
EXPOSE 3000

# Comando para iniciar en modo producción
CMD ["npm", "start"]
