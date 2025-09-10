import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from "@expo/vector-icons";

const destinationTypes = [
  { id: 'classroom', title: 'Classroom', icon: <MaterialCommunityIcons name="school" size={40} color="purple" />, description: 'Find lecture halls and classrooms' },
  { id: 'professor', title: 'Professor Cabin', icon: <MaterialCommunityIcons name="account-tie" size={40} color="purple" />, description: 'Locate faculty offices' },
  { id: 'laboratory', title:
     'Laboratory', icon:  <MaterialCommunityIcons name="flask" size={40} color="purple" />, description: 'Navigate to labs and research facilities' },
];


export default function DestinationSelect() {
  const router = useRouter();

  const handleSelect = (type: string) => {
    router.push(`/destination-details?type=${type}`);
  };



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where do you want to go?</Text>
      
      <ScrollView style={styles.optionsContainer}>
        {destinationTypes.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.optionCard}
            onPress={() => handleSelect(item.id)}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>{item.title}</Text>
              <Text style={styles.optionDescription}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
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
   subtitle: {
    fontSize: 18,
    color: '#888888', // Muted gray from template
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 24,
    fontWeight: '400',
    maxWidth: '80%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  title: {
    fontSize: 35,
    fontWeight: '700', // Bolder weight like template
    color: '#c7c1cdff', // White text for dark background
    textAlign: 'center',
    marginBottom:50,
    letterSpacing: 1.5, // Slight letter spacing for modern look
    fontFamily: 'System', // Modern system font
  },
  optionsContainer: {
    flex: 1,
    paddingTop: 10,
  },
  optionCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    shadowColor: '#B854A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: {
    fontSize: 36,
    marginRight: 20,
    opacity: 0.9,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  optionDescription: {
    fontSize: 15,
    color: '#9E9E9E',
    lineHeight: 22,
    opacity: 0.8,
  },
});