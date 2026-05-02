"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import Revision from "@/types/Revision"
import { useTheme } from "../../context/ThemeContext"

interface Props {
  open: boolean
  onClose: () => void
  idMaquina: number | null
}

export default function RevisionHistoryModal({ open, onClose, idMaquina }: Props) {
  const { theme } = useTheme()
  const [revisiones, setRevisiones] = useState<Revision[]>([])

  useEffect(() => {
    if (!idMaquina) return

    const fetchRevisiones = async () => {
      const res = await fetch("https://api.mytry.dev/admin/vistaRevisionMaquina")
      const data = await res.json()
      if (data.success) {
        const filtradas = data.data.filter((r: any) => r.id_maquina === idMaquina)
        setRevisiones(filtradas)
      }
    }

    fetchRevisiones()
  }, [idMaquina])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`max-w-xl transition-colors duration-300 ${
    theme === "dark" ? "bg-[#1a1a1a] text-white" : "bg-white text-black"
  }`}>
        <DialogHeader>
          <DialogTitle>Historial de revisiones - Máquina #{idMaquina}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] mt-2 pr-2">
          <div className="space-y-4 text-sm">
            {revisiones.length === 0 ? (
              <p className="text-muted-foreground">No hay revisiones registradas.</p>
            ) : (
              revisiones.map((r) => (
                <div key={r.id_revision} className="border-b pb-2">
                  <p><strong>Revisión #{r.id_revision}</strong> - {new Date(r.fecha_revision).toLocaleDateString()}</p>
                  <p><strong>Estado:</strong> <Badge variant="outline">{r.estado_asignado}</Badge></p>
                  <p><strong>Admin:</strong> {r.nombre_admin}</p>
                  <p><strong>Observación:</strong></p>
                  <p className="whitespace-pre-wrap">{r.observacion}</p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
