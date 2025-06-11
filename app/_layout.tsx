import { Ionicons } from "@expo/vector-icons";
import {
  BottomTabNavigationEventMap,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import {
  NavigationHelpers,
  ParamListBase,
  TabNavigationState,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import HomeScreen from "../components/HomeScreens";
import KelolaProduk from "../components/KelolaProduk";
import Laporan from "../components/Laporan";
import Pos from "../components/Pos";
import Settings from "../components/Settings";
import Transaksi from "../components/Transaksi";




import LoginScreen from "../components/LoginScreens";



const { width } = Dimensions.get("window");

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  KelolaProduk: undefined;
  Transaksi: undefined;
  Laporan: undefined;
  Settings: undefined;
  Pos: undefined;





};

type CustomTabBarProps = {
  state: TabNavigationState<ParamListBase>;
  descriptors: {
    [key: string]: {
      options: any;
    };
  };
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
};

const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <View style={styles.navBarContainer}>
      <View style={styles.navBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : options.title || route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const getIconName = () => {
            switch (route.name.toLowerCase()) {
              case "home":
                return "home";
              case "bag":
                return "bag";
              case "people":
                return "people";
              default:
                return "ellipse-outline";
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={[styles.tabButton, isFocused && styles.activeTab]}
              onPress={onPress}
            >
              <Ionicons
                name={getIconName()}
                size={25}
                color={isFocused ? "#FF6B6B" : "rgba(255, 255, 255, 0.8)"}
              />
              <Text style={[styles.tabText, isFocused && styles.activeText]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Beranda", title: "Beranda" }}
      />
      <Tab.Screen
        name="Bag"
        component={HomeScreen}
        options={{ tabBarLabel: "Keranjang", title: "Keranjang" }}
      />
      <Tab.Screen
        name="People"
        component={HomeScreen}
        options={{ tabBarLabel: "Profil", title: "Profil" }}
      />
    </Tab.Navigator>
  );
};

const Layout: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="KelolaProduk" component={KelolaProduk} />
      <Stack.Screen name="Transaksi" component={Transaksi} />
      <Stack.Screen name="Laporan" component={Laporan} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Pos" component={Pos} />





    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  navBarContainer: {
    backgroundColor: "black",
    width: "100%",
    paddingBottom: 8,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "black",
    paddingVertical: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  activeTab: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    borderRadius: 20,
  },
  tabText: {
    fontSize: 9,
    marginTop: 2,
    color: "rgba(255, 255, 255, 0.8)",
  },
  activeText: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
});

export default Layout;
