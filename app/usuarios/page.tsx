/**
 * @file app/usuarios/page.tsx
 * @description Página principal para la gestión de usuarios del sistema.
 * Permite visualizar la lista de usuarios y acceder a la funcionalidad para crear nuevos usuarios.
 * Este componente está protegido y solo es accesible para usuarios autenticados con los permisos adecuados.
 */
"use client"

// ================================================================================
// Importaciones de Componentes y Utilidades
// ================================================================================

import { ClientProtectedLayout } from "@/components/client-protected-layout"
import { UsuariosTable } from "@/components/usuarios-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

/**
 * Componente de la página de Usuarios.
 *
 * Renderiza la interfaz principal para la administración de usuarios, incluyendo
 * un encabezado con el título de la página, una descripción y un botón para
 * crear un nuevo usuario. La lista de usuarios se muestra a través del
 * componente `UsuariosTable`.
 *
 * @returns {JSX.Element} El layout de la página de gestión de usuarios.
 */
export default function UsuariosPage() {
  return (
    <ClientProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#EAEAEA]">Usuarios</h1>
            <p className="text-[#C9A227] mt-1">Gestión de empleados del sistema</p>
          </div>
          <Link href="/usuarios/nuevo">
            <Button className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </Link>
        </div>

        {/* Renderiza el componente `UsuariosTable`, que se encarga de obtener y mostrar la lista de usuarios. */}
        <UsuariosTable />
      </div>
    </ClientProtectedLayout>
  )
}
