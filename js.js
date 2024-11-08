<div id="fireworks-container">

  // Fireworks Başlatma
  const fireworksContainer = document.getElementById('fireworks-container');
  const fireworks = new Fireworks(fireworksContainer, { 
      speed: 2,
      acceleration: 1.05,
      friction: 0.97,
      gravity: 1.5,
      particles: 50,
      trace: 3,
      explosion: 5,
      autoresize: true,
      brightness: { min: 50, max: 80 },
      boundaries: { x: 50, y: 50, width: window.innerWidth - 100, height: window.innerHeight - 100 },
  });

  fireworks.start();

  // HASO.png Resmine Tıklandığında Havai Fişek Tetikleme
  const hasoImage = document.getElementById('hasoImage');
  if(hasoImage){
      hasoImage.addEventListener('click', (e) => {
          fireworks.trigger(e.clientX, e.clientY);
      });
  } else {
      console.error("HASO.png elementi bulunamadı.");
  }
</div>
