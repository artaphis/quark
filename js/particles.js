(function () {

  var Quark = Quark || {};

  Quark.Point = function (x, y) {
    return {
      x : x,
      y : y,
      move : function (speed) {
        this.x += speed.x;
        this.y += speed.y;
      },
      set : function (point) {
        this.x = point.x;
        this.y = point.y;
      }
    };
  };

  /**
   * Base particle class.
   */
  Quark.Particle = function () {
    var self = {
      particleSystem : null,
      position : Quark.Point(0, 0),
      speed : Quark.Point(0, 0),
      life : 0,
      lifeInitial : 0,
      image : null,
      size : Quark.Point(100, 100),
      rotationDirection : Math.random() - 0.5,

      /**
       * Set position of the particle.
       */
      setPosition : function (x, y) {
        self.position.set(Quark.Point(x, y));
      },

      /**
       * On particle died event.
       */
      died : function () {
      },

      /**
       * Render particle on canvas.
       */
      render : function () {
        var context = self.particleSystem.context;

        context.globalAlpha = (self.life / self.lifeInitial);
        if (context.globalAlpha > 0.5) {
          context.globalAlpha = 1 - context.globalAlpha * context.globalAlpha;
        }

        context.save();
        var translation = Quark.Point(self.position.x + self.size.x / 2, self.position.y + self.size.y / 2);
        context.translate(translation.x, translation.y);
        context.rotate(45 * self.rotationDirection * Math.PI / 180);
        context.translate(-translation.x, -translation.y);

        context.drawImage(
          self.image,
          self.position.x - self.size.x / 2,
          self.position.y - self.size.y / 2,
          self.size.x, self.size.y);
        context.restore();

        context.globalAlpha = 1;
      },

      /**
       * Display particle.
       */
      show : function () {
        if (self.life > 0) {
          self.life--;
        } else {
          self.died();
          return;
        }
        self.render();
        self.position.move(self.speed);
      },

      /**
       * Set lifetime of the particle.
       */
      setLife : function (val) {
        self.life = val;
        self.lifeInitial = val;
      },

      /**
       * Rise from hell.
       */
      rise : function () {
        self.life = self.lifeInitial;
      }
    };

    return self;
  };

  /**
   * Fire particle class.
   */
  Quark.FireParticle = function () {
    var self = Quark.Particle();
    self.setLife(50);
    self.speed = Quark.Point(Math.random() * 3 - 2, -Math.random() * 10 - 2);
    return self;
  };

  /**
   * Smoke particle class.
   */
  Quark.CloudParticle = function () {
    var self = Quark.Particle();
    self.setLife(500);
    self.speed = Quark.Point(0, 0);
    self.size.set(Quark.Point(200, 200));
    return self;
  };

  /**
   * Smoke particle class.
   */
  Quark.SmokeParticle = function () {
    var self = Quark.Particle();
    self.setLife(50);
    self.speed = Quark.Point(Math.random() * 3 - 2, -Math.random() * 10 - 2);
    self.size.set(Quark.Point(100, 100));
    return self;
  };

  /**
   * Sparkle particle class.
   */
  Quark.SparkleParticle = function () {
    var self = Quark.Particle();
    self.setLife(50);
    self.speed = Quark.Point(Math.random() * 3 - 1, Math.random() * 20);
    self.size.set(Quark.Point(50, 50));
    return self;
  };

  /**
   * Particle system class.
   */
  Quark.ParticleSystem = function (context, particleClass) {
    var self = {
      context : context,
      maxParticlesCount : 1000,
      position : Quark.Point(0, 0),
      particles : [],
      images : [],
      size : Quark.Point(100, 50),
      particleClass : particleClass,

      /**
       * Generate new particle.
       */
      createParticle : function (context) {
        var particle = new self.particleClass();
        particle.particleSystem = self;
        particle.image = self.images[0];

        var pos = Quark.Point(self.position.x, self.position.y);
        pos.move(Quark.Point(
          self.size.x * Math.random() - self.size.x / 2,
          self.size.y * Math.random() - self.size.y / 2));

        particle.setPosition(pos.x, pos.y);

        particle.died = function () {
          var pos = Quark.Point(self.position.x, self.position.y);
          pos.move(Quark.Point(
            self.size.x * Math.random() - self.size.x / 2,
            self.size.y * Math.random() - self.size.y / 2));

          particle.setPosition(pos.x, pos.y);
          this.rise();
        };

        return particle;
      },

      draw : function () {
        if (self.particles.length < self.maxParticlesCount) {
          self.particles.push(this.createParticle(self.context));
        }

        self.particles.forEach(function (p) {
          p.show();
        });
      },

      /**
       * Set position of the particle system.
       */
      setPosition : function (x, y) {
        self.position.set(Quark.Point(x, y));
      }
    };

    return self;
  };

  /**
   * Application class.
   */
  Quark.Application = function () {
    var cursorPosition = Quark.Point(0, 0);
    var backgroundColor = '#000';
    var canvas = null;
    var canvasContext = null;
    var windowSize = Quark.Point(window.innerWidth, window.innerHeight);

    var self = {
      particleSystem : [],

      /**
       * Window resized event callback.
       */
      onResize : function () {
        windowSize.set(Quark.Point(window.innerWidth, window.innerHeight));
        canvas.width = windowSize.x;
        canvas.height = windowSize.y;
      },

      /**
       * Main application loop.
       */
      loop : function () {
        canvasContext.fillStyle = backgroundColor;
        canvasContext.fillRect(0, 0, windowSize.x, windowSize.y);

        self.particleSystem.forEach(function (particleSystem) {
          particleSystem.draw()
        });

        requestAnimFrame(self.loop);
      },

      /**
       * Initialize application.
       */
      initialize : function () {
        canvas = document.getElementById("screen");
        canvasContext = canvas.getContext("2d");

        window.requestAnimFrame = (function () {
          return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
              window.setTimeout(callback, 1000 / 30);
            };
        })();

        window.addEventListener('resize', self.onResize, false);
        self.onResize();

        document.onmousemove = function (e) {
          cursorPosition.set(Quark.Point(e.pageX, e.pageY));
        };

        var fireImage = new Image();
        fireImage.src = 'images/fire.png';

        var smokeImage = new Image();
        smokeImage.src = 'images/smoke.png';

        var sparkleImage = new Image();
        sparkleImage.src = 'images/sparkle.png';

        // Sparkles.
        self.particleSystem[0] = new Quark.ParticleSystem(canvasContext, Quark.SparkleParticle);
        self.particleSystem[0].maxParticlesCount = 100;
        self.particleSystem[0].images.push(sparkleImage);
        self.particleSystem[0].size.set(Quark.Point(windowSize.x, windowSize.y));
        self.particleSystem[0].position.set(Quark.Point(windowSize.x / 2, windowSize.y / 2));

        // Clouds.
        self.particleSystem[1] = new Quark.ParticleSystem(canvasContext, Quark.CloudParticle);
        self.particleSystem[1].maxParticlesCount = 100;
        self.particleSystem[1].images.push(smokeImage);
        self.particleSystem[1].size.set(Quark.Point(windowSize.x, windowSize.y));
        self.particleSystem[1].position.set(Quark.Point(windowSize.x / 2, windowSize.y / 2));

        // Smoke.
        self.particleSystem[2] = new Quark.ParticleSystem(canvasContext, Quark.SmokeParticle);
        self.particleSystem[2].maxParticlesCount = 100;
        self.particleSystem[2].images.push(smokeImage);
        self.particleSystem[2].size.set(Quark.Point(200, 200));
        self.particleSystem[2].position.set(Quark.Point(windowSize.x / 2, windowSize.y / 2));

        // Fire.
        self.particleSystem[3] = new Quark.ParticleSystem(canvasContext, Quark.FireParticle);
        self.particleSystem[3].maxParticlesCount = 500;
        self.particleSystem[3].images.push(fireImage);
        self.particleSystem[3].position.set(Quark.Point(windowSize.x / 2, windowSize.y / 2 + 250));
      },

      /**
       * Run application.
       */
      run : function () {
        self.loop();
      }
    };

    return self;
  };

  // Entry point.
  var application = new Quark.Application();
  application.initialize();
  application.run();
})();