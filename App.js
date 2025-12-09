
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import LoginScreen from './screens/Login';
import RegisterScreen from './screens/Register';
import HomeScreen from './screens/Home';
import ScannerScreen from './screens/Scanner';
import DepartedScreen from './screens/Departed';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: '#000000', borderBottomWidth: 2, borderBottomColor: '#ffd700' },
              headerTintColor: '#ffd700',
              headerTitleStyle: { fontWeight: '700' },
            }}
          >
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
              options={{ headerShown: false }}
            />
            
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ 
                title: '📦 Sandėlio Valdymas',
                headerShown: false
              }}
            />
            <Stack.Screen 
              name="Scanner" 
              component={ScannerScreen} 
              options={{ title: '📷 Skenuoti' }}
            />
            <Stack.Screen 
              name="Departed" 
              component={DepartedScreen} 
              options={{ title: '📋 Išsiųstos prekės' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </InventoryProvider>
    </AuthProvider>
  );
}
