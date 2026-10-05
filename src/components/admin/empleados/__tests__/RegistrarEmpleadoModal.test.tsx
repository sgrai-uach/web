import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegistrarEmpleadoModal from '../RegistrarEmpleadoModal';
import * as empleadosServiceModule from '@/services/empleadosService';
import type { CatalogosResponse, EmpleadoUsuario } from '@/types/empleados';

const mockCatalogos: CatalogosResponse = {
  roles: [
    { id: 'rol-admin', codigo: 'ADMIN', nombre: 'Administrador' },
    {
      id: 'rol-patrulla',
      codigo: 'PATRULLA_VERIFICADORA',
      nombre: 'Patrulla Verificadora',
    },
    {
      id: 'rol-delegado',
      codigo: 'DELEGADO_CUADRILLA',
      nombre: 'Delegado de Cuadrilla',
    },
    {
      id: 'rol-callcenter',
      codigo: 'CALL_CENTER',
      nombre: 'Operador Call Center',
    },
  ],
  delegaciones: [
    { id: 'del-norte', codigo: 'NORTE', nombre: 'Delegación Norte' },
    { id: 'del-sur', codigo: 'SUR', nombre: 'Delegación Sur' },
    { id: 'del-costa', codigo: 'COSTA', nombre: 'Delegación Costa' },
  ],
  especialidades: ['Motosierrista', 'Conductor', 'Rescate'],
  cargos: ['Delegado de Cuadrilla', 'Verificador', 'Brigadista'],
};

describe('RegistrarEmpleadoModal', () => {
  const onCloseMock = vi.fn();
  const onEmpleadoRegistradoMock = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(empleadosServiceModule.empleadosService, 'getCatalogos').mockResolvedValue(
      mockCatalogos
    );
  });

  it('no debe renderizar nada cuando isOpen es false', () => {
    const { container } = render(
      <RegistrarEmpleadoModal
        isOpen={false}
        onClose={onCloseMock}
        onEmpleadoRegistrado={onEmpleadoRegistradoMock}
        initialCatalogos={mockCatalogos}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar la cabecera y los bloques básicos cuando isOpen es true', () => {
    render(
      <RegistrarEmpleadoModal
        isOpen={true}
        onClose={onCloseMock}
        onEmpleadoRegistrado={onEmpleadoRegistradoMock}
        initialCatalogos={mockCatalogos}
      />
    );

    expect(
      screen.getByText('Registrar Nuevo Funcionario Municipal')
    ).toBeDefined();
    expect(
      screen.getByText('1. Identificación y Datos Personales')
    ).toBeDefined();
    expect(screen.getByText('2. Asignación Institucional')).toBeDefined();
    expect(
      screen.getByText('3. Credenciales de Inicio de Sesión')
    ).toBeDefined();
    // Bloque 4 no debe mostrarse inicialmente
    expect(screen.queryByText('4. Ficha Operativa de Terreno')).toBeNull();
  });

  it('debe desplegar condicionalmente la Ficha Operativa de Terreno si el rol es de terreno', async () => {
    render(
      <RegistrarEmpleadoModal
        isOpen={true}
        onClose={onCloseMock}
        onEmpleadoRegistrado={onEmpleadoRegistradoMock}
        initialCatalogos={mockCatalogos}
      />
    );

    const selectRol = screen.getByLabelText(/rol institucional/i);

    // Seleccionar rol administrativo: bloque 4 oculto
    fireEvent.change(selectRol, { target: { value: 'rol-callcenter' } });
    expect(screen.queryByText('4. Ficha Operativa de Terreno')).toBeNull();

    // Seleccionar rol de patrulla: bloque 4 visible
    fireEvent.change(selectRol, { target: { value: 'rol-patrulla' } });
    expect(screen.getByText('4. Ficha Operativa de Terreno')).toBeDefined();
    expect(screen.getByLabelText(/cargo operativo/i)).toBeDefined();
    expect(screen.getByLabelText(/especialidad técnica/i)).toBeDefined();
    expect(
      screen.getByLabelText(/disponible para despliegue/i)
    ).toBeDefined();

    // Cambiar a administrador: vuelve a ocultarse
    fireEvent.change(selectRol, { target: { value: 'rol-admin' } });
    expect(screen.queryByText('4. Ficha Operativa de Terreno')).toBeNull();
  });

  it('debe validar en tiempo real el formato y dígito verificador del RUT con Módulo 11', async () => {
    render(
      <RegistrarEmpleadoModal
        isOpen={true}
        onClose={onCloseMock}
        onEmpleadoRegistrado={onEmpleadoRegistradoMock}
        initialCatalogos={mockCatalogos}
      />
    );

    const inputRut = screen.getByLabelText(/rut chileno/i);
    const botonGuardar = screen.getByRole('button', {
      name: /registrar funcionario/i,
    });

    // Ingresar RUT inválido sintácticamente o en dígito verificador (11.111.111-2 no es válido para 11111111)
    fireEvent.change(inputRut, { target: { value: '11.111.111-2' } });
    fireEvent.click(botonGuardar);

    await waitFor(() => {
      expect(
        screen.getByText(
          /el rut ingresado no es válido \(verifique cuerpo y dígito verificador\)/i
        )
      ).toBeDefined();
    });

    // Corregir a RUT válido (11.111.111-1 sí es válido)
    fireEvent.change(inputRut, { target: { value: '11.111.111-1' } });

    // El mensaje de error del RUT debe desaparecer
    expect(
      screen.queryByText(
        /el rut ingresado no es válido \(verifique cuerpo y dígito verificador\)/i
      )
    ).toBeNull();
  });

  it('debe permitir generar automáticamente una contraseña segura', () => {
    render(
      <RegistrarEmpleadoModal
        isOpen={true}
        onClose={onCloseMock}
        onEmpleadoRegistrado={onEmpleadoRegistradoMock}
        initialCatalogos={mockCatalogos}
      />
    );

    const inputPassword = screen.getByLabelText(/contraseña inicial/i) as HTMLInputElement;
    expect(inputPassword.value).toBe('');

    const botonGenerar = screen.getByRole('button', {
      name: /generar contraseña segura/i,
    });
    fireEvent.click(botonGenerar);

    expect(inputPassword.value.length).toBeGreaterThanOrEqual(8);
  });

  it('debe mostrar advertencias de campos obligatorios al intentar enviar formulario vacío', async () => {
    render(
      <RegistrarEmpleadoModal
        isOpen={true}
        onClose={onCloseMock}
        onEmpleadoRegistrado={onEmpleadoRegistradoMock}
        initialCatalogos={mockCatalogos}
      />
    );

    const botonGuardar = screen.getByRole('button', {
      name: /registrar funcionario/i,
    });
    fireEvent.click(botonGuardar);

    await waitFor(() => {
      expect(screen.getByText('El RUT es obligatorio')).toBeDefined();
      expect(screen.getByText('Los nombres son obligatorios')).toBeDefined();
      expect(screen.getByText('Los apellidos son obligatorios')).toBeDefined();
      expect(
        screen.getByText('El correo electrónico es obligatorio')
      ).toBeDefined();
      expect(
        screen.getByText('El teléfono de contacto es obligatorio')
      ).toBeDefined();
      expect(
        screen.getByText('Debe seleccionar un rol institucional')
      ).toBeDefined();
      expect(
        screen.getByText('Debe seleccionar una delegación municipal')
      ).toBeDefined();
      expect(
        screen.getByText('La contraseña inicial es obligatoria')
      ).toBeDefined();
    });
  });

  it('debe registrar exitosamente un funcionario y ejecutar callback onEmpleadoRegistrado', async () => {
    const mockCreado: EmpleadoUsuario = {
      usuario_id: 'usr-123',
      rut: '11.111.111-1',
      nombres: 'Esteban',
      apellidos: 'Lagos',
      email: 'elagos@valdivia.cl',
      telefono: '+56987654321',
      usuario_activo: true,
      fecha_ingreso: '2026-10-01',
      fecha_salida: null,
      rol_id: 'rol-patrulla',
      rol_codigo: 'PATRULLA_VERIFICADORA',
      rol_nombre: 'Patrulla Verificadora',
      delegacion_id: 'del-costa',
      delegacion_codigo: 'COSTA',
      delegacion_nombre: 'Delegación Costa',
      es_personal: true,
      personal_id: 'per-123',
      especialidad: 'Conductor',
      cargo: 'Verificador',
      estado_operativo: 'disponible',
      disponible_terreno: true,
      observaciones: null,
    };

    vi.spyOn(empleadosServiceModule.empleadosService, 'createEmpleado').mockResolvedValue(
      mockCreado
    );

    render(
      <RegistrarEmpleadoModal
        isOpen={true}
        onClose={onCloseMock}
        onEmpleadoRegistrado={onEmpleadoRegistradoMock}
        initialCatalogos={mockCatalogos}
      />
    );

    // Llenar campos
    fireEvent.change(screen.getByLabelText(/rut chileno/i), {
      target: { value: '11.111.111-1' },
    });
    fireEvent.change(
      screen.getByLabelText(/correo electrónico institucional/i),
      {
        target: { value: 'elagos@valdivia.cl' },
      }
    );
    fireEvent.change(screen.getByLabelText(/^nombres/i), {
      target: { value: 'Esteban' },
    });
    fireEvent.change(screen.getByLabelText(/^apellidos/i), {
      target: { value: 'Lagos' },
    });
    fireEvent.change(screen.getByLabelText(/teléfono de contacto/i), {
      target: { value: '+56987654321' },
    });
    fireEvent.change(screen.getByLabelText(/rol institucional/i), {
      target: { value: 'rol-patrulla' },
    });
    fireEvent.change(screen.getByLabelText(/delegación territorial/i), {
      target: { value: 'del-costa' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña inicial/i), {
      target: { value: 'ClaveSegura2026!' },
    });

    const botonGuardar = screen.getByRole('button', {
      name: /registrar funcionario/i,
    });
    fireEvent.click(botonGuardar);

    await waitFor(() => {
      expect(onEmpleadoRegistradoMock).toHaveBeenCalledWith(mockCreado);
    });
  });

  it('debe mapear el error 409 de colisión de RUT al input correspondiente', async () => {
    vi.spyOn(empleadosServiceModule.empleadosService, 'createEmpleado').mockRejectedValue(
      new empleadosServiceModule.EmpleadosServiceError(
        'El RUT ingresado ya pertenece a un funcionario registrado',
        409,
        [
          {
            campo: 'rut',
            mensaje:
              'El RUT ingresado ya pertenece a un funcionario registrado',
          },
        ]
      )
    );

    render(
      <RegistrarEmpleadoModal
        isOpen={true}
        onClose={onCloseMock}
        onEmpleadoRegistrado={onEmpleadoRegistradoMock}
        initialCatalogos={mockCatalogos}
      />
    );

    // Llenar campos con datos válidos sintácticamente
    fireEvent.change(screen.getByLabelText(/rut chileno/i), {
      target: { value: '11.111.111-1' },
    });
    fireEvent.change(
      screen.getByLabelText(/correo electrónico institucional/i),
      {
        target: { value: 'elagos@valdivia.cl' },
      }
    );
    fireEvent.change(screen.getByLabelText(/^nombres/i), {
      target: { value: 'Esteban' },
    });
    fireEvent.change(screen.getByLabelText(/^apellidos/i), {
      target: { value: 'Lagos' },
    });
    fireEvent.change(screen.getByLabelText(/teléfono de contacto/i), {
      target: { value: '+56987654321' },
    });
    fireEvent.change(screen.getByLabelText(/rol institucional/i), {
      target: { value: 'rol-admin' },
    });
    fireEvent.change(screen.getByLabelText(/delegación territorial/i), {
      target: { value: 'del-costa' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña inicial/i), {
      target: { value: 'ClaveSegura2026!' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /registrar funcionario/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          'El RUT ingresado ya pertenece a un funcionario registrado'
        )
      ).toBeDefined();
    });
  });

  it('debe llamar a onClose cuando se presiona Cancelar', () => {
    render(
      <RegistrarEmpleadoModal
        isOpen={true}
        onClose={onCloseMock}
        onEmpleadoRegistrado={onEmpleadoRegistradoMock}
        initialCatalogos={mockCatalogos}
      />
    );

    const botonCancelar = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(botonCancelar);

    expect(onCloseMock).toHaveBeenCalled();
  });
});
