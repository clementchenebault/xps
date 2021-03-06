import mcgl, {GL} from 'mcgl';
// import ViewSphere from './views/ViewSphere';
// import ViewIcosphere from './views/ViewIcosphere';
import ViewCube from './views/ViewCube';
import McglFloor from './views/McglFloor';

let gl;

class Scene {
  constructor(){
    gl = GL.gl;
    this.tick = 0;

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.orbitalControl = mcgl.orbitalControl;
    this.orbitalControl.radius = 1800;
    this.orbitalControl.setRy(-Math.PI/6);
    this.camera = mcgl.camera;
    // this.viewSphere = new ViewSphere();
    // this.viewIcosphere = new ViewIcosphere();
    this.viewCube = new ViewCube();
    this.xAxisPlane = new McglFloor();

    window.addEventListener('resize', this.resize.bind(this));

    this.controller = new mcgl.Controller();

    // this.controller.onKeyPressed.add(this.onKeyPressed, this);
    // this.controller.onTouchEnd.add(this.viewIcosphere.onPressed, this.viewIcosphere);
  }

  onKeyPressed(key){
    if(key === "space"){
      // this.viewIcosphere.onPressed();
    }
  }

  update(){
    this.render();
  }


  render(){
    GL.setMatrices(this.camera);

    this.tick++;
    this.orbitalControl.position[0] = 0;
    this.orbitalControl.position[1] = 450;


        // this.orbitalControl.radius = 800// + Math.cos(this.tick/100) * 100;
    // this.orbitalControl.angleA = Math.PI/2 + Math.cos(this.tick/200) * Math.PI/8;
    // this.orbitalControl.angleA += 0.004;

    // console.log(this.orbitalControl.radius);
    // this.orbitalControl.angleA = Math.PI /2;
    this.orbitalControl.update();
    this.camera.position = this.orbitalControl._position;

    this.camera.perspective(60 * Math.PI / 180, GL.aspectRatio, 1, 6000);
    var target = [0, 500, 0];
    var up = [0, 1, 0];

    this.camera.lookAt(target, up);


    this.xAxisPlane.render();
    this.viewCube.render();
  }

  resize(){
    GL.resize(window.innerWidth, window.innerHeight);
    this.camera.setAspectRatio(GL.aspectRatio);
  }
}


export default Scene;
