import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';

// Import expo-three for React Native compatibility
import { Renderer } from 'expo-three';
// Import Three.js for geometries and materials
import * as THREE from 'three';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

 
interface IPathStep {
  from: string;
  to: string;
  coordinates: {
    x: number;
    y: number;
    floor: number;
  }[];
  instruction?: string;
}

interface ArrowUserData {
  mapX: number;
  mapY: number;
  stepIndex: number;
  coordIndex: number;
  isDestination: boolean;
  animationOffset: number;
}

interface SystemState {
  cameraPermissionReady: boolean;
  locationPermissionReady: boolean;
  initialLocationObtained: boolean;
  webglReady: boolean;
  arrowsCreated: boolean;
  renderLoopStarted: boolean;
}

export default function RobustARNavigationScreen() {
  const path = [
    {
      "path": [
        {
          "from": "New Origin",
          "to": "Destination",
          "coordinates": [
            {
              "x": -0.0094,
              "y": -0.0077,
              "floor": 1
            },
            {
              "x": -0.0272,
              "y": -0.0193,
              "floor": 1
            }
          ],
          "instruction": "Go southwest to destination"
        }
      ]
    }
  ];
  
  // System state tracking
  const [systemState, setSystemState] = useState<SystemState>({
    cameraPermissionReady: false,
    locationPermissionReady: false,
    initialLocationObtained: false,
    webglReady: false,
    arrowsCreated: false,
    renderLoopStarted: false,
  });

  // Debug sidebar state
  const [showDebugSidebar, setShowDebugSidebar] = useState(false);
  const sidebarAnimation = useRef(new Animated.Value(-320)).current; // Hidden initially

  // Debug state
  const [debugInfo, setDebugInfo] = useState({
    arrowsCreated: 0,
    visibleArrows: 0,
    userMapPosition: { x: 0, y: 0 },
    nearestArrowDistance: 0,
    lastUpdateTime: 'Never',
    locationAccuracy: 0,
    systemStatus: 'Initializing...'
  });

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const arrowsGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const headingSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  
  // Add retry counters
  const locationRetryRef = useRef<number>(0);
  const maxLocationRetries = 10;

  // Conversion constants
  const ORIGIN_LAT: number = 25.493663;
  const ORIGIN_LON: number = 81.867335;
  const METERS_PER_DEG_LAT: number = 111320; 
  const METERS_PER_DEG_LON = (lat: number): number => 111320 * Math.cos(lat * Math.PI / 180);

  // Debug sidebar animation
  const toggleDebugSidebar = () => {
    const toValue = showDebugSidebar ? -320 : 0;
    setShowDebugSidebar(!showDebugSidebar);
    
    Animated.timing(sidebarAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Convert (lat, lon) to (x, y) in meters
  function latLonToXY(lat: number, lon: number): { x: number; y: number } {
    const dLat = lat - ORIGIN_LAT;
    const dLon = lon - ORIGIN_LON;
    const x = dLon * METERS_PER_DEG_LON(ORIGIN_LAT) * 0.001;
    const y = dLat * METERS_PER_DEG_LAT * 0.001;
    return { x, y };
  }

  // Initialize the entire system step by step
  useEffect(() => {
    console.log('🚀 Starting AR Navigation System Initialization...');
    initializeSystem();
    
    return () => {
      console.log('🛑 Cleaning up AR Navigation System...');
      cleanup();
    };
  }, []);

  const initializeSystem = async (): Promise<void> => {
    try {
      console.log('📋 Step 1: Requesting permissions...');
      await requestAllPermissions();
      
      console.log('📍 Step 2: Getting initial location...');
      await getInitialLocation();
      
      console.log('✅ System initialization completed');
    } catch (error) {
      console.error('❌ System initialization failed:', error);
      updateSystemStatus('System initialization failed');
    }
  };

  const requestAllPermissions = async (): Promise<void> => {
    try {
      // Camera permission
      if (!cameraPermission?.granted) {
        console.log('📷 Requesting camera permission...');
        const cameraResult = await requestCameraPermission();
        if (!cameraResult.granted) {
          throw new Error('Camera permission denied');
        }
      }
      
      setSystemState(prev => ({ ...prev, cameraPermissionReady: true }));
      updateSystemStatus('Camera permission granted');
      
      // Location permission
      if (!locationPermission?.granted) {
        console.log('🗺️ Requesting location permission...');
        const locationResult = await requestLocationPermission();
        if (!locationResult.granted) {
          throw new Error('Location permission denied');
        }
      }
      
      setSystemState(prev => ({ ...prev, locationPermissionReady: true }));
      updateSystemStatus('All permissions granted');
      
    } catch (error) {
      console.error('❌ Permission request error:', error);
      throw error;
    }
  };

  const getInitialLocation = async (): Promise<void> => {
    const attemptLocation = async (attempt: number): Promise<void> => {
      try {
        console.log(`📍 Getting location (attempt ${attempt}/${maxLocationRetries})...`);
        updateSystemStatus(`Getting location (${attempt}/${maxLocationRetries})...`);
        
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeoutMs: 15000,
          maximumAge: 5000,
        });
        
        console.log('✅ Initial location obtained:', {
          lat: location.coords.latitude.toFixed(6),
          lon: location.coords.longitude.toFixed(6),
          accuracy: location.coords.accuracy?.toFixed(1)
        });
        
        setUserLocation(location);
        setDebugInfo(prev => ({ 
          ...prev, 
          locationAccuracy: location.coords.accuracy || 0
        }));
        setSystemState(prev => ({ ...prev, initialLocationObtained: true }));
        updateSystemStatus('Initial location obtained');
        
        // Start continuous location tracking
        await startContinuousLocationTracking();
        
      } catch (error) {
        console.error(`❌ Location attempt ${attempt} failed:`, error);
        
        if (attempt < maxLocationRetries) {
          console.log(`⏳ Retrying in 3 seconds...`);
          updateSystemStatus(`Location failed, retrying in 3s (${attempt}/${maxLocationRetries})`);
          setTimeout(() => attemptLocation(attempt + 1), 3000);
        } else {
          throw new Error(`Failed to get location after ${maxLocationRetries} attempts`);
        }
      }
    };
    
    await attemptLocation(1);
  };

  const startContinuousLocationTracking = async (): Promise<void> => {
    try {
      console.log('🔄 Starting continuous location tracking...');
      
      // Watch location changes
      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 1,
        },
        (newLocation: Location.LocationObject) => {
          console.log('📍 Location updated:', {
            lat: newLocation.coords.latitude.toFixed(6),
            lon: newLocation.coords.longitude.toFixed(6),
            accuracy: newLocation.coords.accuracy?.toFixed(1)
          });
          setUserLocation(newLocation);
          setDebugInfo(prev => ({ 
            ...prev, 
            locationAccuracy: newLocation.coords.accuracy || 0,
            lastUpdateTime: new Date().toLocaleTimeString()
          }));
        }
      );

      // Watch device heading
      headingSubscriptionRef.current = await Location.watchHeadingAsync((heading: Location.LocationHeadingObject) => {
        setDeviceHeading(heading.trueHeading ?? 0);
      });
      
      updateSystemStatus('Location tracking active');
      
    } catch (error) {
      console.error('❌ Continuous location tracking error:', error);
      updateSystemStatus('Location tracking failed');
    }
  };

  const onContextCreate = async (gl: ExpoWebGLRenderingContext): Promise<void> => {
    try {
      console.log('🖥️ Setting up WebGL context...');
      updateSystemStatus('Setting up WebGL...');

      // Create renderer first with expo-three
      const renderer = new Renderer({ gl });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      
      // Create scene using standard Three.js
      const scene = new THREE.Scene();
      
      // Create camera with proper aspect ratio
      const camera = new THREE.PerspectiveCamera(
        75,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.01,
        1000
      );

      // Store refs
      sceneRef.current = scene;
      rendererRef.current = renderer;
      cameraRef.current = camera;

      // Create group for arrows
      const arrowsGroup = new THREE.Group();
      arrowsGroupRef.current = arrowsGroup;
      scene.add(arrowsGroup);

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      scene.add(directionalLight);

      // Set initial camera position (eye level)
      camera.position.set(0, 1.6, 0);

      console.log('✅ WebGL setup complete');
      setSystemState(prev => ({ ...prev, webglReady: true }));
      updateSystemStatus('WebGL ready');

      // Start render loop
      startRenderLoop(gl);

    } catch (error) {
      console.error('❌ WebGL setup error:', error);
      updateSystemStatus('WebGL setup failed');
    }
  };

  const startRenderLoop = (gl: ExpoWebGLRenderingContext): void =>  {
    console.log('🔄 Starting render loop...');
    
    const render = (): void => {
      try {
        if (!sceneRef.current || !cameraRef.current || !rendererRef.current) {
          return;
        }

        animationFrameRef.current = requestAnimationFrame(render);
        
        updateCameraOrientation();
        updateArrowsPosition();
        
        // Render the scene
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        gl.endFrameEXP();
        
      } catch (renderError) {
        console.error('❌ Render loop error:', renderError);
      }
    };
    
    render();
    setSystemState(prev => ({ ...prev, renderLoopStarted: true }));
  };

  // This effect waits for ALL requirements before creating arrows
  useEffect(() => {
    const allRequirementsMet = 
      systemState.webglReady && 
      systemState.initialLocationObtained && 
      userLocation &&
      arrowsGroupRef.current &&
      path;

    console.log('🎯 Arrow creation check:', {
      webglReady: systemState.webglReady,
      initialLocationObtained: systemState.initialLocationObtained,
      hasUserLocation: !!userLocation,
      hasArrowsGroup: !!arrowsGroupRef.current,
      hasPath: !!path,
      allRequirementsMet
    });

    if (allRequirementsMet && !systemState.arrowsCreated) {
      console.log('✅ All requirements met - creating arrows now!');
      createARArrows();
      setSystemState(prev => ({ ...prev, arrowsCreated: true }));
      updateSystemStatus('Arrows created - AR ready!');
    } else if (!allRequirementsMet) {
      const missing = [];
      if (!systemState.webglReady) missing.push('WebGL');
      if (!systemState.initialLocationObtained) missing.push('Initial Location');
      if (!userLocation) missing.push('User Location');
      if (!arrowsGroupRef.current) missing.push('Arrows Group');
      if (!path) missing.push('Path Data');
      
      updateSystemStatus(`Waiting for: ${missing.join(', ')}`);
    }

  }, [
    systemState.webglReady, 
    systemState.initialLocationObtained, 
    userLocation,
    systemState.arrowsCreated
  ]);

  const createARArrows = (): void => {
    if (!arrowsGroupRef.current || !path || path.length === 0) {
      console.log('❌ Cannot create arrows: missing requirements');
      return;
    }

    try {
      console.log('🎯 Creating AR arrows...');
      
      // Clear existing arrows
      while (arrowsGroupRef.current.children.length > 0) {
        const child = arrowsGroupRef.current.children[0];
        arrowsGroupRef.current.remove(child);

        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat: THREE.Material) => mat.dispose());
          } else if (child.material) {
            (child.material as THREE.Material).dispose();
          }
        }
      }

      let totalArrows = 0;

      // Create arrows for each step in the path
      path[0].path.forEach((step: IPathStep, stepIndex: number) => {
        step.coordinates.forEach((coord, coordIndex: number) => {
          try {
            const isDestination =
              stepIndex === path[0].path.length - 1 &&
              coordIndex === step.coordinates.length - 1;

            const arrowGroup = new THREE.Group();

            // Create larger, more visible arrows
            const arrowGeometry = new THREE.ConeGeometry(0.5, 1.0, 8);
            const arrowMaterial = new THREE.MeshPhongMaterial({
              color: isDestination ? 0xff4444 : 0x44ff44,
              transparent: false,
              opacity: 1.0,
            });
            const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
            arrow.rotation.x = Math.PI;
            arrowGroup.add(arrow);

            // Base circle
            const baseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
            const baseMaterial = new THREE.MeshPhongMaterial({
              color: isDestination ? 0xff0000 : 0x0066ff,
              transparent: false,
              opacity: 1.0,
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.y = -0.6;
            arrowGroup.add(base);

            // Save map coordinates
            const userData: ArrowUserData = {
              mapX: coord.x,
              mapY: coord.y,
              stepIndex,
              coordIndex,
              isDestination,
              animationOffset: Math.random() * Math.PI * 2,
            };
            
            arrowGroup.userData = userData;
            arrowsGroupRef.current!.add(arrowGroup);
            totalArrows++;
            
            console.log(`🎯 Arrow ${totalArrows} created at (${coord.x}, ${coord.y}) - ${isDestination ? 'DESTINATION' : 'waypoint'}`);
          } catch (arrowError) {
            console.error('❌ Error creating individual arrow:', arrowError);
          }
        });
      });

      console.log(`✅ Created ${totalArrows} AR arrows total`);
      setDebugInfo(prev => ({ ...prev, arrowsCreated: totalArrows }));
      
    } catch (error) {
      console.error('❌ Error in createARArrows:', error);
    }
  };

  const updateCameraOrientation = (): void => {
    if (!cameraRef.current) return;
    
    try {
      const headingRadians = (deviceHeading * Math.PI) / 180;
      cameraRef.current.rotation.set(0, -headingRadians, 0);
    } catch (error) {
      console.error('❌ Camera orientation update error:', error);
    }
  };

  const updateArrowsPosition = (): void => {
    if (!arrowsGroupRef.current || !userLocation) {
      return;
    }

    try {
      const { latitude, longitude } = userLocation.coords;
      const userXY = latLonToXY(latitude, longitude);
      
      console.log('📍 Updating arrow positions for user at:', userXY);

      const time = Date.now() * 0.001;
      let visibleCount = 0;
      let nearestDistance = Infinity;

      arrowsGroupRef.current.children.forEach((arrowGroup: THREE.Object3D, index: number) => {
        try {
          const data = arrowGroup.userData as ArrowUserData;
          if (!data) return;

          // Arrow's fixed map position
          const targetX = data.mapX;
          const targetY = data.mapY;

          // Position relative to user
          const relativeX = targetX - userXY.x;
          const relativeZ = -(targetY - userXY.y); // north→-Z conversion

          // Distance calculation
          const distance = Math.sqrt(relativeX * relativeX + relativeZ * relativeZ);
          nearestDistance = Math.min(nearestDistance, distance);

          // Set arrow position
          arrowGroup.position.set(relativeX, 2.0, relativeZ);

          // Distance-based scaling
          const scale = Math.max(1.0, Math.min(5.0, 20 / (distance + 1)));

          // Pulse animation
          const pulseScale = 1 + 0.3 * Math.sin(time * 2 + data.animationOffset);
          arrowGroup.scale.setScalar(scale * pulseScale);

          // Rotate arrow to face user
          if (distance > 0.1) {
            const angle = Math.atan2(-relativeX, -relativeZ);
            arrowGroup.rotation.y = angle;
          }

          // Floating effect
          const floatOffset = 0.2 * Math.sin(time * 1.5 + data.animationOffset);
          arrowGroup.position.y = 2.0 + floatOffset;

          // Visibility check - increased range for easier testing
          const isVisible = distance < 100; // 100 meter range
          arrowGroup.visible = isVisible;
          
          if (isVisible) {
            visibleCount++;
            console.log(`👁️ Arrow ${index} visible: distance=${distance.toFixed(2)}m at (${relativeX.toFixed(2)}, ${relativeZ.toFixed(2)})`);
          }
          
        } catch (arrowUpdateError) {
          console.error('❌ Arrow position update error:', arrowUpdateError);
        }
      });
      
      // Update debug info
      setDebugInfo(prev => ({ 
        ...prev, 
        visibleArrows: visibleCount,
        nearestArrowDistance: nearestDistance === Infinity ? 0 : nearestDistance,
        userMapPosition: userXY,
        lastUpdateTime: new Date().toLocaleTimeString()
      }));
      
    } catch (error) {
      console.error('❌ Arrows position update error:', error);
    }
  };

  const updateSystemStatus = (status: string): void => {
    console.log(`📊 System Status: ${status}`);
    setDebugInfo(prev => ({ ...prev, systemStatus: status }));
  };

  const cleanup = (): void => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
    }
    if (headingSubscriptionRef.current) {
      headingSubscriptionRef.current.remove();
    }
  };

  // Show loading screen until system is ready
  if (!systemState.cameraPermissionReady || !cameraPermission?.granted) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>📷 Camera Permission Required</Text>
        <Text style={styles.statusText}>{debugInfo.systemStatus}</Text>
      </View>
    );
  }

  if (!systemState.locationPermissionReady || !locationPermission?.granted) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>📍 Location Permission Required</Text>
        <Text style={styles.statusText}>{debugInfo.systemStatus}</Text>
      </View>
    );
  }

  if (!systemState.initialLocationObtained) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>🛰️ Getting Your Location...</Text>
        <Text style={styles.statusText}>{debugInfo.systemStatus}</Text>
        <Text style={styles.subText}>This may take 10-30 seconds</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back">
        <GLView 
          style={styles.arOverlay} 
          onContextCreate={onContextCreate}
        />
        
        {/* Debug Toggle Button */}
        <TouchableOpacity 
          style={styles.debugToggle}
          onPress={toggleDebugSidebar}
          activeOpacity={0.8}
        >
          <Text style={styles.debugToggleText}>
            {showDebugSidebar ? '◀' : '🔧'}
          </Text>
        </TouchableOpacity>

        {/* Quick Status Indicator */}
        {!showDebugSidebar && (
          <View style={styles.quickStatus}>
            <Text style={styles.quickStatusText}>
              {debugInfo.visibleArrows > 0 ? 
                `✅ AR Active (${debugInfo.visibleArrows} arrows)` : 
                '⚠️ No arrows visible'
              }
            </Text>
          </View>
        )}

        {/* Animated Debug Sidebar */}
        <Animated.View 
          style={[
            styles.debugSidebar,
            {
              transform: [{ translateX: sidebarAnimation }]
            }
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.debugHeader}>
              <Text style={styles.debugTitle}>🔧 Debug Console</Text>
              <TouchableOpacity 
                style={styles.closeSidebar}
                onPress={toggleDebugSidebar}
              >
                <Text style={styles.closeSidebarText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* System Status */}
            <View style={styles.debugSection}>
              <Text style={[styles.debugText, styles.statusHeader]}>
                📊 Status: {debugInfo.systemStatus}
              </Text>
            </View>
            
            {/* Location Info */}
            <View style={styles.debugSection}>
              <Text style={styles.debugSectionTitle}>📍 Location Info</Text>
              <Text style={styles.debugText}>
                Heading: {deviceHeading.toFixed(1)}°
              </Text>
              {userLocation && (
                <>
                  <Text style={styles.debugText}>
                    Lat: {userLocation.coords.latitude.toFixed(6)}
                  </Text>
                  <Text style={styles.debugText}>
                    Lon: {userLocation.coords.longitude.toFixed(6)}
                  </Text>
                  <Text style={styles.debugText}>
                    Accuracy: ±{debugInfo.locationAccuracy.toFixed(1)}m
                  </Text>
                  <Text style={styles.debugText}>
                    Map X: {debugInfo.userMapPosition.x.toFixed(3)}m
                  </Text>
                  <Text style={styles.debugText}>
                    Map Y: {debugInfo.userMapPosition.y.toFixed(3)}m
                  </Text>
                  <Text style={styles.debugText}>
                    Last Update: {debugInfo.lastUpdateTime}
                  </Text>
                </>
              )}
            </View>

            {/* AR Arrows Info */}
            <View style={styles.debugSection}>
              <Text style={styles.debugSectionTitle}>🎯 AR Arrows</Text>
              <Text style={styles.debugText}>
                Created: {debugInfo.arrowsCreated}
              </Text>
              <Text style={styles.debugText}>
                Visible: {debugInfo.visibleArrows}
              </Text>
              <Text style={styles.debugText}>
                Nearest: {debugInfo.nearestArrowDistance > 0 ? 
                  debugInfo.nearestArrowDistance.toFixed(1) + 'm' : 'N/A'}
              </Text>
            </View>

            {/* System State */}
            <View style={styles.debugSection}>
              <Text style={styles.debugSectionTitle}>⚙️ System State</Text>
              <Text style={styles.debugText}>
                📷 Camera: {systemState.cameraPermissionReady ? '✅' : '❌'}
              </Text>
              <Text style={styles.debugText}>
                📍 Location: {systemState.locationPermissionReady ? '✅' : '❌'}
              </Text>
              <Text style={styles.debugText}>
                🛰️ GPS Fix: {systemState.initialLocationObtained ? '✅' : '❌'}
              </Text>
              <Text style={styles.debugText}>
                🖥️ WebGL: {systemState.webglReady ? '✅' : '❌'}
              </Text>
              <Text style={styles.debugText}>
                🎯 Arrows: {systemState.arrowsCreated ? '✅' : '❌'}
              </Text>
              <Text style={styles.debugText}>
                🔄 Render: {systemState.renderLoopStarted ? '✅' : '❌'}
              </Text>
            </View>

            {/* Warning Section */}
            {debugInfo.visibleArrows === 0 && systemState.arrowsCreated && (
              <View style={[styles.debugSection, styles.warningSection]}>
                <Text style={styles.warningText}>
                  ⚠️ No arrows visible. Try moving closer to target locations.
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  camera: {
    flex: 1,
  },
  arOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  debugToggle: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00ff00',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  debugToggleText: {
    color: '#00ff00',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickStatus: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  quickStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  debugSidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 320,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    paddingTop: 60,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    marginBottom: 10,
  },
  debugTitle: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeSidebar: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
  },
  closeSidebarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugSection: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 3,
    fontFamily: 'monospace',
  },
  statusHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 8,
  },
  debugSectionTitle: {
    color: '#ffff00',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  warningSection: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    padding: 12,
    margin: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffa500',
  },
  warningText: {
    color: '#ffa500',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});