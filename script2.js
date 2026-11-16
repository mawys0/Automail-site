
  function skalujStrone() {
    const szerokoscProjektu = 1920; // Zmień na swoją szerokość, jeśli była inna
    
    // document.documentElement.clientWidth nie liczy paska przewijania po prawej (jest dokładniejszy niż innerWidth)
    const aktualnaSzerokosc = document.documentElement.clientWidth;
    const skala = aktualnaSzerokosc / szerokoscProjektu;

    document.body.style.transformOrigin = 'top left';
    document.body.style.transform = `scale(${skala})`;
    document.body.style.width = `${szerokoscProjektu}px`;
  }

  window.addEventListener('load', skalujStrone);
  window.addEventListener('resize', skalujStrone);

