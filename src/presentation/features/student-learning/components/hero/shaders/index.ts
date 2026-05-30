export const swarmVert = /* glsl */ `
uniform float uTime;
uniform vec3 uCursor;
uniform float uCursorStrength;

attribute float aSeed;
attribute vec3 aColor;

varying vec3 vColor;
varying float vGlow;

void main() {
  vColor = aColor;

  vec4 instancePos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vec3 iPos = instancePos.xyz;

  float breath = sin(uTime * 0.6 + aSeed * 6.2831) * 0.08;
  vec3 outward = normalize(iPos + 0.0001);
  iPos += outward * breath;

  vec3 toCursor = uCursor - iPos;
  float dist = length(toCursor);
  float falloff = smoothstep(3.5, 0.0, dist) * uCursorStrength;
  iPos += normalize(toCursor + 0.0001) * falloff * 0.6;

  float scale = 1.0 + falloff * 1.4;
  vec3 local = position * scale;

  vec4 worldPos = vec4(iPos + local, 1.0);
  gl_Position = projectionMatrix * viewMatrix * worldPos;

  vGlow = 0.4 + falloff * 1.8 + (sin(uTime * 2.0 + aSeed * 30.0) * 0.5 + 0.5) * 0.3;
}
`;

export const swarmFrag = /* glsl */ `
varying vec3 vColor;
varying float vGlow;

void main() {
  vec3 col = vColor * vGlow;
  col = pow(col, vec3(0.9));
  gl_FragColor = vec4(col, 1.0);
}
`;

export const linksVert = /* glsl */ `
attribute float aProgress;
attribute vec3 aColor;
varying float vProgress;
varying vec3 vColor;

void main() {
  vProgress = aProgress;
  vColor = aColor;
  gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
}
`;

export const linksFrag = /* glsl */ `
uniform float uTime;
varying float vProgress;
varying vec3 vColor;

void main() {
  float pulse = fract(vProgress * 2.0 - uTime * 0.45);
  float intensity = smoothstep(0.0, 0.5, pulse) * smoothstep(1.0, 0.5, pulse);
  vec3 col = vColor * (0.15 + intensity * 1.6);
  gl_FragColor = vec4(col, 0.35 + intensity * 0.6);
}
`;
