import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppContext } from '@/context/Pathfinder';

export default function AccessibilityOptions() {
  const { disable, setDisable ,getPath} = useAppContext();
  const router = useRouter();
  const { destination } = useLocalSearchParams();
  const [isWheelchairUser, setIsWheelchairUser] = useState(false);
  


  const handleContinue = () => {
    getPath();
    router.push(`/ar-navigation?destination=${destination}&accessibility=${JSON.stringify(disable)}`);
  };





  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accessibility Options</Text>
      <Text style={styles.subtitle}>Help us provide the best route for you</Text>
      
      <View style={styles.optionsContainer}>
        <View style={styles.optionRow}>
          <View style={styles.optionContent}>
            <Text style={styles.optionText}>I use a wheelchair</Text>
            <Text style={styles.optionDescription}>
              Routes will prioritize elevators
            </Text>
          </View>
          <Switch
            value={disable}
            onValueChange={setDisable}
            trackColor={{ false: '#333333', true: '#B854A6' }}
            thumbColor={disable ? '#FFFFFF' : '#666666'}
            ios_backgroundColor="#333333"
          />
        </View>
      </View>

      <TouchableOpacity 
        style={[
          styles.continueButton, 
          isWheelchairUser && styles.continueButtonActive
        ]} 
         onPress={() => {
      handleContinue();
      
      }}
        activeOpacity={0.8}
      >
        <Text style={styles.continueButtonText}>Start AR Navigation</Text>
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 24,
    opacity: 0.9,
  },
  optionsContainer: {
    backgroundColor: '#0A0A0A',
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    shadowColor: '#B854A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionContent: {
    flex: 1,
    marginRight: 20,
  },
  optionText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  optionDescription: {
    fontSize: 14,
    color: '#9E9E9E',
    lineHeight: 20,
    opacity: 0.8,
  },
  continueButton: {
    backgroundColor: '#B854A6',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#B854A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonActive: {
    backgroundColor: '#C966B8',
    shadowOpacity: 0.4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  skipButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#9E9E9E',
    fontSize: 16,
    fontWeight: '400',
    opacity: 0.8,
  },
});