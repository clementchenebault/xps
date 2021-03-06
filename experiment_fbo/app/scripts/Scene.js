import mcgl, {GL} from 'mcgl';
// import  glslify from 'glslify'
// var source = require('glslify!raw!../shaders/test.glsl')
// import ViewSphere from './views/ViewSphere';
// import ViewIcosphere from './views/ViewIcosphere';
import ViewBackground from './views/ViewBackground';
import ViewLine from './views/ViewLine';
import ViewSim from './views/ViewSim';
import ViewNoise from './views/ViewNoise';
import ViewRenderer from './views/ViewRenderer';
import ViewFXAA from './views/ViewFXAA';
import ViewCompositing from './views/ViewCompositing';
import McglFloor from './views/McglFloor';
import Sono from 'sono';

// import ViewFBO from './views/ViewFBO';
// import vs from '../shaders/default.vert'
// import fs from '../shaders/fbo.frag'

let gl;

class Scene {
  constructor(){
    gl = GL.gl;
    this.tick = 0;

    this.debug = true;
    this.delay = 120;
    this.currentNoise = 1;
    this.lastMax = 1;
    this.isPaused = false;

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // this.orbitalControl = mcgl.orbitalControl;
    // this.orbitalControl.radius = .1;

    this._bCopy = new mcgl.BatchCopy();
    this._bCopyRender = new mcgl.BatchCopy();
    this._bCopyFXAA = new mcgl.BatchCopy();
    window.addEventListener('resize', this.resize.bind(this));

    this.controller = new mcgl.Controller();
    this.controller.onKeyPressed.add(this.onKeyPressed, this);
    this.xAxisPlane = new McglFloor();

    this.cameraControl = new mcgl.CameraControl();
    // this.cameraControl.setRy(Math.PI/2)
    this.rx = 0;
    this.ry = Math.PI/2;

    this.camera = new mcgl.camera.CameraPOV();


    this._fboNoise = new mcgl.FBO(256, 256);
    this._fboFXAA = new mcgl.FBO(window.innerWidth, window.innerHeight);
    this._fboCompositing = new mcgl.FBO(window.innerWidth, window.innerHeight);

    this.lines = [];

    for (var i = 0; i < 1; i++) {
      let l = new ViewLine(i === 0);
      // l.position[0] = -1.;
      this.lines.push(l);
    }


    this.viewBackground = new ViewBackground(256,256);
    this.viewNoise = new ViewNoise(256, 256);
    this.viewRender = new ViewRenderer(256,256);
    this.viewFXAA = new ViewFXAA();
    this.viewCompositing = new ViewCompositing();
    // this.viewRender.position[1] = -.5;
    // this.viewRender.position = [-206, -120, 0];

    // this.orbitalControl.setRy(Math.PI/2)
    this._fboNoise.bind(256, 256);
    mcgl.GL.gl.clear(0,0,0,0)
    this.viewNoise.render();
    this._fboNoise.unbind();
    this.targetPoint = [0,0,0];

    this.height = {
      noise: .2,
      lines: .2
    }

    this._fboNoise.clear();
    this._fboFXAA.clear();

    window.addEventListener("mousemove", (e)=>{
      this.onMouseMove(e);
    }, false);

    // this.positionObj = {
    //   x: -.1,
    //   y: 0,
    //   z: 0
    // }

    this.x = .35//.53//.77
    this.y = .0
    this.z = .2

    // gui.add(this, "x", -2, 2);
    // gui.add(this, "y", -2, 2);
    // gui.add(this, "z", -2, 2);

    this.z = -.1//-.32



    this.sound = Sono.createSound({
      // url: [ASSET_URL + 'sounds/blonde_redhead.mp3'],
      url: [ASSET_URL + 'sounds/kognitif.mp3'],
      loop: true,
      volume: 1
    });

    this.sound.play();

    this.analyser = Sono.effect.analyser({
        fftSize: 512,
        smoothingTimeConstant: 0.7
    });

  }

  onKeyPressed(key){
    if(key === "space"){
      this.pause();
    }
  }

  pause(){
    if(this.isPaused){
      this.sound.fade(0, 1)
    }
    else {
      this.sound.fade(1, 1)
    }

    this.isPaused = !this.isPaused;
  }

  onMouseMove(e){
    for (var i = 0; i < this.lines.length; i++) {
      this.lines[i].onMouseMove(e);
    }
  }
  updateFBO(){
    this._fboNoise.bind(256, 256);
    mcgl.GL.gl.clear(0,0,0,0)
    this.viewNoise.render();
    this._fboNoise.unbind();
  }

  getM(a){
    let sum = 0;
    let count = 0
    for (var i = 0; i < a.length; i++) {
      if(a[i]>10){
        sum += a[i]
        count++
      }
    }

    return sum / count;

    let min = Math.min.apply(null, a);
    let max = Math.max.apply(null, a);

    return((max+min)/2)
  }

  toggleSound(){
    this.pause();
  }

  flash(){
    Easings.killTweensOf(this.viewRender);
    Easings.killTweensOf(this.viewBackground);
    this.viewRender.percentage = 1;
    this.viewBackground.percentage = 1;
    Easings.to(this.viewRender, 1, {
      percentage: 0,
      // delay: Math.random() * 4,
      ease: Easings.easeOutCubic
    })

    Easings.to(this.viewBackground, 1, {
      percentage: 0,
      // delay: Math.random() * 4,
      ease: Easings.easeOutCubic
    })
  }

  update(){
    this.updateFBO();
    this.render();

    // this.delay--;

    // if(this.delay < 0){
    //   this.flash();
    //   this.delay = Math.random() * 4 * 60 + 240;
    // }
  }

  render(){
    this.cameraControl.update();
    this.tick++;
    GL.setMatrices(this.camera);

    var target = [0,0,0];
    var up = [0, 1, 0];

    let f = this.analyser.getWaveform();
    // console.log(f);

    // console.log(Math.max.apply(null, f));

    this.x = .35 + Math.cos(this.tick / 120.) * .4;
    // this.x = .53 + Math.cos(this.tick / 120.) * .2;
    // this.z = -.07 + Math.cos(this.tick / 120.) * .2;
    this.camera.perspective(60 * Math.PI/180, GL.aspectRatio, .1, 60);
    this.camera.setPosition(this.x, this.y, this.z);

    this.ry = Math.PI/4 * 2.45 + Math.cos(this.tick/100.) * .1;
    this.rx = Math.sin(this.tick/100.) * .08 + this.cameraControl.rx * 0.1;
    this.rz = Math.sin(this.tick/30.) * .09 + this.cameraControl.ry * 0.1;
    this.camera.rotateX(this.rx);
    this.camera.rotateY(this.ry);
    this.camera.rotateZ(this.rz);

    // this.camera.lookAt(target);


    // this.xAxisPlane.render();


    // let m = this.getM(f)/ 256;


    let m =  Math.max.apply(null, f) / 256;
    m-=.5;
    m*=2;


    m = this.easeInExpo(m, 0, 1, 1) * 10;
    // m = 1//this.easeInExpo(m, 0, 1, 1) * 10;
    if(m > 7){
      this.flash();
    }
    this.currentNoise += (m - this.currentNoise) * 0.01;
    this.viewNoise.amplitude = this.currentNoise;



    let t = this._fboNoise.textures[0];


    // render into the second Framebuffer
    this._fboFXAA.bind(window.innerWidth, window.innerHeight);
    mcgl.GL.gl.clear(0,0,0,0)
    GL.gl.disable(GL.gl.DEPTH_TEST);
    this.viewBackground.render(); // 2 I dont know why this is in this order
    GL.gl.enable(GL.gl.DEPTH_TEST);
    this.viewRender.render(t, m); // 2 I dont know why this is in this order
    this._fboFXAA.unbind();


    let t2 = this._fboFXAA.textures[0];
    // render the fxaa into a compositing framebuffer
    this._fboCompositing.bind(window.innerWidth, window.innerHeight);
    mcgl.GL.gl.clear(0,0,0,0)
    this.viewFXAA.render(t2);
    this._fboCompositing.unbind();

    let t3 = this._fboCompositing.textures[0];
    // this.viewRender.render(t, m); // 2 I dont know why this is in this order
    // this.viewRender.render(t, m); // 2 I dont know why this is in this order
    // just render the fxaa on convas
    // GL.gl.disable(GL.gl.DEPTH_TEST);
    // this.viewFXAA.render(t2);
    // GL.gl.enable(GL.gl.DEPTH_TEST);
    // this.viewRender.render(t, m); // 2 I dont know why this is in this order

    GL.gl.disable(GL.gl.DEPTH_TEST);
    // this.viewFXAA.render(t2);
    this.viewCompositing.render(t3)
    // this.viewCompositing.render(t3)
    GL.gl.enable(GL.gl.DEPTH_TEST);


    if(this.debug){
      // render into the batches
      GL.gl.viewport(0, 0, 256, 256);
      GL.gl.disable(GL.gl.DEPTH_TEST);
      this._bCopy.draw(t);
      GL.gl.enable(GL.gl.DEPTH_TEST);
      GL.gl.viewport(0, 0, window.innerWidth, window.innerHeight);


      GL.gl.viewport(256, 0, 256, 256);
      GL.gl.disable(GL.gl.DEPTH_TEST);
      this._bCopyRender.draw(t2);
      GL.gl.enable(GL.gl.DEPTH_TEST);
      GL.gl.viewport(0, 0, window.innerWidth, window.innerHeight);

      GL.gl.viewport(512, 0, 256, 256);
      GL.gl.disable(GL.gl.DEPTH_TEST);
      this._bCopyFXAA.draw(t3);
      GL.gl.enable(GL.gl.DEPTH_TEST);
      GL.gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    }


    this._fboNoise.clear();
    this._fboFXAA.clear();
    this._fboCompositing.clear();
  }

  easeOutCubic(t, b, c, d) {
		t /= d;
		t--;
		return c*(t*t*t + 1) + b;
	}

  easeInExpo(t, b, c, d) {
	   return c * Math.pow( 2, 10 * (t/d - 1) ) + b;
  };

  resize(){
    GL.resize(window.innerWidth, window.innerHeight);
    this.camera.setAspectRatio(GL.aspectRatio);
  }
}


export default Scene;
