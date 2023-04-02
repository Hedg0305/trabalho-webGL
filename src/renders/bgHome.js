import {
  parseOBJ,
  fragmentShaderSource,
  vertexShaderSource,
  generateTangents,
} from "./utils/index.js";

class Background {
  constructor(href) {
    this.href = href;
    this.cameraTarget;
    this.cameraPosition;

    this.targetAngleRadians = 100;
    this.targetRadius = 360;
    this.fieldOfViewRadians = degToRad(60);
    this.rotationSpeed = 4.2;
    this.cameraAngleRadians = Math.PI / 4;

    this.isAnimated = true;

    this.a = 20;
    this.b = 20;
    this.c = 20;
    this.t = 0;

    this.yRotation = degToRad(0);
    this.xRotation = degToRad(0);

    this.canvas = document.querySelector("#main__BG");
    this.gl = this.canvas.getContext("webgl2");
    if (!this.gl) {
      return;
    }
    twgl.setAttributePrefix("a_");
    this.meshProgramInfo = twgl.createProgramInfo(this.gl, [
      vertexShaderSource,
      fragmentShaderSource,
    ]);

    this.render = this.render.bind(this);

    this.main();
  }

  async main() {
    const response = await fetch(this.href);
    const text = await response.text();
    this.obj = parseOBJ(text);

    await this.loadTexture();

    const extents = this.getGeometriesExtents(this.obj.geometries);
    const range = m4.subtractVectors(extents.max, extents.min);

    this.objOffset = m4.scaleVector(
      m4.addVectors(extents.min, m4.scaleVector(range, 10)),
      -1
    );

    this.radius = m4.length(range) * 10;
    this.c = this.radius;
    this.cameraTarget = [1, 1, 80];
    this.cameraPosition = m4.addVectors(this.cameraTarget, [0, 0, this.radius]);

    this.zNear = this.radius / 50;
    this.zFar = this.radius * 50;

    requestAnimationFrame(this.render);
  }

  async loadTexture() {
    const baseHref = new URL(this.href, window.location.href);

    const textures = {
      defaultColor: twgl.createTexture(this.gl, { src: [250, 86, 86, 255] }),
      defaultNormal: twgl.createTexture(this.gl, { src: [127, 127, 255, 0] }),
    };

    const defaultMaterial = {
      diffuse: [1, 1, 1],
      diffuseMap: textures.defaultColor,
      normalMap: textures.defaultNormal,
      ambient: [0, 0, 0],
      specular: [1, 1, 1],
      specularMap: textures.defaultColor,
      shininess: 200,
      opacity: 1,
    };

    this.parts = this.obj.geometries.map(({ material, data }) => {
      if (data.color) {
        if (data.position.length === data.color.length) {
          data.color = { numComponents: 3, data: data.color };
        }
      } else {
        data.color = { value: [1, 1, 1, 1] };
      }

      if (data.texcoord && data.normal) {
        data.tangent = generateTangents(data.position, data.texcoord);
      } else {
        data.tangent = { value: [1, 0, 0] };
      }

      if (!data.texcoord) {
        data.texcoord = { value: [0, 0] };
      }

      if (!data.normal) {
        data.normal = { value: [0, 0, 1] };
      }

      const bufferInfo = twgl.createBufferInfoFromArrays(this.gl, data);
      const vao = twgl.createVAOFromBufferInfo(
        this.gl,
        this.meshProgramInfo,
        bufferInfo
      );
      return {
        material: {
          ...defaultMaterial,
        },
        bufferInfo,
        vao,
      };
    });
  }

  getExtents(positions) {
    const min = positions.slice(0, 3);
    const max = positions.slice(0, 3);
    for (let i = 3; i < positions.length; i += 3) {
      for (let j = 0; j < 3; ++j) {
        const v = positions[i + j];
        min[j] = Math.min(v, min[j]);
        max[j] = Math.max(v, max[j]);
      }
    }
    return { min, max };
  }

  getGeometriesExtents(geometries) {
    return geometries.reduce(
      ({ min, max }, { data }) => {
        const minMax = this.getExtents(data.position);
        return {
          min: min.map((min, ndx) => Math.min(minMax.min[ndx], min)),
          max: max.map((max, ndx) => Math.max(minMax.max[ndx], max)),
        };
      },
      {
        min: Array(3).fill(Number.POSITIVE_INFINITY),
        max: Array(3).fill(Number.NEGATIVE_INFINITY),
      }
    );
  }

  render() {
    twgl.resizeCanvasToDisplaySize(this.gl.canvas);
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    this.gl.enable(this.gl.DEPTH_TEST);

    const fieldOfViewRadians = degToRad(60);
    const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
    const projection = m4.perspective(
      fieldOfViewRadians,
      aspect,
      this.zNear,
      this.zFar
    );

    const up = [0, 1, 0];

    if (this.isAnimated) this.animation();

    const camera = m4.lookAt(this.cameraPosition, this.cameraTarget, up);

    const view = m4.inverse(camera);

    const sharedUniforms = {
      u_lightDirection: m4.normalize([-1.5, 2, 2]),
      u_view: view,
      u_projection: projection,
      u_viewWorldPosition: this.cameraPosition,
    };

    this.gl.useProgram(this.meshProgramInfo.program);

    twgl.setUniforms(this.meshProgramInfo, sharedUniforms);

    let u_world = m4.identity();
    u_world = m4.translate(u_world, ...this.objOffset);
    u_world = m4.yRotation(this.yRotation);
    u_world = m4.multiply(m4.xRotation(this.xRotation), u_world);

    for (const { bufferInfo, vao, material } of this.parts) {
      this.gl.bindVertexArray(vao);

      twgl.setUniforms(
        this.meshProgramInfo,
        {
          u_world,
        },
        material
      );

      twgl.drawBufferInfo(this.gl, bufferInfo);
    }
    requestAnimationFrame(this.render);
  }
  animation() {
    const x = this.a * Math.cos(this.t);
    const y = this.b * Math.sin(this.t);
    const z = this.c * Math.sin(this.t);

    this.cameraPosition[0] = x;
    this.cameraPosition[1] = y;
    this.cameraPosition[2] = z;

    this.t += 0.01;
  }
}
async function loadBG() {
  const bg = new Background("../objs/lego5/leia.obj");
}

loadBG();
