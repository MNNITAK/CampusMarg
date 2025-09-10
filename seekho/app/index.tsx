import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';

export default function WelcomePage() {
  const router = useRouter();
  const satelliteRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startSatelliteAnimation = () => {
      Animated.loop(
        Animated.timing(satelliteRotation, {
          toValue: 1,
          duration: 20000, // 20 seconds for one full rotation
          useNativeDriver: true,
        })
      ).start();
    };

    startSatelliteAnimation();
  }, []);

  const satelliteRotationStyle = {
    transform: [{
      rotate: satelliteRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
      })
    }]
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <View style={styles.container}>
        {/* Nebula Background */}
        <View style={styles.nebulaBackground} />
        
        {/* Revolving Satellite */}
        <Animated.View style={[styles.satelliteContainer, satelliteRotationStyle]}>
          <Text style={styles.satellite}></Text>
        </Animated.View>
        
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>

            <Text style={styles.mapIcon}>🏛️</Text>
          </View>
          <Text style={styles.title}>Campus Navigator</Text>
        
        </View>

        {/* Info Section with Lottie Animation */}
        <View style={styles.infoSection}>
          <View style={styles.lottieContainer}>
            <LottieView
              source={require('../assets/animations/campus-map.json')} // Replace with your Lottie file path
              autoPlay
              loop
              style={styles.lottieAnimation}
              resizeMode="contain"
            />
            
          </View>
        </View>

        {/* Action Section */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => router.push('/current-destination-select')}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Begin Navigation</Text>
            <Text style={styles.startButtonIcon}>→</Text>
          </TouchableOpacity>
          
          <Text style={styles.footerText}>
            Discover every corner of your academic world
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    position: 'relative',
  },
  nebulaBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000ff',
    backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(138, 43, 226, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 20%, rgba(75, 0, 130, 0.4) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(106, 90, 205, 0.2) 0%, transparent 50%)',
  },
  satelliteContainer: {
    position: 'absolute',
    top: 100,
    right: 50,
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  satellite: {
    fontSize: 24,
    position: 'absolute',
    top: 0,
  },
  headerSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    zIndex: 2,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(138, 43, 226, 0.15)',
    borderWidth: 2,
    borderColor: '#8a2be2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#8a2be2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  mapIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 2,
    fontFamily: 'System',
    textShadowColor: 'rgba(138, 43, 226, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#b8b8b8',
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 1,
    fontStyle: 'italic',
  },
  infoSection: {
    flex: 1.5,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  description: {
    fontSize: 20,
    color: '#e8e8e8',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
    fontFamily: 'System',
    letterSpacing: 0.5,
    marginBottom: 30,
  },
  lottieContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  lottieAnimation: {
    width: 300,
    height: 180,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
   
   

    elevation: 8,
  },
  mapLabel: {
    position: 'absolute',
    bottom: 10,
    fontSize: 12,
    color: '#b8b8b8',
    fontWeight: '500',
  },
  actionSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    zIndex: 2,
  },
  startButton: {
    backgroundColor: '#8a2be2',
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8a2be2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(138, 43, 226, 0.3)',
    minWidth: 220,
  },

  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    marginRight: 10,
  },
  startButtonIcon: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
    marginTop: 25,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
});