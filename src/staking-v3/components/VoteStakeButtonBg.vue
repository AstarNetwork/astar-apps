<template>
  <div id="iframe" ref="target" class="vote-stake-button-bg" />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import * as THREE from 'three';

export default defineComponent({
  setup() {
    const target = ref();

    const fragmentShader = `
// Fragment shader
// Uniforms
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform vec4 u_colors[4];
uniform float u_blur; 
uniform bool u_animate;
uniform float u_animate_speed;
uniform float u_frequency;

#define S(a,b,t) smoothstep(a,b,t)
/*
original_author: Patricio Gonzalez Vivo  
description: sRGB to linear RGB conversion.
use: <float|vec3|vec4> srgb2rgb(<float|vec3|vec4> srgb)
*/
#ifndef SRGB_EPSILON 
#define SRGB_EPSILON 0.00000001
#endif
#ifndef FNC_SRGB2RGB
#define FNC_SRGB2RGB
float srgb2rgb(float channel) {
    return (channel < 0.04045) ? channel * 0.0773993808 : pow((channel + 0.055) * 0.947867298578199, 2.4);
}
vec3 srgb2rgb(vec3 srgb) {
    return vec3(srgb2rgb(srgb.r + SRGB_EPSILON), 
                srgb2rgb(srgb.g + SRGB_EPSILON), 
                srgb2rgb(srgb.b + SRGB_EPSILON));
}
vec4 srgb2rgb(vec4 srgb) {
    return vec4(srgb2rgb(srgb.rgb), srgb.a);
}
#endif
/*
original_author: Patricio Gonzalez Vivo
description: clamp a value between 0 and 1
use: saturation(<float|vec2|vec3|vec4> value)
*/
#if !defined(FNC_SATURATE) && !defined(saturate)
#define FNC_SATURATE
#define saturate(x) clamp(x, 0.0, 1.0)
#endif
/*
original_author: Patricio Gonzalez Vivo  
description: Converts a linear RGB color to sRGB.
use: <float|vec3|vec4> rgb2srgb(<float|vec3|vec4> srgb)
*/
#ifndef FNC_RGB2SRGB
#define FNC_RGB2SRGB
float rgb2srgb(float channel) {
    return (channel < 0.0031308) ? channel * 12.92 : 1.055 * pow(channel, 0.4166666666666667) - 0.055;
}
vec3 rgb2srgb(vec3 rgb) {
    return saturate(vec3(rgb2srgb(rgb.r - SRGB_EPSILON), rgb2srgb(rgb.g - SRGB_EPSILON), rgb2srgb(rgb.b - SRGB_EPSILON)));
}
vec4 rgb2srgb(vec4 rgb) {
    return vec4(rgb2srgb(rgb.rgb), rgb.a);
}
#endif
/*
original_author: Bjorn Ottosson (@bjornornorn), Inigo Quiles
description: |
    Mix function by Inigo Quiles (https://www.shadertoy.com/view/ttcyRS) 
    utilizing Bjorn Ottosso's OkLab color space, which is provide smooth stransitions 
    Learn more about it [his article](https://bottosson.github.io/posts/oklab/)
use: <vec3|vec4> mixOklab(<vec3|vec4> colorA, <vec3|vec4> colorB, float pct)
options:
    - MIXOKLAB_COLORSPACE_SRGB: by default colA and colB use linear RGB. If you want to use sRGB define this flag
examples:
    - /shaders/color_mix.frag
*/
#ifndef FNC_MIXOKLAB
#define FNC_MIXOKLAB
vec3 mixOklab(vec3 colA, vec3 colB, float h) {
    #ifdef MIXOKLAB_COLORSPACE_SRGB
    colA = srgb2rgb(colA);
    colB = srgb2rgb(colB);
    #endif
    const mat3 kCONEtoLMS = mat3(
          0.4121656120,  0.2118591070,  0.0883097947,
          0.5362752080,  0.6807189584,  0.2818474174,
          0.0514575653,  0.1074065790,  0.6302613616);
    const mat3 kLMStoCONE = mat3(
          4.0767245293, -1.2681437731, -0.0041119885,
        -3.3072168827,  2.6093323231, -0.7034763098,
          0.2307590544, -0.3411344290,  1.7068625689);
    vec3 lmsA = pow(kCONEtoLMS * colA, vec3(1.0 / 3.0));
    vec3 lmsB = pow(kCONEtoLMS * colB, vec3(1.0 / 3.0));
    vec3 lms = mix(lmsA, lmsB, h);
    vec3 rgb = kLMStoCONE * (lms * lms * lms);
    #ifdef MIXOKLAB_COLORSPACE_SRGB
    return rgb2srgb(rgb);
    #else
    return rgb;
    #endif
}
vec4 mixOklab(vec4 colA, vec4 colB, float h) {
    return vec4(mixOklab(colA.rgb, colB.rgb, h), mix(colA.a, colB.a, h));
}
#endif
mat2 Rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}
vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(2127.1, 81.17)), dot(p, vec2(1269.5, 283.37)));
    return fract(sin(p) * 43758.5453);
}
float noise(in vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float n = mix(mix(dot(-1.0 + 2.0 * hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                        dot(-1.0 + 2.+ hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
mix(dot(-1.0 + 2.0 * hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
    dot(-1.0 + 2.0 * hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
    return 0.5 + 0.5 * n;
}
void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float ratio = u_resolution.x / u_resolution.y;
    vec2 tuv = uv;
    tuv -= .5;
    float speed = u_time * 10.0 * u_animate_speed;
    if (u_animate == false) {
        speed = 0.0;
    }
    float degree = noise(vec2(speed / 100.0, tuv.x * tuv.y));
    tuv.y *= 1.0 / ratio;
    tuv *= Rot(radians((degree - .5) * 720.0 + 180.0));
    tuv.y *= ratio;
    float frequency = 20.0 * u_frequency;
    float amplitude = 30.0 * (10.0 * (0.01 + u_blur));
    tuv.x += sin(tuv.y * frequency + speed) / amplitude;
    tuv.y += sin(tuv.x * frequency * 1.5 + speed) / (amplitude * .5);
    vec4 layer1 = mixOklab(u_colors[0], u_colors[1], S(-.3, .2, (tuv * Rot(radians(-5.0))).x));
    vec4 layer2 = mixOklab(u_colors[2], u_colors[3], S(-.3, .2, (tuv * Rot(radians(-5.0))).x));
    vec4 finalComp = mixOklab(layer1, layer2, S(.5, -.3, tuv.y));
    gl_FragColor = finalComp;
}
`;

    const vertexShader = `
// Vertex shader
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

    const uniforms = {
      u_colors: {
        value: [
          new THREE.Vector4(0, 0.2823529411764706, 0.9019607843137255, 1),
          new THREE.Vector4(0, 0.6862745098039216, 1, 1),
          new THREE.Vector4(0.4235294117647059, 0.9294117647058824, 1, 1),
          new THREE.Vector4(0, 0.16862745098039217, 0.9019607843137255, 1),
        ],
      },
      u_blur: { value: 0.83 },
      u_animate: { value: true },
      u_animate_speed: { value: 1 },
      u_frequency: { value: 0.831 },
      u_time: { value: 0 },
      u_mouse: { value: [0, 0] },
      u_resolution: { value: [1024, 1024] },
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1024 / 1024, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
      premultipliedAlpha: false,
      alpha: true,
      antialias: true,
      precision: 'highp',
      powerPreference: 'high-performance',
    });
    renderer.setSize(512, 512);

    const geometry = new THREE.PlaneGeometry(1024, 1024);
    const meterial = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms,
      wireframe: false,
      wireframeLinewidth: 0,
      dithering: false,
      // flatShading: true,
      side: THREE.DoubleSide,
      glslVersion: '100',
    });
    const mesh = new THREE.Mesh(geometry, meterial);
    scene.add(mesh);

    camera.position.z = 5;

    function animate() {
      requestAnimationFrame(animate);

      if (mesh) {
        uniforms.u_time.value += 0.05;
      }

      renderer.render(scene, camera);
    }

    onMounted(() => {
      target.value.appendChild(renderer.domElement);
      animate();
    });

    return {
      target,
    };
  },
});
</script>
<style lang="scss" scoped>
.vote-stake-button-bg {
  border: 0;
  margin: 0;
  width: 512px;
  height: 512px;
}
</style>
