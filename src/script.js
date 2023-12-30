import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { ShapeGeometry } from 'three/src/geometries/ShapeGeometry.js'
import GUI from 'lil-gui'
import { LoadingManager } from 'three'
import { TimelineMax } from 'gsap/gsap-core'


// const gui = new GUI()
let car1, car2, car3, text, tag, initialPos, isLoaded = false, currentCycle = 0;
const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-16.3, 0, -8.6),
    new THREE.Vector3(-13.5, 0, -0.5),
    new THREE.Vector3(-10.7, 0, -8.6)
  ]);

// Canvas
const canvas = document.querySelector('canvas.webgl')
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.6;
// renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xd2d4d2);
scene.fog = new THREE.Fog(0xd2d4d2, 40, 100);
// gui.add(scene.fog, 'near').min(-150).max(150).step(10).name('fognear')
// gui.add(scene.fog, 'far').min(-150).max(150).step(10).name('fogfar')

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
// gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 4)
directionalLight.castShadow = true
directionalLight.position.multiplyScalar( 30 );
directionalLight.shadow.bias = 0.0001


directionalLight.shadow.mapSize.width = 1024 * 4
directionalLight.shadow.mapSize.height = 1024 * 4
directionalLight.shadow.camera.near = 0
directionalLight.shadow.camera.far = 3500
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
const helper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(helper)

directionalLight.position.set(10, 10, -1)
// gui.add(directionalLight, 'intensity').min(0).max(7).step(0.001)
// gui.add(directionalLight.position, 'x').min(- 10).max(10).step(0.001)
// gui.add(directionalLight.position, 'y').min(- 10).max(10).step(0.001)
// gui.add(directionalLight.position, 'z').min(- 10).max(10).step(0.001)
scene.add(directionalLight)

/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial({
    roughness: 1,
    color: 0xffffff,
    side: THREE.DoubleSide
})
// gui.add(material, 'metalness').min(0).max(1).step(0.001)
// gui.add(material, 'roughness').min(0).max(1).step(0.001)

/**
 * Objects
 */
const loadingManager = new LoadingManager();
loadingManager.onLoad = () => {
    car1.castShadow = true
    car2.castShadow = true
    car3.castShadow = true
    car1.receiveShadow = true;
    car2.receiveShadow = true;
    car3.receiveShadow = true;


    car1.scale.set(0.009, 0.009, 0.009)
    car2.scale.set(0.006, 0.007, 0.007)
    car3.scale.set(0.6, 0.6, 0.6)

    car2.position.x = -16.3
    car2.position.z = -8.6
    car2.rotation.y = 0.3

    // car3.position.set(16.7, 0, -4.44)

    car1.position.x = 1
    car1.position.z = -4
    // gui.add(car3.position, 'x', -20, 40)
    // gui.add(car3.position, 'z', -20, 40)
    // gui.add(car3.rotation, 'y', -20, 40)
    scene.add(car1, car2, car3);
    initialPos = new THREE.Vector3(14, 0, -3.5)
    car3.position.copy(initialPos);
    isLoaded = true;
    startExplicitAnimation()
}
const fbxLoader = new FBXLoader(loadingManager);
const loader = new FontLoader();

Promise.all([
    fbxLoader.loadAsync('car1.fbx'),
    fbxLoader.loadAsync('car2.fbx'),
    fbxLoader.loadAsync('car3.fbx'),
]).then((res) => {
console.log('res',res)
    car1 = res[0]
    car2 = res[1]
    car3 = res[2]
    res.forEach((item) => {
        item.traverse(function (child) {
            if (child.isMesh) {
              child.castShadow = true;
              child.material.clipShadows = true;
            }
         });
    })
}).catch(error => { console.error(error) });

loader.load( 'helvetiker_bold.typeface.json', function ( font ) {

    const color = new THREE.Color( 0xb0c1d6 );

    const matDark = new THREE.MeshBasicMaterial( {
        color: 0xb5b5b5,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
    } );

    const matLite = new THREE.MeshStandardMaterial( {
        color: color,
        opacity: 1,
        roughness: 1,
        side: THREE.DoubleSide
    } );

    const message = 'Verto';
    const tagline = 'Cross-Border Payments and FX Simplified'

    const shapes = font.generateShapes( message, 10 );
    const tagShapes = font.generateShapes( tagline, 1 );

    const geometry = new ShapeGeometry( shapes );
    const tagGeometry = new ShapeGeometry( tagShapes );

    geometry.computeBoundingBox();
    tagGeometry.computeBoundingBox();

    const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
    const xMidTag = - 0.5 * ( tagGeometry.boundingBox.max.x - tagGeometry.boundingBox.min.x );

    geometry.translate( xMid, 0, 0 );
    tagGeometry.translate( xMidTag, -6, 0 );

    // make shape ( N.B. edge view not visible )

    text = new THREE.Mesh( geometry, matLite );
    tag = new THREE.Mesh( tagGeometry, matDark );
    text.receiveShadow = true;
    tag.rotation.x = - Math.PI * 0.5
    text.rotation.x = - Math.PI * 0.5
    scene.add( text, tag );

} );

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y -= 0.1
plane.receiveShadow = true;

scene.add(plane)

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 800)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.minPolarAngle = 0; // radians
controls.maxPolarAngle = Math.PI/3;
controls.minDistance = 10;
controls.maxDistance = 60;
controls.enableDamping = true

/**
 * Animate
 */
const clock = new THREE.Clock()
camera.position.set(0, 17, 0)
camera.lookAt(0,0,-2)
// gui.add(camera.rotation, 'x', -10, 10).name('lookatX')
// gui.add(camera.rotation, 'y', -10, 10).name('lookaty')
// gui.add(camera.rotation, 'z', -10, 10).name('lookatz')
// gui.add(camera.position, 'x', -10, 10).name('camx')
// gui.add(camera.position, 'y', -10, 50).name('camy')
// gui.add(camera.position, 'z', -10, 20).name('camz')

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    // controls.update()

    // Render
    if(isLoaded)
        startAnimation()
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
const radius = 2.8;
function startAnimation(){
    const elapsedSeconds = clock.getElapsedTime();
    const sine = Math.sin(clock.getElapsedTime()* Math.PI * 2 * 0.13)
    const elapsedTime = (sine+ 1) / 2;
    const currentCycleUpdated = Math.floor(elapsedTime);
    const position = curve.getPointAt(elapsedTime % 1); // Ensure the animation loops
    car2.position.copy(position);

    const nextPoint = curve.getPointAt((elapsedTime + 0.01) % 1);
    
    if (currentCycle % 2 === 0) {
        car2.lookAt(nextPoint)
    }
    else{
        const oppositeDirection = new THREE.Vector3().copy(nextPoint).negate();
        car2.lookAt(oppositeDirection)
    }
    currentCycle = currentCycleUpdated;

    //-----animate third car
    
    const angle = -elapsedSeconds; // You can adjust the speed by modifying this value
    const newPosition = new THREE.Vector3(
        Math.cos(angle) * radius + initialPos.x,
        0,
        Math.sin(angle) * radius + initialPos.z
      );
      const targetPosition = new THREE.Vector3(
        Math.cos(angle + Math.PI / 11) * radius + initialPos.x,
        0,
        Math.sin(angle + Math.PI / 11) * radius + initialPos.z
      );
    car3.position.copy(newPosition);
    car3.lookAt(targetPosition);
    car3.up.set(0, -1, 0);
}

function startExplicitAnimation(){
    let tl = new TimelineMax({
        onReverseComplete: () => {
            tl.restart()
        },
        onReverseCompleteParams:['{self}'],
        onComplete:'complete',
        onCompleteParams:['{self}']
    });

    tl.to(car1.position, {
        z: 0.2,
        duration:2,
        ease: "Power3.easeInOut",
        delay: 0.2,
        onComplete: () => {
            tl.reverse(0)
        },
    })
}