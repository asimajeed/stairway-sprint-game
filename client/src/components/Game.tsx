import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as CANNON from "cannon-es";

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasDivRef = useRef<HTMLDivElement>(null);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const [playerScore, setPlayerScore] = useState<number>(0);
  useEffect(() => {
    if (!canvasRef.current || !canvasDivRef.current || !resetButtonRef.current) return;

    const canvasElement = canvasRef.current;
    const containerDivElement = canvasDivRef.current;

    const size = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const moveConstants: { x: number; y: number; z: number; set: () => number } = {
      x: 3,
      y: 6,
      z: 12,
      set: () => {
        if (size.width > 500) {
          moveConstants.x = size.width / 180;
          moveConstants.y = 6;
          moveConstants.z = 12;
          return 60;
        } else {
          moveConstants.x = 3;
          moveConstants.y = 9;
          moveConstants.z = 12;
          return 80;
        }
      },
    };
    const player = { name: "", score: 0 };
    const scene = new THREE.Scene();
    // const skyboxCube = setSkyBox(scene);
    const camera = new THREE.PerspectiveCamera(
      moveConstants.set(),
      size.width / size.height,
      1,
      100
    );
    const renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(size.width, size.height);
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    // Adding Lights
    const DirectionalLight = new THREE.DirectionalLight(0xffffff, 3.5);
    const initLights = () => {
      DirectionalLight.position.set(5, 15, 20);
      DirectionalLight.target.position.set(0, 0, 0);
      DirectionalLight.castShadow = true;
      DirectionalLight.shadow.mapSize.width = 8000;
      DirectionalLight.shadow.mapSize.height = 8000;
      DirectionalLight.shadow.camera.near = 1;
      DirectionalLight.shadow.camera.far = 100;
      DirectionalLight.shadow.camera.left = -50;
      DirectionalLight.shadow.camera.right = 50;
      DirectionalLight.shadow.camera.top = 50;
      DirectionalLight.shadow.camera.bottom = -50;

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
      scene.add(DirectionalLight);
      scene.add(ambientLight);
    };
    initLights();

    const world = new CANNON.World();
    world.gravity.set(0, -9.81, 0);

    // Ball setup
    const ballTexture = new THREE.TextureLoader().load("textures/ball.png");
    ballTexture.colorSpace = THREE.SRGBColorSpace;
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 20, 20),
      new THREE.MeshPhysicalMaterial({
        roughness: 0,
        transmission: 0,
        map: ballTexture,
      })
    );
    ball.castShadow = true;
    scene.add(ball);

    const ballMaterial = new CANNON.Material();
    const ballBody = new CANNON.Body({
      mass: 2,
      shape: new CANNON.Sphere(0.5),
      position: new CANNON.Vec3(0.75, -3, 0),
      material: ballMaterial,
    });
    ballBody.angularDamping = 0.9999999;
    world.addBody(ballBody);

    camera.position.set(ball.position.x + 3, ball.position.y + 15, ball.position.z + 10);
    camera.setRotationFromEuler(new THREE.Euler((-15 * Math.PI) / 180));
    const mulberry32 = (a: number) => () => {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    let myRand = mulberry32(123);

    const stairs: { mesh: THREE.Mesh; body: CANNON.Body }[] = [];
    const stairMaterial = new CANNON.Material();
    const stairDirtTexture = new THREE.TextureLoader().load("textures/dirt.jpg");
    stairDirtTexture.colorSpace = THREE.SRGBColorSpace;
    const stairMeshMaterial = new THREE.MeshStandardMaterial({
      map: stairDirtTexture,
    });

    const createStair = (i: number) => {
      let x = i * 3 + 1 * myRand();
      let y = i * 1 + 1 * myRand() - 5;
      let z = 0;
      let X = 2;
      let Y = 0.4;
      let Z = 1;
      let angle = 0;

      const stair = new THREE.Mesh(new THREE.BoxGeometry(X, Y, Z), stairMeshMaterial);
      stair.position.set(x, y, z);
      stair.castShadow = true;
      stair.receiveShadow = true;
      stair.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), (angle * Math.PI) / 180);
      scene.add(stair);

      const stairBody = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(X / 2, Y / 2, Z / 2)),
        material: stairMaterial,
      });
      stairBody.position.set(x, y, z);
      stairBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), (angle * Math.PI) / 180);
      world.addBody(stairBody);
      stairs.push({ mesh: stair, body: stairBody });
    };

    world.addContactMaterial(
      new CANNON.ContactMaterial(stairMaterial, ballMaterial, {
        friction: 6,
        restitution: 0.02,
      })
    );

    // Create initial stairs
    const initialStairCount = 15;
    for (let i = 0; i < initialStairCount; i++) {
      createStair(i);
    }

    let isHitAllowed = false;
    let ballTouching = false;
    const startPointerPos = new THREE.Vector2();
    const endPointerPos = new THREE.Vector2();
    // let mouseDown = false;

    // Event listeners for mouse interaction
    renderer.domElement.addEventListener("mousedown", (event) => {
      // mouseDown = true;
      startPointerPos.set(event.clientX, event.clientY);
    });

    renderer.domElement.addEventListener("touchstart", (event) => {
      // mouseDown = true;
      startPointerPos.set(event.touches[0].clientX, event.touches[0].clientY);
    });

    renderer.domElement.addEventListener("touchmove", (event) => {
      endPointerPos.set(event.touches[0].clientX, event.touches[0].clientY);
    });

    const clickHandler = (event: TouchEvent | MouseEvent) => {
      if (event.type === "mouseup") {
        event = event as MouseEvent;
        endPointerPos.set(event.clientX, event.clientY);
      } else {
        event = event as TouchEvent;
        if (event.touches.length > 1) return;
      }
      // mouseDown = false;

      if (isHitAllowed) {
        const direction = new THREE.Vector2().subVectors(startPointerPos, endPointerPos);
        const forceMagnitude = 1 / 15;
        const force = new CANNON.Vec3(
          direction.x * forceMagnitude,
          direction.y * -forceMagnitude,
          0
        );
        ballBody.applyImpulse(force, ballBody.position);
        ballBody.angularVelocity.set(0, 0, 0);
      }
    };

    renderer.domElement.addEventListener("mouseup", clickHandler);
    renderer.domElement.addEventListener("touchend", clickHandler);

    let lastTime = 0;
    const fixedTimeStep = 1 / 60;

    function updateAllowHit() {
      ballTouching = false;
      for (const stair of stairs) {
        world.contacts.forEach((value: CANNON.ContactEquation) => {
          if (
            (value.bi === stair.body && value.bj === ballBody) ||
            (value.bi === ballBody && value.bj === stair.body)
          ) {
            ballTouching = true;
          }
        });
      }
      isHitAllowed =
        ballBody.velocity.almostEquals(new CANNON.Vec3(0, 0, 0), 1e-3) && ballTouching;
      if (isHitAllowed) {
        containerDivElement.style.boxShadow = "inset 0px 0px 3vw 0.5vw #39EBFF";
      } else {
        containerDivElement.style.boxShadow = "";
      }
    }

    function updateStairway() {
      if (stairs[0].mesh.position.x + 10 < ball.position.x || isHitAllowed) {
        if (stairs[0].mesh.position.x + 2 < ball.position.x) {
          const removedStair = stairs.shift();
          if (removedStair) {
            world.removeBody(removedStair.body);
            scene.remove(removedStair.mesh);
          }
          createStair(player.score++ + 15);
          isHitAllowed && setPlayerScore(player.score);
        }
      }
    }

    function lerp(start: number, end: number, t: number) {
      return start * (1 - t) + end * t;
    }
    const skyboxTexture = new THREE.TextureLoader().load("textures/BlueSkySkybox.png");
    const skyboxGeometry = new THREE.SphereGeometry(20, 32, 32);
    const skyboxMaterial = new THREE.MeshBasicMaterial({
      map: skyboxTexture,
      side: THREE.BackSide,
    });
    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    scene.add(skybox);

    function moveAttachedObjects() {
      const ballPos = ball.position;
      camera.position.x = lerp(camera.position.x, ballPos.x + moveConstants.x, 0.05);
      camera.position.y = lerp(camera.position.y, ballPos.y + moveConstants.y, 0.1);
      camera.position.z = lerp(camera.position.z, ballPos.z + moveConstants.z, 0.1);
      skybox.position.x = lerp(skybox.position.x, camera.position.x, 0.2);
      skybox.position.y = lerp(skybox.position.y, camera.position.y, 0.2);
      skybox.position.z = lerp(skybox.position.z, camera.position.z, 0.2);
      skybox.setRotationFromQuaternion(ball.quaternion);
      DirectionalLight.position.set(ballPos.x + 5, ballPos.y + 15, ballPos.z + 20);
      DirectionalLight.target.position.x = ballPos.x;
    }

    const animate = (time: number) => {
      requestAnimationFrame(animate);

      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      world.step(fixedTimeStep, deltaTime);

      ball.position.copy(ballBody.position);
      ball.quaternion.copy(ballBody.quaternion);

      moveAttachedObjects();
      updateAllowHit();
      updateStairway();
      renderer.render(scene, camera);
    };

    animate(0);

    // reset handler
    resetButtonRef.current.addEventListener("click", () => {
      myRand = mulberry32(123);
      stairs.forEach((stair) => {
        world.removeBody(stair.body);
        scene.remove(stair.mesh);
      });
      stairs.splice(0, stairs.length);
      for (let i = 0; i < initialStairCount; i++) {
        createStair(i);
      }
      ballBody.position.set(0.75, -3, 0);
      ballBody.velocity.setZero();
      ballBody.angularVelocity.setZero();
      player.score = 0;
      setPlayerScore(player.score);
    });

    window.addEventListener("resize", () => {
      size.width = window.innerWidth;
      size.height = window.innerHeight;
      camera.aspect = size.width / size.height;
      camera.fov = moveConstants.set();
      camera.updateProjectionMatrix();
      renderer.setSize(size.width, size.height);
    });

    return () => {
      renderer.dispose();
      scene.clear();
      world.bodies.forEach((body) => world.removeBody(body));
    };
  }, []);

  return (
    <>
      <div
        className="mt-24 relative flex justify-center items-center z-[1] pointer-events-none text-2xl gap-[2vw]"
        style={{ textShadow: "0px 0px 0.1em white, 0px 0px 0.5em white" }}
      >
        <button
          ref={resetButtonRef}
          className="bg-[#0FCDE0] pointer-events-auto text-base rounded-xl p-1 transition ease-in duration-100 hover:bg-[#39EBFF]"
        >
          Reset
        </button>
        <p>{playerScore}</p>
      </div>
      <div
        className="fixed w-full h-full top-0 left-0 z-[1] pointer-events-none"
        ref={canvasDivRef}
        style={{ transition: "box-shadow ease-out 400ms" }}
      />
      <canvas ref={canvasRef} id="main-canvas" className="z-[-1] fixed top-0 left-0"></canvas>
    </>
  );
}
