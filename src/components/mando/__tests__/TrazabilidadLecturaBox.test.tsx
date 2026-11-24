import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrazabilidadLecturaBox } from '../TrazabilidadLecturaBox';

describe('TrazabilidadLecturaBox', () => {
  it('renderiza estados de PATRULLA y CUADRILLA en variante card con geometría plana apilada', () => {
    const { rerender } = render(
      <TrazabilidadLecturaBox
        variante="card"
        estado="RECIBIDA"
        tipoUnidad="PATRULLA"
        testId="box-card"
      />
    );

    const cardPatrulla = screen.getByTestId('box-card');
    expect(cardPatrulla.textContent).toContain('RECIBIDA (SIN LEER)');
    expect(cardPatrulla.textContent).toContain('Recibida · pendiente lectura');
    expect(cardPatrulla.style.flexDirection).toBe('column');
    expect(cardPatrulla.style.flexShrink).toBe('0');
    expect(cardPatrulla.style.width).toBe('100%');
    expect(cardPatrulla.style.overflow).toBe('hidden');
    expect(cardPatrulla.style.borderRadius).toBe('0px');

    rerender(
      <TrazabilidadLecturaBox
        variante="card"
        estado="LEIDA"
        tipoUnidad="CUADRILLA"
        testId="box-card"
      />
    );

    const cardCuadrilla = screen.getByTestId('box-card');
    expect(cardCuadrilla.textContent).toContain('LEÍDA');
    expect(cardCuadrilla.textContent).toContain('Leída por la cuadrilla');
  });

  it('renderiza SIN ACUSE en variante card y parametrizado por unidad en variante drawer', () => {
    const { rerender } = render(
      <TrazabilidadLecturaBox
        variante="card"
        estado={null}
        tipoUnidad="CUADRILLA"
        testId="box-sin-acuse"
      />
    );

    const cardSinAcuse = screen.getByTestId('box-sin-acuse');
    expect(cardSinAcuse.textContent).toContain('SIN ACUSE');
    expect(cardSinAcuse.textContent).toContain('Lectura aún no confirmada');

    rerender(
      <TrazabilidadLecturaBox
        variante="drawer"
        estado={null}
        tipoUnidad="CUADRILLA"
        metaDerecha="MIS-2026-0010 · Cuadrilla Sur 1"
        testId="box-drawer"
      />
    );

    const drawerCuadrilla = screen.getByTestId('box-drawer');
    expect(drawerCuadrilla.textContent).toContain('SIN ACUSE: Lectura por cuadrilla aún no confirmada');
    expect(drawerCuadrilla.textContent).toContain('MIS-2026-0010 · Cuadrilla Sur 1');

    rerender(
      <TrazabilidadLecturaBox
        variante="drawer"
        estado="PENDIENTE_ENVIO"
        tipoUnidad="PATRULLA"
        testId="box-drawer"
      />
    );

    expect(screen.getByTestId('box-drawer').textContent).toContain(
      'NO LEÍDA: Patrulla sin señal / offline'
    );
  });

  it('renderiza variante compact en tabla de misiones y retorna null sin estado', () => {
    const { container, rerender } = render(
      <TrazabilidadLecturaBox
        variante="compact"
        estado={null}
        tipoUnidad="CUADRILLA"
        testId="box-compact"
      />
    );

    expect(container.firstChild).toBeNull();

    rerender(
      <TrazabilidadLecturaBox
        variante="compact"
        estado="ENVIADA"
        tipoUnidad="CUADRILLA"
        testId="box-compact"
      />
    );

    const compact = screen.getByTestId('box-compact');
    expect(compact.textContent).toContain('NO LEÍDA');
    expect(compact.textContent).toContain('Enviada · pendiente confirmación de cuadrilla');
  });
});
