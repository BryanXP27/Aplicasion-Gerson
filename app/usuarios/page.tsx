<<<<<<< HEAD
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

import { ClientProtectedLayout } from "@/components/client-protected-layout" // Componente de layout que gestiona la protección de rutas en el cliente.
import { UsuariosTable } from "@/components/usuarios-table" // Componente que renderiza la tabla de datos de usuarios con sus acciones.
import { Button } from "@/components/ui/button" // Componente de UI para botones estandarizados.
import { Plus } from "lucide-react" // Biblioteca de iconos para el icono de "añadir".
import Link from "next/link" // Componente de Next.js para la navegación del lado del cliente sin recargar la página.

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
    // `ClientProtectedLayout` envuelve la página para asegurar que solo usuarios autenticados puedan acceder.
    <ClientProtectedLayout>
      {/* Contenedor principal que organiza el contenido con un espaciado vertical de 6 unidades. */}
      <div className="space-y-6">
        {/* Encabezado de la página: alinea el título a la izquierda y el botón de acción a la derecha. */}
        <div className="flex items-center justify-between">
          {/* Bloque de texto para el título y la descripción de la página. */}
=======
"use client"

// Importaciones necesarias para el componente
import { ClientProtectedLayout } from "@/components/client-protected-layout" // Layout protegido para clientes autenticados
import { UsuariosTable } from "@/components/usuarios-table" // Componente que muestra la tabla de usuarios
import { Button } from "@/components/ui/button" // Componente de botón reutilizable
import { Plus } from "lucide-react" // Icono de plus para el botón de nuevo usuario
import Link from "next/link" // Componente de Next.js para navegación

// Componente principal de la página de usuarios
export default function UsuariosPage() {
  return (
    // Layout protegido que asegura que solo usuarios autenticados puedan acceder
    <ClientProtectedLayout>
      {/* Contenedor principal con espaciado vertical */}
      <div className="space-y-6">
        {/* Sección del encabezado con título y botón de acción */}
        <div className="flex items-center justify-between">
          {/* Información del título y descripción */}
>>>>>>> 6ca1d5ea6b7d57cb64a864fbec055783162f736e
          <div>
            <h1 className="text-3xl font-bold text-[#EAEAEA]">Usuarios</h1>
            <p className="text-[#C9A227] mt-1">Gestión de empleados del sistema</p>
          </div>
<<<<<<< HEAD
          {/* Botón de "Nuevo Usuario" que redirige a la página de creación de usuarios. */}
=======
          {/* Botón para crear un nuevo usuario, enlazado a la página de creación */}
>>>>>>> 6ca1d5ea6b7d57cb64a864fbec055783162f736e
          <Link href="/usuarios/nuevo">
            <Button className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </Link>
        </div>

<<<<<<< HEAD
        {/* Renderiza el componente `UsuariosTable`, que se encarga de obtener y mostrar la lista de usuarios. */}
=======
        {/* Componente que renderiza la tabla con la lista de usuarios */}
>>>>>>> 6ca1d5ea6b7d57cb64a864fbec055783162f736e
        <UsuariosTable />
      </div>
    </ClientProtectedLayout>
  )
}
