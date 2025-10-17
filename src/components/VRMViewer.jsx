import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm'

export default function VRMViewer({ isSpeaking = false }) {
  const canvasRef = useRef(null)
  const vrmRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const clockRef = useRef(null)
  const animationIdRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      30,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 1.4, 2.5)
    camera.lookAt(0, 1.4, 0)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    })
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.outputEncoding = THREE.sRGBEncoding
    rendererRef.current = renderer

    // Lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
    scene.add(ambientLight)

    const backLight = new THREE.DirectionalLight(0xffffff, 1)
    backLight.position.set(-1, 1, -1)
    scene.add(backLight)

    // Clock for animation
    const clock = new THREE.Clock()
    clockRef.current = clock

    // Load VRM
    const loader = new GLTFLoader()
    loader.register((parser) => new VRMLoaderPlugin(parser))

    loader.load(
      '/avatar.vrm',
      (gltf) => {
        const vrm = gltf.userData.vrm
        vrmRef.current = vrm

        // VRM uses Y-up coordinate system
        VRMUtils.rotateVRM0(vrm)

        scene.add(vrm.scene)
        console.log('VRM loaded successfully:', vrm)
      },
      (progress) => {
        console.log('Loading VRM:', (progress.loaded / progress.total) * 100, '%')
      },
      (error) => {
        console.error('Error loading VRM:', error)
      }
    )

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)

      const deltaTime = clock.getDelta()

      // Lip-sync animation
      if (vrmRef.current && isSpeaking) {
        const vrm = vrmRef.current
        const time = clock.elapsedTime

        // Animate "aa" blend shape for mouth movement
        if (vrm.expressionManager) {
          const value = Math.abs(Math.sin(time * 10)) * 0.5
          vrm.expressionManager.setValue('aa', value)
        }
      } else if (vrmRef.current && !isSpeaking) {
        // Reset mouth when not speaking
        if (vrmRef.current.expressionManager) {
          vrmRef.current.expressionManager.setValue('aa', 0)
        }
      }

      // Update VRM
      if (vrmRef.current) {
        vrmRef.current.update(deltaTime)
      }

      renderer.render(scene, camera)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current || !renderer || !camera) return

      const width = canvasRef.current.clientWidth
      const height = canvasRef.current.clientHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()

      renderer.setSize(width, height)
      renderer.setPixelRatio(window.devicePixelRatio)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)

      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }

      if (vrmRef.current) {
        scene.remove(vrmRef.current.scene)
        VRMUtils.deepDispose(vrmRef.current.scene)
      }

      if (renderer) {
        renderer.dispose()
      }
    }
  }, [])

  // Update lip-sync based on isSpeaking prop
  useEffect(() => {
    if (!isSpeaking && vrmRef.current) {
      // Ensure mouth is closed when not speaking
      if (vrmRef.current.expressionManager) {
        vrmRef.current.expressionManager.setValue('aa', 0)
      }
    }
  }, [isSpeaking])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  )
}
