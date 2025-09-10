import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppContext } from '@/context/Pathfinder';

type LocationItem = {
  id: string;
  name: string;
  floor: string;
  department?: string;
};


type LocationData = {
  classroom: LocationItem[];
  professor: LocationItem[];
  laboratory: LocationItem[];
};

const locationData: LocationData = {
  classroom: [
 { id: 'R101', name: 'Classroom 101', floor: '1st Floor' },
    { id: 'R102', name: 'Classroom 102', floor: '1st Floor' },
    { id: 'R103', name: 'Classroom 103', floor: '1st Floor' },
    { id: 'R201', name: 'Classroom 201', floor: '2nd Floor' },
    { id: 'R202', name: 'Classroom 202', floor: '2nd Floor' },
    { id: 'R203', name: 'Classroom 203', floor: '2nd Floor' },
  ],


  professor: [
    { id: 'prof1', name: 'Dr. BASANT KUMAR', floor: '2nd Floor', department: 'Signal and System' },
    { id: 'prof2', name: 'Dr. BASU', floor: '1st Floor', department: 'Mathematics' },
    { id: 'prof3', name: 'Dr. AMIT DHAWAN', floor: '1st Floor', department: 'Digital Electronics' },
    { id: 'prof4', name: 'Dr. SINGH', floor: '3rd Floor', department: 'Physics' },
    { id: 'prof5', name: 'Dr. SHARMA', floor: '2nd Floor', department: 'Computer Science' },
    { id: 'prof6', name: 'Dr. VERMA', floor: 'Ground Floor', department: 'Chemistry' }
  ],

  laboratory: [
    { id: 'lab1', name: 'Computer Lab 1', floor: '1st Floor' },
    { id: 'lab2', name: 'Computer Lab 2', floor: '2nd Floor' },
    { id: 'lab3', name: 'Physics Lab', floor: '2nd Floor' },
    { id: 'lab4', name: 'Electronics Lab', floor: '3rd Floor' },
    { id: 'lab5', name: 'Chemistry Lab', floor: 'Ground Floor' },
    { id: 'lab6', name: 'Networking Lab', floor: '3rd Floor' }
  ]
};


export default function DestinationDetails() {
  const { initial, setInitial } = useAppContext();
  const router = useRouter();
  const { type } = useLocalSearchParams();
  const [searchText, setSearchText] = useState('');
  const [locations, setLocations] = useState<LocationItem[]>([]);

  useEffect(() => {
    if (type && locationData[type as keyof LocationData]) {
      setLocations(locationData[type as keyof LocationData]);
    }
  }, [type]);

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchText.toLowerCase())
  );


  const handleSelect = (locationId: string) => {
    setInitial(locationId);
    console.log("Initial location set to:", initial);
    router.push('/destination-select'); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select specific location</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search locations..."
        placeholderTextColor="#666666"
        value={searchText}
        onChangeText={setSearchText}
        selectionColor="#B854A6"
      />

      <ScrollView style={styles.locationsContainer} showsVerticalScrollIndicator={false}>
        {filteredLocations.map((location, index) => (
          <TouchableOpacity
            key={location.id}
            style={[
              styles.locationCard,
              { transform: [{ translateY: index * 1 }] }
            ]}
            onPress={() => handleSelect(location.id)}
            activeOpacity={0.7}
          >
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>{location.name}</Text>
              <Text style={styles.locationFloor}>{location.floor}</Text>
              {location.department && (
                <Text style={styles.locationDepartment}>{location.department}</Text>
              )}
            </View>
            <View style={styles.arrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
        
        {filteredLocations.length === 0 && searchText !== '' && (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>No locations found</Text>
            <Text style={styles.noResultsSubtext}>Try adjusting your search</Text>
          </View>
        )}
      </ScrollView>
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
    marginBottom: 30,
    letterSpacing: 0.5,
    lineHeight: 36,
  },
  searchInput: {
    backgroundColor: '#0A0A0A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
    shadowColor: '#B854A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  locationsContainer: {
    flex: 1,
  },
  locationCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#B854A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  locationFloor: {
    fontSize: 15,
    color: '#9E9E9E',
    marginBottom: 4,
    opacity: 0.9,
  },
  locationDepartment: {
    fontSize: 13,
    color: '#B854A6',
    fontStyle: 'italic',
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  arrow: {
    marginLeft: 15,
    opacity: 0.6,
  },
  arrowText: {
    fontSize: 24,
    color: '#9E9E9E',
    fontWeight: '300',
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 18,
    color: '#9E9E9E',
    fontWeight: '400',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#666666',
    opacity: 0.7,
  },
});