export default interface Pago {
    id_pago: number
    cedula: string
    nombre_completo: string
    tipo_membresia: string
    fecha_pago: string
    monto: number
    formaDePago: string
}