"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const api = "https://api.mytry.dev"

export default function AuthPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    host: "",
    dbname: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(`${api}/connection/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        setMessage("Conexión exitosa. Redirigiendo...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error connecting:", error);
      setMessage("Error conectando al servidor");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-gray-100 via-gray-300 to-gray-400 text-gray-900">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-10">
        {/* Formulario a la izquierda */}
        <div className="w-full lg:w-1/2  p-6 rounded shadow space-y-4">
          <h2 className="text-2xl font-bold text-center mb-4">Conexión</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
              required
            />
            <input
              type="text"
              name="host"
              placeholder="Host"
              value={formData.host}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
              required
            />
            <input
              type="text"
              name="dbname"
              placeholder="Database Name"
              value={formData.dbname}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition duration-300"
            >
              Conectar
            </button>
          </form>
          {message && (
            <p className="text-center text-sm mt-2 text-gray-700">{message}</p>
          )}
        </div>

        {/* Instrucciones a la derecha */}
        <div className="w-full lg:w-1/2 text-sm text-gray-700 space-y-4">
          <h1 className="text-3xl font-bold">Bienvenido a la Aplicación de Base de Datos</h1>

          <p>
            Conectarse a tu instancia de SQL Server para continuar. 
            <br />
            Asegúrate de que el servidor esté en ejecución y la base de datos ya esté creada.
          </p>

          <div>
            <p>
              El query de creación está en <code className="text-blue-500">dbquery.sql</code> en la raiz del proyecto
            </p>
            <p>Antes de ejecutarlo, crear y usar la base de datos con:</p>
            <div className="bg-gray-100 px-2 py-1 rounded mt-1 text-sm font-mono">
              CREATE DATABASE fastfitness;
            </div>
            <div className="bg-gray-100 px-2 py-1 rounded mt-1 text-sm font-mono">
              USE fastfitness;
            </div>
          </div>

          <div>
                <p>
                Si estás utilizando Docker, puedes levantar todo el sistema ejecutando el siguiente comando desde una terminal ubicada en la raíz del proyecto:
                <br />
                <strong>docker-compose up --build</strong>
                <br />
                Este comando se recomienda solo la primera vez, ya que se encarga de construir las imágenes desde cero.
                </p>

                <p>
                Para las siguientes veces que desees iniciar el sistema, basta con ejecutar:
                <br />
                <strong>docker-compose up</strong>
                <br />
                Esto arrancará los contenedores ya construidos sin necesidad de recompilar todo nuevamente.
                </p>

                <p>
                    Nota: Si se usa docker el host debe de ser: <strong>host.docker.internal</strong>
                </p>

            <p className="mt-2">
              Luego, accede a:
              <br />
              <a href="http://localhost:3000" className="text-blue-600 underline">
                http://localhost:3000
              </a>
              <br />
              Y listo, ya con eso se puede usar la aplicación sin problemas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
