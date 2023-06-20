const matterContainer = document.querySelector("#matter-container");

document.getElementById("myInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const contents = e.target.result;

      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(contents, "image/svg+xml");

      const paths = svgDoc.querySelectorAll("path");
      if (paths.length > 0) {
        const firstPath = paths[0];

        document.getElementById("Layer_1").innerHTML = firstPath.outerHTML;

        if (svgBody) {
          Matter.Composite.remove(engine.world, svgBody);
        }

        creatSvgBodies();
      } else {
        console.error("No paths found in the uploaded SVG.");
      }
    };
    reader.readAsText(file);
  }
});

let svgBody;

var gui = new dat.GUI({ autoPlace: false });
gui.domElement.id = "gui";
document.getElementById("gui").appendChild(gui.domElement);

var guiSize;


var config = {
  wireframes: false,
  visible: false,
  showAngleIndicator: false,
  Width: 15,
  Colour: "#0000aa",
  verticies: 1,
  letterVisable: true,
  bounce: 0.9,
  scale: 1.25,
  loadFile: function () {
    document.getElementById("myInput").click();
  },
  clearTrail: function () {
    document.getElementById("path").setAttribute("d", "");
    document.getElementById("path2").setAttribute("d", "");
    gs = [];
  },
  tgrav: 0,
  svgX: 360,
  svgY: 320,
  canvasX: 720,
  canvasY: 720,
};

var importExportFolder = gui.addFolder("Import / Export");

config.exportSvg = exportSvg;

importExportFolder.add(config, "loadFile").name("Upload SVG");
importExportFolder.add(config, "exportSvg").name("Export Trail");
importExportFolder.open();

var letterFolder = gui.addFolder("SVG");

letterFolder
  .add(config, "scale", 0.1, 3, 0.01)
  .onChange(function (value) {
    config.scale = value;

    if (svgBody) {
      Matter.Composite.remove(engine.world, svgBody);
    }

    creatSvgBodies();
  })
  .name("Scale");
letterFolder
  .add(config, "svgX", 1, 1920)
  .onChange(function (value) {
    config.verticies = value;

    if (svgBody) {
      Matter.Composite.remove(engine.world, svgBody);
    }

    creatSvgBodies();
  })
  .name("X Position");
letterFolder
  .add(config, "svgY", 1, 1920)
  .onChange(function (value) {
    config.verticies = value;

    if (svgBody) {
      Matter.Composite.remove(engine.world, svgBody);
    }

    creatSvgBodies();
  })
  .name("Y Position");
letterFolder
  .add(config, "verticies", 1, 100)
  .onChange(function (value) {
    config.verticies = value;

    if (svgBody) {
      Matter.Composite.remove(engine.world, svgBody);
    }

    creatSvgBodies();
  })
  .name("Shape Simplicity");
letterFolder
  .add(config, "letterVisable")
  .onChange(function (value) {
    svgBody.render.visible = value;
  })
  .name("Visibility");

letterFolder.open();



var physicsFolder = gui.addFolder("Physics");

physicsFolder
  .add(config, "bounce", 0.1, 0.99, 0.01)
  .onChange(function (value) {
    circle.restitution = value;
  })
  .name("Bouncy-ness");

physicsFolder
  .add(config, "tgrav", 0, 1)
  .onChange(function (value) {
    engine.world.gravity.y = value;
  })
  .name("Gravity");

physicsFolder.open();

var trailFolder = gui.addFolder("Trail");

trailFolder.add(config, "Width", 1, 30).onChange(function (value) {
  document.getElementById("path").setAttribute("stroke-width", value);
});
trailFolder.addColor(config, "Colour").onChange(function (value) {
  document.getElementById("path").setAttribute("stroke", value);
  document.getElementById("path2").setAttribute("stroke", value);
});

trailFolder.add(config, "clearTrail").name("Clear Trail");

trailFolder.open();

var visualsFolder = gui.addFolder("Debug");
visualsFolder
  .add(config, "wireframes")
  .onChange(function (value) {
    render.options.wireframes = value;
  })
  .name("Wireframes");
visualsFolder
  .add(config, "visible")
  .onChange(function (value) {
    mouseConstraint.constraint.render.visible = value;
  })
  .name("Mouse Indicator");
visualsFolder
  .add(config, "showAngleIndicator")
  .onChange(function (value) {
    render.options.showAngleIndicator = value;
  })
  .name("Angle Indicator");

var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite,
  Mouse = Matter.Mouse,
  Events = Matter.Events,
  MouseConstraint = Matter.MouseConstraint,
  Constraint = Matter.Constraint,
  Body = Matter.Body,
  Svg = Matter.Svg,
  Vector = Matter.Vector,
  Vertices = Matter.Vertices;

var Thickness = 60;

var engine = Engine.create({
  positionIterations: 6,
  velocityIterations: 4,
});

engine.world.gravity.y = config.tgrav;

var render = Render.create({
  element: matterContainer,
  engine: engine,
  options: {
    width: matterContainer.clientWidth,
    height: matterContainer.clientHeight,
    background: "transparent",
    wireframes: config.wireframes,
    showAngleIndicator: config.showAngleIndicator,
  },
});

var circleOptions = {
  friction: 0.3,
  firctionAir: 0.0001,
  restitution: config.bounce,
  render: { fillStyle: "#fff",
strokeStyle: '#000',
lineWidth: 5
},
};

var circleStartPosition = {
  x: matterContainer.clientHeight / 8,
  y: matterContainer.clientHeight / 8,
};

var circle = Bodies.circle(
  circleStartPosition.x,
  circleStartPosition.y,
  20,
  circleOptions
);

const svg_path_s = "#Layer_1 path";
const svg_w = 30;
const svg_p = 0.3;

Composite.add(engine.world, [circle]);

creatSvgBodies();

function creatSvgBodies() {
  const path = document.querySelector(svg_path_s);
  let vertices = Svg.pathToVertices(path, config.verticies);
  let scaleFactor =
    ((matterContainer.clientWidth * svg_p) / svg_w) * config.scale;
  vertices = Vertices.scale(vertices, scaleFactor, scaleFactor);
  svgBody = Bodies.fromVertices(config.svgX, config.svgY, [vertices], {
    isStatic: true,
    mass: 100,
    render: {
      strokeStyle: "#ffffff",
      fillStyle: "#000",
      lineWidth: 0,
      visible: true,
    },
  });
  Composite.add(engine.world, svgBody);
}

var ground = Bodies.rectangle(
  matterContainer.clientWidth / 2,
  matterContainer.clientHeight + Thickness / 2,
  27184,
  Thickness,
  { isStatic: true }
);

var leftWall = Bodies.rectangle(
  0 - Thickness / 2,
  matterContainer.clientHeight / 2,
  Thickness,
  matterContainer.clientHeight * 3,
  { isStatic: true }
);

var rightWall = Bodies.rectangle(
  matterContainer.clientWidth + Thickness / 2,
  matterContainer.clientHeight / 2,
  Thickness,
  matterContainer.clientHeight * 3,
  { isStatic: true }
);

var ceiling = Bodies.rectangle(
  matterContainer.clientWidth / 2,
  0 - Thickness / 2,
  27184,
  Thickness,
  { isStatic: true }
);

Composite.add(engine.world, [ground, leftWall, rightWall, ceiling]);

var mouse = Mouse.create(render.canvas),
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: config.visible,
      },
    },
  });

Composite.add(engine.world, mouseConstraint);

Render.run(render);

var runner = Runner.create();

Runner.run(runner, engine);

function handleResize(matterContainer) {
  render.canvas.width = matterContainer.clientWidth;
  render.canvas.height = matterContainer.clientHeight;

  Matter.Body.setPosition(
    ground,
    Matter.Vector.create(
      matterContainer.clientWidth / 2,
      matterContainer.clientHeight + Thickness / 2
    )
  );
  Matter.Body.setPosition(
    leftWall,
    Matter.Vector.create(0 - Thickness / 2, matterContainer.clientHeight / 2)
  );
  Matter.Body.setPosition(
    rightWall,
    Matter.Vector.create(
      matterContainer.clientWidth + Thickness / 2,
      matterContainer.clientHeight / 2
    )
  );
  Matter.Body.setPosition(
    ceiling,
    Matter.Vector.create(matterContainer.clientWidth / 2, 0 - Thickness / 2)
  );
  Matter.Body.setPosition(
    svgBody,
    Matter.Vector.create(config.svgX, config.svgY)
  );
}

function aP() {
  gs.push([circle.position.x, circle.position.y]);
  pU();
}

Matter.Events.on(engine, "beforeUpdate", aP);

var p1 = document.getElementById("path"),
  p2 = document.getElementById("path2"),
  // np=50,
  pM = "M",
  pQ = "Q",
  pCo = ",",
  pSp = " ",
  gsZ = "0,0",
  gs = [];

function mP(p2, p1, f) {
  return [p1[0] + (p2[0] - p1[0]) * f, p1[1] + (p2[1] - p1[1]) * f];
}
function rP() {
  if (gs.length > 1) {
    pU();
  }
}
function pU() {
  var nP = gs.length > 1 ? pM : pM + gsZ;
  for (var L = gs.length - 1, j = 0; j < L; j++) {
    if (j != 0) {
      var P2 = mP(gs[j], gs[j + 1], 0.5);
      nP += pQ + gs[j][0] + pCo + gs[j][1] + pSp + P2[0] + pCo + P2[1];
    } else {
      nP += pSp + gs[j][0] + pCo + gs[j][1];
    }
  }
  p1.setAttribute("d", nP);
  p2.setAttribute("d", nP);
}

Matter.Events.on(engine, "afterUpdate", function () {
  if (
    circle.position.x < 0 ||
    circle.position.y < 0 ||
    circle.position.x > matterContainer.clientWidth ||
    circle.position.y > matterContainer.clientHeight
  ) {
    Matter.Body.setPosition(circle, circleStartPosition);
    Matter.Body.setVelocity(circle, { x: 0, y: 0 });
  }
});

window.addEventListener("resize", () => handleResize(matterContainer));

function exportSvg() {
  const path = document.getElementById("path");
  const pathData = path.getAttribute("d");

  const svgElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svgElement.setAttribute(
    "viewBox",
    "0 0 " + matterContainer.clientWidth + " " + matterContainer.clientHeight
  );

  const newPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  newPath.setAttribute("d", pathData);
  newPath.setAttribute("fill", "none");
  newPath.setAttribute("stroke", path.getAttribute("stroke"));
  newPath.setAttribute("stroke-width", path.getAttribute("stroke-width"));

  svgElement.appendChild(newPath);

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const blob = new Blob([svgData], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "trail.svg";
  link.click();

  URL.revokeObjectURL(url);
}
