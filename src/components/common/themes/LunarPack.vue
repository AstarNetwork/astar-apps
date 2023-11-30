<template>
  <div class="wrapper">
    <canvas id="canvas" ref="target"></canvas>
  </div>
</template>
<script lang="ts">
// @ts-nocheck
import { defineComponent, ref, onMounted } from 'vue';
export default defineComponent({
  setup() {
    const target = ref(null);

    onMounted(() => {
      window.requestAnimationFrame =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
          window.setTimeout(callback, 1000 / 60);
        };

      let canvas,
        ctx,
        w = 300,
        h = 200,
        particles = [],
        probability = 0.01,
        xPoint,
        yPoint;

      function onLoad() {
        canvas = target.value;
        ctx = canvas.getContext('2d');

        window.requestAnimationFrame(updateWorld);
      }

      function updateWorld() {
        update();
        paint();
        window.requestAnimationFrame(updateWorld);
      }

      function update() {
        if (particles.length < 500 && Math.random() < probability) {
          createFirework();
        }
        const alive = [];
        for (let i = 0; i < particles.length; i++) {
          if (particles[i].move()) {
            alive.push(particles[i]);
          }
        }
        particles = alive;
      }

      function paint() {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < particles.length; i++) {
          particles[i].draw(ctx);
        }
      }

      let nFireColors = ['#D2691E', '#FF8C00', '#DAA520'];
      for (let j = 0; j < 5; j++) {
        nFireColors = nFireColors.concat(...nFireColors);
      }
      nFireColors = nFireColors.concat(...nFireColors);

      function createFirework() {
        xPoint = Math.random() * (w - 200) + 100;
        yPoint = Math.random() * (h - 200) + 100;
        const nFire = Math.random() * 50 + 100;
        const nFireColor = nFireColors[Math.floor(Math.random() * 3)];
        for (let i = 0; i < nFire; i++) {
          const particle = new Particle();
          particle.color = nFireColor;
          const vy = Math.sqrt(25 - particle.vx * particle.vx);
          if (Math.abs(particle.vy) > vy) {
            particle.vy = particle.vy > 0 ? vy : -vy;
          }
          particles.push(particle);
        }
      }

      function Particle() {
        this.w = this.h = Math.random() * 4 + 1;

        this.x = xPoint - this.w / 2;
        this.y = yPoint - this.h / 2;

        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;

        this.alpha = Math.random() * 0.5 + 0.5;

        this.color;
      }

      Particle.prototype = {
        gravity: 0.05,
        move: function () {
          this.x += this.vx;
          this.vy += this.gravity;
          this.y += this.vy;
          this.alpha -= 0.01;
          if (
            this.x <= -this.w ||
            this.x >= screen.width ||
            this.y >= screen.height ||
            this.alpha <= 0
          ) {
            return false;
          }
          return true;
        },
        draw: function (c) {
          c.save();
          c.beginPath();

          c.translate(this.x + this.w / 2, this.y + this.h / 2);
          c.arc(0, 0, this.w, 0, Math.PI * 2);
          c.fillStyle = this.color;
          c.globalAlpha = this.alpha;

          c.closePath();
          c.fill();
          c.restore();
        },
      };

      onLoad();
    });

    return { target };
  },
});
</script>
<style lang="scss" scoped>
.wrapper {
  position: absolute;
  top: 300px;
}
#canvas {
  width: 220px;
  height: 240px;
  z-index: 9999;
}
</style>
