import mcgl, {GLShader} from 'mcgl';
import glmatrix from 'gl-matrix';
import vs from '../../shaders/compositing.vert'
import fs from '../../shaders/compositing.frag'

class ViewCompositing {
  constructor(width, height){
    this.tick = 1;
    this.shader = new GLShader(vs, fs);

		this.mesh = new mcgl.geom.BigTriangle(this.shader.shaderProgram);
    this.bool = 0;

    gui.add(this, "bool", 0, 1)
  }

  render(t){
    this.tick+= 1;
    this.shader.bind();
    this.shader.uniform("u_dimension", "vec2", [window.innerWidth, window.innerHeight])
    this.shader.uniform("u_enabled", "float", this.bool)
    this.shader.uniform("u_time", "float", this.tick)
    // this.shader.uniform("u_width", "float", window.innerWidth)
    // this.shader.uniform("u_height", "float", window.innerHeight)
    t.bind();

    GL.draw(this.mesh);
  }
}

export default ViewCompositing;
