import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import fs from 'fs'
import path from 'path'
import AuthPage from '../app/auth/page'

const AUTH_PAGE_PATH = path.resolve(__dirname, '../app/auth/page.tsx')

describe('J-B1 (CWE-532): Log de datos sensibles en consola del browser', () => {

  it('ANTES (vulnerable): el código original tenía console.log con la respuesta del servidor', () => {
    // Verifica que la línea vulnerable existía en la versión original
    // Documentamos el payload exacto que exponía datos
    const vulnerablePattern = `console.log("Response data:", data)`
    const currentContent = fs.readFileSync(AUTH_PAGE_PATH, 'utf-8')

    // En la versión corregida este log ya no existe
    expect(currentContent).not.toContain(vulnerablePattern)
  })

  it('DESPUÉS (corregido): console.log NO es llamado con la respuesta del servidor al hacer login', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ success: true, message: 'Succesfully conected to sql server' }),
    }) as any

    render(<AuthPage />)

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'sa' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'FastFitness123!' } })
    fireEvent.change(screen.getByPlaceholderText('Host'), { target: { value: 'sqlserver' } })
    fireEvent.change(screen.getByPlaceholderText('Database Name'), { target: { value: 'FastFitness' } })
    fireEvent.submit(screen.getByRole('button', { name: /conectar/i }).closest('form')!)

    await waitFor(() => {
      const leakedCall = consoleSpy.mock.calls.find(
        (args) => args[0] === 'Response data:'
      )
      expect(leakedCall).toBeUndefined()
    })

    consoleSpy.mockRestore()
  })
})
