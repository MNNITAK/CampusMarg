# 📍 Campus Marg – Academic Building Navigator

Welcome to **Campus Marg**, a smart navigation app designed specifically for **MNNIT Allahabad**! Whether you're a student, faculty member, or visitor, this app helps you easily find your way around the academic buildings and the campus with intuitive directions, seamless location tracking, and an immersive AR-based experience.

---

## 🚀 Features

 **Campus-wide Navigation** – Find paths from one building to another  
 **AR-Based Directions** – Experience real-world navigation through augmented reality  
 **Interactive Path Visualization** – See routes in a clear, step-by-step manner  
 **Latitude & Longitude Conversion** – Maps GPS coordinates into navigable x, y coordinates  
 **Custom Instructions** – Context-aware navigation messages  
 **Lightweight & Fast** – Optimized for smooth performance on mobile devices  

---


---

## 📌 How It Works

1. **Location Input** – Users input their current location or select it via GPS.
2. **Coordinate Conversion** – The app converts latitude and longitude into x, y coordinates using defined formulas.
3. **Path Rendering** – Routes are visualized on the map or through AR.
4. **Instructions** – Real-time directions guide users from point A to B.
5. **Custom Paths** – Paths are predefined in a JSON format with waypoints and instructions.

---

## 🧭 Example Path Format

```json
{
  "path": [
    {
      "from": "S1",
      "to": "J1",
      "coordinates": [
        {
          "x": 25,
          "y": 60,
          "floor": 1
        },
        {
          "x": 25,
          "y": 40,
          "floor": 1
        }
      ],
      "instruction": "Move from Staircase 1 to Junction 1"
    },
    {
      "from": "J1",
      "to": "C1",
      "coordinates": [
        {
          "x": 25,
          "y": 40,
          "floor": 1
        },
        {
          "x": 20,
          "y": 20,
          "floor": 1
        }
      ],
      "instruction": "Move from Junction 1 to Corridor 1"
    },
    {
      "from": "C1",
      "to": "R101",
      "coordinates": [
        {
          "x": 20,
          "y": 20,
          "floor": 1
        },
        {
          "x": 10,
          "y": 20,
          "floor": 1
        }
      ],
      "instruction": "Move from Corridor 1 to Classroom 101"
    }
  ]
}


