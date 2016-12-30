precision highp float;

attribute vec3 a_position;
attribute vec2 a_textureCoord;
attribute float direction;
attribute vec3 aPrevious;
attribute vec3 aNext;
attribute float width;
// attribute vec4 a_offsets;
attribute float aCounters;
// attribute vec3 aNormal;

uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_modelMatrix;
uniform mat4 u_inverseViewMatrix;
uniform sampler2D heightmap;//RenderTarget containing the transformed positions
uniform float uTime;
uniform float u_height;
uniform vec3 u_position;

uniform float aspect;

varying vec2 vUV;
varying vec3 vColor;
varying float vCounters;

void main() {

  float thickness = .1;
  int miter = 0;

  vec3 pos = a_position;


  vec2 aspectVec = vec2(aspect, 1.0);
  mat4 projViewModel = u_projectionMatrix * u_viewMatrix * u_modelMatrix;

  vec4 previousProjected = projViewModel * vec4(aPrevious.x, aPrevious.y, aPrevious.z, 1.0);
  vec4 currentProjected = projViewModel * vec4(a_position.x, a_position.y, a_position.z, 1.0);
  vec4 nextProjected = projViewModel * vec4(aNext.x, aNext.y, aNext.z, 1.0);
  vUV = a_textureCoord;

  //get 2D screen space with W divide and aspect correction
  vec2 currentScreen = currentProjected.xy / currentProjected.w * aspectVec;
  vec2 previousScreen = previousProjected.xy / previousProjected.w * aspectVec;
  vec2 nextScreen = nextProjected.xy / nextProjected.w * aspectVec;

  vCounters = aCounters;

  float len = thickness * width ;

  float orientation = direction;

  //starting point uses (next - current)
  vColor = vec3(1.0, .0, 0.0);
  vec2 dir = vec2(0.0);
  if (currentScreen == previousScreen) {
    dir = normalize(nextScreen - currentScreen);
  }

  //ending point uses (current - previous)
  else if (currentScreen == nextScreen) {
    dir = normalize(currentScreen - previousScreen);
  }
  //somewhere in middle, needs a join
  else {
    //get directions from (C - B) and (B - A)
    vec2 dirA = normalize((currentScreen - previousScreen));
    if (miter == 1) {
      vec2 dirB = normalize((nextScreen - currentScreen));
      //now compute the miter join normal and length
      vec2 tangent = normalize(dirA + dirB);
      vec2 perp = vec2(-dirA.y, dirA.x);
      vec2 miter = vec2(-tangent.y, tangent.x);
      dir = tangent;
      len = thickness / dot(miter, perp);
    } else {
      dir = dirA;

    }
  }
  vec2 normal = vec2(-dir.y, dir.x);
  vColor = vec3(normal, 1.0);
  normal.x /= aspect;
  normal *= len/2.0;

  vec4 offset =  vec4(normal * orientation, 0.0, 0.0);
  vec4 posF = currentProjected + offset;
  posF.y = texture2D( heightmap, a_position.xz ).x * u_height/4. ;//* (sin(-currentProjected.x * 1.) + .02);// * pow(-currentProjected.x, 2.);


  gl_Position = posF;//currentProjected + offset;
  gl_PointSize = 1.0;
}
