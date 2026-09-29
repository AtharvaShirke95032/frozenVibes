// Full-screen photo shader: noise-driven "frost/thaw" dissolve between two photos,
// icy refraction along the dissolve edge, and a pointer-reactive lens with RGB split.

export const frostVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const frostFragment = /* glsl */ `
  uniform sampler2D uTex0;
  uniform sampler2D uTex1;
  uniform vec2 uImg0;
  uniform vec2 uImg1;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform float uVel;
  uniform float uProgress;
  uniform float uTime;
  uniform vec3 uFrost;
  varying vec2 vUv;

  // Simplex noise (Ashima / Stefan Gustavson, MIT)
  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float f = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { f += a * snoise(p); p *= 2.02; a *= 0.5; }
    return f * 0.5 + 0.5;
  }

  vec2 cover(vec2 uv, vec2 res, vec2 img) {
    float rs = res.x / res.y;
    float ri = img.x / img.y;
    vec2 s = rs < ri ? vec2(rs / ri, 1.0) : vec2(1.0, ri / rs);
    return (uv - 0.5) * s + 0.5;
  }

  vec3 sampleRGB(sampler2D t, vec2 uv, vec2 shift) {
    return vec3(
      texture2D(t, uv + shift).r,
      texture2D(t, uv).g,
      texture2D(t, uv - shift).b
    );
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;

    // Slow "breathing" zoom.
    float zoom = 1.0 - 0.025 * sin(uTime * 0.15);
    uv = (uv - 0.5) * zoom + 0.5;

    // Pointer lens: push pixels away from the cursor, stronger when moving fast.
    vec2 d = (vUv - uMouse) * vec2(aspect, 1.0);
    float lens = smoothstep(0.35, 0.0, length(d));
    uv -= normalize(d + 1e-5) * lens * (0.012 + uVel * 0.05) / vec2(aspect, 1.0);
    vec2 split = vec2(lens * uVel * 0.012 + 0.0008, 0.0);

    // Frost dissolve. All the expensive noise only runs while a transition is in progress
    // (uProgress is a uniform, so these branches are coherent and effectively free when idle).
    vec3 col;
    if (uProgress <= 0.0) {
      col = sampleRGB(uTex0, cover(uv, uRes, uImg0), split);
    } else {
      float n = fbm(vUv * vec2(aspect, 1.0) * 2.2 + uTime * 0.03);
      float w = 0.12;
      float p = uProgress * (1.0 + 2.0 * w) - w;
      float mask = smoothstep(n - w, n + w, p);
      float edge = pow(1.0 - abs(mask * 2.0 - 1.0), 1.5);

      vec2 refr = vec2(0.0);
      if (edge > 0.001) {
        // Icy refraction along the edge.
        refr = vec2(snoise(vUv * 18.0 + uTime * 0.2), snoise(vUv * 18.0 - uTime * 0.2)) * 0.018 * edge;
      }
      vec3 a = mask < 0.999 ? sampleRGB(uTex0, cover(uv + refr, uRes, uImg0), split) : vec3(0.0);
      vec3 b = mask > 0.001 ? sampleRGB(uTex1, cover(uv - refr, uRes, uImg1), split) : vec3(0.0);
      col = mix(a, b, mask);

      if (edge > 0.001) {
        // Frost bloom: brighten + cool-tint the crystal edge.
        float crystals = smoothstep(0.55, 1.0, fbm(vUv * vec2(aspect, 1.0) * 14.0));
        col = mix(col, uFrost * 1.15, edge * (0.35 + 0.45 * crystals));
        col += edge * 0.08;
      }
    }

    // Editorial grade: slight desaturation, soft vignette, darker base for legible type.
    float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
    col = mix(vec3(l), col, 0.88);
    float vig = smoothstep(1.25, 0.35, length((vUv - 0.5) * vec2(aspect * 0.8, 1.0)));
    col *= mix(0.72, 1.0, vig);
    col *= mix(0.62, 1.0, smoothstep(0.0, 0.45, vUv.y));

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export const snowVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  attribute float aSize;
  attribute float aSpeed;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    // Fall + sway, wrapping vertically inside the [-1, 1] box.
    p.y = mod(p.y - uTime * aSpeed * 0.06 + 1.0, 2.0) - 1.0;
    p.x += sin(uTime * 0.3 * aSpeed + position.y * 6.0) * 0.03;
    // Depth parallax against the pointer.
    p.xy += (uMouse - 0.5) * 0.06 * p.z;

    // Drawn straight in clip space; z (0..1) is only a depth cue for size, alpha and parallax.
    gl_Position = vec4(p.xy, 0.0, 1.0);
    gl_PointSize = aSize * uPixelRatio * (1.0 + p.z * 0.8);
    vAlpha = 0.25 + 0.55 * p.z;
  }
`;

export const snowFragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(vec3(0.93, 0.96, 1.0), a);
  }
`;
