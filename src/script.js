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


const gui = new GUI()
let car1, car2;

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
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
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
material.roughness = 0.7
material.color.setHex( 0xffffff );
// gui.add(material, 'metalness').min(0).max(1).step(0.001)
// gui.add(material, 'roughness').min(0).max(1).step(0.001)

/**
 * Objects
 */
const loadingManager = new LoadingManager();
loadingManager.onLoad = () => {
    car1.scale.set(0.006, 0.006, 0.006)
    car2.scale.set(0.004, 0.005, 0.005)
    car2.position.x = 6.75
    car2.position.z = -3.58
    car1.position.x = 1.32
    car1.position.z = -3.8
    gui.add(car2.position, 'x', 1, 10)
    gui.add(car2.position, 'z', -10, 10)
    gui.add(car2.rotation, 'y', -10, 10)
    scene.add(car1, car2);
    startAnimation()
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

    const text = new THREE.Mesh( geometry, matLite );
    text.rotation.x = - Math.PI * 0.5
    scene.add( text );

} );

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y -= 0.1

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
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
camera.position.set(-0.14, 6, 9.2)
gui.add(camera.position, 'x', -10, 10).name('camx')
gui.add(camera.position, 'y', -10, 10).name('camy')
gui.add(camera.position, 'z', -10, 10).name('camz')

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

function startAnimation(){

    let tl = new TimelineMax({
        onReverseComplete: () => {
            tl.restart()
        },
        onReverseCompleteParams:['{self}'],
        onComplete:'complete',
        onCompleteParams:['{self}']
    });

    let t2 = new TimelineMax({
        onReverseComplete: () => {
            t2.restart()
        },
        onReverseCompleteParams:['{self}'],
        onComplete:'complete',
        onCompleteParams:['{self}']
    });

    tl.to(car1.position, {
        z: 0.1,
        duration:1,
        ease: "Power3.easeInOut",
        delay: 0.2,
        onComplete: () => {
            tl.reverse(0)
        },
    })

    t2.to(car2.position, {
        z: -1,
        duration:1.3,
        ease: "Power3.easeInOut",
        delay: 0.2,
        // onComplete: () => {
        //     t2.reverse(0)
        // },
    })
    .to(car2.rotation, {
        y: 0.5,
        duration:0.4,
        ease: "Power3.easeInOut",
        // del
    }).to(car2.position, {
        x: 7,
        duration:0.3,
        ease: "Power3.easeInOut",
    })
}