import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MunicipalHeader } from '../MunicipalHeader';

describe('MunicipalHeader', () => {
  it('debe renderizar el enlace a las noticias municipales con el texto esperado', () => {
    render(<MunicipalHeader />);

    const newsLink = screen.getByRole('link', {
      name: /Revisa acá las últimas noticias de nuestro municipio/i,
    });
    expect(newsLink).toBeDefined();
    expect(newsLink.getAttribute('href')).toContain('munivaldivia.cl/noticias');
    expect(newsLink.getAttribute('target')).toBe('_blank');
    expect(newsLink.getAttribute('rel')).toContain('noopener');
  });

  it('debe renderizar los enlaces oficiales a redes sociales (Facebook, X, YouTube, Instagram)', () => {
    render(<MunicipalHeader />);

    const facebookLink = screen.getByRole('link', {
      name: /Facebook oficial de la Municipalidad de Valdivia/i,
    });
    expect(facebookLink).toBeDefined();
    expect(facebookLink.getAttribute('href')).toContain('facebook.com');

    const xLink = screen.getByRole('link', {
      name: /X \(Twitter\) oficial de la Municipalidad de Valdivia/i,
    });
    expect(xLink).toBeDefined();
    expect(xLink.getAttribute('href')).toContain('x.com');

    const youtubeLink = screen.getByRole('link', {
      name: /YouTube oficial de la Municipalidad de Valdivia/i,
    });
    expect(youtubeLink).toBeDefined();
    expect(youtubeLink.getAttribute('href')).toContain('youtube.com');

    const instagramLink = screen.getByRole('link', {
      name: /Instagram oficial de la Municipalidad de Valdivia/i,
    });
    expect(instagramLink).toBeDefined();
    expect(instagramLink.getAttribute('href')).toContain('instagram.com');
  });

  it('debe renderizar el botón de llamada de emergencias con el número 1451', () => {
    render(<MunicipalHeader />);

    const emergencyLink = screen.getByRole('link', {
      name: /Llamar a emergencias municipales al número 1451/i,
    });
    expect(emergencyLink).toBeDefined();
    expect(emergencyLink.getAttribute('href')).toBe('tel:1451');
  });
});
