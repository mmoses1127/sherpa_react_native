import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Text, View, Pressable, TextInput } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { getTemperatureSetting, updateTemperatureSetting, fetchTemperatureSetting } from "../store/temperatureSettings";
import { convertCtoF, convertFtoC } from "./Settings";
import formatTime from "./clock" ;
import { fetchUnits, getTempUnit } from "../store/units";
import { useNavigation } from '@react-navigation/native';



const EditTemp = ({route}) => {

  const tempItemId = route.params.itemId;
  const tempSetting = useSelector(getTemperatureSetting(tempItemId));
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState('start');
  const tempUnit = useSelector(getTempUnit)[0];
  const [temperature, setTemperature] = useState('');

  useEffect(() => {
    dispatch(fetchUnits());
  }, []);

  useEffect(() => {
    dispatch(fetchTemperatureSetting(tempItemId))
  }, [dispatch, tempItemId]);

  useEffect(() => {
    if (tempSetting) {
      setStartTime(new Date(tempSetting.start_time));
      setEndTime(new Date(tempSetting.end_time));
      setTemperature(tempUnit === 'F' ? String(convertCtoF(tempSetting.temperature)) : String(tempSetting.temperature));
    }
  }, [tempSetting, tempUnit]);

  useEffect(() => {
    if (tempUnit === 'F') {
      if (temperature > 212) setTemperature(212);
    } else {
      if (temperature < 0) setTemperature(0);
      if (temperature > 100) setTemperature(100);
    }
  }, [temperature, tempUnit]);

  const formatTempInput = (temperature) => {
    let splitTemp = temperature.split('.');
    if (splitTemp.length > 2 || temperature.includes(',')) {
      setTemperature(temperature.slice(0, temperature.length - 1));
    } else if (temperature[0] === '0' && temperature.length > 1 && temperature[1] !== '.') {
      setTemperature(temperature.slice(1));
    } else {
      setTemperature(temperature);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!startTime || !endTime || !temperature) {
      alert('Please fill out all fields')
      return;
    }

    if (startTime >= endTime) {
      alert('Start time must be before end time')
      return;
    }

    let splitTemp = temperature.split('.');
    if (splitTemp.length > 2) {
      setTemperature(splitTemp.slice(0,2))
    };

    if (temperature.includes(',')) {
      setTemperature(temperature.replace(','));
    }

    if (tempUnit === 'F' && (temperature < 32 || temperature > 212)) {
      alert('Temperature must be between 32 and 212')
      return;
    }

    if (tempUnit === 'C' && (temperature < 0 || temperature > 100)) {
      alert('Temperature must be between 0 and 100')
      return;
    }

    let finalTemp = temperature;

    if (temperature[0] === '.') {
      finalTemp = `0${temperature}`;
    }

    const updatedTemperatureSetting = {
      id: tempItemId,
      start_time: startTime,
      end_time: endTime,
      temperature: tempUnit === 'F' ? parseFloat(convertFtoC(parseFloat(temperature))) : parseFloat(finalTemp)
    }
    
    dispatch(updateTemperatureSetting(updatedTemperatureSetting));
    
    navigation.push('Dashboard');

  };

  const showClock = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const handleClockChange = (event, selectedTime) => {
    const currentTime = selectedTime || startTime;
    setShow(Platform.OS === 'ios');
    mode === 'start' ? setStartTime(currentTime) : setEndTime(currentTime);
  };


  return (

    <View className="w-full h-full flex flex-col justify-center items-center">
      <View className="flex flex-col justify-center items-center">
        <View className="flex flex-col align-between justify-center w-full bg-cyan-200 min-h-[300px] p-8 mb-5">
          <View className="flex flex-row items-center justify-start w-full">
            <Text className="min-w-[120px]">Start</Text>
            <Pressable className="flex flex-row items-center justify-center bg-blue-500 min-w-[80px] m-5 p-2 text-center h-10" onPress={() => showClock('start')} >
              <Text className="text-white">{formatTime(startTime)}</Text>
            </Pressable>
          </View>
          <View className="flex flex-row items-center text-white justify-start w-full">
            <Text className="min-w-[120px]">End</Text>
            <Pressable className="flex flex-row items-center justify-center bg-blue-500 min-w-[80px] m-5 p-2 text-center h-10" onPress={() => showClock('end')} >
              <Text className="text-white">{formatTime(endTime)}</Text>
            </Pressable>
          </View>
          <View className="flex flex-row items-center justify-start w-full">
            <Text className="min-w-[120px]">Temperature ({tempUnit})</Text>
            <TextInput className="bg-blue-500 min-w-[80px] m-5 p-2 text-center text-white h-10" keyboardType='numeric' maxLength={5} onChangeText={text => formatTempInput(text)} value={temperature} />
          </View>
        </View>

        <Button  title="Save" onPress={handleUpdate} />
        {show && 
        <DateTimePicker testID="dateTimePicker" value={mode === 'start' ? startTime : endTime} mode={'time'}
        is24Hour={false} display="default" onChange={handleClockChange} />
        }
      </View>
    </View>

  );

};


export default EditTemp;