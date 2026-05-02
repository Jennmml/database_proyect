import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import EstadisticaEntrenador from "@/types/estadisticaEntrenador";

interface Props {
  estadisticas: EstadisticaEntrenador[];
}

export default function EntrenadoresSesionesTotales({ estadisticas }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Sesiones por Entrenador</h2>
      <Card>
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
          <CardDescription>Cantidad de sesiones asignadas a cada entrenador</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {estadisticas.map((e) => (
            <div key={e.cedula_entrenador} className="border-b pb-2">
              <p className="font-medium">{e.nombreEntrenador}</p>
              <p className="text-sm text-muted-foreground">Cédula: {e.cedula_entrenador}</p>
              <p className="text-sm">Sesiones asignadas: {e.cantidad_sesiones}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
