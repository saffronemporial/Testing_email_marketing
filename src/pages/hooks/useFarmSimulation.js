// hooks/useFarmSimulation.js
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

export const useFarmSimulation = () => {
  const { user } = useAuth();
  const [farmData, setFarmData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch weather data for farm locations
  const fetchWeatherData = async (location) => {
    // Using OpenWeatherMap API (you'll need to get a free API key)
    const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location},IN&units=metric&appid=${API_KEY}`
      );
      const data = await response.json();
      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        weather_condition: data.weather[0].main,
        wind_speed: data.wind.speed
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Fallback data
      return {
        temperature: 25 + Math.random() * 10,
        humidity: 60 + Math.random() * 20,
        weather_condition: 'Clear',
        wind_speed: 2 + Math.random() * 3
      };
    }
  };

  // AI simulation for farm conditions
  const simulateFarmConditions = (weatherData, cropType, location) => {
    // Base conditions for different crops
    const baseConditions = {
      pomegranate: {
        optimal_temp: [25, 35],
        optimal_humidity: [60, 80],
        growth_rate: 0.8
      },
      almonds: {
        optimal_temp: [20, 30],
        optimal_humidity: [50, 70],
        growth_rate: 0.6
      },
      cardamom: {
        optimal_temp: [15, 25],
        optimal_humidity: [70, 90],
        growth_rate: 0.5
      }
    };

    const crop = baseConditions[cropType] || baseConditions.pomegranate;
    
    // Calculate soil moisture based on recent rainfall and humidity
    const soilMoisture = Math.min(100, Math.max(20, 
      weatherData.humidity * 0.8 + (Math.random() * 20)
    ));

    // Calculate soil pH (relatively stable)
    const soilPh = 6.5 + (Math.random() * 0.6);

    // Calculate crop maturity based on ideal conditions
    const tempDiff = Math.abs(weatherData.temperature - (crop.optimal_temp[0] + crop.optimal_temp[1]) / 2);
    const tempFactor = Math.max(0, 1 - (tempDiff / 15));
    const humidityFactor = weatherData.humidity >= crop.optimal_humidity[0] && 
                          weatherData.humidity <= crop.optimal_humidity[1] ? 1 : 0.8;
    
    const dailyGrowth = crop.growth_rate * tempFactor * humidityFactor;
    
    return {
      soil_moisture: parseFloat(soilMoisture.toFixed(1)),
      soil_ph: parseFloat(soilPh.toFixed(2)),
      crop_maturity_percentage: Math.min(100, 50 + (dailyGrowth * 30)), // Start from 50% for demo
      quality_prediction: tempFactor > 0.8 && humidityFactor > 0.8 ? 'A+' : 'A',
      expected_yield_kg: calculateExpectedYield(cropType, tempFactor, humidityFactor)
    };
  };

  const calculateExpectedYield = (cropType, tempFactor, humidityFactor) => {
    const baseYields = {
      pomegranate: 2000,
      almonds: 1500,
      cardamom: 800
    };
    return Math.round(baseYields[cropType] * tempFactor * humidityFactor);
  };

  // Initialize farm simulation data
  const initializeFarmSimulation = async () => {
    const farms = [
      { location: 'Maharashtra', name: 'Nashik Pomegranate Farm', crop: 'pomegranate' },
      { location: 'Karnataka', name: 'Almond Valley Farm', crop: 'almonds' },
      { location: 'Kerala', name: 'Cardamom Hills Estate', crop: 'cardamom' }
    ];

    try {
      for (const farm of farms) {
        const weatherData = await fetchWeatherData(farm.location);
        const farmConditions = simulateFarmConditions(weatherData, farm.crop, farm.location);
        
        // Save to database
        const { error } = await supabase
          .from('farm_simulation')
          .insert([{
            farm_location: farm.location,
            farm_name: farm.name,
            crop_type: farm.crop,
            ...weatherData,
            ...farmConditions,
            predicted_harvest_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          }]);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error initializing farm simulation:', error);
    }
  };

  // Fetch current farm data
  const fetchFarmData = async () => {
    try {
      const { data, error } = await supabase
        .from('farm_simulation')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) throw error;
      setFarmData(data);
    } catch (error) {
      console.error('Error fetching farm data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update farm data periodically
  const updateFarmData = async () => {
    const farms = await supabase
      .from('farm_simulation')
      .select('farm_location, crop_type')
      .order('timestamp', { ascending: false })
      .limit(3);

    if (farms.data) {
      for (const farm of farms.data) {
        const weatherData = await fetchWeatherData(farm.farm_location);
        const farmConditions = simulateFarmConditions(weatherData, farm.crop_type, farm.farm_location);
        
        await supabase
          .from('farm_simulation')
          .insert([{
            farm_location: farm.farm_location,
            farm_name: `${farm.farm_location} ${farm.crop_type} Farm`,
            crop_type: farm.crop_type,
            ...weatherData,
            ...farmConditions,
            predicted_harvest_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }]);
      }
      fetchFarmData(); // Refresh the data
    }
  };

  useEffect(() => {
    if (!user) return;

    // Check if we have farm data, if not initialize it
    const checkAndInitialize = async () => {
      const { data } = await supabase
        .from('farm_simulation')
        .select('id')
        .limit(1);

      if (!data || data.length === 0) {
        await initializeFarmSimulation();
      }
      fetchFarmData();
    };

    checkAndInitialize();

    // Update farm data every hour
    const interval = setInterval(updateFarmData, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  return {
    farmData,
    loading,
    refreshFarmData: fetchFarmData,
    updateFarmData
  };
};