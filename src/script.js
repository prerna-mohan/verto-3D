import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { ShapeGeometry } from 'three/src/geometries/ShapeGeometry.js'
import GUI from 'lil-gui'
import { LoadingManager } from 'three'
import { gsap } from 'gsap'
import { TimelineMax } from 'gsap/gsap-core'


// const gui = new GUI()
let car1, car2, text, isLoaded = false, currentCycle = 0;
const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-16.3, 0, -8.6),
    new THREE.Vector3(-13.5, 0, -0.5),
    new THREE.Vector3(-10.7, 0, -8.6)
  ]);

// Canvas
const canvas = document.querySelector('canvas.webgl')

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
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
// gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.76)
directionalLight.castShadow = true

directionalLight.shadow.camera.left = - 100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = - 100;

directionalLight.position.set(2, 4.477, - 1)
// gui.add(directionalLight, 'intensity').min(0).max(3).step(0.001)
// gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001)
// gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001)
// gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(directionalLight)

/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial()
material.roughness = 1
material.color.setHex( 0xffffff );
// gui.add(material, 'metalness').min(0).max(1).step(0.001)
// gui.add(material, 'roughness').min(0).max(1).step(0.001)

/**
 * Objects
 */
const loadingManager = new LoadingManager();
loadingManager.onLoad = () => {
    car1.castShadow = true
    car2.castShadow = true
    car2.receiveShadow = true;


    car1.scale.set(0.009, 0.009, 0.009)
    car2.scale.set(0.006, 0.007, 0.007)
    car2.position.x = -16.3
    car2.position.z = -8.6
    car2.rotation.y = 0.3

    car1.position.x = 1
    car1.position.z = -4
    // gui.add(car1.position, 'x', -20, 20)
    // gui.add(car1.position, 'z', -20, 20)
    // gui.add(car1.rotation, 'y', -20, 20)
    scene.add(car1, car2);
    isLoaded = true;
    startExplicitAnimation()
}
const fbxLoader = new FBXLoader(loadingManager);
const loader = new FontLoader();

Promise.all([
    fbxLoader.loadAsync('car1.fbx'),
    fbxLoader.loadAsync('car2.fbx'),
]).then((res) => {
console.log('res',res)
    car1 = res[0]
    car2 = res[1]
}).catch(error => { console.error(error) });

loader.load( 'helvetiker_bold.typeface.json', function ( font ) {

    const color = new THREE.Color( 0x006699 );

    const matDark = new THREE.MeshBasicMaterial( {
        color: color,
        side: THREE.DoubleSide
    } );

    const matLite = new THREE.MeshBasicMaterial( {
        color: color,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
    } );

    const message = 'Verto';

    const shapes = font.generateShapes( message, 10 );

    const geometry = new ShapeGeometry( shapes );

    geometry.computeBoundingBox();

    const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );

    geometry.translate( xMid, 0, 0 );

    // make shape ( N.B. edge view not visible )

    text = new THREE.Mesh( geometry, matLite );
    text.receiveShadow = true;
    text.rotation.x = - Math.PI * 0.5
    scene.add( text );

} );

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y -= 0.1
plane.receiveShadow = true;

scene.add(plane)



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

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
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

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

function startAnimation(){
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