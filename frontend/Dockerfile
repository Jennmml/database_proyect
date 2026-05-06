# Imagen base
FROM node:18

# Instala pnpm
RUN npm install -g pnpm

# Directorio de trabajo
WORKDIR /app

# Copia e instala dependencias
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copia el resto del código
COPY . .

# Construye la app
RUN pnpm run build

# Expone el puerto por defecto de Next.js
EXPOSE 3000

# Comando para iniciar en modo producción
CMD ["pnpm", "start"]
