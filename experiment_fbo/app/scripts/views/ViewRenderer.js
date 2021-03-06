import mcgl, {GLShader} from 'mcgl';
import glmatrix from 'gl-matrix';
import vs from '../../shaders/render.vert'
import fs from '../../shaders/render.frag'

class ViewRenderer {
  constructor(width, height){
    this.h = 0
    this.tick = 0;
    this.amplitude = 1;
    this.height = 0;
    this.shader = new GLShader(vs, fs);
    this.shader.bind();
    this.position = [0,0,0];

    this.percentage = 0;

    this.height = .2;

    let positions = [];
		let indices = [];
		let count = 0;
		// let totalParticles = numParticles * numParticles;
		let ux, uy;

		for(let j = 0; j < width; j++) {
			for(let i = 0; i < height; i++) {
				ux = (i / width) * 1;
				uy = (j / height) * 1;
				indices.push(count);
				count ++;

        positions.push([ux, uy, 0]);

			}
		}


		this.mesh = new mcgl.Mesh(this.shader.shaderProgram, GL.gl.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferIndex(indices);

    // this.m = glmatrix.mat4.fromRotati
    this.rot = [];
    glmatrix.mat4.fromRotation(this.rot, Math.PI/2, [1,0,0])

    this.speed = 1;

    // gui.add(this, "speed", 0, 4).step(.1);

    // console.log(this.rot);
  }

  render(t, height){
    this.tick++//=this.speed;
    this.shader.bind();

    this.shader.uniform("u_percentage", "float", this.percentage);
    // mcgl.GL.gl.bindTexture(mcgl.GL.gl.TEXTURE_2D, t);
    t.bind();

    // if(height > this.height){
      this.height += (height - this.height) * .05;
    // }
    // this.height *= .9
    // mcgl.GL.gl.activeTexture(mcgl.GL.gl.TEXTURE0);
    // mcgl.GL.gl.bindTexture(mcgl.GL.gl.TEXTURE_2D, t);
    this.shader.uniform("positions", "int", 0);
    this.shader.uniform("u_height", "float", this.height);
    this.shader.uniform("u_time", "float", this.tick);
    this.shader.uniform("u_transform", "mat4", this.rot);
    this.shader.uniform("u_position", "vec3", this.position)

    GL.draw(this.mesh);

    // mcgl.GL.gl.bindTexture(mcgl.GL.gl.TEXTURE_2D, t);
    // mcgl.GL.gl.generateMipmap(mcgl.GL.gl.TEXTURE_2D);
    // mcgl.GL.gl.bindTexture(mcgl.GL.gl.TEXTURE_2D, null);
  }
}

export default ViewRenderer;
