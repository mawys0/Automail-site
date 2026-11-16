
  function skalujStrone() {
    // Wpisz tutaj szerokość ekranu, na którym projektowałeś stronę (np. 1920 lub 1366)
    const szerokoscProjektu = 1920; 
    
    const aktualnaSzerokosc = window.innerWidth;
    const skala = aktualnaSzerokosc / szerokoscProjektu;

    document.body.style.transformOrigin = 'top left';
    document.body.style.transform = `scale(${skala})`;
    document.body.style.width = `${szerokoscProjektu}px`;
  }

  window.addEventListener('load', skalujStrone);
  window.addEventListener('resize', skalujStrone);

