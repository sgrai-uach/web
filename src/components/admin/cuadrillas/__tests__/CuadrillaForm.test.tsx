import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CuadrillaForm from '../CuadrillaForm';
import { cuadrillasService, CuadrillaServiceError } from '@/services/cuadrillasService';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/lib/socket/client', () => ({
  getSocket: () => ({
    on: vi.fn(),
    off: vi.fn(),
  }),
}));

describe('CuadrillaForm (H79)', () => {
  const mockDelegaciones = [
    { id: 'del-calle-calle', nombre: 'Calle Calle', codigo: 'DEL_CALLE_CALLE' },
    { id: 'del-norte', nombre: 'Norte', codigo: 'DEL_NORTE' },
  ];

  const mockCandidatos = [
    {
      id: 'usr-1',
      nombreCompleto: 'Carlos Silva',
      rut: '15.123.456-7',
      email: 'carlos@valdivia.cl',
      rolNombre: 'Operario',
      rolCodigo: 'OPERARIO',
      delegacionNombre: 'Calle Calle',
    },
    {
      id: 'usr-2',
      nombreCompleto: 'Andrés Morales',
      rut: '16.789.012-3',
      email: 'andres@valdivia.cl',
      rolNombre: 'Brigadista',
      rolCodigo: 'BRIGADISTA',
      delegacionNombre: 'Norte',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(cuadrillasService, 'obtenerDelegaciones').mockResolvedValue(mockDelegaciones);
    vi.spyOn(cuadrillasService, 'obtenerCandidatosDelegados').mockResolvedValue(mockCandidatos);
  });

  it('debe renderizar correctamente los campos iniciales del formulario', async () => {
    render(<CuadrillaForm />);

    expect(screen.getByRole('heading', { name: /Alta de Cuadrilla Operativa/i })).toBeDefined();
    expect(screen.getByLabelText(/Nombre de la Cuadrilla/i)).toBeDefined();
    expect(screen.getByLabelText(/Delegación Municipal Base/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Buscar funcionario por nombre, apellido o RUT/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Guardar Cuadrilla/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeDefined();

    // Esperar a que carguen las delegaciones
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Calle Calle' })).toBeDefined();
    });
  });

  it('debe mostrar errores de validación si se envía el formulario vacío', async () => {
    render(<CuadrillaForm />);

    const botonGuardar = screen.getByRole('button', { name: /Guardar Cuadrilla/i });
    fireEvent.click(botonGuardar);

    await waitFor(() => {
      expect(screen.getByText(/El nombre de la cuadrilla es obligatorio/i)).toBeDefined();
      expect(screen.getByText(/Debe seleccionar una delegación municipal base/i)).toBeDefined();
      expect(screen.getByText(/Debe asignar a un funcionario como delegado responsable/i)).toBeDefined();
    });
  });

  it('debe filtrar y permitir seleccionar un delegado usando el buscador', async () => {
    render(<CuadrillaForm />);

    const buscador = screen.getByPlaceholderText(/Buscar funcionario por nombre, apellido o RUT/i);

    // Escribir en el buscador para filtrar
    fireEvent.focus(buscador);
    fireEvent.change(buscador, { target: { value: 'Carlos' } });

    // Debe mostrar la opción en el desplegable
    const opcion = await screen.findByText('Carlos Silva');
    expect(opcion).toBeDefined();

    // Seleccionar al funcionario
    fireEvent.click(opcion);

    // Debe mostrarse la tarjeta de delegado seleccionado
    expect(screen.getByText('Carlos Silva')).toBeDefined();
    expect(screen.getByText(/15.123.456-7/)).toBeDefined();
    expect(screen.getByRole('button', { name: /Cambiar Delegado/i })).toBeDefined();
  });

  it('debe completar el flujo exitoso y mostrar la pantalla de confirmación con datos', async () => {
    const mockOnSuccess = vi.fn();

    vi.spyOn(cuadrillasService, 'crearCuadrilla').mockResolvedValueOnce({
      id: 'cuad-100',
      nombre: 'Cuadrilla Vías y Calles',
      estado: 'DISPONIBLE',
      delegacion: { id: 'del-calle-calle', nombre: 'Calle Calle' },
      delegado: {
        id: 'usr-1',
        nombre: 'Carlos Silva',
        email: 'carlos@valdivia.cl',
        rut: '15.123.456-7',
      },
      creadoEn: '2026-10-24T12:00:00.000Z',
    });

    render(<CuadrillaForm onSuccess={mockOnSuccess} />);

    // 1. Ingresar nombre
    const inputNombre = screen.getByLabelText(/Nombre de la Cuadrilla/i);
    fireEvent.change(inputNombre, { target: { value: 'Cuadrilla Vías y Calles' } });

    // 2. Seleccionar delegación
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Calle Calle' })).toBeDefined();
    });
    const selectDelegacion = screen.getByLabelText(/Delegación Municipal Base/i);
    fireEvent.change(selectDelegacion, { target: { value: 'del-calle-calle' } });

    // 3. Buscar y seleccionar delegado
    const buscador = screen.getByPlaceholderText(/Buscar funcionario por nombre, apellido o RUT/i);
    fireEvent.focus(buscador);
    fireEvent.change(buscador, { target: { value: 'Carlos' } });
    const opcion = await screen.findByText('Carlos Silva');
    fireEvent.click(opcion);

    // 4. Enviar formulario
    const botonGuardar = screen.getByRole('button', { name: /Guardar Cuadrilla/i });
    fireEvent.click(botonGuardar);

    // 5. Verificar pantalla de éxito
    await waitFor(() => {
      expect(screen.getByText(/Cuadrilla Operativa Registrada Exitosamente/i)).toBeDefined();
      expect(screen.getByText('Cuadrilla Vías y Calles')).toBeDefined();
      expect(screen.getByText('DISPONIBLE')).toBeDefined();
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Cuadrilla Vías y Calles',
        estado: 'DISPONIBLE',
      })
    );
  });

  it('debe reflejar error de colisión de nombre (409 Conflict) directamente en el input', async () => {
    vi.spyOn(cuadrillasService, 'crearCuadrilla').mockRejectedValueOnce(
      new CuadrillaServiceError(
        'Ya existe una cuadrilla operativa con este nombre.',
        409,
        'nombre',
        'NOMBRE_DUPLICADO'
      )
    );

    render(<CuadrillaForm />);

    // Llenar campos
    fireEvent.change(screen.getByLabelText(/Nombre de la Cuadrilla/i), {
      target: { value: 'Cuadrilla Existente' },
    });
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Calle Calle' })).toBeDefined();
    });
    fireEvent.change(screen.getByLabelText(/Delegación Municipal Base/i), {
      target: { value: 'del-calle-calle' },
    });

    const buscador = screen.getByPlaceholderText(/Buscar funcionario por nombre, apellido o RUT/i);
    fireEvent.focus(buscador);
    fireEvent.change(buscador, { target: { value: 'Carlos' } });
    const opcion = await screen.findByText('Carlos Silva');
    fireEvent.click(opcion);

    // Enviar
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cuadrilla/i }));

    // Verificar que el mensaje 409 aparece en el campo nombre
    await waitFor(() => {
      expect(screen.getByText(/Ya existe una cuadrilla operativa con este nombre/i)).toBeDefined();
    });
  });

  it('debe redirigir al Centro de Mando al hacer clic en Cancelar', async () => {
    render(<CuadrillaForm />);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Calle Calle' })).toBeDefined();
    });

    const botonCancelar = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(botonCancelar);

    expect(mockPush).toHaveBeenCalledWith('/gestion/centro-incidentes');
  });
});
